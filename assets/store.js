/* =========================================================
   STORE MODULE — render de tarjetas, catálogo con filtros
   y búsqueda con autocompletado. Usa PRODUCTS/CATEGORIES de
   products.js y la función money() de main.js. Se auto-inicia
   solo si encuentra los elementos correspondientes en la página.
   ========================================================= */
(function(){

  /* Declaradas primero: renderProductCard (más abajo) las necesita
     apenas se llama, y las tarjetas se renderizan antes de llegar al
     bloque de wishlist/comparar. Un "const" definido más abajo pero
     usado antes de ejecutarse revienta con un ReferenceError (temporal
     dead zone) — por eso viven acá arriba, no junto a sus funciones. */
  const WISHLIST_KEY = 'lunatech3d_wishlist_v1';
  const COMPARE_KEY = 'lunatech3d_compare_v1';
  const RECENT_KEY = 'lunatech3d_recent_v1';
  const COMPARE_MAX = 4;
  const RECENT_MAX = 8;

  /* Minúsculas + sin tildes + espacios repetidos/al borde colapsados,
     para que "  PLA  " o "pla   blanco" encuentren lo mismo que
     "pla blanco" en vez de fallar por espacios de más. */
  function normalize(s){
    return (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  }

  function escapeHtml(s){
    return (s || '').toString().replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function categoryMeta(catId){
    return (typeof CATEGORIES !== 'undefined') ? CATEGORIES.find(c => c.id === catId) : null;
  }

  /* Algunos productos (PLA, PETG) tienen precio distinto por color:
     price queda en cada variante y product.price guarda el mínimo.
     Esto calcula el rango real para mostrar "Desde ₡X" cuando aplica. */
  function productPriceInfo(p){
    const variantPrices = (p.variants || []).map(v => v.price).filter(v => v != null);
    if (!variantPrices.length) return { price: p.price, isRange: false };
    const min = Math.min(...variantPrices);
    const max = Math.max(...variantPrices);
    return { price: min, isRange: min !== max };
  }
  window.productPriceInfo = productPriceInfo;

  /* ---------- STOCK EN VIVO ----------
     LunatechStock.get() devuelve null mientras Supabase todavía no
     cargó — en ese caso no mostramos nada de stock y confiamos
     en el "availability" estático de products.js hasta que llegue
     el dato real (evita parpadeos de "Agotado" en el primer render). */
  function getProductStockInfo(p){
    if (!window.LunatechStock) return { known: false, outOfStock: false, low: false, total: null };
    const hasVariants = p.variants && p.variants.length > 0;
    if (!hasVariants){
      const q = window.LunatechStock.get(p.id, '');
      if (q === null) return { known: false, outOfStock: false, low: false, total: null };
      return { known: true, outOfStock: q <= 0, low: q > 0 && q <= 5, total: q };
    }
    let sawKnown = false, total = 0;
    p.variants.forEach(v => {
      const q = window.LunatechStock.get(p.id, v.name);
      if (q !== null){ sawKnown = true; total += Math.max(q, 0); }
    });
    if (!sawKnown) return { known: false, outOfStock: false, low: false, total: null };
    return { known: true, outOfStock: total <= 0, low: total > 0 && total <= 5, total };
  }
  function isProductOutOfStock(p){
    const info = getProductStockInfo(p);
    return info.outOfStock || p.availability === false;
  }
  window.getProductStockInfo = getProductStockInfo;
  window.isProductOutOfStock = isProductOutOfStock;

  /* Grids que dependen de PRODUCTS + stock y deben refrescarse
     cada vez que llega un evento "stock:updated" (carga inicial
     de Supabase o un cambio en tiempo real). Cada bloque de abajo
     empuja su propia función de render acá. */
  const stockRefreshers = [];

  /* ---------- CARD RENDERING (compartido tienda + destacados) ---------- */
  function renderProductCard(p, opts){
    opts = opts || {};
    const img = p.mainImage || (p.images && p.images[0]) || 'assets/img/icon-mark.svg';
    const hasVariants = p.variants && p.variants.length > 0;
    let colorDots = '';
    if (p.variantType === 'color' && hasVariants){
      const shown = p.variants.slice(0, 4);
      const rest = p.variants.length - shown.length;
      colorDots = `<div class="color-preview">${shown.map(v => `<span class="dot" style="background:${v.hex}"></span>`).join('')}${
        rest > 0 ? `<span class="more">+${rest} colores</span>` : (p.variants.length > 1 ? `<span class="more">${p.variants.length} colores</span>` : '')
      }</div>`;
    }
    const stockInfo = getProductStockInfo(p);
    const outOfStock = stockInfo.outOfStock || p.availability === false;
    const footBtn = hasVariants
      ? `<a class="mini-btn" href="producto.html?id=${p.id}">Ver ${p.variantType === 'color' ? 'colores' : 'opciones'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`
      : `<button class="mini-btn add-cart"${outOfStock ? ' disabled' : ''}>${outOfStock ? 'Agotado' : 'Agregar'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>`;
    const stockBadge = outOfStock
      ? '<span class="stock-badge">Agotado</span>'
      : (stockInfo.known && stockInfo.low ? `<span class="stock-badge low">¡Últimas ${stockInfo.total}!</span>` : '');
    const catLabel = opts.showCategoryLabel ? `<div class="prod-cat-label">${p.categoryLabel}</div>` : '';
    const isWished = typeof isInWishlist === 'function' && isInWishlist(p.id);
    const isCompared = typeof isInCompare === 'function' && isInCompare(p.id);
    const priceInfo = productPriceInfo(p);
    return `
      <div class="prod-card reveal in${outOfStock ? ' out-of-stock' : ''}" data-category="${p.category}" data-brand="${p.brand || ''}" data-price="${priceInfo.price}" data-id="${p.id}" data-name="${p.name}" data-spec="${p.spec || ''}" data-photo="${img}">
        ${stockBadge}
        ${catLabel}
        <div class="prod-thumb-wrap">
          <a href="producto.html?id=${p.id}"><div class="prod-thumb has-photo"><img src="${img}" alt="${p.name}" loading="lazy" decoding="async"></div></a>
          <button class="card-fav${isWished ? ' active' : ''}" data-wish="${p.id}" aria-label="Guardar en favoritos" aria-pressed="${isWished}">
            <svg viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.35-9.5-8.5C.9 8.7 2.6 5 6.2 5c2 0 3.5 1.15 5.8 3.3C14.3 6.15 15.8 5 17.8 5c3.6 0 5.3 3.7 3.7 7.5C19 16.65 12 21 12 21z"/></svg>
          </button>
        </div>
        <a href="producto.html?id=${p.id}"><h3>${p.name}</h3></a>
        <p class="prod-spec">${p.spec || ''}</p>
        ${colorDots}
        <label class="card-compare"><input type="checkbox" data-compare="${p.id}"${isCompared ? ' checked' : ''}> Comparar</label>
        <div class="prod-foot">
          <div class="prod-price">${priceInfo.isRange ? 'Desde ' : ''}${money(priceInfo.price)}<span>${typeof priceSuffix === "function" ? priceSuffix() : "+ IVA"}</span></div>
          ${footBtn}
        </div>
      </div>`;
  }
  window.renderProductCard = renderProductCard;

  /* ---------- HOMEPAGE — destacados ---------- */
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid && typeof PRODUCTS !== 'undefined'){
    const featured = Object.values(PRODUCTS).filter(p => p.featured);
    const renderFeatured = () => { featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join(''); };
    renderFeatured();
    stockRefreshers.push(renderFeatured);
  }

  /* ---------- HOMEPAGE — stats ----------
     Se calculan en vivo desde el catálogo real (nunca se inventan
     cifras de negocio como "clientes atendidos" o "años activos"
     sin que LUNATECH3D confirme el dato). */
  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid && typeof PRODUCTS !== 'undefined'){
    const productCount = Object.keys(PRODUCTS).length;
    const categoryCount = typeof CATEGORIES !== 'undefined' ? CATEGORIES.length : 0;
    const variantCount = Object.values(PRODUCTS).reduce((sum, p) => sum + (p.variants ? p.variants.length : 0), 0);

    const stats = [
      { value: productCount, suffix: '+', label: 'Productos en catálogo' },
      { value: categoryCount, suffix: '', label: 'Categorías de materiales y accesorios' },
      { value: variantCount, suffix: '+', label: 'Opciones de color y tamaño' },
      { value: null, text: 'Costa Rica', label: 'Cobertura de envío' }
    ];

    statsGrid.innerHTML = stats.map((s, i) => `
      <div class="stat-card reveal in" style="transition-delay:${i * 70}ms">
        <div class="stat-number" ${s.value != null ? `data-count="${s.value}" data-suffix="${s.suffix || ''}"` : ''}>${s.value != null ? '0' + (s.suffix || '') : s.text}</div>
        <p class="stat-label">${s.label}</p>
      </div>
    `).join('');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const counters = statsGrid.querySelectorAll('[data-count]');
    function animateCount(el){
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion || !target){ el.textContent = target + suffix; return; }
      const duration = 900;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window){
      const statsIO = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting){ animateCount(e.target); statsIO.unobserve(e.target); } });
      }, { threshold: 0.4 });
      counters.forEach(el => statsIO.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- TIENDA — catálogo con filtros ---------- */
  const storeGrid = document.getElementById('storeGrid');
  if (storeGrid && typeof PRODUCTS !== 'undefined'){
    const groupTabsEl = document.getElementById('groupTabs');
    const subFiltersEl = document.getElementById('subFilters');
    const emptyStateEl = document.getElementById('emptyState');
    const brandSelectEl = document.getElementById('filterBrand');
    const availabilityEl = document.getElementById('filterAvailability');
    const priceMinEl = document.getElementById('filterPriceMin');
    const priceMaxEl = document.getElementById('filterPriceMax');
    const resultsCountEl = document.getElementById('resultsCount');
    const activeQueryEl = document.getElementById('activeQuery');

    const allProducts = Object.values(PRODUCTS);
    const params = new URLSearchParams(window.location.search);

    const state = {
      group: params.get('group') || 'todos',
      cat: params.get('cat') || 'todos',
      q: params.get('q') || '',
      brand: 'todas',
      onlyAvailable: false,
      priceMin: null,
      priceMax: null
    };

    // Si viene ?cat= directo, deducir el grupo dueño de esa categoría
    if (state.cat !== 'todos'){
      const meta = categoryMeta(state.cat);
      if (meta) state.group = meta.group;
    }

    function buildBrandOptions(){
      if (!brandSelectEl) return;
      const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).sort();
      brandSelectEl.innerHTML = '<option value="todas">Todas las marcas</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    function renderGroupTabs(){
      if (!groupTabsEl) return;
      const tabs = [{ id: 'todos', label: 'Todos' }, ...CATEGORY_GROUPS];
      groupTabsEl.innerHTML = tabs.map(t => `<button class="filter-btn${state.group === t.id ? ' active' : ''}" data-group="${t.id}">${t.label}</button>`).join('');
    }

    function renderSubFilters(){
      if (!subFiltersEl) return;
      if (state.group === 'todos'){ subFiltersEl.innerHTML = ''; subFiltersEl.style.display = 'none'; return; }
      const cats = CATEGORIES.filter(c => c.group === state.group);
      subFiltersEl.style.display = 'flex';
      subFiltersEl.innerHTML = [`<button class="filter-btn chip-sm${state.cat === 'todos' ? ' active' : ''}" data-cat="todos">Todas</button>`]
        .concat(cats.map(c => `<button class="filter-btn chip-sm${state.cat === c.id ? ' active' : ''}" data-cat="${c.id}">${c.label}${c.comingSoon ? ' <span class=\"soon-dot\"></span>' : ''}</button>`))
        .join('');
    }

    function matches(p){
      if (state.group !== 'todos'){
        const meta = categoryMeta(p.category);
        if (!meta || meta.group !== state.group) return false;
      }
      if (state.cat !== 'todos' && p.category !== state.cat) return false;
      if (state.brand !== 'todas' && p.brand !== state.brand) return false;
      if (state.onlyAvailable && (isProductOutOfStock(p) || !p.availability)) return false;
      const priceForFilter = productPriceInfo(p).price;
      if (state.priceMin != null && priceForFilter < state.priceMin) return false;
      if (state.priceMax != null && priceForFilter > state.priceMax) return false;
      if (state.q){
        const q = normalize(state.q);
        const hay = normalize([p.name, p.categoryLabel, p.brand, p.material, p.spec].filter(Boolean).join(' '));
        if (!hay.includes(q)) return false;
      }
      return true;
    }

    function activeCategoryComingSoon(){
      if (state.cat === 'todos') return false;
      const meta = categoryMeta(state.cat);
      return !!(meta && meta.comingSoon);
    }

    function render(){
      const list = allProducts.filter(matches);
      storeGrid.innerHTML = list.map(p => renderProductCard(p, { showCategoryLabel: true })).join('');

      if (resultsCountEl) resultsCountEl.textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
      if (activeQueryEl){
        activeQueryEl.style.display = state.q ? 'inline-flex' : 'none';
        activeQueryEl.querySelector('span') && (activeQueryEl.querySelector('span').textContent = state.q);
      }

      if (emptyStateEl){
        if (list.length === 0){
          emptyStateEl.style.display = 'block';
          const message = activeCategoryComingSoon()
            ? 'Esta categoría llega pronto a LUNATECH3D — escribinos por WhatsApp si la necesitás antes.'
            : (state.q ? `No encontramos productos para "${escapeHtml(state.q)}".` : 'No hay productos que coincidan con estos filtros.');
          emptyStateEl.innerHTML = `<p>${message}</p><button type="button" class="btn btn-ghost" data-reset-filters>Ver todo el catálogo</button>`;
        } else {
          emptyStateEl.style.display = 'none';
          emptyStateEl.innerHTML = '';
        }
      }
      renderGroupTabs();
      renderSubFilters();
    }

    function syncURL(){
      const p = new URLSearchParams();
      if (state.group !== 'todos') p.set('group', state.group);
      if (state.cat !== 'todos') p.set('cat', state.cat);
      if (state.q) p.set('q', state.q);
      const qs = p.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    }

    buildBrandOptions();
    renderGroupTabs();
    renderSubFilters();
    render();
    stockRefreshers.push(render);

    if (groupTabsEl) groupTabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-group]');
      if (!btn) return;
      state.group = btn.dataset.group;
      state.cat = 'todos';
      syncURL(); render();
    });
    if (subFiltersEl) subFiltersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.cat = btn.dataset.cat;
      syncURL(); render();
    });
    if (brandSelectEl) brandSelectEl.addEventListener('change', () => { state.brand = brandSelectEl.value; render(); });
    if (availabilityEl) availabilityEl.addEventListener('change', () => { state.onlyAvailable = availabilityEl.checked; render(); });
    if (priceMinEl) priceMinEl.addEventListener('input', () => { state.priceMin = priceMinEl.value ? Number(priceMinEl.value) : null; render(); });
    if (priceMaxEl) priceMaxEl.addEventListener('input', () => { state.priceMax = priceMaxEl.value ? Number(priceMaxEl.value) : null; render(); });
    if (activeQueryEl) activeQueryEl.addEventListener('click', () => {
      state.q = '';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      syncURL(); render();
    });
    if (emptyStateEl) emptyStateEl.addEventListener('click', (e) => {
      if (!e.target.closest('[data-reset-filters]')) return;
      state.group = 'todos'; state.cat = 'todos'; state.q = '';
      state.brand = 'todas'; state.onlyAvailable = false; state.priceMin = null; state.priceMax = null;
      if (brandSelectEl) brandSelectEl.value = 'todas';
      if (availabilityEl) availabilityEl.checked = false;
      if (priceMinEl) priceMinEl.value = '';
      if (priceMaxEl) priceMaxEl.value = '';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      syncURL(); render();
    });
  }

  /* ---------- SEARCH: autocomplete en el header ---------- */
  const searchToggle = document.getElementById('searchToggle');
  const searchPanel = document.getElementById('searchPanel');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClose = document.getElementById('searchClose');
  const POPULAR_SEARCHES = ['PLA', 'PETG', 'Resina', 'Filamento', 'Herramientas', 'Imanes'];

  if (searchToggle && searchPanel && searchInput && typeof PRODUCTS !== 'undefined'){
    const allProducts = Object.values(PRODUCTS);

    function openSearch(){
      searchPanel.classList.add('open');
      searchToggle.setAttribute('aria-expanded', 'true');
      searchPanel.setAttribute('aria-hidden', 'false');
      if (typeof window.trapFocusOpen === 'function') window.trapFocusOpen(searchInput);
      else setTimeout(() => searchInput.focus(), 50);
      renderSuggestions('');
    }
    function closeSearch(){
      /* closeSearch() se llama en cada click/Escape sin importar si
         el buscador está abierto (ver los listeners de abajo) — sin
         este guard, esas llamadas de más decrementarían el contador
         compartido de trapFocus y le robarían el foco atrapado a
         OTRO panel que sí esté abierto (carrito/checkout). */
      if (!searchPanel.classList.contains('open')) return;
      searchPanel.classList.remove('open');
      searchToggle.setAttribute('aria-expanded', 'false');
      searchPanel.setAttribute('aria-hidden', 'true');
      if (typeof window.trapFocusClose === 'function') window.trapFocusClose();
    }
    searchToggle.addEventListener('click', () => {
      searchPanel.classList.contains('open') ? closeSearch() : openSearch();
    });
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
      if ((e.key === '/' || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) && document.activeElement !== searchInput){
        e.preventDefault(); openSearch();
      }
    });
    document.addEventListener('click', (e) => {
      if (!searchPanel.contains(e.target) && !searchToggle.contains(e.target)) closeSearch();
    });

    function renderSuggestions(raw){
      const q = normalize(raw);
      if (!q){
        searchResults.innerHTML = `
          <p class="search-label">Búsquedas populares</p>
          <div class="search-chips">${POPULAR_SEARCHES.map(t => `<button type="button" class="search-chip" data-term="${t}">${t}</button>`).join('')}</div>
          <p class="search-label">Categorías</p>
          <div class="search-chips">${CATEGORY_GROUPS.map(g => `<a class="search-chip" href="tienda.html?group=${g.id}">${g.label}</a>`).join('')}</div>
        `;
        return;
      }
      const matches = allProducts.filter(p => normalize([p.name, p.categoryLabel, p.brand, p.material].filter(Boolean).join(' ')).includes(q)).slice(0, 6);
      if (!matches.length){
        searchResults.innerHTML = `<p class="search-empty">Sin resultados para "${escapeHtml(raw)}". <a href="tienda.html?q=${encodeURIComponent(raw)}">Ver en la tienda</a></p>`;
        return;
      }
      searchResults.innerHTML = `
        <p class="search-label">Productos</p>
        <div class="search-results-list">
          ${matches.map(p => `
            <a class="search-result" href="producto.html?id=${p.id}">
              <span class="sr-thumb"><img src="${p.mainImage || (p.images && p.images[0]) || 'assets/img/icon-mark.svg'}" alt=""></span>
              <span class="sr-txt"><strong>${p.name}</strong><small>${p.categoryLabel} · ${productPriceInfo(p).isRange ? 'Desde ' : ''}${money(productPriceInfo(p).price)}</small></span>
            </a>`).join('')}
        </div>
        <a class="search-viewall" href="tienda.html?q=${encodeURIComponent(raw)}">Ver todos los resultados para "${escapeHtml(raw)}"</a>
      `;
    }

    searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));
    searchResults.addEventListener('click', (e) => {
      const chip = e.target.closest('.search-chip[data-term]');
      if (chip){ searchInput.value = chip.dataset.term; renderSuggestions(chip.dataset.term); searchInput.focus(); }
    });
    searchInput.closest('form') && searchInput.closest('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const term = searchInput.value.trim();
      if (term) window.location.href = 'tienda.html?q=' + encodeURIComponent(term);
    });
  }

  /* =========================================================
     WISHLIST / COMPARE / RECENTLY VIEWED
     Todo persistido en localStorage — no requiere cuenta ni backend.
     ========================================================= */

  /* Migración desde las claves viejas 'lunarlab_*' (antes de renombrar
     el proyecto internamente a LUNATECH3D): si ya existía una lista
     guardada con el nombre viejo, se copia una sola vez a la clave
     nueva en vez de dejarla "perdida". */
  const LEGACY_KEYS = {
    [WISHLIST_KEY]: 'lunarlab_wishlist_v1',
    [COMPARE_KEY]: 'lunarlab_compare_v1',
    [RECENT_KEY]: 'lunarlab_recent_v1'
  };
  function readList(key){
    try {
      let raw = localStorage.getItem(key);
      if (raw === null && LEGACY_KEYS[key]){
        const legacy = localStorage.getItem(LEGACY_KEYS[key]);
        if (legacy !== null){
          raw = legacy;
          try { localStorage.setItem(key, legacy); localStorage.removeItem(LEGACY_KEYS[key]); } catch (e) { /* storage unavailable */ }
        }
      }
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    }
    catch (e) { return []; }
  }
  function writeList(key, list){ try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {} }

  function isInWishlist(id){ return readList(WISHLIST_KEY).includes(id); }
  function isInCompare(id){ return readList(COMPARE_KEY).includes(id); }

  function notify(msg){ if (typeof showToast === 'function') showToast(msg); }

  function toggleWishlist(id){
    let list = readList(WISHLIST_KEY);
    const nowSaved = !list.includes(id);
    list = nowSaved ? [...list, id] : list.filter(x => x !== id);
    writeList(WISHLIST_KEY, list);
    renderWishlistDrawer();
    document.querySelectorAll(`[data-wish="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', nowSaved);
      btn.setAttribute('aria-pressed', String(nowSaved));
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
    });
    notify(nowSaved ? 'Guardado en favoritos' : 'Quitado de favoritos');
    return nowSaved;
  }

  function toggleCompare(id){
    let list = readList(COMPARE_KEY);
    if (list.includes(id)){
      list = list.filter(x => x !== id);
    } else {
      if (list.length >= COMPARE_MAX){ notify(`Podés comparar hasta ${COMPARE_MAX} productos a la vez`); return isInCompare(id); }
      list = [...list, id];
    }
    writeList(COMPARE_KEY, list);
    renderCompareBar();
    return list.includes(id);
  }

  function addRecentlyViewed(id){
    let list = readList(RECENT_KEY).filter(x => x !== id);
    list.unshift(id);
    writeList(RECENT_KEY, list.slice(0, RECENT_MAX));
  }

  function productThumb(p){ return p.mainImage || (p.images && p.images[0]) || 'assets/img/icon-mark.svg'; }

  function renderWishlistDrawer(){
    const badge = document.getElementById('wishlistBadge');
    const itemsEl = document.getElementById('wishlistItems');
    if (typeof PRODUCTS === 'undefined') return;
    /* Un id de un producto que ya no existe en el catálogo (removido,
       renombrado) se filtra acá: si no, el badge podía mostrar un
       número más alto que la cantidad real de tarjetas que se ven al
       abrir el drawer (el .map de abajo ya las saltea con `if (!p)
       return ''`, pero el badge seguía contando el total sin filtrar). */
    const ids = readList(WISHLIST_KEY).filter(id => PRODUCTS[id]);
    if (badge){ badge.textContent = ids.length; badge.style.display = ids.length ? 'flex' : 'none'; }
    if (!itemsEl) return;
    if (!ids.length){ itemsEl.innerHTML = '<p class="cart-empty">Todavía no guardaste productos. Tocá el corazón en cualquier producto para guardarlo acá.</p><a class="btn btn-ghost" style="width:100%;justify-content:center" href="tienda.html">Ver catálogo</a>'; return; }
    itemsEl.innerHTML = ids.map(id => {
      const p = PRODUCTS[id];
      if (!p) return '';
      return `
        <div class="cart-item" data-id="${p.id}">
          <a class="cart-item-thumb" href="producto.html?id=${p.id}"><img src="${productThumb(p)}" alt="${p.name}"></a>
          <div class="cart-item-info">
            <a href="producto.html?id=${p.id}"><h4>${p.name}</h4></a>
            <span class="spec">${productPriceInfo(p).isRange ? 'Desde ' : ''}${money(productPriceInfo(p).price)}</span>
            <button class="remove-item" data-remove-wish="${p.id}" type="button">Quitar</button>
          </div>
        </div>`;
    }).join('');
  }
  window.renderWishlistDrawer = renderWishlistDrawer;

  function renderCompareBar(){
    const ids = readList(COMPARE_KEY);
    const bar = document.getElementById('compareBar');
    const thumbsEl = document.getElementById('compareThumbs');
    const countEl = document.getElementById('compareCount');
    if (!bar || typeof PRODUCTS === 'undefined') return;
    bar.classList.toggle('open', ids.length > 0);
    if (countEl) countEl.textContent = ids.length;
    if (thumbsEl){
      thumbsEl.innerHTML = ids.map(id => {
        const p = PRODUCTS[id];
        return p ? `<span class="compare-thumb"><img src="${productThumb(p)}" alt="${p.name}"></span>` : '';
      }).join('');
    }
    document.querySelectorAll('[data-compare]').forEach(chk => { chk.checked = ids.includes(chk.dataset.compare); });
  }
  window.renderCompareBar = renderCompareBar;

  window.toggleWishlist = toggleWishlist;
  window.isInWishlist = isInWishlist;
  window.toggleCompare = toggleCompare;
  window.isInCompare = isInCompare;
  window.addRecentlyViewed = addRecentlyViewed;
  window.readCompareList = () => readList(COMPARE_KEY);
  window.clearCompareList = () => { writeList(COMPARE_KEY, []); renderCompareBar(); };
  window.readWishlist = () => readList(WISHLIST_KEY);

  renderWishlistDrawer();
  renderCompareBar();

  /* wishlist drawer open/close */
  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistBackdrop = document.getElementById('wishlistBackdrop');
  const wishlistClose = document.getElementById('wishlistClose');
  function openWishlist(){
    if (!wishlistDrawer) return;
    renderWishlistDrawer();
    wishlistDrawer.classList.add('open'); wishlistBackdrop.classList.add('open');
    wishlistDrawer.setAttribute('aria-hidden', 'false');
    if (typeof window.trapFocusOpen === 'function') window.trapFocusOpen(wishlistClose);
  }
  function closeWishlist(){
    if (!wishlistDrawer) return;
    wishlistDrawer.classList.remove('open'); wishlistBackdrop.classList.remove('open');
    wishlistDrawer.setAttribute('aria-hidden', 'true');
    if (typeof window.trapFocusClose === 'function') window.trapFocusClose();
  }
  window.closeWishlistDrawer = closeWishlist;
  if (wishlistBtn) wishlistBtn.addEventListener('click', openWishlist);
  if (wishlistClose) wishlistClose.addEventListener('click', closeWishlist);
  if (wishlistBackdrop) wishlistBackdrop.addEventListener('click', closeWishlist);
  if (wishlistDrawer) wishlistDrawer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-wish]');
    if (!btn) return;
    toggleWishlist(btn.dataset.removeWish);
  });

  /* compare bar clear */
  const compareClear = document.getElementById('compareClear');
  if (compareClear) compareClear.addEventListener('click', () => window.clearCompareList());

  /* delegado: corazón de favoritos y checkbox de comparar en cualquier tarjeta */
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-wish]');
    if (favBtn) toggleWishlist(favBtn.dataset.wish);
  });
  document.addEventListener('change', (e) => {
    const chk = e.target.closest('[data-compare]');
    if (chk) chk.checked = toggleCompare(chk.dataset.compare);
  });

  /* ---------- RELATED + RECENTLY VIEWED (página de producto) ---------- */
  const relatedGrid = document.getElementById('relatedGrid');
  const recentGrid = document.getElementById('recentGrid');
  if ((relatedGrid || recentGrid) && typeof PRODUCTS !== 'undefined'){
    const currentId = new URLSearchParams(window.location.search).get('id');
    const current = PRODUCTS[currentId];

    if (current && relatedGrid){
      const related = Object.values(PRODUCTS).filter(p => p.id !== current.id && p.category === current.category).slice(0, 4);
      if (related.length){
        const renderRelated = () => { relatedGrid.innerHTML = related.map(p => renderProductCard(p)).join(''); };
        renderRelated();
        document.getElementById('relatedSection').style.display = 'block';
        stockRefreshers.push(renderRelated);
      }
    }

    if (recentGrid){
      const recentIds = readList(RECENT_KEY).filter(id => id !== currentId);
      const recent = recentIds.map(id => PRODUCTS[id]).filter(Boolean).slice(0, 4);
      if (recent.length){
        const renderRecent = () => { recentGrid.innerHTML = recent.map(p => renderProductCard(p)).join(''); };
        renderRecent();
        document.getElementById('recentSection').style.display = 'block';
        stockRefreshers.push(renderRecent);
      }
    }

    if (current) addRecentlyViewed(current.id);
  }

  document.addEventListener('stock:updated', () => { stockRefreshers.forEach(fn => fn()); });

})();
