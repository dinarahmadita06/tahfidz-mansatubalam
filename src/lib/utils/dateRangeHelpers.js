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
 *   endDate: 2026-02-01,
 *   startDateStr: "2026-01-01",
 *   endDateStr: "2026-02-01"
 * }
 */
export function calculateMonthRange(month, year) {
  // Use local timezone to ensure consistency with how dates are stored in the database
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  // Format as YYYY-MM-DD for the API query
  const formatYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const startDateStr = formatYMD(startDate);
  const endDateStr = formatYMD(endDate);

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
