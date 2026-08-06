/* =========================================================
   ACCOUNT PAGE — monta el <UserProfile /> completo de Clerk en
   mi-cuenta.html, con la pestaña custom de "Direcciones" (definida
   en assets/addresses.js, compartida con el popover del header).
   Si no hay sesión, muestra un prompt para iniciar sesión en vez
   de la página en blanco. Se repinta con Clerk.addListener por si
   el usuario cierra sesión estando acá.
   ========================================================= */
(function(){
  const mount = document.getElementById('accountMount');
  if (!mount) return;

  function renderSignedOut(){
    mount.innerHTML = `
      <div class="account-signed-out">
        <h2>Iniciá sesión para ver tu cuenta</h2>
        <p>Necesitás una cuenta para gestionar tus datos y ver tu perfil.</p>
        <button type="button" class="btn btn-primary" id="accountSignInBtn">Iniciar sesión / Registrarme</button>
      </div>`;
    document.getElementById('accountSignInBtn').addEventListener('click', () => window.Clerk.openSignIn({ redirectUrl: window.location.href }));
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
        Clerk.mountUserProfile(el, { customPages: [window.LunarAddresses.addressesCustomPage()] });
      } else {
        renderSignedOut();
      }
    }

    paint();
    Clerk.addListener(paint);
  }

  init();
})();
