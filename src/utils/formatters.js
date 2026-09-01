export function formatCurrency(val, currencyCode = 'INR', showSign = false) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const num = Number(val);
  const sign = num > 0 && showSign ? '+' : '';
  return sign + new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode || 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatCompact(val, currencyCode = 'INR') {
  const num = Math.abs(Number(val));
  const sign = Number(val) < 0 ? '-' : '';
  const symbol = currencyCode === 'INR' ? '\u20B9' : currencyCode + ' ';
  if (num >= 10000000) return sign + symbol + (num / 10000000).toFixed(1) + 'Cr';
  if (num >= 100000)   return sign + symbol + (num / 100000).toFixed(1) + 'L';
  if (num >= 1000)     return sign + symbol + (num / 1000).toFixed(1) + 'k';
  return sign + symbol + num.toFixed(0);
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatDateShort(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short'
  });
}

export function monthLabel(date) {
  // date is a Date object or timestamp
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function getMonthBounds(monthOffset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  const start = new Date(year, month, 1, 0, 0, 0, 0).getTime();
  const end   = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  const label = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  return { start, end, label, year: new Date(year, month, 1).getFullYear(), month: new Date(year, month, 1).getMonth() };
}
