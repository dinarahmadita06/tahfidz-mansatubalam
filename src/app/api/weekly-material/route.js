export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const isActive = searchParams.get('isActive');

    const where = {};

    if (kelasId) {
      where.kelasId = kelasId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get current active material by default
    if (!kelasId && !isActive) {
      const now = new Date();
      where.weekStart = { lte: now };
      where.weekEnd = { gte: now };
      where.isActive = true;
    }

    const materials = await prisma.weeklyMaterial.findMany({
      where,
      include: {
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching weekly material:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly material' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is GURU or ADMIN
    if (session.user.role !== 'GURU' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      surahNumber,
      ayatMulai,
      ayatSelesai,
      judul,
      keterangan,
      kelasId,
      targetRole,
      weekStart,
      weekEnd,
    } = body;

    // Validate required fields
    if (!surahNumber || !ayatMulai || !ayatSelesai || !weekStart || !weekEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const material = await prisma.weeklyMaterial.create({
      data: {
        surahNumber: parseInt(surahNumber),
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        judul,
        keterangan,
        createdBy: session.user.id,
        kelasId: kelasId || null,
        targetRole: targetRole || ['SISWA'],
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        isActive: true,
      },
      include: {
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly material:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly material' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is GURU or ADMIN
    if (session.user.role !== 'GURU' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    await prisma.weeklyMaterial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly material:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly material' },
      { status: 500 }
    );
  }
}
