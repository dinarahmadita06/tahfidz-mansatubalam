import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Schedule tasmi exam
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
    const { tanggalUjian } = body;

    // Validate input
    if (!tanggalUjian) {
      return NextResponse.json(
        { message: 'Tanggal ujian harus diisi' },
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

    // Check if approved
    if (tasmi.statusPendaftaran !== 'DISETUJUI') {
      return NextResponse.json(
        { message: 'Pendaftaran harus disetujui terlebih dahulu' },
        { status: 400 }
      );
    }

    // Check if exam date is in the future
    const examDate = new Date(tanggalUjian);
    if (examDate < new Date()) {
      return NextResponse.json(
        { message: 'Tanggal ujian harus di masa depan' },
        { status: 400 }
      );
    }

    // Update tanggal ujian
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        tanggalUjian: examDate,
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
      },
    });

    return NextResponse.json({
      message: 'Jadwal ujian Tasmi\' berhasil ditentukan',
      tasmi: updatedTasmi,
    });
  } catch (error) {
    console.error('Error scheduling tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
