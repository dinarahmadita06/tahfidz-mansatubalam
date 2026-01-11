export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Grade tasmi exam
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      nilaiKelancaran,
      nilaiTajwid,
      nilaiAdab,
      nilaiIrama,
      nilaiAkhir,
      predikat,
      catatanPenguji,
      publish, // flag untuk publish hasil
    } = body;

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate input
    if (
      nilaiKelancaran === undefined ||
      nilaiTajwid === undefined ||
      nilaiAdab === undefined ||
      nilaiIrama === undefined ||
      nilaiAkhir === undefined ||
      !predikat
    ) {
      return NextResponse.json(
        { message: 'Data penilaian tidak lengkap' },
        { status: 400 }
      );
    }

    // Validate score range (0-100)
    if (
      nilaiKelancaran < 0 ||
      nilaiKelancaran > 100 ||
      nilaiTajwid < 0 ||
      nilaiTajwid > 100 ||
      nilaiAdab < 0 ||
      nilaiAdab > 100 ||
      nilaiIrama < 0 ||
      nilaiIrama > 100
    ) {
      return NextResponse.json(
        { message: 'Nilai harus antara 0-100' },
        { status: 400 }
      );
    }

    // Check if tasmi exists
    const tasmi = await prisma.tasmi.findUnique({
      where: { id },
    });

    if (!tasmi) {
      return NextResponse.json(
        { message: 'Pendaftaran Tasmi\' tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if approved and scheduled
    if (tasmi.statusPendaftaran !== 'DISETUJUI') {
      return NextResponse.json(
        { message: 'Pendaftaran harus disetujui terlebih dahulu' },
        { status: 400 }
      );
    }

    if (!tasmi.tanggalUjian) {
      return NextResponse.json(
        { message: 'Jadwal ujian harus ditentukan terlebih dahulu' },
        { status: 400 }
      );
    }

    // Update with grades and mark as completed
    const updateData = {
      guruPengujiId: guru.id,
      nilaiKelancaran: parseInt(nilaiKelancaran),
      nilaiTajwid: parseInt(nilaiTajwid),
      nilaiAdab: parseInt(nilaiAdab),
      nilaiIrama: parseInt(nilaiIrama),
      nilaiAkhir: parseFloat(nilaiAkhir),
      predikat,
      catatanPenguji: catatanPenguji || null,
      statusPendaftaran: 'SELESAI',
    };

    // If publish flag is true, set publishedAt timestamp
    if (publish) {
      updateData.publishedAt = new Date();
    }

    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
        guruVerifikasi: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        guruPenguji: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const message = publish
      ? 'Penilaian Tasmi\' berhasil disimpan dan dipublikasikan'
      : 'Penilaian Tasmi\' berhasil disimpan sebagai draft';

    return NextResponse.json({
      message,
      tasmi: updatedTasmi,
    });
  } catch (error) {
    console.error('Error grading tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
