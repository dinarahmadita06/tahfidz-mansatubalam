/**
 * Template Service - Manage Certificate Templates
 * Handles upload, storage, and retrieval of active templates
 */

import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get fs and path modules dynamically (only in Node environment)
 */
async function getNodeModules() {
  if (typeof window !== 'undefined') return { fs: null, path: null };
  
  try {
    const fs = (await import('fs/promises')).default;
    const path = (await import('path')).default;
    return { fs, path };
  } catch (error) {
    console.warn('[NODE_MODULES] Not available:', error.message);
    return { fs: null, path: null };
  }
}

/**
 * Get template storage path
 */
function getStoragePath() {
  if (typeof window !== 'undefined') return null;
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return null;
  
  // Use require for synchronous path resolution in Node
  try {
    const path = require('path');
    return path.join(process.cwd(), 'public', 'uploads', 'templates');
  } catch {
    return null;
  }
}

/**
 * Initialize storage directory (local dev only)
 */
async function ensureStorageExists() {
  const storagePath = getStoragePath();
  if (!storagePath) return;
  
  const { fs } = await getNodeModules();
  if (!fs) return;
  
  try {
    await fs.mkdir(storagePath, { recursive: true });
  } catch (error) {
    console.error('[STORAGE] Failed to create directory:', error);
  }
}

/**
 * Upload new template and set as active
 * @param {Buffer} fileBuffer - Template image buffer
 * @param {string} originalFilename - Original filename
 * @param {string} uploadedBy - User ID who uploaded
 * @returns {Promise<Object>} Template record
 */
export async function uploadTemplate(fileBuffer, originalFilename, uploadedBy) {
  const ext = originalFilename.split('.').pop();
  const filename = `template_${uuidv4()}.${ext}`;
  
  let fileUrl;
  let filepath;
  
  // Use Vercel Blob in production, filesystem in development
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    try {
      console.log('[UPLOAD] Using Vercel Blob Storage');
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg'
      });
      fileUrl = blob.url;
      filepath = blob.url;
      console.log('[UPLOAD] Blob uploaded:', fileUrl);
    } catch (error) {
      console.error('[UPLOAD] Vercel Blob upload failed:', error);
      throw new Error(`Failed to upload to blob storage: ${error.message}`);
    }
  } else {
    // Local development: use filesystem
    await ensureStorageExists();
    const { fs, path } = await getNodeModules();
    
    if (!fs || !path) {
      throw new Error('Filesystem modules not available');
    }
    
    const storagePath = getStoragePath();
    const localPath = path.join(storagePath, filename);
    await fs.writeFile(localPath, fileBuffer);
    fileUrl = `/uploads/templates/${filename}`;
    filepath = `/uploads/templates/${filename}`;
    console.log('[UPLOAD] File saved locally:', filepath);
  }
  
  // Get image dimensions (optional, for metadata)
  let width = 932;
  let height = 661;
  
  try {
    const sharp = await import('sharp');
    const sharpInstance = sharp.default;
    const metadata = await sharpInstance(fileBuffer).metadata();
    width = metadata.width;
    height = metadata.height;
  } catch (error) {
    console.warn('[UPLOAD] Could not get image dimensions, using defaults:', error.message);
  }
  
  // Deactivate all existing templates
  await prisma.templateSertifikat.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });
  
  // Create new template record
  const template = await prisma.templateSertifikat.create({
    data: {
      nama: originalFilename,
      filename: filename,
      filepath: filepath,
      fileUrl: fileUrl,
      width: width,
      height: height,
      isActive: true,
      uploadedBy: uploadedBy
    }
  });
  
  console.log('[UPLOAD] Template record created:', template.id);
  return template;
}

/**
 * Get active template
 * @returns {Promise<Object|null>} Active template or null
 */
export async function getActiveTemplate() {
  const template = await prisma.templateSertifikat.findFirst({
    where: { isActive: true },
    orderBy: { uploadedAt: 'desc' }
  });
  
  return template;
}

/**
 * Get active template as buffer for PDF generation
 * @returns {Promise<Buffer>} Template image buffer
 */
export async function getActiveTemplateBuffer() {
  const template = await getActiveTemplate();
  
  if (!template) {
    throw new Error('No active template found. Please upload a template first.');
  }
  
  // Check if it's a blob URL (starts with https://)
  if (template.fileUrl.startsWith('https://')) {
    console.log('[TEMPLATE] Fetching from Blob Storage:', template.fileUrl);
    const response = await fetch(template.fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template from blob storage: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  // Local development: read from filesystem
  const { fs, path } = await getNodeModules();
  if (!fs || !path) {
    throw new Error('Cannot read template: filesystem modules not available');
  }
  
  const fullPath = path.join(process.cwd(), 'public', template.filepath);
  console.log('[TEMPLATE] Reading from local filesystem:', fullPath);
  const buffer = await fs.readFile(fullPath);
  
  return buffer;
}

/**
 * Get all templates
 * @returns {Promise<Array>} List of all templates
 */
export async function getAllTemplates() {
  const templates = await prisma.templateSertifikat.findMany({
    orderBy: { uploadedAt: 'desc' }
  });
  
  return templates;
}

/**
 * Set template as active
 * @param {string} templateId - Template ID to activate
 * @returns {Promise<Object>} Updated template
 */
export async function setActiveTemplate(templateId) {
  // Deactivate all templates
  await prisma.templateSertifikat.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });
  
  // Activate selected template
  const template = await prisma.templateSertifikat.update({
    where: { id: templateId },
    data: { isActive: true }
  });
  
  return template;
}

/**
 * Deactivate template (remove active status)
 * @param {string} templateId - Template ID to deactivate
 * @returns {Promise<Object>} Updated template
 */
export async function deactivateTemplate(templateId) {
  // Check if template exists and is active
  const template = await prisma.templateSertifikat.findUnique({
    where: { id: templateId }
  });
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  if (!template.isActive) {
    throw new Error('Template is already inactive');
  }
  
  // Deactivate the template
  const updatedTemplate = await prisma.templateSertifikat.update({
    where: { id: templateId },
    data: { isActive: false }
  });
  
  return updatedTemplate;
}

/**
 * Delete template
 * @param {string} templateId - Template ID to delete
 * @returns {Promise<void>}
 */
export async function deleteTemplate(templateId) {
  const template = await prisma.templateSertifikat.findUnique({
    where: { id: templateId }
  });
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  if (template.isActive) {
    throw new Error('Cannot delete active template. Please activate another template first.');
  }
  
  // Delete file from storage
  if (template.fileUrl.startsWith('https://')) {
    // Delete from Vercel Blob
    try {
      const { del } = await import('@vercel/blob');
      await del(template.fileUrl);
      console.log('[DELETE] Deleted from Blob Storage:', template.fileUrl);
    } catch (error) {
      console.warn('[DELETE] Could not delete from blob storage:', error);
    }
  } else {
    // Delete from local filesystem
    const { fs, path } = await getNodeModules();
    
    if (fs && path) {
      try {
        const fullPath = path.join(process.cwd(), 'public', template.filepath);
        await fs.unlink(fullPath);
        console.log('[DELETE] Deleted from local filesystem:', fullPath);
      } catch (error) {
        console.warn('[DELETE] Could not delete template file:', error);
      }
    }
  }
  
  // Delete from database
  await prisma.templateSertifikat.delete({
    where: { id: templateId }
  });
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Template record
 */
export async function getTemplateById(templateId) {
  const template = await prisma.templateSertifikat.findUnique({
    where: { id: templateId }
  });
  
  return template;
}

/**
 * Validate template image
 * @param {Buffer} fileBuffer - Image buffer
 * @returns {Promise<Object>} Validation result
 */
export async function validateTemplate(fileBuffer) {
  try {
    // Try to use sharp for validation
    let sharp;
    try {
      sharp = await import('sharp');
      sharp = sharp.default;
    } catch (importError) {
      console.warn('[VALIDATE] Sharp not available, using basic validation:', importError.message);
      
      // Fallback: Basic validation without sharp
      // Check if buffer starts with valid image signatures
      const isPNG = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
      const isJPEG = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF;
      
      if (!isPNG && !isJPEG) {
        return {
          valid: false,
          error: 'Invalid file format. Please upload PNG or JPG file.'
        };
      }
      
      // Basic size check (at least 100KB for a decent template)
      if (fileBuffer.length < 100000) {
        return {
          valid: false,
          error: 'File too small. Please upload a valid template image.'
        };
      }
      
      // Return valid with basic metadata
      return {
        valid: true,
        metadata: {
          format: isPNG ? 'png' : 'jpeg',
          size: fileBuffer.length,
          note: 'Basic validation (Sharp not available in serverless)'
        }
      };
    }
    
    // Sharp is available, do full validation
    const metadata = await sharp(fileBuffer).metadata();
    
    // Check format
    const validFormats = ['png', 'jpeg', 'jpg'];
    if (!validFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid format. Only PNG and JPG are supported. Got: ${metadata.format}`
      };
    }
    
    // Check dimensions (recommended: 932×661 or landscape)
    if (metadata.width < 800 || metadata.height < 500) {
      return {
        valid: false,
        error: `Image too small. Minimum size: 800×500. Got: ${metadata.width}×${metadata.height}`
      };
    }
    
    // Check aspect ratio (should be landscape)
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 1.2) {
      return {
        valid: false,
        error: `Template should be landscape orientation. Got aspect ratio: ${aspectRatio.toFixed(2)}`
      };
    }
    
    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        aspectRatio: aspectRatio.toFixed(2)
      }
    };
  } catch (error) {
    console.error('[VALIDATE] Validation error:', error);
    return {
      valid: false,
      error: `Failed to validate image: ${error.message}`
    };
  }
}

export default {
  uploadTemplate,
  getActiveTemplate,
  getActiveTemplateBuffer,
  getAllTemplates,
  setActiveTemplate,
  deactivateTemplate,
  deleteTemplate,
  getTemplateById,
  validateTemplate
};
