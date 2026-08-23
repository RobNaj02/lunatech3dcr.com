/* ---------- Mobile nav ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', false);
  }));
}

/* ---------- Value cards: tap-to-expand on touch, keyboard toggle ---------- */
document.querySelectorAll('.value-card').forEach(card => {
  function toggle(){
    const open = card.classList.toggle('is-open');
    card.setAttribute('aria-expanded', open);
  }
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
  });
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* =========================================================
   CART MODULE
   Cart is persisted in localStorage so it survives navigating
   between pages (index → tienda → producto) and reopening the
   site later. Falls back gracefully if storage is unavailable.
   ========================================================= */
const WHATSAPP_NUMBER = (window.SITE_CONFIG && window.SITE_CONFIG.whatsappNumber) || '50688019404';
const CURRENCY = '₡';
const CART_STORAGE_KEY = 'lunatech3d_cart_v1';

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCart(){
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
  catch (e) { /* storage unavailable — cart just won't persist */ }
}

let cart = loadCart(); // {id, name, price, spec, category, image, qty}

const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartFootEl = document.getElementById('cartFoot');
const cartSubtotalEl = document.getElementById('cartSubtotalValue');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutBackdrop = document.getElementById('checkoutBackdrop');
const checkoutPanel = document.getElementById('checkoutPanel');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutBack = document.getElementById('checkoutBack');
const checkoutForm = document.getElementById('checkoutForm');
const orderSummaryEl = document.getElementById('orderSummary');
const savedAddressField = document.getElementById('savedAddressField');
const savedAddressSelect = document.getElementById('savedAddressSelect');
const custAddressEl = document.getElementById('custAddress');

const toastEl = document.getElementById('toast');

function money(n){ return CURRENCY + n.toLocaleString('es-CR'); }

function showToast(msg){
  if (!toastEl) return;
  toastEl.querySelector('span').textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function cartCount(){ return cart.reduce((s,i) => s + i.qty, 0); }
function cartSubtotal(){ return cart.reduce((s,i) => s + i.qty * i.price, 0); }

function updateBadge(){
  if (!cartBadge) return;
  const count = cartCount();
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}

function cartItemThumb(item){
  if (item.image){
    return `<img src="${item.image}" alt="${item.name}">`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/></svg>`;
}

function renderCart(){
  saveCart();
  if (!cartItemsEl) return;
  updateBadge();
  if (cart.length === 0){
    cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>Agregá productos desde el catálogo.</p>';
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (cartSubtotalEl) cartSubtotalEl.textContent = money(0);
    return;
  }
  if (checkoutBtn) checkoutBtn.disabled = false;
  cartItemsEl.innerHTML = cart.map(item => {
    const available = window.LunatechStock ? window.LunatechStock.get(item.productId || item.id, item.variantName || '') : null;
    const oosNote = available !== null && available < item.qty
      ? `<span class="cart-item-oos">${available > 0 ? `Solo quedan ${available} disponibles` : 'Agotado'} — ajustá la cantidad</span>`
      : '';
    return `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-thumb">${cartItemThumb(item)}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="spec">${item.spec}</div>
        <div class="qty-row">
          <button class="qty-btn" data-action="dec" aria-label="Quitar una unidad">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-action="inc" aria-label="Agregar una unidad">+</button>
        </div>
        <button class="remove-item" data-action="remove">Eliminar</button>
        ${oosNote}
      </div>
      <div class="cart-item-price">${money(item.qty * item.price)}</div>
    </div>
  `;
  }).join('');
  if (cartSubtotalEl) cartSubtotalEl.textContent = money(cartSubtotal());
}

function addToCart(product, btnEl){
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  renderCart();
  showToast(`${product.name} agregado al carrito`);
  if (btnEl){
    const original = btnEl.textContent;
    btnEl.classList.add('added');
    btnEl.textContent = 'Agregado ✓';
    setTimeout(() => { btnEl.classList.remove('added'); btnEl.textContent = original; }, 1200);
  }
}

/* Delegado en document: las tarjetas de producto pueden renderizarse
   dinámicamente (store.js) después de que este script ya corrió. */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-cart');
  if (!btn || btn.disabled) return;
  const card = btn.closest('[data-id]');
  if (!card) return;
  const productId = card.dataset.id;
  if (window.LunatechStock && window.LunatechStock.isOutOfStock(productId, '')){
    showToast('Este producto está agotado');
    return;
  }
  const existing = cart.find(i => i.id === productId);
  const available = window.LunatechStock ? window.LunatechStock.get(productId, '') : null;
  if (available !== null && (existing ? existing.qty : 0) + 1 > available){
    showToast(`Solo quedan ${available} unidades disponibles`);
    return;
  }
  addToCart({
    id: productId,
    name: card.dataset.name,
    price: parseInt(card.dataset.price, 10),
    spec: card.dataset.spec || '',
    category: card.dataset.category || '',
    image: card.dataset.photo || null,
    productId,
    variantName: ''
  }, btn);
});

if (cartItemsEl){
  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('.cart-item');
    const id = row.dataset.id;
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (btn.dataset.action === 'inc'){
      const available = window.LunatechStock ? window.LunatechStock.get(item.productId || item.id, item.variantName || '') : null;
      if (available !== null && item.qty + 1 > available){
        showToast(available > 0 ? `Solo quedan ${available} unidades disponibles` : 'Este producto está agotado');
      } else {
        item.qty += 1;
      }
    }
    if (btn.dataset.action === 'dec') { item.qty -= 1; if (item.qty <= 0) cart = cart.filter(i => i.id !== id); }
    if (btn.dataset.action === 'remove') cart = cart.filter(i => i.id !== id);
    renderCart();
  });
}

document.addEventListener('stock:updated', () => {
  renderCart();
  if (checkoutPanel && checkoutPanel.classList.contains('open')) renderOrderSummary();
});

/* ---------- Foco al abrir/cerrar paneles (carrito, checkout, favoritos) ----------
   Guarda qué elemento tenía el foco antes de abrir el primer panel
   para devolvérselo recién cuando se cierra el último (contador de
   overlays abiertos, no un simple on/off): carrito → checkout es una
   transición entre paneles, no un cierre real, así que el foco no
   debe "volver" a la página en el medio de ese paso. Expuesto en
   window para que store.js pueda usarlo también con el drawer de
   favoritos, sin duplicar esta lógica. */
let lastFocusedEl = null;
let openOverlayCount = 0;
function trapFocusOpen(closeBtnEl){
  if (openOverlayCount === 0) lastFocusedEl = document.activeElement;
  openOverlayCount++;
  if (closeBtnEl) setTimeout(() => closeBtnEl.focus(), 10);
}
function trapFocusClose(){
  openOverlayCount = Math.max(0, openOverlayCount - 1);
  if (openOverlayCount === 0 && lastFocusedEl && typeof lastFocusedEl.focus === 'function'){
    lastFocusedEl.focus();
    lastFocusedEl = null;
  }
}
window.trapFocusOpen = trapFocusOpen;
window.trapFocusClose = trapFocusClose;

function openCart(){
  if (!cartDrawer) return;
  renderCart();
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  trapFocusOpen(cartClose);
}
function closeCart(){
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  trapFocusClose();
}
if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

/* ---------- Checkout ---------- */
function escapeHtml(s){
  return (s || '').toString().replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function populateSavedAddresses(){
  if (!savedAddressField || !savedAddressSelect || !window.LunatechAddresses) return;
  const list = window.LunatechAddresses.getAddresses();
  savedAddressSelect.innerHTML = '<option value="">Elegí una dirección…</option>' +
    list.map(a => `<option value="${a.id}">${escapeHtml(a.label)}</option>`).join('');
  savedAddressField.style.display = list.length ? 'flex' : 'none';
}
if (savedAddressSelect){
  savedAddressSelect.addEventListener('change', () => {
    const list = window.LunatechAddresses ? window.LunatechAddresses.getAddresses() : [];
    const found = list.find(a => a.id === savedAddressSelect.value);
    if (found && custAddressEl) custAddressEl.value = found.text;
  });
}

function renderOrderSummary(){
  if (!orderSummaryEl) return;
  orderSummaryEl.innerHTML = cart.map(i => {
    const available = window.LunatechStock ? window.LunatechStock.get(i.productId || i.id, i.variantName || '') : null;
    const warn = available !== null && available < i.qty
      ? `<span class="cart-item-oos">${available > 0 ? `Solo quedan ${available}` : 'Agotado'}</span>`
      : '';
    return `<div class="row"><span>${i.qty} × ${i.name}${warn}</span><span>${money(i.qty * i.price)}</span></div>`;
  }).join('') + `<div class="row total"><span>Total</span><span>${money(cartSubtotal())}</span></div>`;
}

function openCheckout(){
  if (!checkoutPanel) return;
  renderOrderSummary();
  populateSavedAddresses();
  closeCart();
  checkoutPanel.classList.add('open');
  checkoutBackdrop.classList.add('open');
  checkoutPanel.setAttribute('aria-hidden', 'false');
  trapFocusOpen(document.getElementById('custName'));
}
function closeCheckout(){
  if (!checkoutPanel) return;
  checkoutPanel.classList.remove('open');
  checkoutBackdrop.classList.remove('open');
  checkoutPanel.setAttribute('aria-hidden', 'true');
  trapFocusClose();
}
/* ---------- Checkout como invitado ----------
   La compra NO requiere cuenta: cualquiera puede agregar productos,
   abrir el carrito y completar el checkout con nombre/teléfono/
   dirección, sin iniciar sesión. Clerk (mi-cuenta.html) es solo una
   forma opcional de guardar direcciones entre visitas — si Clerk
   no está disponible, el checkout igual funciona con normalidad. */
if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', closeCheckout);
if (checkoutBack) checkoutBack.addEventListener('click', () => { closeCheckout(); openCart(); });

/* ---------- Escape cierra el panel que esté abierto ----------
   Orden de prioridad: checkout (el que está "más arriba") primero,
   después el carrito, y por último favoritos (drawer manejado en
   store.js, que expone closeWishlistDrawer para esto). El buscador
   ya maneja su propio Escape en store.js. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (checkoutPanel && checkoutPanel.classList.contains('open')) { closeCheckout(); return; }
  if (cartDrawer && cartDrawer.classList.contains('open')) { closeCart(); return; }
  const wishlistDrawerEl = document.getElementById('wishlistDrawer');
  if (wishlistDrawerEl && wishlistDrawerEl.classList.contains('open') && typeof window.closeWishlistDrawer === 'function'){
    window.closeWishlistDrawer();
  }
});

document.querySelectorAll('.pay-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    opt.querySelector('input').checked = true;
  });
});

if (checkoutForm){
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const payMethod = checkoutForm.querySelector('input[name="payMethod"]:checked');

    if (!name || !phone || cart.length === 0){
      showToast('Completá tus datos antes de continuar');
      return;
    }

    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    /* Última validación, justo antes de "vender": resta el stock de
       todo el carrito en una sola transacción en Supabase. Si algo
       ya no alcanza (otro comprador se lo llevó primero, por ejemplo),
       no se resta nada y se avisa qué ítems hay que ajustar — así
       nadie termina pidiendo por WhatsApp algo que ya no hay.
       Se llama siempre que exista window.LunatechStock (sin condicionar
       a ".client"): así, si Supabase está configurado pero su
       librería no cargó, checkout() decide de forma segura en vez de
       que este código asuma silenciosamente que no hay nada que
       validar y deje pasar la venta. */
    if (window.LunatechStock){
      const items = cart.map(i => ({ productId: i.productId || i.id, variantName: i.variantName || '', qty: i.qty }));
      const result = await window.LunatechStock.checkout(items);
      if (!result || result.ok === false){
        if (submitBtn) submitBtn.disabled = false;
        if (result && result.failed && result.failed.length){
          const names = result.failed.map(f => {
            const match = cart.find(i => (i.productId || i.id) === f.product_id && (i.variantName || '') === f.variant_name);
            return match ? match.name : f.product_id;
          }).join(', ');
          showToast(`Sin stock suficiente para: ${names}. Ajustá el carrito.`);
        } else if (result && result.unavailable){
          showToast('No pudimos verificar el stock en este momento. Probá de nuevo en unos segundos.');
        } else {
          showToast('No se pudo confirmar el stock. Intentá de nuevo.');
        }
        renderCart();
        return;
      }
    }

    const payLabel = payMethod ? payMethod.parentElement.querySelector('.pt').textContent : 'A coordinar';

    let msg = `Hola LUNATECH3D! Quiero hacer este pedido:\n\n`;
    cart.forEach(i => { msg += `• ${i.qty} × ${i.name} — ${money(i.qty * i.price)}\n`; });
    msg += `\nTotal: ${money(cartSubtotal())}`;
    msg += `\n\nNombre: ${name}`;
    msg += `\nTeléfono: ${phone}`;
    if (address) msg += `\nDirección / notas: ${address}`;
    msg += `\nMétodo de pago preferido: ${payLabel}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    let waWindow = null;
    try { waWindow = window.open(url, '_blank', 'noopener'); }
    catch (err) { console.error('[checkout] window.open falló', err); }

    if (submitBtn) submitBtn.disabled = false;

    if (!waWindow){
      /* El navegador bloqueó el popup (o window.open falló). No
         tenemos ninguna confirmación de que el pedido salió, así que
         el carrito se queda intacto: la persona puede reintentar con
         este mismo link en vez de perder lo que tenía armado. */
      showToast('Tu navegador bloqueó la ventana de WhatsApp. Permití popups para este sitio y volvé a intentar.');
      if (orderSummaryEl) {
        const existing = orderSummaryEl.querySelector('[data-manual-wa-link]');
        if (existing) existing.href = url;
        else orderSummaryEl.insertAdjacentHTML('beforeend',
          `<a class="btn btn-primary" data-manual-wa-link style="width:100%;justify-content:center;margin-top:12px" href="${url}" target="_blank" rel="noopener">Abrir WhatsApp manualmente</a>`);
      }
      return;
    }

    /* window.open devolvió una ventana: es la confirmación razonable
       de que el pedido salió para WhatsApp. Recién acá se limpia el
       carrito — nunca antes de este punto. */
    cart = [];
    renderCart();
    closeCheckout();
    showToast('Pedido enviado por WhatsApp ✓');
    checkoutForm.reset();
  });
}

/* Los filtros de la tienda (categorías, marca, precio, disponibilidad,
   búsqueda) ahora los maneja assets/store.js sobre datos de PRODUCTS. */

/* ---------- Newsletter (footer) ----------
   No hay un servicio de email marketing conectado todavía, así que
   en vez de simular una "suscripción" que no llega a ningún lado,
   el aviso de novedades se coordina por WhatsApp con el correo que
   dejó la persona. */
document.querySelectorAll('[data-newsletter-form]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) return;
    const msg = `Hola LUNATECH3D! Quiero enterarme de promociones y productos nuevos. Mi correo: ${email}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    form.reset();
    showToast('Te vamos a escribir por WhatsApp');
  });
});

/* init */
renderCart();
