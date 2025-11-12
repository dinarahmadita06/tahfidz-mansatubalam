import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Update catatan semesteran
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
    const { siswaId, periode, catatan } = body;

    if (!siswaId || !periode) {
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

    // Calculate date range based on periode
    const dateRange = calculateDateRange(periode);

    // Check if a catatan semesteran record exists
    // We'll use the Presensi table with a special marker for semester summaries
    const existingCatatan = await prisma.presensi.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        tanggal: dateRange.start,
        status: 'CATATAN_SEMESTERAN', // Special marker
      },
    });

    if (existingCatatan) {
      // Update existing catatan
      await prisma.presensi.update({
        where: { id: existingCatatan.id },
        data: { keterangan: catatan },
      });
    } else {
      // Create new catatan semesteran
      await prisma.presensi.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: dateRange.start,
          status: 'CATATAN_SEMESTERAN',
          keterangan: catatan,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Catatan semesteran saved successfully',
    });
  } catch (error) {
    console.error('Error saving catatan semesteran:', error);
    return NextResponse.json(
      { error: 'Failed to save catatan semesteran', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate date range
function calculateDateRange(periode) {
  const now = new Date();
  let start, end;

  switch (periode) {
    case 'bulan-ini':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'bulan-lalu':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'semester-ini':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  return { start, end };
}
