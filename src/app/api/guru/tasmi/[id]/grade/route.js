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
      guruPengujiId,
      nilaiKelancaran,
      nilaiTajwid,
      nilaiKetepatan,
      nilaiAkhir,
      catatan,
    } = body;

    // Validate input
    if (
      !guruPengujiId ||
      nilaiKelancaran === undefined ||
      nilaiTajwid === undefined ||
      nilaiKetepatan === undefined ||
      nilaiAkhir === undefined
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
      nilaiKetepatan < 0 ||
      nilaiKetepatan > 100
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
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        guruPengujiId,
        nilaiKelancaran: parseInt(nilaiKelancaran),
        nilaiTajwid: parseInt(nilaiTajwid),
        nilaiKetepatan: parseInt(nilaiKetepatan),
        nilaiAkhir: parseFloat(nilaiAkhir),
        catatan: catatan || null,
        statusPendaftaran: 'SELESAI',
      },
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

    return NextResponse.json({
      message: 'Penilaian Tasmi\' berhasil disimpan',
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
