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
create or replace function public.checkout_cart(items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_product_id text;
  v_variant text;
  v_qty int;
  v_available int;
  failed jsonb := '[]'::jsonb;
begin
  -- Paso 1: bloquear las filas involucradas y validar que haya stock suficiente
  for item in select * from jsonb_array_elements(items) loop
    v_product_id := item->>'product_id';
    v_variant := coalesce(item->>'variant_name', '');
    v_qty := (item->>'qty')::int;

    -- qty debe ser un entero positivo: una cantidad <= 0 (o negativa) no es
    -- un pedido real y, si se restara tal cual, SUMARÍA stock en vez de
    -- restarlo (quantity - (-5) = quantity + 5). Cualquiera puede llamar a
    -- esta función directo desde la consola del navegador con el payload
    -- que quiera, así que esto no puede depender de que el frontend ya
    -- valide qty > 0 — se rechaza acá también, en el server.
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

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.checkout_cart(jsonb) to anon, authenticated;

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
