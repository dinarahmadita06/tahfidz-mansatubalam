import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a random 9-digit recovery code
 * Format: XXX-XXX-XXX
 */
export function generateRecoveryCode() {
  const code = Math.floor(100000000 + Math.random() * 900000000).toString();
  return code;
}

/**
 * Format 9-digit code to XXX-XXX-XXX
 */
export function formatRecoveryCode(code) {
  if (!code || code.length !== 9) return code;
  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}`;
}

/**
 * Hash recovery code for storage
 */
export async function hashRecoveryCode(code) {
  // Remove hyphens if present
  const cleanCode = code.replace(/-/g, '');
  return await bcrypt.hash(cleanCode, 10);
}

/**
 * Verify recovery code against hash
 */
export async function verifyRecoveryCode(code, hash) {
  if (!code || !hash) return false;
  const cleanCode = code.replace(/-/g, '');
  return await bcrypt.compare(cleanCode, hash);
}
