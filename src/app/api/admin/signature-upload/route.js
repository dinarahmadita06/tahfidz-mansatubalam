import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

const prisma = new PrismaClient();

// Helper function to get image dimensions from PNG buffer
function getPNGDimensions(buffer) {
  try {
    // PNG width is at bytes 16-20, height at 20-24 (big-endian)
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
    console.log('[Signature Upload] Request received');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'guru' atau 'koordinator'

    console.log('[Signature Upload] Data:', { 
      fileName: file?.name, 
      fileSize: file?.size,
      fileType: file?.type,
      type 
    });

    if (!file || !type) {
      console.warn('[Signature Upload] Missing file or type');
      return NextResponse.json(
        { error: 'File dan type harus disediakan' },
        { status: 400 }
      );
    }

    // Validasi file type
    if (file.type !== 'image/png') {
      console.warn('[Signature Upload] Invalid file type:', file.type);
      return NextResponse.json(
        { error: `Format file harus PNG saja (received: ${file.type})` },
        { status: 400 }
      );
    }

    // Validasi file size (max 500KB)
    if (file.size > 500 * 1024) {
      console.warn('[Signature Upload] File too large:', file.size);
      return NextResponse.json(
        { error: `Ukuran file tidak boleh lebih dari 500 KB (received: ${(file.size / 1024).toFixed(2)} KB)` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    console.log('[Signature Upload] Buffer ready, size:', uint8Array.length);

    // Get PNG dimensions
    const dimensions = getPNGDimensions(buffer);
    console.log('[Signature Upload] Image dimensions:', dimensions);

    // Convert to base64
    const base64Data = Buffer.from(uint8Array).toString('base64');
    const base64DataUrl = `data:image/png;base64,${base64Data}`;
    console.log('[Signature Upload] Base64 encoded, length:', base64DataUrl.length);

    // Validate type
    if (type !== 'guru' && type !== 'koordinator') {
      return NextResponse.json(
        { error: 'Type harus guru atau koordinator' },
        { status: 400 }
      );
    }

    // Save to database
    try {
      const signature = await prisma.adminSignature.upsert({
        where: { type },
        update: {
          signatureData: base64DataUrl,
          fileName: file.name,
          fileSize: file.size,
          imageWidth: dimensions.width,
          imageHeight: dimensions.height,
          updatedAt: new Date()
        },
        create: {
          type,
          signatureData: base64DataUrl,
          fileName: file.name,
          fileSize: file.size,
          imageWidth: dimensions.width,
          imageHeight: dimensions.height
        }
      });

      console.log('[Signature Upload] Saved to database:', { type, id: signature.id });

      const successMsg = `Tanda tangan ${type === 'guru' ? 'Guru Tahfidz' : 'Koordinator Tahfidz'} berhasil diupload`;
      console.log('[Signature Upload] Success:', successMsg);

      return NextResponse.json(
        { 
          message: successMsg,
          success: true,
          type,
          signature: {
            id: signature.id,
            fileName: signature.fileName,
            uploadedAt: signature.uploadedAt,
            dimensions: { width: dimensions.width, height: dimensions.height }
          }
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('[Signature Upload] Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('[Signature Upload] Fatal error:', error);
    return NextResponse.json(
      { error: `Gagal upload tanda tangan: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint untuk fetch signature
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'guru' atau 'koordinator'

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter diperlukan' },
        { status: 400 }
      );
    }

    const signature = await prisma.adminSignature.findUnique({
      where: { type }
    });

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        signature: {
          type: signature.type,
          data: signature.signatureData,
          fileName: signature.fileName,
          uploadedAt: signature.uploadedAt,
          dimensions: {
            width: signature.imageWidth,
            height: signature.imageHeight
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Signature Fetch] Error:', error);
    return NextResponse.json(
      { error: `Gagal fetch tanda tangan: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
