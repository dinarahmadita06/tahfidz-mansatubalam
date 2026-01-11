export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch children's tasmi history for orang tua
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya orang tua yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get orang tua data with children and their tasmi
    const orangTua = await prisma.orangTua.findUnique({
      where: { userId: session.user.id },
      include: {
        orangTuaSiswa: {
          include: {
            siswa: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                kelas: {
                  select: {
                    nama: true,
                  },
                },
                tasmi: {
                  include: {
                    guruPengampu: {
                      include: {
                        user: {
                          select: {
                            name: true,
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
                  orderBy: {
                    tanggalDaftar: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!orangTua) {
      return NextResponse.json(
        { message: 'Data orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    // Flatten the data structure for easier consumption
    const children = orangTua.orangTuaSiswa.map((ots) => ({
      siswaId: ots.siswa.id,
      nama: ots.siswa.user.name,
      email: ots.siswa.user.email,
      kelas: ots.siswa.kelas?.nama || '-',
      hubungan: ots.hubungan,
      tasmi: ots.siswa.tasmi,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching tasmi for orang tua:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
