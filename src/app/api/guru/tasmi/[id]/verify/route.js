import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Verify tasmi registration (approve or reject)
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
    const { approve, guruId } = body;

    // Validate input
    if (typeof approve !== 'boolean' || !guruId) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
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

    // Check if already verified
    if (tasmi.statusPendaftaran !== 'MENUNGGU') {
      return NextResponse.json(
        { message: 'Pendaftaran ini sudah diverifikasi' },
        { status: 400 }
      );
    }

    // Update status
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        statusPendaftaran: approve ? 'DISETUJUI' : 'DITOLAK',
        guruVerifikasiId: guruId,
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
      message: approve
        ? 'Pendaftaran Tasmi\' berhasil disetujui'
        : 'Pendaftaran Tasmi\' ditolak',
      tasmi: updatedTasmi,
    });
  } catch (error) {
    console.error('Error verifying tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
