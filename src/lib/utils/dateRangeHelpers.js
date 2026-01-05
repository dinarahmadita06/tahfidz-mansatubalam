/**
 * Calculate start and end dates for a given month/year
 * 
 * @param {number} month - Month (0-11)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Object} { startDate: Date, endDate: Date, startDateStr: string, endDateStr: string }
 * 
 * Example:
 * calculateMonthRange(0, 2026) => 
 * { 
 *   startDate: 2026-01-01,
 *   endDate: 2026-01-31,
 *   startDateStr: "2026-01-01",
 *   endDateStr: "2026-01-31"
 * }
 */
export function calculateMonthRange(month, year) {
  // First day of month
  const startDate = new Date(year, month, 1);

  // Last day of month (day 0 of next month = last day of current month)
  const endDate = new Date(year, month + 1, 0);

  // Format as ISO strings (YYYY-MM-DD)
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  return {
    startDate,
    endDate,
    startDateStr,
    endDateStr,
  };
}

/**
 * Get current month (0-11) and year
 * @returns {Object} { month: number, year: number }
 */
export function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

/**
 * Format month/year to Indonesian display text
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {string} e.g., "Januari 2026"
 */
export function formatMonthYear(month, year) {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${monthNames[month]} ${year}`;
}
