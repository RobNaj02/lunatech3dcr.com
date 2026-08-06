(function(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS[id] : null;

  const container = document.getElementById('productDetail');
  const notFound = document.getElementById('notFound');

  if (!product) {
    if (container) container.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
    return;
  }

  document.title = product.name + ' · LUNATECH3D';

  const pageUrl = 'https://lunatech3d.cr/producto.html?id=' + encodeURIComponent(product.id);
  const shareDescription = (product.description || '').slice(0, 155).trim();
  const shareImage = 'https://lunatech3d.cr/' + (product.mainImage || (product.images && product.images[0]) || 'assets/img/icon-mark.svg');
  const setMeta = (id, attr, value) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, value); };
  setMeta('metaDescription', 'content', shareDescription);
  setMeta('canonicalLink', 'href', pageUrl);
  setMeta('ogUrl', 'content', pageUrl);
  setMeta('ogTitle', 'content', product.name + ' · LUNATECH3D');
  setMeta('ogDescription', 'content', shareDescription);
  setMeta('ogImage', 'content', shareImage);
  setMeta('twitterTitle', 'content', product.name + ' · LUNATECH3D');
  setMeta('twitterDescription', 'content', shareDescription);
  setMeta('twitterImage', 'content', shareImage);

  const productLd = document.createElement('script');
  productLd.type = 'application/ld+json';
  productLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: shareDescription,
    image: shareImage,
    sku: product.id,
    category: product.categoryLabel,
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'CRC',
      price: product.price,
      availability: 'https://schema.org/InStock'
    }
  });
  document.head.appendChild(productLd);

  const breadcrumbLd = document.createElement('script');
  breadcrumbLd.type = 'application/ld+json';
  breadcrumbLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://lunatech3d.cr/' },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: 'https://lunatech3d.cr/tienda.html' },
      { '@type': 'ListItem', position: 3, name: product.name, item: pageUrl }
    ]
  });
  document.head.appendChild(breadcrumbLd);

  /* ---------- Favoritos / comparar / compartir ---------- */
  const wishBtn = document.getElementById('productWishBtn');
  const wishLabel = document.getElementById('productWishLabel');
  function syncWishBtn(){
    const saved = typeof isInWishlist === 'function' && isInWishlist(product.id);
    if (wishBtn) wishBtn.classList.toggle('active', saved);
    if (wishBtn) wishBtn.setAttribute('aria-pressed', String(saved));
    if (wishLabel) wishLabel.textContent = saved ? 'Guardado en favoritos' : 'Guardar en favoritos';
  }
  if (wishBtn){
    syncWishBtn();
    wishBtn.addEventListener('click', () => { toggleWishlist(product.id); syncWishBtn(); });
  }

  const compareCheck = document.getElementById('productCompareCheck');
  if (compareCheck){
    compareCheck.checked = typeof isInCompare === 'function' && isInCompare(product.id);
    compareCheck.addEventListener('change', () => { compareCheck.checked = toggleCompare(product.id); });
  }

  const shareText = product.name + ' · LUNATECH3D';
  const shareNative = document.getElementById('shareNative');
  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareCopy = document.getElementById('shareCopy');
  if (shareWhatsapp) shareWhatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + pageUrl);
  if (shareNative){
    if (navigator.share){
      shareNative.addEventListener('click', () => { navigator.share({ title: shareText, url: pageUrl }).catch(() => {}); });
    } else {
      shareNative.style.display = 'none';
    }
  }
  if (shareCopy){
    shareCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(pageUrl).then(() => {
        if (typeof showToast === 'function') showToast('Enlace copiado');
      }).catch(() => {
        if (typeof showToast === 'function') showToast('No se pudo copiar el enlace');
      });
    });
  }

  const catMeta = (typeof CATEGORIES !== 'undefined') ? CATEGORIES.find(c => c.id === product.category) : null;
  document.getElementById('crumbCategory').textContent = catMeta ? catMeta.label : product.categoryLabel;
  document.getElementById('crumbCategory').href = 'tienda.html?cat=' + product.category;
  document.getElementById('crumbProduct').textContent = product.name;

  document.getElementById('pCatLabel').textContent = product.categoryLabel;
  document.getElementById('pName').textContent = product.name;
  document.getElementById('pSpec').textContent = product.spec;
  document.getElementById('pPrice').innerHTML = '₡' + product.price.toLocaleString('es-CR') + ' <span>+ IVA</span>';
  document.getElementById('pDesc').textContent = product.description;

  const specList = document.getElementById('pSpecList');
  if (specList && product.specs){
    specList.innerHTML = product.specs.map(([k,v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`).join('');
  }

  let selectedVariant = null;
  let qty = 1;

  const colorSectionEl = document.getElementById('colorSection');
  const variantLabelEl = document.getElementById('variantLabel');
  const swatchesEl = document.getElementById('swatches');
  const pickedLabel = document.getElementById('pickedLabel');
  const addBtn = document.getElementById('productAddBtn');
  const addNote = document.getElementById('addNote');
  const qtyValEl = document.getElementById('productQtyVal');
  const galleryEl = document.getElementById('productGallery');

  const hasVariants = product.variants && product.variants.length > 0;

  /* ---------- Image slider ----------
     Two cases:
     1) Product has variants that each carry a photo -> slider syncs with color/size selection.
     2) Product has a plain "images" array (no variants) -> simple browsable slider.
  ------------------------------------------------------------------ */
  let goToSlide = null;
  let currentSlide = 0;
  const variantsHavePhotos = hasVariants && product.variants.every(v => v.image);
  const hasGalleryImages = variantsHavePhotos || (product.images && product.images.length > 0);

  if (hasGalleryImages && galleryEl){
    const slides = [];
    let offset = 0;

    if (variantsHavePhotos){
      if (product.mainImage) slides.push({ image: product.mainImage, alt: product.name, variantIdx: null });
      product.variants.forEach((v, idx) => slides.push({ image: v.image, alt: `${product.name} — ${v.name}`, variantIdx: idx }));
      offset = product.mainImage ? 1 : 0;
    } else {
      product.images.forEach((img, i) => slides.push({ image: img, alt: `${product.name} — foto ${i + 1}`, variantIdx: null }));
    }

    galleryEl.classList.add('has-slider');
    galleryEl.innerHTML = `
      <div class="gallery-slider">
        <div class="gallery-track" id="galleryTrack">
          ${slides.map((s, i) => `<div class="gallery-slide"><img src="${s.image}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" data-lightbox data-lightbox-group="product-gallery"></div>`).join('')}
        </div>
        ${slides.length > 1 ? `
        <button type="button" class="gallery-arrow prev" id="galleryPrev" aria-label="Imagen anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <button type="button" class="gallery-arrow next" id="galleryNext" aria-label="Imagen siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        </button>
        <div class="gallery-dots" id="galleryDots">
          ${slides.map((s, i) => `<button type="button" class="g-dot" data-idx="${i}" aria-label="Ver imagen ${i + 1}"></button>`).join('')}
        </div>` : ''}
      </div>`;

    const track = document.getElementById('galleryTrack');
    const getDots = () => galleryEl.querySelectorAll('.g-dot');

    goToSlide = function(idx, syncColor){
      currentSlide = idx;
      track.style.transform = `translateX(-${idx * 100}%)`;
      getDots().forEach((d, i) => d.classList.toggle('active', i === idx));
      if (syncColor){
        const variantIdx = slides[idx].variantIdx;
        if (variantIdx !== null){
          const swatchEls = swatchesEl.querySelectorAll('.swatch');
          const target = swatchEls[variantIdx];
          if (target && !target.classList.contains('unavailable')) target.click();
        }
      }
    };

    if (slides.length > 1){
      document.getElementById('galleryPrev').addEventListener('click', () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length, true);
      });
      document.getElementById('galleryNext').addEventListener('click', () => {
        goToSlide((currentSlide + 1) % slides.length, true);
      });
      getDots().forEach(d => d.addEventListener('click', () => goToSlide(parseInt(d.dataset.idx, 10), true)));
    }

    goToSlide(0, false);

    // Only expose the color/size → slide jump when the slider actually has
    // one slide per variant. Otherwise (plain photo gallery, e.g. a product
    // with a fixed set of reference photos) there's nothing to sync to, and
    // calling it with an out-of-range index broke the slider (blank frame).
    if (variantsHavePhotos){
      goToSlide.forVariant = (variantIdx) => goToSlide(variantIdx + offset, false);
    }
  }

  /* ---------- Variant selector (color or size) ---------- */
  if (hasVariants){
    variantLabelEl.textContent = product.variantLabel || 'Opción';
    const isColor = product.variantType === 'color';
    swatchesEl.className = isColor ? 'swatches' : 'variant-chips';

    swatchesEl.innerHTML = product.variants.map((v, idx) => {
      const unavailable = v.available === false;
      if (isColor){
        return `
          <button type="button" class="swatch ${unavailable ? 'unavailable' : ''}" style="background:${v.hex}" data-idx="${idx}" aria-label="${v.name}${unavailable ? ' · Agotado' : ''}" ${unavailable ? 'disabled' : ''}>
            <span class="swatch-tooltip">${v.name}${unavailable ? ' · Agotado' : ''}</span>
          </button>`;
      }
      return `
        <button type="button" class="variant-chip ${unavailable ? 'unavailable' : ''}" data-idx="${idx}" ${unavailable ? 'disabled' : ''}>
          ${v.name}${unavailable ? ' · Agotado' : ''}
        </button>`;
    }).join('');

    const selector = isColor ? '.swatch' : '.variant-chip';
    swatchesEl.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('unavailable')) return;
        swatchesEl.querySelectorAll(selector).forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        const idx = parseInt(el.dataset.idx, 10);
        selectedVariant = product.variants[idx];
        pickedLabel.textContent = selectedVariant.name;
        addBtn.disabled = false;
        addNote.style.display = 'none';
        if (goToSlide && goToSlide.forVariant) goToSlide.forVariant(idx);
      });
    });
  } else {
    colorSectionEl.style.display = 'none';
    addBtn.disabled = false;
    addNote.style.display = 'none';
  }

  document.getElementById('qtyDec').addEventListener('click', () => {
    if (qty > 1) qty--;
    qtyValEl.textContent = qty;
  });
  document.getElementById('qtyInc').addEventListener('click', () => {
    qty++;
    qtyValEl.textContent = qty;
  });

  addBtn.addEventListener('click', () => {
    if (hasVariants && !selectedVariant) return;
    const variantSuffix = selectedVariant ? '-' + selectedVariant.name.toLowerCase().replace(/\s+/g,'-') : '';
    const itemId = product.id + variantSuffix;
    const itemName = selectedVariant ? `${product.name} — ${selectedVariant.name}` : product.name;
    const itemImage = (selectedVariant && selectedVariant.image) || product.mainImage || (product.images && product.images[0]) || null;

    const existing = cart.find(i => i.id === itemId);
    if (existing) existing.qty += qty;
    else cart.push({ id: itemId, name: itemName, price: product.price, spec: product.spec, category: product.category, image: itemImage, qty });

    renderCart();
    showToast(`${qty} × ${itemName} agregado al carrito`);
    openCart();
  });
})();
