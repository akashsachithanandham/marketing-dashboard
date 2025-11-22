export const formatMoney = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(2)} K`;
  return `₹${value.toFixed(2)}`;
};

export const formatNumber = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  return value.toLocaleString('en-IN');
};

export const formatPercent = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  return `${value.toFixed(2)}%`;
};

export const calculateCtr = (clicks, impressions) =>
  impressions ? (clicks / impressions) * 100 : 0;
