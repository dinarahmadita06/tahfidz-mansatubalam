import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

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

    // Try multiple paths - use public folder in workspace
    const workspaceRoot = process.cwd();
    console.log('[Signature Upload] Workspace root:', workspaceRoot);
    
    // Path 1: /public/signatures (relative to workspace)
    const publicSignaturesDir = join(workspaceRoot, 'public', 'signatures');
    console.log('[Signature Upload] Attempting to use path:', publicSignaturesDir);
    
    try {
      // Make sure directory exists
      const parentDir = join(workspaceRoot, 'public');
      if (!existsSync(publicSignaturesDir)) {
        console.log('[Signature Upload] Creating signatures directory...');
        await mkdir(publicSignaturesDir, { recursive: true });
      }
      
      // Save file
      const fileName = type === 'guru' ? 'guru_signature.png' : 'koordinator_signature.png';
      const filePath = join(publicSignaturesDir, fileName);
      
      console.log('[Signature Upload] Writing file to:', filePath);
      await writeFile(filePath, uint8Array);
      console.log('[Signature Upload] File saved successfully to:', filePath);

      const successMsg = `Tanda tangan ${type === 'guru' ? 'Guru Tahfidz' : 'Koordinator Tahfidz'} berhasil diupload`;
      console.log('[Signature Upload] Success:', successMsg);

      return NextResponse.json(
        { 
          message: successMsg,
          path: `/signatures/${fileName}`,
          success: true,
          debugInfo: { savedPath: filePath }
        },
        { status: 200 }
      );
    } catch (fsError) {
      console.error('[Signature Upload] File system error:', fsError);
      throw fsError;
    }
  } catch (error) {
    console.error('[Signature Upload] Fatal error:', error);
    return NextResponse.json(
      { error: `Gagal upload tanda tangan: ${error.message}` },
      { status: 500 }
    );
  }
}
