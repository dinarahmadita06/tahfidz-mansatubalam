import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Publish tasmi results to student
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

    // Check if tasmi exists
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
        { message: 'Pendaftaran Tasmi\' tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if already graded
    if (!tasmi.nilaiAkhir) {
      return NextResponse.json(
        { message: 'Tasmi belum dinilai, tidak dapat dipublikasikan' },
        { status: 400 }
      );
    }

    // Check if already published
    if (tasmi.publishedAt) {
      return NextResponse.json(
        { message: 'Hasil penilaian sudah dipublikasikan sebelumnya' },
        { status: 400 }
      );
    }

    // Publish the result by setting publishedAt timestamp
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        publishedAt: new Date(),
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
      message: 'Hasil penilaian berhasil dipublikasikan ke siswa',
      tasmi: updatedTasmi,
    });
  } catch (error) {
    console.error('Error publishing tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
