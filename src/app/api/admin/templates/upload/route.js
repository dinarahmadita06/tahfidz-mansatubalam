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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check admin permission
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('template');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validate template
    const validation = await validateTemplate(buffer);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Upload and set as active
    const template = await uploadTemplate(
      buffer,
      file.name,
      session.user.id
    );
    
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
    console.error('Template upload error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload template' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
