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
 * Generate a mixed password: 7 digits + 1 capital letter
 * Total length: 8 characters
 * Position of capital letter: random
 * Examples: 7789210P, P7789210, 778P9210
 */
export function generatePasswordMixed() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  // Generate 7 random digits
  let digits = '';
  for (let i = 0; i < 7; i++) {
    digits += numbers[Math.floor(Math.random() * numbers.length)];
  }

  // Generate 1 random capital letter
  const capitalLetter = uppercase[Math.floor(Math.random() * uppercase.length)];

  // Random position for capital letter (0-7)
  const position = Math.floor(Math.random() * 8);

  // Insert capital letter at random position
  const password = digits.slice(0, position) + capitalLetter + digits.slice(position);

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
 * Generate email for Wali (parent) based on first name and NIS
 * Format: katapertamanama.NIS@wali.tahfidz.sch.id
 *
 * Aturan:
 * - katapertamanama diambil dari kata pertama nama wali
 * - Convert jadi lowercase
 * - Bersihkan karakter non-alphabet (', -, ., dll)
 * - Hilangkan spasi
 * - Gabungkan dengan .NIS
 *
 * @param {string} namaWali - Full name of parent (e.g., "Ucok Ucup")
 * @param {string} nis - Student NIS (e.g., "889900")
 * @returns {string} Generated wali email (e.g., "ucok.889900@wali.tahfidz.sch.id")
 */
export function generateWaliEmail(namaWali, nis) {
  // Get first word from name
  const firstName = namaWali
    .trim()
    .split(/\s+/)[0] // Take first word
    .toLowerCase()
    .replace(/[^a-z]/g, ''); // Remove non-alphabetic characters

  // Ensure we have valid NIS
  if (!firstName || !nis) {
    return ''; // Return empty if cannot generate
  }

  return `${firstName}.${nis}@wali.tahfidz.sch.id`;
}

/**
 * Generate student password based on NISN
 * @param {string} nisn - Student NISN (10 digits)
 * @returns {string} Generated student password
 */
export function generateStudentPassword(birthDate) {
  if (!birthDate) return '';
  
  try {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error generating student password:', error);
    return '';
  }
}

/**
 * Generate parent password based on birth date
 * @param {string|Date} birthDate - Student birth date
 * @returns {string} Generated parent password
 */
// Generate student username from NIS
export function generateStudentUsername(nis) {
  if (!nis) return '';
  return nis;
}

// Generate parent username from child's NIS
export function generateParentUsername(nis) {
  if (!nis) return '';
  return nis;
}

export function generateParentPassword(birthDate) {
  if (!birthDate) return '';
  
  try {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return '';
    
    // Format as DDMMYYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    return `${day}${month}${year}`;
  } catch (error) {
    console.error('Error generating parent password:', error);
    return '';
  }
}

/**
 * Generate email for Guru based on first name
 * Format: guru.<katapertamanama>@tahfidz.sch.id
 *
 * @param {string} name - Full name of guru
 * @returns {string} Generated guru email
 */
export function generateGuruEmail(name) {
  if (!name || name.trim().length === 0) return '';
  
  const firstName = name
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, '');
    
  if (!firstName) return '';
  
  return `guru.${firstName}@tahfidz.sch.id`;
}

/**
 * Generate password for Guru based on first name and birth date
 * Format: guru.<katapertamanama>-YYYY
 *
 * @param {string} name - Full name of guru
 * @param {string|Date} birthDate - Birth date of guru
 * @returns {string} Generated guru password
 */
export function generateGuruPassword(name, birthDate) {
  if (!name || name.trim().length === 0) return '';
  
  const firstName = name
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, '');
    
  if (!firstName) return '';
  
  if (!birthDate) return `guru.${firstName}`;
  
  try {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return `guru.${firstName}`;
    
    const year = date.getFullYear();
    return `guru.${firstName}-${year}`;
  } catch (error) {
    return `guru.${firstName}`;
  }
}

/**
 * Generate next available teacher username in format G001, G002, etc.
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {string} Next available username
 */
export async function generateNextTeacherUsername(prisma) {
  try {
    // Fetch the teacher with the highest username that starts with 'G'
    const latestGuru = await prisma.guru.findFirst({
      where: {
        user: {
          username: {
            startsWith: 'G'
          }
        }
      },
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: {
        user: {
          username: 'desc'
        }
      }
    });

    let nextNumber = 1;
    if (latestGuru && latestGuru.user.username) {
      const lastUsername = latestGuru.user.username;
      const lastNumber = parseInt(lastUsername.slice(1));
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }
    
    // Format as G + 3-digit padded number (ALWAYS UPPERCASE)
    return `G${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating next teacher username:', error);
    // Fallback to G001 if there's an error
    return 'G001';
  }
}

/**
 * Build guru credentials (username + password)
 * Single source of truth for credential generation
 * 
 * @param {Object} params
 * @param {string|Date} params.tanggalLahir - Birth date (Date object or YYYY-MM-DD string)
 * @param {number} params.lastUsernameNumber - Last username number for batch generation
 * @param {import('bcryptjs')} params.bcrypt - bcrypt instance for hashing
 * @returns {Promise<{username: string, passwordPlain: string, passwordHash: string}>}
 */
export async function buildGuruCredentials({ tanggalLahir, lastUsernameNumber, bcrypt }) {
  // Generate username: G + 3-digit padded number (ALWAYS UPPERCASE)
  const username = `G${(lastUsernameNumber + 1).toString().padStart(3, '0')}`;
  
  // Normalize tanggal lahir to YYYY-MM-DD format (date-only, no timezone)
  let dateString;
  if (tanggalLahir instanceof Date) {
    const year = tanggalLahir.getUTCFullYear();
    const month = String(tanggalLahir.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tanggalLahir.getUTCDate()).padStart(2, '0');
    dateString = `${year}-${month}-${day}`;
  } else if (typeof tanggalLahir === 'string') {
    // Already YYYY-MM-DD format
    dateString = tanggalLahir.trim();
  } else {
    throw new Error('Invalid tanggalLahir format');
  }
  
  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }
  
  // Password plain text = YYYY-MM-DD (date-only)
  const passwordPlain = dateString;
  
  // Hash password for storage
  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  
  return {
    username,       // e.g., "G008" (UPPERCASE)
    passwordPlain,  // e.g., "1997-06-17" (YYYY-MM-DD)
    passwordHash    // bcrypt hash
  };
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
