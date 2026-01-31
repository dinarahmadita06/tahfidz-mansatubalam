/**
 * API Route: Upload Certificate Template
 * POST /api/admin/templates/upload
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadTemplate, validateTemplate } from '@/lib/template-service';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session) {
      console.error('[UPLOAD] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check admin permission
    if (session.user.role !== 'ADMIN') {
      console.error('[UPLOAD] Non-admin access attempt:', session.user.role);
      return NextResponse.json(
        { success: false, error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('template');
    
    console.log('[UPLOAD] Form data keys:', Array.from(formData.keys()));
    console.log('[UPLOAD] File received:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'NO FILE');
    
    if (!file) {
      console.error('[UPLOAD] No file in form data');
      return NextResponse.json(
        { success: false, error: 'No file uploaded. Please select a PNG or JPG file.' },
        { status: 400 }
      );
    }
    
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('[UPLOAD] File buffer size:', buffer.length, 'bytes');
    
    // Validate template
    const validation = await validateTemplate(buffer);
    
    console.log('[UPLOAD] Validation result:', validation);
    
    if (!validation.valid) {
      console.error('[UPLOAD] Validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Upload and set as active
    console.log('[UPLOAD] Uploading template:', file.name);
    const template = await uploadTemplate(
      buffer,
      file.name,
      session.user.id
    );
    
    console.log('[UPLOAD] Template uploaded successfully:', template.id);
    
    return NextResponse.json({
      success: true,
      message: 'Template uploaded and activated successfully',
      template: {
        id: template.id,
        nama: template.nama,
        filepath: template.filepath,
        width: template.width,
        height: template.height,
        isActive: template.isActive,
        uploadedAt: template.uploadedAt
      },
      validation: validation.metadata
    });
    
  } catch (error) {
    console.error('[UPLOAD] Template upload error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload template. Please try again.' },
      { status: 500 }
    );
  }
}

// Next.js 13+ App Router config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
