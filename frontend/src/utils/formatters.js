/**
 * Formats integer paise into Indian Rupee format (e.g. 1499900 -> ₹14,999)
 */
export const formatPrice = (paise) => {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return 'Recent';
  }
};
