/* =========================================================
   ACCOUNT PAGE — monta el <UserProfile /> completo de Clerk en
   mi-cuenta.html, con una pestaña custom de "Direcciones" además
   de las de Clerk (perfil, seguridad, sesiones). Si no hay sesión,
   muestra un prompt para iniciar sesión en vez de la página en
   blanco. Se repinta con Clerk.addListener por si el usuario
   cierra sesión estando acá.
   ========================================================= */
(function(){
  const mount = document.getElementById('accountMount');
  if (!mount) return;

  /* ---------- Pestaña custom: Direcciones de envío ---------- */
  function renderAddressesTab(el){
    function paint(){
      const list = window.LunarAddresses ? window.LunarAddresses.getAddresses() : [];
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
                  <div><strong>${a.label}</strong><p>${a.text}</p></div>
                  <button type="button" class="addr-remove" data-id="${a.id}" aria-label="Eliminar dirección">✕</button>
                </div>`).join('')}
          </div>
        </div>`;

      el.querySelector('#addrForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const label = el.querySelector('#addrLabel').value.trim();
        const text = el.querySelector('#addrText').value.trim();
        if (!label || !text || !window.LunarAddresses) return;
        window.LunarAddresses.addAddress(label, text);
        paint();
      });
      el.querySelectorAll('.addr-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          window.LunarAddresses.removeAddress(btn.dataset.id);
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

  function renderSignedOut(){
    mount.innerHTML = `
      <div class="account-signed-out">
        <h2>Iniciá sesión para ver tu cuenta</h2>
        <p>Necesitás una cuenta para gestionar tus datos y ver tu perfil.</p>
        <button type="button" class="btn btn-primary" id="accountSignInBtn">Iniciar sesión / Registrarme</button>
      </div>`;
    document.getElementById('accountSignInBtn').addEventListener('click', () => window.Clerk.openSignIn());
  }

  async function init(){
    mount.innerHTML = '<p class="account-loading">Cargando…</p>';
    const Clerk = await window.clerkReady;

    function paint(){
      mount.innerHTML = '';
      if (Clerk.user){
        const el = document.createElement('div');
        el.className = 'account-mount';
        mount.appendChild(el);
        Clerk.mountUserProfile(el, { customPages: [addressesCustomPage()] });
      } else {
        renderSignedOut();
      }
    }

    paint();
    Clerk.addListener(paint);
  }

  init();
})();
