import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'guru' atau 'koordinator'

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File dan type harus disediakan' },
        { status: 400 }
      );
    }

    // Validasi file type
    if (file.type !== 'image/png') {
      return NextResponse.json(
        { error: 'Format file harus PNG saja' },
        { status: 400 }
      );
    }

    // Validasi file size (max 500KB)
    if (file.size > 500 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file tidak boleh lebih dari 500 KB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create signatures directory if not exists
    const signaturesDir = join(process.cwd(), 'public', 'signatures');
    try {
      await mkdir(signaturesDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Save file with type-based name
    const fileName = type === 'guru' ? 'guru_signature.png' : 'koordinator_signature.png';
    const filePath = join(signaturesDir, fileName);
    
    await writeFile(filePath, uint8Array);

    return NextResponse.json(
      { 
        message: `Tanda tangan ${type === 'guru' ? 'Guru' : 'Koordinator'} berhasil diupload`,
        path: `/signatures/${fileName}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading signature:', error);
    return NextResponse.json(
      { error: 'Gagal upload tanda tangan. ' + error.message },
      { status: 500 }
    );
  }
}
