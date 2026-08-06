/* =========================================================
   CALCULADORA DE COSTOS DE IMPRESIÓN 3D
   Herramienta pública para que cualquier persona calcule el
   costo real y el precio de venta sugerido de SUS PROPIAS
   impresiones (su impresora, su filamento, su electricidad).
   No genera pedidos ni cotizaciones a LUNATECH3D.

   Los campos de dinero se guardan siempre en colones (CRC) en
   el atributo data-base de cada input — es la moneda "ancla"
   interna. El toggle de moneda solo cambia cómo se MUESTRAN
   esos valores (usando el tipo de cambio editable); el cálculo
   real siempre ocurre sobre los colones base, así que cambiar
   de moneda o el tipo de cambio nunca hace que los números
   "se corran".
   ========================================================= */
(function(){

const DEFAULTS = {
  exchangeRate: 505,
  calcFilamentPrice: 9500,
  calcWeight: 50,
  calcHours: 3,
  calcWatts: 150,
  calcKwhRate: 100,
  calcPrinterCost: 350000,
  calcLifespan: 2000,
  calcLaborHours: 0.25,
  calcLaborRate: 3000,
  calcExtras: 0,
  calcFail: 5,
  calcMargin: 40,
  calcQty: 1
};

const MONEY_FIELD_IDS = ['calcFilamentPrice', 'calcKwhRate', 'calcPrinterCost', 'calcLaborRate', 'calcExtras'];

const exchangeRateInput = document.getElementById('calcExchangeRate');
const btnCRC = document.getElementById('calcBtnCRC');
const btnUSD = document.getElementById('calcBtnUSD');
const resetBtn = document.getElementById('calcReset');
const printerModelSelect = document.getElementById('calcPrinterModel');
const wattsInput = document.getElementById('calcWatts');

if (!exchangeRateInput || !btnCRC || !btnUSD) return; // esta página no cargó el calculador

let currency = 'CRC'; // moneda que se muestra en los campos de entrada
let exchangeRate = DEFAULTS.exchangeRate;

const allInputs = Array.from(document.querySelectorAll('#calcForm input'));

function roundForCurrency(value, curr){
  return curr === 'USD' ? Math.round(value * 100) / 100 : Math.round(value);
}

function toDisplay(baseCRC, curr){
  return curr === 'USD' ? baseCRC / exchangeRate : baseCRC;
}
function toBase(displayValue, curr){
  return curr === 'USD' ? displayValue * exchangeRate : displayValue;
}

function fmtMoney(baseCRC, curr){
  const val = toDisplay(baseCRC, curr);
  if (curr === 'USD') return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '₡' + Math.round(val).toLocaleString('es-CR');
}
function fmtDual(baseCRC, primaryCurr){
  const secondaryCurr = primaryCurr === 'USD' ? 'CRC' : 'USD';
  return { primary: fmtMoney(baseCRC, primaryCurr), secondary: fmtMoney(baseCRC, secondaryCurr) };
}

function num(id){
  const el = document.getElementById(id);
  return el ? (parseFloat(el.value) || 0) : 0;
}
function baseOf(id){
  const el = document.getElementById(id);
  return el ? (parseFloat(el.dataset.base) || 0) : 0;
}

/* ---------- Moneda ---------- */
function refreshMoneyFieldsDisplay(){
  MONEY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = roundForCurrency(toDisplay(parseFloat(el.dataset.base) || 0, currency), currency);
  });
}

function setCurrency(newCurrency){
  currency = newCurrency;
  btnCRC.classList.toggle('is-active', currency === 'CRC');
  btnCRC.setAttribute('aria-pressed', currency === 'CRC');
  btnUSD.classList.toggle('is-active', currency === 'USD');
  btnUSD.setAttribute('aria-pressed', currency === 'USD');
  refreshMoneyFieldsDisplay();
  calculate();
}

btnCRC.addEventListener('click', () => setCurrency('CRC'));
btnUSD.addEventListener('click', () => setCurrency('USD'));

exchangeRateInput.addEventListener('input', () => {
  exchangeRate = parseFloat(exchangeRateInput.value) || 1;
  refreshMoneyFieldsDisplay();
  calculate();
});

MONEY_FIELD_IDS.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    el.dataset.base = toBase(parseFloat(el.value) || 0, currency);
    calculate();
  });
});

allInputs.filter(el => !MONEY_FIELD_IDS.includes(el.id)).forEach(el => {
  el.addEventListener('input', calculate);
});

/* ---------- Modelo de impresora → consumo (W) automático ---------- */
if (printerModelSelect && wattsInput){
  printerModelSelect.addEventListener('change', () => {
    if (printerModelSelect.value === 'custom') return;
    wattsInput.value = printerModelSelect.value;
    calculate();
  });
}

/* ---------- Reset ---------- */
resetBtn.addEventListener('click', () => {
  exchangeRate = DEFAULTS.exchangeRate;
  exchangeRateInput.value = DEFAULTS.exchangeRate;
  currency = 'CRC';
  btnCRC.classList.add('is-active'); btnCRC.setAttribute('aria-pressed', 'true');
  btnUSD.classList.remove('is-active'); btnUSD.setAttribute('aria-pressed', 'false');

  Object.keys(DEFAULTS).forEach(id => {
    if (id === 'exchangeRate') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.value = DEFAULTS[id];
    if (MONEY_FIELD_IDS.includes(id)) el.dataset.base = DEFAULTS[id];
  });
  if (printerModelSelect) printerModelSelect.value = 'custom';
  calculate();
  if (typeof showToast === 'function') showToast('Valores restablecidos');
});

/* ---------- Cálculo ---------- */
function calculate(){
  const weightG = num('calcWeight');
  const hours = num('calcHours');
  const watts = num('calcWatts');
  const lifespan = Math.max(1, num('calcLifespan'));
  const laborHours = num('calcLaborHours');
  const failPct = Math.max(0, num('calcFail'));
  const marginPct = Math.max(0, num('calcMargin'));
  const qty = Math.max(1, Math.round(num('calcQty')) || 1);

  const filamentPerKgCRC = baseOf('calcFilamentPrice');
  const kwhRateCRC = baseOf('calcKwhRate');
  const printerCostCRC = baseOf('calcPrinterCost');
  const laborRateCRC = baseOf('calcLaborRate');
  const extrasCRC = baseOf('calcExtras');

  const costMaterial = (weightG / 1000) * filamentPerKgCRC;
  const costElectricity = (watts / 1000) * hours * kwhRateCRC;
  const costDepreciation = hours * (printerCostCRC / lifespan);
  const costLabor = laborHours * laborRateCRC;
  const costExtras = extrasCRC;

  const subtotal = costMaterial + costElectricity + costDepreciation + costLabor + costExtras;
  const failAmount = subtotal * (failPct / 100);
  const productionCost = subtotal + failAmount;
  const marginAmount = productionCost * (marginPct / 100);
  const salePrice = productionCost + marginAmount;

  const totalSale = salePrice * qty;
  const totalProfit = marginAmount * qty;

  setRow('calcRowMaterial', costMaterial);
  setRow('calcRowElectricity', costElectricity);
  setRow('calcRowDepreciation', costDepreciation);
  setRow('calcRowLabor', costLabor);
  setRow('calcRowExtras', costExtras);
  setRow('calcRowSubtotal', subtotal);
  setRow('calcRowFail', failAmount);
  setRow('calcRowCost', productionCost);
  setRow('calcRowMargin', marginAmount);
  setRow('calcRowTotal', totalSale);
  setRow('calcRowProfit', totalProfit);

  document.getElementById('calcRowQty').textContent = qty;
  document.getElementById('calcResultQtyLabel').textContent = `(${qty} pieza${qty > 1 ? 's' : ''})`;

  const dual = fmtDual(salePrice, currency);
  document.getElementById('calcPriceMain').textContent = dual.primary + (qty > 1 ? ' c/u' : '');
  document.getElementById('calcPriceSecondary').textContent = `≈ ${dual.secondary}` + (qty > 1 ? ` c/u · Total: ${fmtMoney(totalSale, currency)}` : '');
}

function setRow(id, baseCRC){
  const el = document.getElementById(id);
  if (el) el.textContent = fmtMoney(baseCRC, currency);
}

calculate();

})();
