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
const WHATSAPP_NUMBER = '50688019404';
const CURRENCY = '₡';
const CART_STORAGE_KEY = 'lunarlab_cart_v1';

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
  cartItemsEl.innerHTML = cart.map(item => `
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
      </div>
      <div class="cart-item-price">${money(item.qty * item.price)}</div>
    </div>
  `).join('');
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
  if (!btn) return;
  const card = btn.closest('[data-id]');
  if (!card) return;
  addToCart({
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price, 10),
    spec: card.dataset.spec || '',
    category: card.dataset.category || '',
    image: card.dataset.photo || null
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
    if (btn.dataset.action === 'inc') item.qty += 1;
    if (btn.dataset.action === 'dec') { item.qty -= 1; if (item.qty <= 0) cart = cart.filter(i => i.id !== id); }
    if (btn.dataset.action === 'remove') cart = cart.filter(i => i.id !== id);
    renderCart();
  });
}

function openCart(){
  if (!cartDrawer) return;
  renderCart();
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}
function closeCart(){
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}
if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

/* ---------- Checkout ---------- */
function openCheckout(){
  if (!checkoutPanel) return;
  if (orderSummaryEl){
    orderSummaryEl.innerHTML = cart.map(i => `
      <div class="row"><span>${i.qty} × ${i.name}</span><span>${money(i.qty * i.price)}</span></div>
    `).join('') + `<div class="row total"><span>Total</span><span>${money(cartSubtotal())}</span></div>`;
  }
  closeCart();
  checkoutPanel.classList.add('open');
  checkoutBackdrop.classList.add('open');
  checkoutPanel.setAttribute('aria-hidden', 'false');
}
function closeCheckout(){
  if (!checkoutPanel) return;
  checkoutPanel.classList.remove('open');
  checkoutBackdrop.classList.remove('open');
  checkoutPanel.setAttribute('aria-hidden', 'true');
}
/* ---------- Auth gate: hay que estar logeado para comprar ----------
   Navegar, agregar al carrito y usar favoritos/comparador queda libre.
   El login (Clerk) solo se exige al confirmar la compra. window.clerkReady
   lo define assets/clerk-init.js (carga compartida, una sola vez). */
async function requireSignInThenCheckout(){
  const Clerk = await window.clerkReady;
  if (Clerk.user){ openCheckout(); return; }
  const unsubscribe = Clerk.addListener(({ user }) => {
    if (user){ unsubscribe(); openCheckout(); }
  });
  Clerk.openSignIn();
}

if (checkoutBtn) checkoutBtn.addEventListener('click', requireSignInThenCheckout);
if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', closeCheckout);
if (checkoutBack) checkoutBack.addEventListener('click', () => { closeCheckout(); openCart(); });

document.querySelectorAll('.pay-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    opt.querySelector('input').checked = true;
  });
});

if (checkoutForm){
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const payMethod = checkoutForm.querySelector('input[name="payMethod"]:checked');

    if (!name || !phone || cart.length === 0){
      showToast('Completá tus datos antes de continuar');
      return;
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
    window.open(url, '_blank', 'noopener');

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
