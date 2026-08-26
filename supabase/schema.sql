-- =========================================================
-- LUNATECH3D — esquema de stock en tiempo real
-- Corré este script completo una sola vez en:
--   Supabase Dashboard → SQL Editor → New query → pegar → Run
--
-- Este archivo es la fuente de verdad, pero NO se aplica solo:
-- Supabase no lee este repo. Si ya corriste una versión anterior
-- y volvés a pegar el script completo, es seguro (create or
-- replace function + create table if not exists + ON CONFLICT DO
-- NOTHING en los datos), así que simplemente volvé a correrlo
-- entero para aplicar cualquier cambio hecho acá (ej. la
-- validación de qty > 0 agregada a checkout_cart()).
-- =========================================================

-- ---------- Tabla de stock ----------
-- Una fila por producto sin variantes, o por cada combinación
-- producto + variante (color/tamaño). variant_name = '' cuando
-- el producto no tiene variantes.
create table if not exists public.product_stock (
  id bigint generated always as identity primary key,
  product_id text not null,
  variant_name text not null default '',
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_name)
);

-- ---------- Seguridad (RLS) ----------
-- Cualquiera puede LEER el stock (para mostrarlo en la tienda).
-- Nadie puede escribir directo a la tabla desde el navegador:
-- la única forma de restar stock es la función checkout_cart()
-- de abajo, que corre con permisos elevados y valida todo en
-- una sola transacción. Para reponer o corregir cantidades,
-- edita la tabla vos mismo desde el Table Editor del dashboard
-- (ese acceso no pasa por estas políticas).
alter table public.product_stock enable row level security;

drop policy if exists "public read stock" on public.product_stock;
create policy "public read stock"
  on public.product_stock for select
  to anon, authenticated
  using (true);

-- ---------- Tiempo real ----------
-- Permite que el navegador reciba cambios de stock al instante.
-- "alter publication ... add table" no es idempotente (no existe un
-- "if not exists" universal para esto en Postgres) — si la tabla ya
-- estaba agregada, correrlo de nuevo tira el error 42710 y aborta el
-- resto del script (Supabase corre todo el bloque pegado como una
-- sola transacción implícita). Este bloque hace el mismo efecto pero
-- solo si hace falta, así el script completo se puede re-correr
-- siempre sin romper nada.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'product_stock'
  ) then
    alter publication supabase_realtime add table public.product_stock;
  end if;
end $$;

-- ---------- Función de checkout ----------
-- Recibe el carrito completo y resta el stock de todos los
-- ítems en UNA sola transacción: si a alguno no le alcanza el
-- stock, no se resta nada y se informa cuáles fallaron. Corre
-- como SECURITY DEFINER para poder escribir aunque RLS bloquee
-- escrituras directas del navegador.
-- La firma cambió (se le agregaron order_number y customer) respecto a
-- versiones anteriores de este script: create or replace no puede cambiar
-- los parámetros de una función, así que hay que borrar la versión vieja
-- primero o quedan las dos coexistiendo (Postgres las trata como funciones
-- distintas si difieren en argumentos).
drop function if exists public.checkout_cart(jsonb);

create or replace function public.checkout_cart(items jsonb, order_number text, customer jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_variable
-- El parámetro "order_number" tiene el mismo nombre que la columna
-- public.orders.order_number. Sin esta línea, el INSERT de más abajo
-- falla con "column reference order_number is ambiguous" porque
-- Postgres no puede decidir si te referís al parámetro o a la columna.
-- Esta directiva le dice que, ante esa ambigüedad, siempre gane la
-- variable/parámetro de PL/pgSQL (que es lo que queremos acá).
declare
  item jsonb;
  v_product_id text;
  v_variant text;
  v_qty int;
  v_available int;
  failed jsonb := '[]'::jsonb;
  -- Id de Clerk de quien llama, si venía logueado (requiere la
  -- integración Clerk↔Supabase activa). Se lee del JWT verificado de
  -- la request, nunca de un valor mandado por el navegador — así
  -- nadie puede "plantar" un pedido en la cuenta de otra persona
  -- pasando un id ajeno.
  v_clerk_id text := auth.jwt() ->> 'sub';
begin
  -- Paso 1: bloquear las filas involucradas y validar que haya stock suficiente
  for item in select * from jsonb_array_elements(items) loop
    v_product_id := item->>'product_id';
    v_variant := coalesce(item->>'variant_name', '');

    -- Cualquiera puede llamar a esta función directo (curl, consola del
    -- navegador) con el jsonb que quiera — un qty que no sea un entero
    -- real ("abc", 1.5, un número fuera de rango) hacía tronar el cast
    -- ::int con un error crudo de Postgres en vez de la respuesta
    -- controlada {ok:false, failed:[...]} que el resto de esta función
    -- ya devuelve. Ahora ese ítem simplemente se marca como fallido.
    begin
      v_qty := (item->>'qty')::int;
    exception when others then
      v_qty := null;
    end;

    -- qty debe ser un entero positivo: una cantidad <= 0 (o negativa) no es
    -- un pedido real y, si se restara tal cual, SUMARÍA stock en vez de
    -- restarlo (quantity - (-5) = quantity + 5). Esto tampoco puede
    -- depender de que el frontend ya valide qty > 0 — se rechaza acá
    -- también, en el server.
    if v_qty is null or v_qty <= 0 then
      failed := failed || jsonb_build_object(
        'product_id', v_product_id,
        'variant_name', v_variant,
        'available', 0
      );
      continue;
    end if;

    select quantity into v_available
      from product_stock
      where product_id = v_product_id and variant_name = v_variant
      for update;

    if v_available is null or v_available < v_qty then
      failed := failed || jsonb_build_object(
        'product_id', v_product_id,
        'variant_name', v_variant,
        'available', coalesce(v_available, 0)
      );
    end if;
  end loop;

  if jsonb_array_length(failed) > 0 then
    return jsonb_build_object('ok', false, 'failed', failed);
  end if;

  -- Paso 2: ya validado todo, restar de verdad
  for item in select * from jsonb_array_elements(items) loop
    update product_stock
      set quantity = quantity - (item->>'qty')::int, updated_at = now()
      where product_id = item->>'product_id'
        and variant_name = coalesce(item->>'variant_name', '');
  end loop;

  -- Paso 3: dejar registrado el pedido (antes esto no se guardaba en
  -- ningún lado — solo salía como mensaje de WhatsApp — así que no
  -- había forma de reponer el stock automáticamente si el cliente no
  -- concretaba la compra). Va en su propio sub-bloque con manejo de
  -- excepción (en vez de "on conflict", que depende de que exista un
  -- índice único sobre order_number) para que un problema al guardar
  -- el registro nunca tumbe una venta que ya se validó y restó del
  -- stock real.
  begin
    -- left(...) trunca en vez de rechazar: esta función es pública (la
    -- llama cualquiera, no solo el formulario del sitio, que ya limita
    -- estos campos con maxlength), así que un valor absurdamente largo
    -- no puede tumbar una venta ya validada y con el stock ya restado
    -- — simplemente se guarda recortado.
    insert into public.orders (order_number, items, customer_name, customer_phone, customer_address, notes, pay_method, customer_clerk_id)
    values (
      left(order_number, 60),
      items,
      left(customer->>'name', 120),
      left(customer->>'phone', 30),
      left(customer->>'address', 500),
      left(customer->>'notes', 500),
      left(customer->>'pay_method', 60),
      v_clerk_id
    );
  exception when unique_violation then
    -- Número de pedido repetido (colisión aleatoria generada en el
    -- navegador): no es motivo para cancelar una venta ya validada.
    null;
  end;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.checkout_cart(jsonb, text, jsonb) to anon, authenticated;

-- =========================================================
-- ADMIN — quién puede ver/cancelar pedidos desde pedidos-admin.html
-- =========================================================
-- Un usuario de Supabase Auth (creado a mano en Authentication →
-- Users, con email + contraseña) cuyo UID esté en esta tabla puede
-- iniciar sesión en el panel de admin. No hay señalizadores/roles:
-- basta con estar en esta tabla.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
-- Sin políticas a propósito: nadie puede leer esta tabla directo desde
-- el navegador (ni siquiera un admin), solo is_admin() de abajo (que
-- corre con permisos elevados) puede consultarla.

-- plpgsql (no sql) a propósito, para poder atajar el cast a uuid: una
-- vez activada la integración Clerk↔Supabase, cualquier cliente
-- logueado con Clerk también llega acá como rol "authenticated", pero
-- su "sub" es texto tipo "user_2abc..." (no un uuid). auth.uid() hace
-- ese cast internamente y con un sub así truena con un error real (no
-- devuelve null) — y como Postgres evalúa TODAS las políticas de una
-- tabla, eso rompería incluso a un cliente leyendo sus propios pedidos
-- en "Mis pedidos" si no se atrapa acá.
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  begin
    v_uid := auth.uid();
  exception when others then
    return false;
  end;
  return exists (select 1 from public.admins where user_id = v_uid);
end;
$$;

grant execute on function public.is_admin() to authenticated;

-- =========================================================
-- PEDIDOS — registro de cada checkout, para poder reponer stock
-- si el pedido no se concreta (cliente no contestó, se arrepintió,
-- etc.) desde pedidos-admin.html
-- =========================================================
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  items jsonb not null,
  customer_name text,
  customer_phone text,
  customer_address text,
  notes text,
  pay_method text,
  status text not null default 'pending' check (status in ('pending', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);
alter table public.orders enable row level security;

-- Se agregó el estado 'completed' (pedido ya entregado/procesado) a lo
-- que originalmente era solo pending/cancelled. drop+add porque un
-- check constraint no se puede "or replace" — el nombre por defecto
-- de un check inline de columna es <tabla>_<columna>_check.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'completed', 'cancelled'));
alter table public.orders add column if not exists completed_at timestamptz;

-- Quién hizo el pedido si estaba logueado con Clerk al momento del
-- checkout (null en un pedido de invitado). Requiere la integración
-- nativa Clerk↔Supabase (Clerk Dashboard → Supabase integration +
-- Supabase Dashboard → Authentication → Sign In/Providers → Clerk):
-- sin eso, auth.jwt() no trae el "sub" de Clerk y esta columna
-- siempre queda en null (el resto del sitio sigue funcionando igual,
-- solo no aparece nada en "Mis pedidos").
alter table public.orders add column if not exists customer_clerk_id text;

-- Solo un admin autenticado puede LEER pedidos desde el navegador.
-- Los INSERT (checkout_cart) y UPDATE (cancel_order) de abajo no
-- necesitan política propia: corren con permisos elevados.
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- Un cliente logueado con Clerk puede leer sus propios pedidos (para
-- "Mis pedidos" en Mi cuenta) — nunca los de otro. (auth.jwt()->>'sub'
-- es el user id de Clerk; no se usa auth.uid() porque ese id no es un
-- uuid.)
drop policy if exists "customer read own orders" on public.orders;
create policy "customer read own orders"
  on public.orders for select
  to authenticated
  using (customer_clerk_id is not null and customer_clerk_id = (auth.jwt() ->> 'sub'));

-- ---------- Función para marcar como completado ----------
-- Solo cambia el estado (el stock ya se restó en el checkout y no
-- hay nada más que tocar) — para cuando el pedido efectivamente se
-- entregó/procesó.
create or replace function public.complete_order(p_order_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;
  if v_order.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'not_pending');
  end if;

  update public.orders
    set status = 'completed', completed_at = now()
    where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.complete_order(bigint) to authenticated;

-- ---------- Función de cancelación ----------
-- Repone en product_stock exactamente lo que ese pedido había
-- restado, y marca el pedido como cancelado. Solo aplica a pedidos
-- pendientes: uno ya completado (entregado de verdad) no se debería
-- poder "cancelar y reponer" por acá — eso sería más bien una
-- devolución, un caso distinto — y uno ya cancelado no se vuelve a
-- cancelar (así no se repone el stock dos veces por error).
create or replace function public.cancel_order(p_order_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  item jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;
  if v_order.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'not_pending');
  end if;

  for item in select * from jsonb_array_elements(v_order.items) loop
    update product_stock
      set quantity = quantity + (item->>'qty')::int, updated_at = now()
      where product_id = item->>'product_id'
        and variant_name = coalesce(item->>'variant_name', '');
  end loop;

  update public.orders
    set status = 'cancelled', cancelled_at = now()
    where id = p_order_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.cancel_order(bigint) to authenticated;

-- ---------- Auto-expirar pedidos pendientes viejos ----------
-- checkout_cart() es una función pública: cualquiera puede llamarla
-- directo (curl, consola del navegador) con un product_id real y
-- qty:1, sin pasar nunca por WhatsApp, y eso resta stock de verdad.
-- No hay forma de impedir eso desde acá sin agregar algo como rate
-- limiting o un captcha delante (fuera del alcance de este archivo);
-- esta función acota el daño: un pedido que se queda "pending" más
-- de 48 horas se cancela solo y repone su stock, igual que si un
-- admin lo hubiera cancelado a mano desde pedidos-admin.html.
create or replace function public.expire_stale_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  item jsonb;
  v_count int := 0;
begin
  for v_order in
    select * from public.orders
    where status = 'pending' and created_at < now() - interval '48 hours'
    for update skip locked
  loop
    for item in select * from jsonb_array_elements(v_order.items) loop
      update product_stock
        set quantity = quantity + (item->>'qty')::int, updated_at = now()
        where product_id = item->>'product_id'
          and variant_name = coalesce(item->>'variant_name', '');
    end loop;

    update public.orders
      set status = 'cancelled', cancelled_at = now()
      where id = v_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;
-- A propósito, sin "grant execute" a anon/authenticated: esta función
-- corre sola por tarea programada (con privilegios de owner), nunca
-- se llama desde el navegador ni el sitio.

-- Para activar la tarea programada (una sola vez, no hace falta
-- repetirlo cada vez que vuelvas a correr este archivo completo):
--   1. Dashboard → Database → Extensions → activá "pg_cron".
--   2. Corré en el SQL Editor:
--        select cron.schedule('expire-stale-orders', '0 * * * *',
--          $$select public.expire_stale_orders()$$);
--      (la corre cada hora; podés probarla a mano ejecutando
--      "select public.expire_stale_orders();" para ver cuántos
--      pedidos canceló).

-- =========================================================
-- DATOS INICIALES — un renglón por producto/variante del
-- catálogo actual (assets/products.js). La cantidad "10" es
-- solo un valor de partida: entrá al Table Editor de Supabase
-- después de correr esto y ajustá cada fila a tu stock real.
-- Si corrés este script de nuevo no duplica filas (ON CONFLICT).
-- =========================================================
insert into public.product_stock (product_id, variant_name, quantity) values
  -- SUNLU PLA 1kg (colores)
  ('sunlu-pla-1kg', 'Blanco', 10),
  ('sunlu-pla-1kg', 'Negro', 10),
  ('sunlu-pla-1kg', 'Azul', 10),
  ('sunlu-pla-1kg', 'Amarillo', 10),
  ('sunlu-pla-1kg', 'Naranja Intenso', 10),
  ('sunlu-pla-1kg', 'Azul Cielo', 10),
  ('sunlu-pla-1kg', 'Verde Oliva', 10),
  ('sunlu-pla-1kg', 'Rojo Cereza', 10),
  -- SUNLU PETG 1kg (colores)
  ('sunlu-petg-1kg', 'Blanco', 10),
  ('sunlu-petg-1kg', 'Marrón Castaño', 10),
  -- Resina estándar SUNLU (colores)
  ('sunlu-resina-estandar-1kg', 'Negro', 10),
  ('sunlu-resina-estandar-1kg', 'Blanco', 10),
  -- Imanes de neodimio (tamaños)
  ('imanes-neodimio', '3×1mm', 10),
  ('imanes-neodimio', '3×2mm', 10),
  ('imanes-neodimio', '4×2mm', 10),
  ('imanes-neodimio', '5×1mm', 10),
  ('imanes-neodimio', '5×2mm', 10),
  ('imanes-neodimio', '8×1mm', 10),
  ('imanes-neodimio', '10×1mm', 10),
  ('imanes-neodimio', '12×1mm', 10),
  ('imanes-neodimio', '15×1mm', 10),
  -- Productos sin variantes
  ('alicate-corte-precision', '', 10),
  ('bolsas-vacio-filamento', '', 10),
  ('funda-protectora-impresora', '', 10),
  ('creality-clog-poke', '', 10),
  ('etiquetas-nfc', '', 10),
  ('switches-blue', '', 10),
  ('lampara-led-usb', '', 10),
  ('insertos-roscados-laton', '', 10),
  ('kit-corte-posprocesado', '', 10),
  ('kit-limpieza-boquillas', '', 10),
  ('grasa-termica-creality', '', 10),
  ('calcetin-silicona-a1', '', 10)
on conflict (product_id, variant_name) do nothing;
