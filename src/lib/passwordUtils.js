/**
 * Generate a strong random password
 * Format: uppercase + lowercase + numbers
 * Length: 8-12 characters
 * Example: Simtaq#A19x
 */
export function generateStrongPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '#@!';

  // Random length between 8-12
  const length = Math.floor(Math.random() * 5) + 8; // 8 to 12

  let password = '';

  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return password;
}

/**
 * Generate email for Orang Tua based on name and phone number
 * Format: nama.nomorhp@wali.tahfidz.sch.id or nama.random@wali.tahfidz.sch.id
 *
 * @param {string} name - Full name of parent
 * @param {string} phone - Phone number (last 4 digits will be used)
 * @returns {string} Generated email address
 */
export function generateParentEmail(name, phone) {
  // Clean and format name: lowercase, remove spaces and special chars, replace with dots
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '');

  // Get last 4 digits of phone number, or use random if not available
  let suffix = '';
  if (phone && phone.length >= 4) {
    suffix = phone.slice(-4);
  } else {
    suffix = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit number
  }

  return `${cleanName}.${suffix}@wali.tahfidz.sch.id`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      return false;
    }
  }
}
