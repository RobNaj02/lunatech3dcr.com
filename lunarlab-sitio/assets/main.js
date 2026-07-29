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
   Cart lives only in memory for this page session (no
   localStorage — see project note on artifact restrictions).
   ========================================================= */
const WHATSAPP_NUMBER = '50688019404';
const CURRENCY = '₡';

let cart = []; // {id, name, price, spec, category, qty}

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

function renderCart(){
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
      <div class="cart-item-thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/></svg></div>
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

document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('[data-id]');
    if (!card) return;
    addToCart({
      id: card.dataset.id,
      name: card.dataset.name,
      price: parseInt(card.dataset.price, 10),
      spec: card.dataset.spec || '',
      category: card.dataset.category || ''
    }, btn);
  });
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
}
function closeCart(){
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
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
}
function closeCheckout(){
  if (!checkoutPanel) return;
  checkoutPanel.classList.remove('open');
  checkoutBackdrop.classList.remove('open');
}
if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
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

    let msg = `Hola LunarLab! Quiero hacer este pedido:\n\n`;
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

/* ---------- Store filters (tienda.html) ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const storeCards = document.querySelectorAll('.store-grid [data-category]');
const emptyState = document.getElementById('emptyState');
function applyFilter(cat){
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
  let visible = 0;
  storeCards.forEach(card => {
    const match = cat === 'todos' || card.dataset.category === cat;
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
}
if (filterBtns.length){
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam && [...filterBtns].some(b => b.dataset.filter === catParam)) {
    applyFilter(catParam);
  }
}

/* init */
renderCart();
