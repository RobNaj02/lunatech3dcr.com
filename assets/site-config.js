/* =========================================================
   SITE CONFIG — fuente única de datos de marca/contacto y del
   criterio de precios. Cambiá un valor acá y se propaga a todo
   el sitio (mensajes de WhatsApp, enlaces de contacto, sufijo
   de IVA en los precios) en vez de tener que buscarlo archivo
   por archivo.

   NOTA PARA EL DUEÑO DEL SITIO — datos que no se pueden inventar
   y quedan tal como estaban, solo centralizados acá:
   - instagramHandle / instagramUrl: actualizado a @lunatech3dcr
     (2026-08-24, a pedido del dueño — verificado disponible antes
     de asumirlo como el handle real).
   - whatsappNumber: actualizado a 8863-2253 (2026-08-24, a pedido del dueño).
   - email: info@lunatech3dcr.com (actualizado — antes era un Gmail
     personal usado como placeholder).
   - domain: se asume que lunatech3dcr.com es el dominio de
     producción real porque ya se usaba como canonical/sitemap
     en todo el proyecto. Si todavía no está activo, avisá para
     ajustar el SEO a la URL que sí esté publicada.
   ========================================================= */
window.SITE_CONFIG = {
  brandName: 'LUNATECH3D',
  whatsappNumber: '50688632253',        // formato wa.me, sin '+' ni espacios
  whatsappDisplay: '+506 8863-2253',
  email: 'info@lunatech3dcr.com',
  instagramHandle: '@lunatech3dcr',
  instagramUrl: 'https://instagram.com/lunatech3dcr',
  domain: 'https://lunatech3dcr.com'
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

/* ---------- Formato de colones ----------
   No usamos `n.toLocaleString('es-CR')` para mostrar precios: el
   separador de miles que produce esa configuración regional varía
   según el navegador/motor (Node en este mismo proyecto lo muestra
   con un espacio, no con punto), así que dos personas podían ver
   "₡10 500" y "₡10,500" en vez del mismo número. Este formateador
   fijo siempre usa punto como separador de miles (la convención
   usada en Costa Rica: ₡10.000), sin depender de esa configuración
   regional del navegador. Es el único lugar del proyecto que arma
   el símbolo ₡ + monto — todo lo demás llama a esto. */
function formatCRC(amount){
  const rounded = Math.round(amount) || 0;
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + '₡' + digits;
}
window.formatCRC = formatCRC;

/* ---------- Helper de enlace de WhatsApp ----------
   Arma la URL de wa.me con el número centralizado de arriba,
   para no repetir el número en cada script. */
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
