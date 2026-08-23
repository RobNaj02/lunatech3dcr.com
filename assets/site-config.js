/* =========================================================
   SITE CONFIG — fuente única de datos de marca/contacto y del
   criterio de precios. Cambiá un valor acá y se propaga a todo
   el sitio (mensajes de WhatsApp, enlaces de contacto, sufijo
   de IVA en los precios) en vez de tener que buscarlo archivo
   por archivo.

   NOTA PARA EL DUEÑO DEL SITIO — datos que no se pueden inventar
   y quedan tal como estaban, solo centralizados acá:
   - instagramHandle / instagramUrl: sigue siendo @lunarlab3d.
     Si ya existe una cuenta @lunatech3d, actualizá este único
     valor (no lo cambiamos nosotros sin confirmación tuya).
   - whatsappNumber / email: son los que ya estaban en uso.
   - domain: se asume que lunatech3d.cr es el dominio de
     producción real porque ya se usaba como canonical/sitemap
     en todo el proyecto. Si todavía no está activo, avisá para
     ajustar el SEO a la URL que sí esté publicada.
   ========================================================= */
window.SITE_CONFIG = {
  brandName: 'LUNATECH3D',
  whatsappNumber: '50688019404',        // formato wa.me, sin '+' ni espacios
  whatsappDisplay: '+506 8801-9404',
  email: 'robi.bilps@gmail.com',
  instagramHandle: '@lunarlab3d',       // TODO(dueño): actualizar si cambia la cuenta
  instagramUrl: 'https://instagram.com/lunarlab3d',
  domain: 'https://lunatech3d.cr'
};

/* ---------- Criterio de precios / IVA ----------
   Hoy el sitio muestra precios de referencia SIN impuestos y
   avisa "+ IVA" junto a cada precio (así estaba antes de esta
   auditoría) — no inventamos un porcentaje ni un régimen fiscal
   nuevo. Este objeto es el único lugar que hay que tocar si el
   dueño decide más adelante mostrar precios con IVA incluido o
   agregar el porcentaje real:
     pricesIncludeTax: false -> el precio mostrado es antes de IVA
     taxRatePercent: null    -> no se conoce/aplica un % fijo acá,
                                 así que no se calcula nada, solo
                                 se avisa "+ IVA"
   Si más adelante se define taxRatePercent (ej. 13), el helper
   priceSuffix() de abajo puede empezar a mostrar el monto final. */
window.PRICING_CONFIG = {
  pricesIncludeTax: false,
  taxRatePercent: null,
  taxLabel: 'IVA'
};

function priceSuffix(){
  const cfg = window.PRICING_CONFIG || {};
  if (cfg.pricesIncludeTax) return `${cfg.taxLabel || 'IVA'} incl.`;
  return `+ ${cfg.taxLabel || 'IVA'}`;
}
window.priceSuffix = priceSuffix;

/* ---------- Helper de enlace de WhatsApp ----------
   Arma la URL de wa.me con el número centralizado de arriba,
   para no repetir '50688019404' en cada script. */
function waLink(text){
  const number = (window.SITE_CONFIG && window.SITE_CONFIG.whatsappNumber) || '';
  return `https://wa.me/${number}` + (text ? `?text=${encodeURIComponent(text)}` : '');
}
window.waLink = waLink;

/* ---------- Hidratación de enlaces de contacto ----------
   Los enlaces de WhatsApp/correo/Instagram quedan escritos en el
   HTML con el valor correcto de hoy (así el sitio funciona igual
   aunque este script no cargara), pero además llevan un atributo
   data-* para que, si el dato cambia en SITE_CONFIG de arriba, se
   actualice acá una sola vez en vez de tener que buscar y
   reemplazar en cada uno de los archivos .html del sitio. */
document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.SITE_CONFIG || {};
  document.querySelectorAll('[data-wa-link]').forEach(el => {
    el.setAttribute('href', waLink(el.getAttribute('data-wa-text') || ''));
  });
  document.querySelectorAll('[data-email-link]').forEach(el => {
    if (cfg.email) el.setAttribute('href', 'mailto:' + cfg.email);
  });
  document.querySelectorAll('[data-ig-link]').forEach(el => {
    if (cfg.instagramUrl) el.setAttribute('href', cfg.instagramUrl);
  });
  document.querySelectorAll('[data-ig-handle]').forEach(el => {
    if (cfg.instagramHandle) el.textContent = cfg.instagramHandle;
  });
});
