export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Update catatan
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
    const { siswaId, tanggal, catatan } = body;

    if (!siswaId || !tanggal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Parse date range
    const selectedDate = new Date(tanggal);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Check if penilaian exists for this date
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingPenilaian) {
      // Update penilaian catatan
      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: { catatan },
      });
    } else {
      // Check if presensi exists
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

      if (existingPresensi) {
        // Update presensi keterangan
        await prisma.presensi.update({
          where: { id: existingPresensi.id },
          data: { keterangan: catatan },
        });
      } else {
        // Create new presensi with catatan
        await prisma.presensi.create({
          data: {
            siswaId,
            guruId: guru.id,
            tanggal: new Date(tanggal),
            status: 'HADIR',
            keterangan: catatan,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Catatan saved successfully',
    });
  } catch (error) {
    console.error('Error saving catatan:', error);
    return NextResponse.json(
      { error: 'Failed to save catatan', details: error.message },
      { status: 500 }
    );
  }
}
