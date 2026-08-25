/* =========================================================
   FORMULARIO DE CONTACTO — abre WhatsApp con el mensaje ya
   redactado, igual que el checkout y el newsletter del footer.
   Vive en su propio archivo (no inline en contacto.html) para
   que la Content-Security-Policy del sitio no necesite permitir
   scripts inline.
   ========================================================= */
(function(){
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ctName').value.trim();
    const topic = document.getElementById('ctTopic').value;
    const message = document.getElementById('ctMessage').value.trim();
    if (!name || !message) return;
    const text = `Hola LUNATECH3D! Soy ${name}.\nMotivo: ${topic}\n\n${message}`;
    window.open((typeof waLink === 'function' ? waLink(text) : 'https://wa.me/50688019404?text=' + encodeURIComponent(text)), '_blank', 'noopener');
    contactForm.reset();
  });
})();
