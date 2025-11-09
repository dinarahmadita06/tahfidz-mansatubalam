import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get statistics and reports for tasmi
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya koordinator yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun');
    const bulan = searchParams.get('bulan');

    // Build date filter
    let dateFilter = {};
    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0, 23, 59, 59);
      dateFilter = {
        tanggalDaftar: {
          gte: startDate,
          lte: endDate,
        },
      };
    } else if (tahun) {
      const startDate = new Date(parseInt(tahun), 0, 1);
      const endDate = new Date(parseInt(tahun), 11, 31, 23, 59, 59);
      dateFilter = {
        tanggalDaftar: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    // Get total counts by status
    const totalMenunggu = await prisma.tasmi.count({
      where: {
        statusPendaftaran: 'MENUNGGU',
        ...dateFilter,
      },
    });

    const totalDisetujui = await prisma.tasmi.count({
      where: {
        statusPendaftaran: 'DISETUJUI',
        ...dateFilter,
      },
    });

    const totalDitolak = await prisma.tasmi.count({
      where: {
        statusPendaftaran: 'DITOLAK',
        ...dateFilter,
      },
    });

    const totalSelesai = await prisma.tasmi.count({
      where: {
        statusPendaftaran: 'SELESAI',
        ...dateFilter,
      },
    });

    const totalPendaftar = totalMenunggu + totalDisetujui + totalDitolak + totalSelesai;

    // Get statistics by predikat
    const tasmiSelesai = await prisma.tasmi.findMany({
      where: {
        statusPendaftaran: 'SELESAI',
        publishedAt: { not: null },
        predikat: { not: null },
        ...dateFilter,
      },
      select: {
        predikat: true,
        nilaiAkhir: true,
      },
    });

    // Count by predikat
    const predikatStats = {
      Mumtaz: tasmiSelesai.filter((t) => t.predikat === 'Mumtaz').length,
      'Jayyid Jiddan': tasmiSelesai.filter((t) => t.predikat === 'Jayyid Jiddan').length,
      Jayyid: tasmiSelesai.filter((t) => t.predikat === 'Jayyid').length,
      Maqbul: tasmiSelesai.filter((t) => t.predikat === 'Maqbul').length,
    };

    // Calculate average score
    const averageScore =
      tasmiSelesai.length > 0
        ? tasmiSelesai.reduce((sum, t) => sum + (t.nilaiAkhir || 0), 0) / tasmiSelesai.length
        : 0;

    // Get top performers (highest nilaiAkhir)
    const topPerformers = await prisma.tasmi.findMany({
      where: {
        statusPendaftaran: 'SELESAI',
        publishedAt: { not: null },
        nilaiAkhir: { not: null },
        ...dateFilter,
      },
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
      orderBy: {
        nilaiAkhir: 'desc',
      },
      take: 10,
    });

    // Get tasmi by kelas
    const tasmiByKelas = await prisma.tasmi.groupBy({
      by: ['siswaId'],
      where: {
        statusPendaftaran: 'SELESAI',
        ...dateFilter,
      },
      _count: {
        id: true,
      },
    });

    // Get siswa data for kelas grouping
    const siswaIds = tasmiByKelas.map((t) => t.siswaId);
    const siswaData = await prisma.siswa.findMany({
      where: {
        id: { in: siswaIds },
      },
      select: {
        id: true,
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    // Group by kelas
    const kelasCounts = {};
    siswaData.forEach((siswa) => {
      if (siswa.kelas) {
        const kelasNama = siswa.kelas.nama;
        kelasCounts[kelasNama] = (kelasCounts[kelasNama] || 0) + 1;
      }
    });

    return NextResponse.json({
      summary: {
        totalPendaftar,
        totalMenunggu,
        totalDisetujui,
        totalDitolak,
        totalSelesai,
        averageScore: averageScore.toFixed(2),
      },
      predikatStats,
      topPerformers,
      kelasCounts,
    });
  } catch (error) {
    console.error('Error fetching rekap:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
