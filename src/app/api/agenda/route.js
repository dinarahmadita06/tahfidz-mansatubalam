import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - List agenda
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');

    let whereClause = {
      guruId: session.user.guruId,
    };

    // Filter by date if provided
    if (tanggal) {
      const startDate = new Date(tanggal);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(tanggal);
      endDate.setHours(23, 59, 59, 999);

      whereClause.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    const agenda = await prisma.agenda.findMany({
      where: whereClause,
      include: {
        kelas: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { waktuMulai: 'asc' },
      ],
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error('Error fetching agenda:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agenda' },
      { status: 500 }
    );
  }
}

// POST - Create new agenda
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      kelasId,
      judul,
      deskripsi,
      tanggal,
      waktuMulai,
      waktuSelesai,
    } = body;

    // Validate required fields
    if (!judul || !tanggal || !waktuMulai) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agenda = await prisma.agenda.create({
      data: {
        guruId: session.user.guruId,
        kelasId: kelasId || null,
        judul,
        deskripsi: deskripsi || null,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai: waktuSelesai || null,
        status: 'upcoming',
      },
      include: {
        kelas: {
          select: {
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(agenda, { status: 201 });
  } catch (error) {
    console.error('Error creating agenda:', error);
    return NextResponse.json(
      { error: 'Failed to create agenda' },
      { status: 500 }
    );
  }
}

// PATCH - Update agenda status
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agenda = await prisma.agenda.update({
      where: {
        id,
        guruId: session.user.guruId, // Ensure guru can only update their own agenda
      },
      data: {
        status,
      },
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error('Error updating agenda:', error);
    return NextResponse.json(
      { error: 'Failed to update agenda' },
      { status: 500 }
    );
  }
}
