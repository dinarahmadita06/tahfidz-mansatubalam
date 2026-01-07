/**
 * Service to handle signature retrieval for PDF exports and other purposes
 */

import { prisma } from './db';

/**
 * Get signature data as base64 for PDF export
 * @param {string} userId - The user ID to get signature for
 * @returns {Promise<string|null>} - Base64 encoded signature or null if not found
 */
export async function getUserSignatureAsBase64(userId) {
  try {
    // Get user with signature blob data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        signatureBlob: true,
        signatureMimeType: true
      }
    });

    if (!user || !user.signatureBlob) {
      return null;
    }

    // Convert blob to base64
    const buffer = Buffer.from(user.signatureBlob);
    const base64 = buffer.toString('base64');
    const mimeType = user.signatureMimeType || 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error getting user signature as base64:', error);
    return null;
  }
}

/**
 * Get guru signature data as base64 for PDF export
 * @param {string} guruId - The guru ID to get signature for
 * @returns {Promise<string|null>} - Base64 encoded signature or null if not found
 */
export async function getGuruSignatureAsBase64(guruId) {
  try {
    // Get guru with signature blob data
    const guru = await prisma.guru.findUnique({
      where: { id: guruId },
      include: {
        user: {
          select: {
            signatureBlob: true,
            signatureMimeType: true
          }
        }
      }
    });

    if (!guru) {
      return null;
    }

    // Priority: guru.signatureBlob > user.signatureBlob
    const signatureBlob = guru.signatureBlob || guru.user?.signatureBlob;
    const signatureMimeType = guru.signatureMimeType || guru.user?.signatureMimeType;

    if (!signatureBlob) {
      return null;
    }

    // Convert blob to base64
    const buffer = Buffer.from(signatureBlob);
    const base64 = buffer.toString('base64');
    const mimeType = signatureMimeType || 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error getting guru signature as base64:', error);
    return null;
  }
}

/**
 * Get signature URL for display (can be used in img src)
 * @param {string} userId - The user ID to get signature for
 * @param {string} userType - 'guru' or 'admin'
 * @returns {string|null} - Signature URL or null if not found
 */
export function getSignatureDisplayUrl(userId, userType) {
  if (!userId || !userType) {
    return null;
  }
  
  const baseUrl = userType.toLowerCase() === 'guru' 
    ? `/api/guru/signature/${userId}`
    : `/api/admin/signature/${userId}`;
  
  return baseUrl;
}