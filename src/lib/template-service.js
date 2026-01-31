/**
 * Template Service - Manage Certificate Templates
 * Handles upload, storage, and retrieval of active templates
 */

import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage path for templates
const TEMPLATE_STORAGE_PATH = path.join(process.cwd(), 'public', 'uploads', 'templates');

/**
 * Initialize storage directory
 */
async function ensureStorageExists() {
  try {
    await fs.mkdir(TEMPLATE_STORAGE_PATH, { recursive: true });
  } catch (error) {
    console.error('Failed to create template storage:', error);
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
  await ensureStorageExists();
  
  // Generate unique filename
  const ext = path.extname(originalFilename);
  const filename = `template_${uuidv4()}${ext}`;
  const filepath = path.join(TEMPLATE_STORAGE_PATH, filename);
  
  // Save file to storage
  await fs.writeFile(filepath, fileBuffer);
  
  // Get image dimensions (optional, for validation)
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
      filepath: `/uploads/templates/${filename}`,
      fileUrl: `/uploads/templates/${filename}`,
      width: width,
      height: height,
      isActive: true,
      uploadedBy: uploadedBy
    }
  });
  
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
  
  const fullPath = path.join(process.cwd(), 'public', template.filepath);
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
  const fullPath = path.join(process.cwd(), 'public', template.filepath);
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    console.warn('Could not delete template file:', error);
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
  deleteTemplate,
  getTemplateById,
  validateTemplate
};
