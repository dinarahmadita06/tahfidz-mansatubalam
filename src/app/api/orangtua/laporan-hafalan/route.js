import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get anak (siswa) of this orang tua
    const orangTuaSiswa = await prisma.orangTuaSiswa.findMany({
      where: {
        orangTuaId: session.user.orangTuaId
      },
      include: {
        siswa: {
          select: {
            id: true
          }
        }
      }
    });

    const siswaIds = orangTuaSiswa.map(os => os.siswa.id);

    if (siswaIds.length === 0) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    let whereClause = {
      siswaId: {
        in: siswaIds
      }
    };

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const laporan = await prisma.hafalan.findMany({
      where: whereClause,
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
        penilaian: true
        // Removed surah: true since surah is a string field, not a relation
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('Error fetching laporan hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan hafalan' },
      { status: 500 }
    );
  }
}

// Export PDF endpoint
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { siswaId, periode, format } = body

    // TODO: Implementasi pembuatan PDF/Excel
    // Untuk saat ini, return success message

    return NextResponse.json({
      success: true,
      message: `Laporan dalam format ${format} akan segera diunduh`,
      downloadUrl: `/api/orangtua/laporan-hafalan/download?siswaId=${siswaId}&periode=${periode}&format=${format}`
    })

  } catch (error) {
    console.error('Error exporting laporan:', error)
    return NextResponse.json(
      { error: 'Failed to export laporan', details: error.message },
      { status: 500 }
    )
  }
}
