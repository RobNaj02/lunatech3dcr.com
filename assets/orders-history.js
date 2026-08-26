/* =========================================================
   MIS PEDIDOS — pestaña custom para el <UserProfile /> de Clerk
   (mismo patrón que assets/addresses.js). A diferencia de las
   direcciones (que viven solo en localStorage), esto lee de
   Supabase: la tabla public.orders con RLS que solo deja ver a cada
   usuario sus propios pedidos (customer_clerk_id = auth.jwt()->>'sub'),
   gracias a la integración nativa Clerk↔Supabase.

   Si esa integración no está activada, o el pedido se hizo sin
   sesión (checkout como invitado), el pedido simplemente no aparece
   acá — no es un error, solo no hay con qué asociarlo a una cuenta.
   ========================================================= */
(function(){
  function escapeHtml(s){
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function money(n){
    return '₡' + Math.round(n || 0).toLocaleString('es-CR');
  }

  function orderTotal(items){
    return (items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  }

  function renderOrdersTab(el){
    async function paint(){
      el.innerHTML = '<div class="addr-page"><h2>Mis pedidos</h2><p class="account-loading">Cargando…</p></div>';

      const client = window.LunatechStock && window.LunatechStock.client;
      if (!client){
        el.innerHTML = `
          <div class="addr-page">
            <h2>Mis pedidos</h2>
            <p class="addr-empty">No se pudo conectar para cargar tu historial en este momento.</p>
          </div>`;
        return;
      }

      const { data, error } = await client
        .from('orders')
        .select('order_number, items, status, pay_method, created_at')
        .order('created_at', { ascending: false });

      if (error){
        console.error('[orders-history] error cargando pedidos', error);
        el.innerHTML = `
          <div class="addr-page">
            <h2>Mis pedidos</h2>
            <p class="addr-empty">No se pudo cargar tu historial de pedidos ahora mismo.</p>
          </div>`;
        return;
      }

      const orders = data || [];
      el.innerHTML = `
        <div class="addr-page">
          <h2>Mis pedidos</h2>
          <p>Pedidos hechos por WhatsApp con esta cuenta iniciada. Si cancelamos alguno porque no se concretó, lo vas a ver marcado acá.</p>
          <div class="my-orders-list">
            ${orders.length === 0
              ? '<p class="addr-empty">Todavía no hiciste ningún pedido con esta cuenta.</p>'
              : orders.map(o => {
                  const cancelled = o.status === 'cancelled';
                  const items = Array.isArray(o.items) ? o.items : [];
                  const itemsHtml = items.map(i => {
                    const label = escapeHtml(i.name || i.product_id || 'Producto');
                    const variant = i.variant_name ? ` (${escapeHtml(i.variant_name)})` : '';
                    return `<li>${Number(i.qty) || 0} × ${label}${variant}</li>`;
                  }).join('');
                  return `
                    <article class="my-order${cancelled ? ' is-cancelled' : ''}">
                      <div class="my-order-head">
                        <div>
                          <strong>${escapeHtml(o.order_number)}</strong>
                          <span class="my-order-date">${escapeHtml(new Date(o.created_at).toLocaleString('es-CR'))}</span>
                        </div>
                        <span class="admin-badge ${cancelled ? 'is-cancelled' : 'is-pending'}">${cancelled ? 'Cancelado' : 'Pendiente'}</span>
                      </div>
                      <ul class="my-order-items">${itemsHtml || '<li>Sin detalle</li>'}</ul>
                      <div class="my-order-total">Total: ${money(orderTotal(items))} · Pago: ${escapeHtml(o.pay_method) || '—'}</div>
                    </article>`;
                }).join('')}
          </div>
        </div>`;
    }
    paint();
  }

  function ordersCustomPage(){
    return {
      label: 'Mis pedidos',
      url: 'pedidos',
      mountIcon: (el) => {
        el.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6"/><circle cx="9.5" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>';
      },
      unmountIcon: (el) => { el.innerHTML = ''; },
      mount: (el) => renderOrdersTab(el),
      unmount: (el) => { el.innerHTML = ''; },
    };
  }

  window.LunatechOrders = { ordersCustomPage };
})();
