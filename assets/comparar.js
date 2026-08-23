(function(){
  const wrap = document.getElementById('compareTableWrap');
  const emptyEl = document.getElementById('compareEmpty');
  if (!wrap || typeof PRODUCTS === 'undefined') return;

  function render(){
    const ids = typeof readCompareList === 'function' ? readCompareList() : [];
    const items = ids.map(id => PRODUCTS[id]).filter(Boolean);

    if (!items.length){
      wrap.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    const labels = [];
    items.forEach(p => (p.specs || []).forEach(([k]) => { if (!labels.includes(k)) labels.push(k); }));

    const head = `
      <tr>
        <th class="compare-row-label">Producto</th>
        ${items.map(p => `
          <th>
            <button class="compare-remove" data-remove="${p.id}" aria-label="Quitar de comparar">✕</button>
            <img src="${p.mainImage || (p.images && p.images[0]) || 'assets/img/icon-mark.svg'}" alt="${p.name}" loading="lazy" decoding="async">
            <a href="producto.html?id=${p.id}">${p.name}</a>
          </th>`).join('')}
      </tr>`;

    const priceRow = `
      <tr>
        <td class="compare-row-label">Precio</td>
        ${items.map(p => { const pi = productPriceInfo(p); return `<td class="compare-price">${pi.isRange ? 'Desde ' : ''}${money(pi.price)}<span>+ IVA</span></td>`; }).join('')}
      </tr>`;

    const specRows = labels.map(label => `
      <tr>
        <td class="compare-row-label">${label}</td>
        ${items.map(p => {
          const row = (p.specs || []).find(([k]) => k === label);
          return `<td>${row ? row[1] : '—'}</td>`;
        }).join('')}
      </tr>`).join('');

    const actionRow = `
      <tr>
        <td class="compare-row-label"></td>
        ${items.map(p => `<td><a class="btn btn-primary" href="producto.html?id=${p.id}">Ver producto</a></td>`).join('')}
      </tr>`;

    wrap.innerHTML = `<table class="compare-table"><thead>${head}</thead><tbody>${priceRow}${specRows}${actionRow}</tbody></table>`;
  }

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    if (typeof toggleCompare === 'function') toggleCompare(btn.dataset.remove);
    render();
  });

  render();
})();
