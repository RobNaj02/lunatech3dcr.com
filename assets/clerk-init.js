/* =========================================================
   CLERK INIT
   Carga única y compartida de Clerk. El script del CDN (en el
   <head>) es async, así que puede terminar de cargar en cualquier
   momento relativo a este archivo — por eso esperamos a que
   window.Clerk exista antes de llamar a .load(). Otros scripts
   (main.js, auth-ui.js) consumen window.clerkReady en vez de
   cargar Clerk cada uno por su cuenta.
   ========================================================= */
window.clerkReady = new Promise((resolve) => {
  if (window.Clerk) { resolve(window.Clerk); return; }
  const iv = setInterval(() => {
    if (window.Clerk) { clearInterval(iv); resolve(window.Clerk); }
  }, 30);
}).then(async (Clerk) => {
  await Clerk.load();
  return Clerk;
});
