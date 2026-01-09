/**
 * Auto-Deactivation Helper
 * Utilities for checking and deactivating graduated students
 */

/**
 * Check if a student is eligible for auto-deactivation based on grace period
 * @param {DateTime} lulusAt - Date when student was marked as graduated
 * @param {number} gracePeriodDays - Grace period in days (from env var)
 * @returns {boolean} true if grace period has expired
 */
export function isEligibleForDeactivation(lulusAt, gracePeriodDays) {
  if (!lulusAt) return false;
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);
  
  return new Date(lulusAt) <= cutoffDate;
}

/**
 * Calculate days until auto-deactivation
 * @param {DateTime} lulusAt - Date when student was marked as graduated
 * @param {number} gracePeriodDays - Grace period in days
 * @returns {number} days remaining until deactivation (negative if already expired)
 */
export function daysUntilDeactivation(lulusAt, gracePeriodDays) {
  if (!lulusAt) return null;
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.ceil((cutoffDate - new Date(lulusAt)) / (1000 * 60 * 60 * 24));
  
  return daysRemaining;
}

/**
 * Get the deactivation date for a student
 * @param {DateTime} lulusAt - Date when student was marked as graduated
 * @param {number} gracePeriodDays - Grace period in days
 * @returns {Date} the date when account will/did become inactive
 */
export function getDeactivationDate(lulusAt, gracePeriodDays) {
  if (!lulusAt) return null;
  
  const deactivationDate = new Date(lulusAt);
  deactivationDate.setDate(deactivationDate.getDate() + gracePeriodDays);
  
  return deactivationDate;
}
