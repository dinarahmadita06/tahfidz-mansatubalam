import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// GET - Fetch books uploaded by current guru
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
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    const books = await prisma.bukuDigital.findMany({
      where: { guruId: guru.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Error fetching buku digital:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buku digital' },
      { status: 500 }
    );
  }
}

// POST - Upload new buku digital
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const judul = formData.get('judul');
    const deskripsi = formData.get('deskripsi');
    let kategori = formData.get('kategori') || 'UMUM';
    
    // Convert kategori to uppercase to match enum (TAJWID, TAFSIR, HADITS, FIQIH, AKHLAK, UMUM)
    kategori = kategori.toUpperCase();
    
    // Validate kategori enum
    const validKategori = ['TAJWID', 'TAFSIR', 'HADITS', 'FIQIH', 'AKHLAK', 'UMUM'];
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        { error: `Kategori tidak valid. Pilih dari: ${validKategori.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!file || !judul) {
      return NextResponse.json(
        { error: 'File dan judul harus diisi' },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Hanya file PDF yang diterima' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 50MB' },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const fileName = `buku-digital-${guru.id}-${Date.now()}.pdf`;
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: 'application/pdf'
    });

    // Save to database
    const bukuDigital = await prisma.bukuDigital.create({
      data: {
        guruId: guru.id,
        judul,
        deskripsi: deskripsi || null,
        kategori: kategori,  // Now uppercase and validated
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size
      }
    });

    // ✅ Log activity - Upload buku digital
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_UPLOAD_BUKU_DIGITAL,
      title: 'Upload buku digital',
      description: `Upload buku digital "${judul}" ke kategori ${kategori}`,
      metadata: {
        bukuId: bukuDigital.id,
        judul,
        kategori,
        fileName: file.name,
        fileSize: file.size,
        guruId: guru.id,
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json({
      success: true,
      message: 'Buku digital berhasil diupload',
      data: bukuDigital
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading buku digital:', error);
    return NextResponse.json(
      { error: 'Failed to upload buku digital', details: error.message },
      { status: 500 }
    );
  }
}
