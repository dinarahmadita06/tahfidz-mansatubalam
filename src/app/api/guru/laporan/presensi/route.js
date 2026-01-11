export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// POST - Update presensi status
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
    const { siswaId, tanggal, status } = body;

    if (!siswaId || !tanggal || !status) {
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

    // Check if presensi already exists
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

    // Get siswa data for activity log
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: { user: { select: { name: true } } }
    });

    if (existingPresensi) {
      // Update existing presensi
      await prisma.presensi.update({
        where: { id: existingPresensi.id },
        data: { status },
      });
    } else {
      // Create new presensi
      await prisma.presensi.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: new Date(tanggal),
          status,
        },
      });
    }

    // ✅ Log activity - Presensi update
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_UBAH_PRESENSI,
      title: 'Ubah presensi siswa',
      description: `Mengubah status presensi ${siswa?.user?.name} menjadi ${status}`,
      targetUserId: siswaId,
      targetRole: 'SISWA',
      targetName: siswa?.user?.name,
      metadata: {
        siswaId,
        tanggal,
        status,
        guruId: guru.id,
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json({
      success: true,
      message: 'Status kehadiran saved successfully',
    });
  } catch (error) {
    console.error('Error saving presensi:', error);
    return NextResponse.json(
      { error: 'Failed to save presensi', details: error.message },
      { status: 500 }
    );
  }
}
