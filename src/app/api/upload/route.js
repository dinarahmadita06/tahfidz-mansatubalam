import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Create uploads directory if not exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const fileName = `${baseName}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return relative URL
    const relativePath = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File berhasil diunggah',
      url: relativePath,
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
