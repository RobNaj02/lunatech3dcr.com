/* =========================================================
   DIRECCIONES GUARDADAS
   CRUD simple sobre localStorage, separado por usuario de Clerk
   (así una PC compartida no mezcla direcciones entre cuentas).
   Sin sesión no hay dónde guardar, así que devuelve [] / no-op.
   Lo usan: la pestaña "Direcciones" dentro de Mi cuenta
   (assets/account.js) y el checkout (assets/main.js).
   ========================================================= */
(function(){
  const KEY_PREFIX = 'lunatech3d_addresses_';

  function escapeHtml(s){
    return (s || '').toString().replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function storageKey(){
    const uid = window.Clerk && window.Clerk.user ? window.Clerk.user.id : null;
    return uid ? KEY_PREFIX + uid : null;
  }

  function getAddresses(){
    const key = storageKey();
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveAddresses(list){
    const key = storageKey();
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  function addAddress(label, text){
    const list = getAddresses();
    list.push({ id: 'addr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label, text });
    saveAddresses(list);
    return list;
  }

  function removeAddress(id){
    const list = getAddresses().filter(a => a.id !== id);
    saveAddresses(list);
    return list;
  }

  /* ---------- Pestaña custom para el <UserProfile /> de Clerk ----------
     La usan tanto assets/account.js (página dedicada, mountUserProfile)
     como assets/auth-ui.js (popover del UserButton en el header), para
     no duplicar el formulario/lista en dos lugares. */
  function renderAddressesTab(el){
    function paint(){
      const list = getAddresses();
      el.innerHTML = `
        <div class="addr-page">
          <h2>Direcciones de envío</h2>
          <p>Guardalas acá para completarlas más rápido al finalizar una compra.</p>
          <form class="addr-form" id="addrForm">
            <div class="field">
              <label for="addrLabel">Nombre (ej. Casa, Oficina)</label>
              <input id="addrLabel" required maxlength="40" placeholder="Casa">
            </div>
            <div class="field">
              <label for="addrText">Dirección</label>
              <textarea id="addrText" rows="2" required placeholder="Provincia, cantón, señas..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Guardar dirección</button>
          </form>
          <div class="addr-list">
            ${list.length === 0
              ? '<p class="addr-empty">Todavía no guardaste ninguna dirección.</p>'
              : list.map(a => `
                <div class="addr-item">
                  <div><strong>${escapeHtml(a.label)}</strong><p>${escapeHtml(a.text)}</p></div>
                  <button type="button" class="addr-remove" data-id="${a.id}" aria-label="Eliminar dirección">✕</button>
                </div>`).join('')}
          </div>
        </div>`;

      el.querySelector('#addrForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const label = el.querySelector('#addrLabel').value.trim();
        const text = el.querySelector('#addrText').value.trim();
        if (!label || !text) return;
        addAddress(label, text);
        paint();
      });
      el.querySelectorAll('.addr-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          removeAddress(btn.dataset.id);
          paint();
        });
      });
    }
    paint();
  }

  function addressesCustomPage(){
    return {
      label: 'Direcciones',
      url: 'direcciones',
      mountIcon: (el) => {
        el.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 1114 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
      },
      unmountIcon: (el) => { el.innerHTML = ''; },
      mount: (el) => renderAddressesTab(el),
      unmount: (el) => { el.innerHTML = ''; },
    };
  }

  window.LunatechAddresses = { getAddresses, addAddress, removeAddress, addressesCustomPage };
})();
