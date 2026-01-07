import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Helper function to get image dimensions from PNG buffer
function getPNGDimensions(buffer) {
  try {
    const view = new DataView(buffer);
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return { width, height };
  } catch {
    return { width: 100, height: 50 }; // Default fallback
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'guru' atau 'koordinator'

    if (!file) {
      return NextResponse.json({ error: 'File harus disediakan' }, { status: 400 });
    }

    // Create uploads directory if not exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'signatures');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `ttd-${session.user.id}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    await writeFile(filePath, Buffer.from(uint8Array));

    const relativePath = `/uploads/signatures/${fileName}`;
    const dimensions = getPNGDimensions(buffer);

    // Update user record - but only if user actually has fields in database
    try {
      const updateData = {
        signatureUrl: relativePath,
        ttdUrl: relativePath  // Also update ttdUrl for compatibility
      };
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData
      });
    } catch (updateError) {
      // If User fields don't exist, just log and continue
      console.error('[Signature Upload] User table update note:', updateError.message);
    }

    // Also update AdminSignature for legacy support if type is provided
    if (type) {
      await prisma.adminSignature.upsert({
        where: { type },
        update: {
          signatureData: relativePath,
          fileName: file.name,
          fileSize: file.size,
          imageWidth: dimensions.width,
          imageHeight: dimensions.height,
          updatedAt: new Date()
        },
        create: {
          type,
          signatureData: relativePath,
          fileName: file.name,
          fileSize: file.size,
          imageWidth: dimensions.width,
          imageHeight: dimensions.height
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tanda tangan berhasil diupload',
      signatureUrl: relativePath
    });

  } catch (error) {
    console.error('[Signature Upload] Error:', error);
    return NextResponse.json({ error: `Gagal upload: ${error.message}` }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let signatureUrl = null;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { signatureUrl: true }
      });
      signatureUrl = user?.signatureUrl || null;
    } catch (error) {
      console.error('[Signature Upload] User table query note:', error.message);
    }

    return NextResponse.json({
      success: true,
      signatureUrl: signatureUrl || null
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

