/* =========================================================
   CLERK INIT
   Carga única y compartida de Clerk. El script del CDN (en el
   <head>) es async, así que puede terminar de cargar en cualquier
   momento relativo a este archivo — por eso esperamos a que
   window.Clerk exista antes de llamar a .load(). Otros scripts
   (auth-ui.js, account.js) consumen window.clerkReady en vez de
   cargar Clerk cada uno por su cuenta.

   Clerk es OPCIONAL en este sitio: sirve para guardar direcciones
   entre visitas (mi-cuenta.html), pero el checkout funciona como
   invitado sin necesidad de iniciar sesión (ver assets/main.js).
   Por eso, si Clerk no carga en un tiempo razonable (CDN caído,
   bloqueado por un adblocker, credenciales de un entorno de
   prueba que no reconoce este dominio, etc.), window.clerkReady
   se resuelve en null en vez de quedarse esperando para siempre
   — así el resto del sitio (navegación, carrito, checkout) sigue
   funcionando sin verse bloqueado por un problema de Clerk.
   ========================================================= */
window.clerkReady = new Promise((resolve) => {
  const TIMEOUT_MS = 6000;
  let settled = false;
  const finish = (value) => { if (!settled) { settled = true; resolve(value); } };

  const timer = setTimeout(() => {
    console.warn('[clerk-init] Clerk no cargó a tiempo — cuentas de usuario deshabilitadas por ahora, pero el resto del sitio (carrito, checkout) sigue funcionando.');
    finish(null);
  }, TIMEOUT_MS);

  const iv = setInterval(() => {
    if (window.Clerk) {
      clearInterval(iv);
      clearTimeout(timer);
      window.Clerk.load()
        .then(() => finish(window.Clerk))
        .catch((err) => {
          console.error('[clerk-init] Clerk.load() falló', err);
          finish(null);
        });
    }
  }, 30);
});
