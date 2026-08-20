/* =========================================================
   INVENTORY — stock en tiempo real desde Supabase.
   Expone window.LunarStock con:
     .get(productId, variantName)      -> cantidad (número) o null si aún no cargó
     .isOutOfStock(productId, variantName)
     .checkout([{productId, variantName, qty}]) -> { ok, failed? } vía RPC transaccional
   Dispara "stock:updated" en document cada vez que cambian los
   datos (carga inicial y cada evento realtime), para que
   store.js / producto.js / main.js puedan refrescar la UI.

   Si SUPABASE_URL/SUPABASE_ANON_KEY no están configurados
   todavía (ver assets/supabase-config.js), el módulo no hace
   nada y el sitio sigue funcionando con los valores estáticos
   de "availability" de products.js.
   ========================================================= */
(function(){
  const STOCK = {};

  function stockKey(productId, variantName){
    return productId + '::' + (variantName || '');
  }
  function getStock(productId, variantName){
    const k = stockKey(productId, variantName);
    return Object.prototype.hasOwnProperty.call(STOCK, k) ? STOCK[k] : null;
  }
  function isOutOfStock(productId, variantName){
    const q = getStock(productId, variantName);
    return q !== null && q <= 0;
  }
  function notifyUpdate(){
    document.dispatchEvent(new CustomEvent('stock:updated'));
  }

  const LunarStock = {
    STOCK,
    get: getStock,
    isOutOfStock,
    ready: Promise.resolve(),
    client: null,
    checkout: async function(){
      return { ok: true }; // no-op hasta que Supabase esté configurado
    }
  };
  window.LunarStock = LunarStock;

  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  const configured = url && key && !/YOUR-PROJECT|YOUR-ANON/.test(url + key);

  if (!configured || typeof window.supabase === 'undefined'){
    console.warn('[inventory] Supabase no configurado todavía — usando disponibilidad estática de products.js. Ver assets/supabase-config.js.');
    return;
  }

  const client = window.supabase.createClient(url, key);
  LunarStock.client = client;

  LunarStock.ready = client
    .from('product_stock')
    .select('product_id, variant_name, quantity')
    .then(({ data, error }) => {
      if (error){ console.error('[inventory] error cargando stock', error); return; }
      (data || []).forEach(row => {
        STOCK[stockKey(row.product_id, row.variant_name)] = row.quantity;
      });
      notifyUpdate();
    });

  client
    .channel('product_stock-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_stock' }, (payload) => {
      const row = (payload.new && Object.keys(payload.new).length) ? payload.new : payload.old;
      if (!row) return;
      if (payload.eventType === 'DELETE'){
        delete STOCK[stockKey(row.product_id, row.variant_name)];
      } else {
        STOCK[stockKey(row.product_id, row.variant_name)] = row.quantity;
      }
      notifyUpdate();
    })
    .subscribe();

  LunarStock.checkout = async function(items){
    const payload = items.map(i => ({
      product_id: i.productId,
      variant_name: i.variantName || '',
      qty: i.qty
    }));
    const { data, error } = await client.rpc('checkout_cart', { items: payload });
    if (error){ console.error('[inventory] error en checkout_cart', error); return { ok: false }; }
    return data;
  };
})();
