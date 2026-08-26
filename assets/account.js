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

  function renderUnavailable(){
    mount.innerHTML = `
      <div class="account-signed-out">
        <h2>No pudimos cargar tu cuenta ahora mismo</h2>
        <p>El inicio de sesión no está disponible en este momento. Podés seguir comprando sin cuenta — el checkout no la necesita — o intentar de nuevo en un rato.</p>
        <a class="btn btn-ghost" href="tienda.html">Ir a la tienda</a>
      </div>`;
  }

  async function init(){
    mount.innerHTML = '<p class="account-loading">Cargando…</p>';
    const Clerk = await window.clerkReady;

    if (!Clerk){ renderUnavailable(); return; }

    let mountedEl = null;
    let lastUserId; // undefined hasta el primer paint()

    function paint(){
      /* Clerk.addListener dispara por muchos motivos internos, no solo
         login/logout — entre ellos, navegar entre las pestañas del
         propio <UserProfile /> (Perfil / Direcciones / Mis pedidos).
         Si repintamos en cada disparo, desmontamos y volvemos a montar
         el UserProfile A MITAD de esa navegación interna, lo que deja
         a Clerk en un estado roto (el panel se cierra y el ícono de
         cuenta del header deja de poder volver a abrirse hasta
         refrescar). Por eso solo repintamos cuando cambia de verdad
         quién está logueado. */
      const userId = Clerk.user ? Clerk.user.id : null;
      if (userId === lastUserId) return;
      lastUserId = userId;

      if (mountedEl){ try { Clerk.unmountUserProfile(mountedEl); } catch (e) { /* ya desmontado */ } }
      mount.innerHTML = '';
      mountedEl = null;

      if (Clerk.user){
        const el = document.createElement('div');
        el.className = 'account-mount';
        mount.appendChild(el);
        Clerk.mountUserProfile(el, { customPages: [window.LunatechAddresses.addressesCustomPage(), window.LunatechOrders.ordersCustomPage()] });
        mountedEl = el;
      } else {
        renderSignedOut();
      }
    }

    paint();
    Clerk.addListener(paint);
  }

  init();
})();
