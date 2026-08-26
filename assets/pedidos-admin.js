/* =========================================================
   PEDIDOS ADMIN — login (Supabase Auth) + lista de pedidos +
   cancelar pedido (repone stock vía RPC cancel_order).

   Quién puede entrar de verdad no lo decide esta página: lo decide
   la función is_admin() en Supabase (ver supabase/schema.sql). Un
   usuario de Supabase Auth que no esté en la tabla admins puede
   iniciar sesión pero no ve pedidos ni puede cancelar nada.
   ========================================================= */
(function(){
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const ordersList = document.getElementById('ordersList');
  const ordersEmpty = document.getElementById('ordersEmpty');
  const ordersError = document.getElementById('ordersError');
  const toastEl = document.getElementById('toast');

  function showToast(msg){
    if (!toastEl) return;
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function showLoginError(msg){
    loginError.textContent = msg;
    loginError.hidden = !msg;
  }

  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  const configured = url && key && !/YOUR-PROJECT|YOUR-ANON/.test(url + key) && typeof window.supabase !== 'undefined';

  if (!configured){
    showLoginError('Supabase no está configurado en este sitio — no se puede iniciar sesión.');
    loginBtn.disabled = true;
    return;
  }

  const client = window.supabase.createClient(url, key);

  /* Todo lo que viene de "orders" pudo haber sido escrito por un
     cliente (nombre, dirección, notas) o incluso enviado directo a
     la RPC checkout_cart desde la consola del navegador (items),
     saltándose el formulario por completo. Nunca es seguro meterlo
     en innerHTML sin escapar — si no, un cliente podría inyectar
     HTML/JS que se ejecuta en la sesión autenticada del admin. */
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

  const STATUS_LABEL = { pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado · stock repuesto' };

  function renderOrders(orders){
    ordersList.innerHTML = '';
    ordersEmpty.hidden = orders.length > 0;
    orders.forEach(order => {
      const status = order.status || 'pending';
      const isPending = status === 'pending';
      const items = Array.isArray(order.items) ? order.items : [];
      const itemsHtml = items.map(i => {
        const label = escapeHtml(i.name || i.product_id || 'Producto');
        const variant = i.variant_name ? ` (${escapeHtml(i.variant_name)})` : '';
        const price = i.price != null ? ` · ${money(i.price)} c/u` : '';
        const qty = Number(i.qty) || 0;
        return `<li>${qty} × ${label}${variant}${price}</li>`;
      }).join('');
      const card = document.createElement('article');
      card.className = 'admin-order' + (isPending ? '' : ' is-' + status);
      card.innerHTML = `
        <div class="admin-order-head">
          <div>
            <strong>${escapeHtml(order.order_number) || '—'}</strong>
            <span class="admin-order-date">${escapeHtml(new Date(order.created_at).toLocaleString('es-CR'))}</span>
          </div>
          <span class="admin-badge is-${status}">${STATUS_LABEL[status] || status}</span>
        </div>
        <ul class="admin-order-items">${itemsHtml || '<li>Sin detalle de ítems</li>'}</ul>
        <div class="admin-order-total">Total: ${money(orderTotal(items))}</div>
        <div class="admin-order-customer">
          <span>${escapeHtml(order.customer_name) || '—'}</span>
          <span>${escapeHtml(order.customer_phone) || '—'}</span>
          <span>${escapeHtml(order.customer_address) || '—'}</span>
          ${order.notes ? `<span>Notas: ${escapeHtml(order.notes)}</span>` : ''}
          <span>Pago: ${escapeHtml(order.pay_method) || '—'}</span>
        </div>
        ${isPending ? `
        <div class="admin-order-actions">
          <button class="btn btn-primary admin-complete-btn" data-order-id="${order.id}">Marcar como completado</button>
          <button class="btn btn-ghost admin-cancel-btn" data-order-id="${order.id}">Cancelar y reponer stock</button>
        </div>` : ''}
      `;
      ordersList.appendChild(card);
    });
  }

  async function loadOrders(){
    ordersError.hidden = true;
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error){
      console.error('[pedidos-admin] error cargando pedidos', error);
      ordersError.textContent = 'No se pudieron cargar los pedidos.';
      ordersError.hidden = false;
      return;
    }
    renderOrders(data || []);
  }

  ordersList.addEventListener('click', async (e) => {
    const cancelBtn = e.target.closest('.admin-cancel-btn');
    const completeBtn = e.target.closest('.admin-complete-btn');
    if (!cancelBtn && !completeBtn) return;

    if (cancelBtn){
      const orderId = cancelBtn.dataset.orderId;
      cancelBtn.disabled = true;
      cancelBtn.textContent = 'Cancelando…';
      const { data, error } = await client.rpc('cancel_order', { p_order_id: Number(orderId) });
      if (error || !data || data.ok === false){
        console.error('[pedidos-admin] error cancelando pedido', error, data);
        showToast('No se pudo cancelar el pedido.');
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancelar y reponer stock';
        return;
      }
      showToast('Pedido cancelado — stock repuesto ✓');
      loadOrders();
      return;
    }

    if (completeBtn){
      const orderId = completeBtn.dataset.orderId;
      completeBtn.disabled = true;
      completeBtn.textContent = 'Marcando…';
      const { data, error } = await client.rpc('complete_order', { p_order_id: Number(orderId) });
      if (error || !data || data.ok === false){
        console.error('[pedidos-admin] error completando pedido', error, data);
        showToast('No se pudo marcar el pedido como completado.');
        completeBtn.disabled = false;
        completeBtn.textContent = 'Marcar como completado';
        return;
      }
      showToast('Pedido marcado como completado ✓');
      loadOrders();
    }
  });

  async function showDashboard(){
    loginView.hidden = true;
    dashboardView.hidden = false;
    await loadOrders();
  }

  async function checkAdminAndEnter(){
    const { data: isAdmin, error } = await client.rpc('is_admin');
    if (error || !isAdmin){
      await client.auth.signOut();
      showLoginError('Esta cuenta no tiene acceso al panel de pedidos.');
      return false;
    }
    await showDashboard();
    return true;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoginError('');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando…';
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
    if (error){
      showLoginError('Correo o contraseña incorrectos.');
      return;
    }
    await checkAdminAndEnter();
  });

  logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
    dashboardView.hidden = true;
    loginView.hidden = false;
    loginForm.reset();
  });

  /* Si ya había sesión activa (recargaste la página), entrar directo
     sin pedir login de nuevo. */
  client.auth.getSession().then(({ data }) => {
    if (data && data.session) checkAdminAndEnter();
  });
})();
