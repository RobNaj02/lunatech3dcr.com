/* =========================================================
   AUTH UI (header)
   Pinta el control de cuenta en dos lugares posibles del header:
   - #authSlot: ícono junto al carrito (visible desde ~601px, ver
     style.css) — deslogeado abre el sign-in, logeado monta el
     UserButton nativo de Clerk (avatar + menú: cuenta / salir).
   - #authSlotMobile: link de texto dentro del menú hamburguesa
     (visible solo por debajo de ese mismo breakpoint), para que
     la cuenta siga siendo alcanzable en celulares chicos sin
     competir por espacio con los demás íconos del header.
   Se repinta solo con Clerk.addListener cuando cambia la sesión.
   ========================================================= */
(function(){
  function signInIcon(){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cart-btn';
    btn.id = 'authSignInBtn';
    btn.setAttribute('aria-label', 'Iniciar sesión o crear cuenta');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 21a8 8 0 10-16 0"/><circle cx="12" cy="8" r="4"/></svg>`;
    btn.addEventListener('click', () => window.Clerk.openSignIn({ redirectUrl: window.location.href }));
    return btn;
  }

  function signInLink(){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-auth-link';
    btn.textContent = 'Iniciar sesión / Registrarme';
    btn.addEventListener('click', () => window.Clerk.openSignIn({ redirectUrl: window.location.href }));
    return btn;
  }

  function accountLink(){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-auth-link';
    btn.textContent = 'Mi cuenta';
    btn.addEventListener('click', () => { window.location.href = 'mi-cuenta.html'; });
    return btn;
  }

  async function render(){
    const Clerk = await window.clerkReady;
    const iconSlot = document.getElementById('authSlot');
    const mobileSlot = document.getElementById('authSlotMobile');

    if (!Clerk){
      /* Clerk no cargó (ver assets/clerk-init.js) — no hay cuentas
         disponibles por ahora, pero eso no debe bloquear el resto
         del sitio. Dejamos los slots vacíos en vez de un botón que
         fallaría al hacer clic. */
      if (iconSlot) iconSlot.innerHTML = '';
      if (mobileSlot) mobileSlot.innerHTML = '';
      return;
    }

    let lastUserId; // undefined hasta el primer paint()

    function paint(){
      /* Clerk.addListener dispara por muchos motivos internos, no
         solo login/logout — entre ellos, navegar entre las pestañas
         del propio popover de cuenta (Perfil / Direcciones / Mis
         pedidos). Repintar en cada disparo desmonta y remonta el
         UserButton a mitad de esa navegación, lo que deja a Clerk en
         un estado roto (el ícono de cuenta del header desaparece y no
         vuelve a abrir hasta refrescar). Por eso solo repintamos
         cuando cambia de verdad quién está logueado. */
      const userId = Clerk.user ? Clerk.user.id : null;
      if (userId === lastUserId) return;
      lastUserId = userId;

      if (iconSlot){
        try { Clerk.unmountUserButton(iconSlot); } catch (e) { /* ya desmontado */ }
        iconSlot.innerHTML = '';
        if (Clerk.user){
          /* Popover normal de Clerk (no 'navigation': el sitio es
             multi-página estática, no un SPA con router — con
             userProfileMode:'navigation' el click en "Manage account"
             solo empuja un hash a la URL y no navega a ningún lado.
             La página dedicada (mi-cuenta.html) sigue existiendo,
             solo que se llega ahí por el link, no desde acá. */
          Clerk.mountUserButton(iconSlot, {
            userProfileProps: { customPages: [window.LunatechAddresses.addressesCustomPage(), window.LunatechOrders.ordersCustomPage()] },
          });
        }
        else iconSlot.appendChild(signInIcon());
      }
      if (mobileSlot){
        mobileSlot.innerHTML = '';
        mobileSlot.appendChild(Clerk.user ? accountLink() : signInLink());
      }
    }

    paint();
    Clerk.addListener(paint);
  }

  render();
})();
