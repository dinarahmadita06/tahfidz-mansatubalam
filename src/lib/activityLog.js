import { prisma } from '@/lib/db';

/**
 * Log user activity to the database
 * @param {Object} params - Activity log parameters
 * @param {string} params.userId - User ID who performed the action
 * @param {string} params.userName - User's full name
 * @param {string} params.userRole - User's role (ADMIN, GURU, SISWA, ORANG_TUA)
 * @param {string} params.action - Action type (LOGIN, CREATE, UPDATE, DELETE, etc)
 * @param {string} params.module - Module name (HAFALAN, KEHADIRAN, SISWA, etc)
 * @param {string} params.description - Detailed description of the activity
 * @param {string} [params.ipAddress] - User's IP address (optional)
 * @param {string} [params.userAgent] - User's device/browser info (optional)
 * @param {Object} [params.metadata] - Additional data as JSON (optional)
 */
export async function logActivity({
  userId,
  userName,
  userRole,
  action,
  module,
  description,
  ipAddress = null,
  userAgent = null,
  metadata = null
}) {
  try {
    const result = await prisma.activityLog.create({
      data: {
        userId,
        userName,
        userRole,
        action,
        module,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
    console.log(`✅ Activity logged: ${action} ${module} - ${description}`);
    return result;
  } catch (error) {
    console.error('❌ ERROR logging activity:', error);
    console.error('Failed data:', { userId, userName, userRole, action, module, description });
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    // Don't throw error to prevent disrupting the main operation
  }
}

/**
 * Extract IP address from Next.js request
 * @param {Request} request - Next.js request object
 * @returns {string|null} IP address
 */
export function getIpAddress(request) {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return null;
}

/**
 * Extract user agent from Next.js request
 * @param {Request} request - Next.js request object
 * @returns {string|null} User agent string
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || null;
}

/**
 * Parse user agent to get readable device/browser info
 * @param {string} userAgent - User agent string
 * @returns {string} Parsed device/browser info
 */
export function parseUserAgent(userAgent) {
  if (!userAgent) return 'Unknown';

  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return `${browser} on ${os}`;
}
