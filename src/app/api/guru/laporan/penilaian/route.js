export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Save penilaian
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      siswaId,
      tanggal,
      surah,
      ayatMulai,
      ayatSelesai,
      tajwid,
      kelancaran,
      makhraj,
      implementasi,
    } = body;

    // Validation
    if (!siswaId || !tanggal || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (
      tajwid == null ||
      kelancaran == null ||
      makhraj == null ||
      implementasi == null
    ) {
      return NextResponse.json(
        { error: 'All assessment values are required' },
        { status: 400 }
      );
    }

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // Calculate average
    const nilaiAkhir = (tajwid + kelancaran + makhraj + implementasi) / 4;

    // Parse date
    const selectedDate = new Date(tanggal);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Check if hafalan and penilaian already exist for this date
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        hafalan: true,
      },
    });

    if (existingPenilaian) {
      // Update existing hafalan and penilaian
      await prisma.hafalan.update({
        where: { id: existingPenilaian.hafalanId },
        data: {
          tanggal: new Date(tanggal),
          surah,
          ayatMulai,
          ayatSelesai,
        },
      });

      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: {
          tajwid,
          kelancaran,
          makhraj,
          adab: implementasi,
          nilaiAkhir,
        },
      });
    } else {
      // Create new hafalan
      const hafalan = await prisma.hafalan.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: new Date(tanggal),
          juz: 1, // Default value
          surah,
          ayatMulai,
          ayatSelesai,
        },
      });

      // Create new penilaian
      await prisma.penilaian.create({
        data: {
          hafalanId: hafalan.id,
          siswaId,
          guruId: guru.id,
          tajwid,
          kelancaran,
          makhraj,
          adab: implementasi,
          nilaiAkhir,
        },
      });
    }

    // Ensure presensi is marked as HADIR if penilaian is created
    const existingPresensi = await prisma.presensi.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!existingPresensi) {
      await prisma.presensi.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: new Date(tanggal),
          status: 'HADIR',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Penilaian saved successfully',
    });
  } catch (error) {
    console.error('Error saving penilaian:', error);
    return NextResponse.json(
      { error: 'Failed to save penilaian', details: error.message },
      { status: 500 }
    );
  }
}
