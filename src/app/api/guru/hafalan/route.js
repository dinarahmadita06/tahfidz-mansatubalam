import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch hafalan
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const kelasId = searchParams.get('kelasId');

    let whereClause = {
      guruId: session.user.guruId
    };

    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    // If kelasId provided, filter by kelas
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        penilaian: {
          select: {
            id: true,
            tajwid: true,
            kelancaran: true,
            makhraj: true,
            adab: true,
            nilaiAkhir: true,
            catatan: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// POST - Create hafalan
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      siswaId,
      tanggal,
      juz,
      surah,
      ayatMulai,
      ayatSelesai,
      keterangan
    } = data;

    // Validasi input
    if (!siswaId || !juz || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Create hafalan
    const hafalan = await prisma.hafalan.create({
      data: {
        siswaId,
        guruId: session.user.guruId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        juz: parseInt(juz),
        surah,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        keterangan: keterangan || null
      },
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(hafalan, { status: 201 });
  } catch (error) {
    console.error('Error creating hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to create hafalan' },
      { status: 500 }
    );
  }
}

// PUT - Update hafalan
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      id,
      tanggal,
      juz,
      surah,
      ayatMulai,
      ayatSelesai,
      keterangan
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID hafalan harus disertakan' },
        { status: 400 }
      );
    }

    // Update hafalan
    const hafalan = await prisma.hafalan.update({
      where: {
        id,
        guruId: session.user.guruId
      },
      data: {
        tanggal: tanggal ? new Date(tanggal) : undefined,
        juz: juz ? parseInt(juz) : undefined,
        surah: surah || undefined,
        ayatMulai: ayatMulai ? parseInt(ayatMulai) : undefined,
        ayatSelesai: ayatSelesai ? parseInt(ayatSelesai) : undefined,
        keterangan: keterangan || null
      },
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('Error updating hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to update hafalan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete hafalan
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID hafalan harus disertakan' },
        { status: 400 }
      );
    }

    // Delete hafalan (will cascade delete penilaian)
    await prisma.hafalan.delete({
      where: {
        id,
        guruId: session.user.guruId
      }
    });

    return NextResponse.json({ message: 'Hafalan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to delete hafalan' },
      { status: 500 }
    );
  }
}
