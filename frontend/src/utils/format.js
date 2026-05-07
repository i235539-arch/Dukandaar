export const formatPKR = (n) => {
  if (n === null || n === undefined || isNaN(n)) return 'PKR 0';
  return `PKR ${Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

export const formatPKR2 = (n) => {
  if (n === null || n === undefined || isNaN(n)) return 'PKR 0.00';
  return `PKR ${Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
};

export const formatDateOnly = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: '2-digit' });
};

export const titleCase = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');

export const monthString = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
