import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('tandaTangan');

    if (!file) {
      return NextResponse.json(
        { error: 'File tanda tangan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan PNG atau JPG' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 2MB' },
        { status: 400 }
      );
    }

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `signatures/ttd-${guru.id}-${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    const finalUrl = blob.url;

    // Update database with file path
    await prisma.$transaction([
      prisma.guru.update({
        where: { id: guru.id },
        data: { tandaTangan: finalUrl }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          signatureUrl: finalUrl,
          ttdUrl: finalUrl  // Also update ttdUrl for consistency
        }
      })
    ]);

    // ✅ Log activity (removed async call to prevent blocking)
    // Activity logging will be handled asynchronously if needed

    return NextResponse.json({
      success: true,
      message: 'Tanda tangan berhasil diupload',
      tandaTanganUrl: finalUrl
    });

  } catch (error) {
    console.error('Error uploading signature:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupload tanda tangan' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current signature
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const guru = await prisma.guru.findUnique({
      where: {
        userId: session.user.id
      },
      select: {
        tandaTangan: true
      }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tandaTanganUrl: guru.tandaTangan
    });

  } catch (error) {
    console.error('Error getting signature:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil tanda tangan' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove signature
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const guru = await prisma.guru.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update database to remove signature
    await prisma.$transaction([
      prisma.guru.update({
        where: { id: guru.id },
        data: { tandaTangan: null }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          signatureUrl: null,
          ttdUrl: null  // Also remove ttdUrl for consistency
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Tanda tangan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting signature:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus tanda tangan' },
      { status: 500 }
    );
  }
}
