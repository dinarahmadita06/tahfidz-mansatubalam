/**
 * Date formatting utilities dengan timezone Asia/Jakarta
 * Menghindari timezone mismatch antara server (UTC) dan client
 */

/**
 * Format date ke string Indonesia dengan timezone WIB
 * @param {Date|string} date - Date object atau ISO string
 * @param {object} options - Intl.DateTimeFormat options (opsional)
 * @returns {string} Formatted date string
 */
export function formatDateWIB(date, options = {}) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
    ...options
  };
  
  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(dateObj);
}

/**
 * Format date ke short format (dd/mm/yyyy)
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
  return formatDateWIB(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format date dengan hari (Senin, 18 Januari 2026)
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date string
 */
export function formatDateLong(date) {
  return formatDateWIB(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format date untuk display singkat (18 Jan 2026)
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted date string
 */
export function formatDateMedium(date) {
  return formatDateWIB(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format datetime (18 Jan 2026, 14:30)
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const dateStr = formatDateWIB(dateObj, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const timeStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    hour12: false
  }).format(dateObj);
  
  return `${dateStr}, ${timeStr}`;
}

/**
 * Parse date-only string (YYYY-MM-DD) ke Date dengan UTC midnight
 * Menghindari timezone shift
 * @param {string} dateString - Date string dalam format YYYY-MM-DD
 * @returns {Date} Date object
 */
export function parseDateOnly(dateString) {
  if (!dateString) return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
