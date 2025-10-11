import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch all wisuda
export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wisuda = await prisma.wisuda.findMany({
      include: {
        siswa: {
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
          },
        },
      },
      orderBy: {
        tanggalWisuda: 'desc',
      },
    });

    // Transform data
    const transformedWisuda = wisuda.map(w => ({
      id: w.id,
      tanggalWisuda: w.tanggalWisuda,
      lokasiWisuda: w.lokasiWisuda,
      keterangan: w.keterangan,
      status: w.status,
      jumlahSiswa: w.siswa.length,
      siswa: w.siswa.map(ws => ({
        id: ws.siswaId,
        nama: ws.siswa.user.name,
        kelas: ws.siswa.kelas.nama,
        totalJuz: ws.totalJuz,
      })),
      createdAt: w.createdAt,
    }));

    return NextResponse.json(transformedWisuda);
  } catch (error) {
    console.error('Error fetching wisuda:', error);
    return NextResponse.json({ error: 'Failed to fetch wisuda' }, { status: 500 });
  }
}

// POST - Create new wisuda
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tanggalWisuda, lokasiWisuda, keterangan, siswaList } = body;

    // Validate required fields
    if (!tanggalWisuda || !lokasiWisuda || !siswaList || siswaList.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total juz for each siswa
    const siswaWithJuz = await Promise.all(
      siswaList.map(async (siswaId) => {
        const hafalan = await prisma.hafalan.findMany({
          where: { siswaId },
          select: { juz: true },
        });

        const uniqueJuz = [...new Set(hafalan.map(h => h.juz))];
        return {
          siswaId,
          totalJuz: uniqueJuz.length,
        };
      })
    );

    // Create wisuda with siswa
    const wisuda = await prisma.wisuda.create({
      data: {
        guruId: session.user.guruId,
        tanggalWisuda: new Date(tanggalWisuda),
        lokasiWisuda,
        keterangan,
        siswa: {
          create: siswaWithJuz,
        },
      },
      include: {
        siswa: {
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
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Wisuda created successfully',
      wisuda,
    });
  } catch (error) {
    console.error('Error creating wisuda:', error);
    return NextResponse.json({ error: 'Failed to create wisuda' }, { status: 500 });
  }
}

// PATCH - Update wisuda
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, tanggalWisuda, lokasiWisuda, keterangan, siswaList, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Wisuda ID required' }, { status: 400 });
    }

    // Prepare update data
    const updateData = {};
    if (tanggalWisuda) updateData.tanggalWisuda = new Date(tanggalWisuda);
    if (lokasiWisuda) updateData.lokasiWisuda = lokasiWisuda;
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (status) updateData.status = status;

    // If siswaList is provided, update the students
    if (siswaList && Array.isArray(siswaList)) {
      // Delete existing students
      await prisma.wisudaSiswa.deleteMany({
        where: { wisudaId: id },
      });

      // Calculate total juz for each siswa
      const siswaWithJuz = await Promise.all(
        siswaList.map(async (siswaId) => {
          const hafalan = await prisma.hafalan.findMany({
            where: { siswaId },
            select: { juz: true },
          });

          const uniqueJuz = [...new Set(hafalan.map(h => h.juz))];
          return {
            siswaId,
            totalJuz: uniqueJuz.length,
          };
        })
      );

      updateData.siswa = {
        create: siswaWithJuz,
      };
    }

    const wisuda = await prisma.wisuda.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
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
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Wisuda updated successfully',
      wisuda,
    });
  } catch (error) {
    console.error('Error updating wisuda:', error);
    return NextResponse.json({ error: 'Failed to update wisuda' }, { status: 500 });
  }
}

// DELETE - Delete wisuda
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Wisuda ID required' }, { status: 400 });
    }

    await prisma.wisuda.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Wisuda deleted successfully' });
  } catch (error) {
    console.error('Error deleting wisuda:', error);
    return NextResponse.json({ error: 'Failed to delete wisuda' }, { status: 500 });
  }
}
