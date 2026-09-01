const CURRENCY_SYMBOLS = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$',
};

export function formatCurrency(amount, currencyCode = 'INR', isMasked = false) {
  if (isMasked) return '₹••••••';
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode + ' ';
  const num = Math.round(Number(amount) || 0);
  const formatted = num.toLocaleString('en-IN');
  return `${symbol}${formatted}`;
}

export function formatCompact(amount, currencyCode = 'INR', isMasked = false) {
  if (isMasked) return '••••';
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode + ' ';
  const abs = Math.abs(Number(amount) || 0);
  const sign = (Number(amount) || 0) < 0 ? '-' : '';

  if (abs >= 10000000) return `${sign}${symbol}${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000)   return `${sign}${symbol}${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000)     return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toLocaleString('en-IN')}`;
}

export function formatDate(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function monthLabel(offset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getMonthBounds(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0, 0).getTime();
  const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}
