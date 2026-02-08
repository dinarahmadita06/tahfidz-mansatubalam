/**
 * API Route: Manage Certificate Templates
 * GET /api/admin/templates - Get all templates
 * PUT /api/admin/templates - Set active template
 * DELETE /api/admin/templates - Delete template
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getAllTemplates,
  getActiveTemplate,
  setActiveTemplate,
  deactivateTemplate,
  deleteTemplate
} from '@/lib/template-service';

// GET - Get all templates or active template
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    if (activeOnly) {
      const template = await getActiveTemplate();
      
      return NextResponse.json({
        success: true,
        template: template
      });
    }
    
    const templates = await getAllTemplates();
    
    return NextResponse.json({
      success: true,
      templates: templates
    });
    
  } catch (error) {
    console.error('Get templates error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to get templates' },
      { status: 500 }
    );
  }
}

// PUT - Set active template
export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { templateId } = body;
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const template = await setActiveTemplate(templateId);
    
    return NextResponse.json({
      success: true,
      message: 'Template activated successfully',
      template: template
    });
    
  } catch (error) {
    console.error('Set active template error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to activate template' },
      { status: 500 }
    );
  }
}

// PATCH - Deactivate template
export async function PATCH(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { templateId } = body;
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    const template = await deactivateTemplate(templateId);
    
    return NextResponse.json({
      success: true,
      message: 'Template deactivated successfully',
      template: template
    });
    
  } catch (error) {
    console.error('Deactivate template error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    await deleteTemplate(templateId);
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete template error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}
