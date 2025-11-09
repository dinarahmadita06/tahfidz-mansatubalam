import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Approve tasmi registration
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { tanggalUjian } = body;

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

    // Get tasmi
    const tasmi = await prisma.tasmi.findUnique({
      where: { id },
      include: {
        siswa: {
          include: {
            user: true,
            kelas: true,
          },
        },
      },
    });

    if (!tasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (tasmi.statusPendaftaran !== 'MENUNGGU') {
      return NextResponse.json(
        { message: 'Tasmi sudah diproses sebelumnya' },
        { status: 400 }
      );
    }

    // Update tasmi - approve
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        statusPendaftaran: 'DISETUJUI',
        guruVerifikasiId: guru.id,
        tanggalUjian: tanggalUjian ? new Date(tanggalUjian) : tasmi.tanggalTasmi,
        catatanPenolakan: null,
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
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
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

    return NextResponse.json(
      { message: 'Tasmi berhasil disetujui', tasmi: updatedTasmi },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
