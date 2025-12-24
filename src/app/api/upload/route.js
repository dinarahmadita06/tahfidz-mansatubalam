import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';

    if (!file) {
      return NextResponse.json(
        { message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type (PDF and video files)
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/x-msvideo', // AVI
      'video/quicktime', // MOV
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Format file tidak didukung. Gunakan PDF atau video (MP4, WebM, OGG)' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal 50MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const fileName = `${folder}/${baseName}-${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      message: 'File berhasil diunggah',
      url: blob.url,
      filename: fileName,
      size: file.size,
      type: file.type,
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengunggah file', error: error.message },
      { status: 500 }
    );
  }
}
