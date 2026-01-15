/**
 * Helper function to format "Status Mengulang" text for display to parents
 * Used in: Parent Portal UI & PDF Reports
 * 
 * Rules:
 * - If only alasan: display ALASAN_UPPERCASE
 * - If only catatan: display catatan as-is
 * - If both: display ALASAN_UPPERCASE + ". " + catatan
 * - Never display empty strings like ". " or null
 * 
 * @param {string} repeatReason - The reason for repeating (optional)
 * @param {string} catatan - Additional notes (optional)
 * @returns {string} Formatted text for display
 */
export function formatMengulangText(repeatReason, catatan) {
  const cleanReason = repeatReason?.trim() || '';
  const cleanCatatan = catatan?.trim() || '';

  // If both are provided
  if (cleanReason && cleanCatatan) {
    return `${cleanReason.toUpperCase()}. ${cleanCatatan}`;
  }

  // If only reason
  if (cleanReason) {
    return cleanReason.toUpperCase();
  }

  // If only catatan
  if (cleanCatatan) {
    return cleanCatatan;
  }

  // If neither (should not happen with proper validation)
  return '-';
}
