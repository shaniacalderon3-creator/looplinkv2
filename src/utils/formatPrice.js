/**
 * Format a borrowing fee in Philippine Peso.
 * 0 or undefined → "Free"
 * any positive number → "₱50", "₱150", etc.
 */
export function formatPrice(fee) {
  const n = Number(fee);
  if (!n || n <= 0) return 'Free';
  return `₱${n.toLocaleString('en-PH')}`;
}
