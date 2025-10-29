import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const bulan = searchParams.get('bulan'); // format: YYYY-MM
    const tahun = searchParams.get('tahun');

    // Validasi: pastikan user adalah orang tua
    if (session.user.role !== 'ORANGTUA' && session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Jika siswaId tidak diberikan, ambil semua anak dari orang tua ini
    if (!siswaId) {
      const children = await prisma.siswa.findMany({
        where: {
          orangTuaId: session.user.id,
        },
        select: {
          id: true,
          namaLengkap: true,
          kelas: {
            select: {
              namaKelas: true,
            },
          },
        },
      });

      return NextResponse.json({ children });
    }

    // Validasi: pastikan siswa adalah anak dari orang tua ini
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTuaId: session.user.id,
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 404 }
      );
    }

    // Build date filter
    const whereClause = {
      siswaId: siswaId,
    };

    if (bulan && tahun) {
      const startDate = new Date(`${tahun}-${bulan}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    } else if (tahun) {
      whereClause.tanggal = {
        gte: new Date(`${tahun}-01-01`),
        lt: new Date(`${parseInt(tahun) + 1}-01-01`),
      };
    }

    // Get presensi data
    const presensiData = await prisma.presensi.findMany({
      where: whereClause,
      include: {
        jadwal: {
          select: {
            namaKegiatan: true,
            jamMulai: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    // Calculate statistics
    const totalHadir = presensiData.filter((p) => p.status === 'HADIR').length;
    const totalIzin = presensiData.filter((p) => p.status === 'IZIN').length;
    const totalSakit = presensiData.filter((p) => p.status === 'SAKIT').length;
    const totalAlfa = presensiData.filter((p) => p.status === 'ALFA').length;
    const totalHari = presensiData.length;
    const persentaseKehadiran =
      totalHari > 0 ? Math.round((totalHadir / totalHari) * 100) : 0;

    // Format response
    const response = {
      siswa: {
        id: siswa.id,
        nama: siswa.namaLengkap,
        kelas: siswa.kelas?.namaKelas,
      },
      statistics: {
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlfa,
        totalHari,
        persentaseKehadiran,
      },
      presensiList: presensiData.map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        kegiatan: p.jadwal?.namaKegiatan || 'Kegiatan Tahfidz',
        status: p.status,
        jam: p.jamPresensi || p.jadwal?.jamMulai,
        catatan: p.keterangan,
      })),
      chartData: [
        { label: 'Hadir', value: totalHadir, color: '#10b981' },
        { label: 'Izin', value: totalIzin, color: '#f59e0b' },
        { label: 'Sakit', value: totalSakit, color: '#0ea5e9' },
        { label: 'Alfa', value: totalAlfa, color: '#f43f5e' },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching presensi data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presensi data', details: error.message },
      { status: 500 }
    );
  }
}
