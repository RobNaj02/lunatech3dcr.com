/* =========================================================
   DIRECCIONES GUARDADAS
   CRUD simple sobre localStorage, separado por usuario de Clerk
   (así una PC compartida no mezcla direcciones entre cuentas).
   Sin sesión no hay dónde guardar, así que devuelve [] / no-op.
   Lo usan: la pestaña "Direcciones" dentro de Mi cuenta
   (assets/account.js) y el checkout (assets/main.js).
   ========================================================= */
(function(){
  const KEY_PREFIX = 'lunarlab_addresses_';

  function storageKey(){
    const uid = window.Clerk && window.Clerk.user ? window.Clerk.user.id : null;
    return uid ? KEY_PREFIX + uid : null;
  }

  function getAddresses(){
    const key = storageKey();
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveAddresses(list){
    const key = storageKey();
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  function addAddress(label, text){
    const list = getAddresses();
    list.push({ id: 'addr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label, text });
    saveAddresses(list);
    return list;
  }

  function removeAddress(id){
    const list = getAddresses().filter(a => a.id !== id);
    saveAddresses(list);
    return list;
  }

  window.LunarAddresses = { getAddresses, addAddress, removeAddress };
})();
