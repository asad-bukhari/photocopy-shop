/**
 * Format currency in PKR (Pakistani Rupee)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[PKR,Rs.]/g, '')) || 0;
};
