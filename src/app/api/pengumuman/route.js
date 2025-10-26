import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil pengumuman untuk user berdasarkan role
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Ambil pengumuman yang sesuai dengan role user
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        targetRole: {
          has: session.user.role
        },
        publishedAt: {
          not: null
        }
      },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        wisuda: {
          include: {
            siswa: {
              include: {
                siswa: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    },
                    kelas: {
                      select: {
                        nama: true,
                        tingkat: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman' },
      { status: 500 }
    );
  }
}
