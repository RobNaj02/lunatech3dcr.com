/* =========================================================
   LIGHTBOX
   Vanilla, dependency-free image viewer. Any <img data-lightbox
   data-lightbox-group="name"> becomes clickable; images sharing
   the same group value become a navigable set. Delegated on
   document so it also picks up images injected later by
   store.js/producto.js/comparar.js.
   ========================================================= */
(function(){
  let backdrop, imgEl, closeBtn, prevBtn, nextBtn, counterEl;
  let group = [];
  let index = 0;
  let lastFocused = null;

  function build(){
    backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada">
        <button type="button" class="lightbox-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <button type="button" class="lightbox-nav prev" aria-label="Imagen anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <img class="lightbox-img" alt="">
        <button type="button" class="lightbox-nav next" aria-label="Imagen siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        </button>
        <span class="lightbox-counter"></span>
      </div>`;
    document.body.appendChild(backdrop);
    imgEl = backdrop.querySelector('.lightbox-img');
    closeBtn = backdrop.querySelector('.lightbox-close');
    prevBtn = backdrop.querySelector('.lightbox-nav.prev');
    nextBtn = backdrop.querySelector('.lightbox-nav.next');
    counterEl = backdrop.querySelector('.lightbox-counter');

    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
  }

  function show(i){
    index = (i + group.length) % group.length;
    const target = group[index];
    imgEl.src = target.src;
    imgEl.alt = target.alt || '';
    const multi = group.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
    counterEl.style.display = multi ? '' : 'none';
    counterEl.textContent = multi ? `${index + 1} / ${group.length}` : '';
  }

  function open(img){
    if (!backdrop) build();
    const groupName = img.dataset.lightboxGroup || '';
    group = groupName
      ? Array.from(document.querySelectorAll(`img[data-lightbox][data-lightbox-group="${CSS.escape(groupName)}"]`))
      : [img];
    index = Math.max(0, group.indexOf(img));
    show(index);
    lastFocused = document.activeElement;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-lock');
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close(){
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-lock');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onKeydown(e){
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('img[data-lightbox]');
    if (!img) return;
    open(img);
  });
})();
