import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');

    if (!kelasId || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    // Get kelas info
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      select: { nama: true }
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    // Get all siswa in this kelas
    const siswaList = await prisma.siswa.findMany({
      where: { kelasId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Get kehadiran data for the period
    const kehadiran = await prisma.presensi.findMany({
      where: {
        siswa: {
          kelasId: kelasId
        },
        tanggal: {
          gte: new Date(tanggalMulai),
          lte: new Date(tanggalSelesai)
        }
      },
      include: {
        siswa: {
          select: {
            id: true,
            nisn: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggal: 'asc'
      }
    });

    // Get unique dates (pertemuan)
    const uniqueDates = [...new Set(kehadiran.map(k => k.tanggal.toISOString().split('T')[0]))];
    const totalPertemuan = uniqueDates.length;

    // Calculate statistics per siswa
    const siswaData = siswaList.map(siswa => {
      const siswaKehadiran = kehadiran.filter(k => k.siswaId === siswa.id);

      const hadir = siswaKehadiran.filter(k => k.status === 'HADIR').length;
      const izin = siswaKehadiran.filter(k => k.status === 'IZIN').length;
      const sakit = siswaKehadiran.filter(k => k.status === 'SAKIT').length;
      const alpa = siswaKehadiran.filter(k => k.status === 'ALPA').length;

      const totalKehadiran = siswaKehadiran.length;
      const persenHadir = totalPertemuan > 0 ? Math.round((hadir / totalPertemuan) * 100) : 0;
      const persenIzin = totalPertemuan > 0 ? Math.round((izin / totalPertemuan) * 100) : 0;
      const persenSakit = totalPertemuan > 0 ? Math.round((sakit / totalPertemuan) * 100) : 0;
      const persenAlpa = totalPertemuan > 0 ? Math.round((alpa / totalPertemuan) * 100) : 0;

      // Status kehadiran
      let status = 'Baik';
      if (persenHadir >= 90) status = 'Sangat Baik';
      else if (persenHadir >= 75) status = 'Baik';
      else if (persenHadir >= 60) status = 'Cukup';
      else status = 'Kurang';

      return {
        nama: siswa.user.name,
        nisn: siswa.nisn,
        hadir,
        izin,
        sakit,
        alpa,
        persenHadir,
        persenIzin,
        persenSakit,
        persenAlpa,
        totalKehadiran: persenHadir,
        status
      };
    });

    // Calculate overall statistics
    const totalHadir = siswaData.reduce((sum, s) => sum + s.hadir, 0);
    const totalIzin = siswaData.reduce((sum, s) => sum + s.izin, 0);
    const totalSakit = siswaData.reduce((sum, s) => sum + s.sakit, 0);
    const totalAlpa = siswaData.reduce((sum, s) => sum + s.alpa, 0);
    const totalKehadiranAll = totalHadir + totalIzin + totalSakit + totalAlpa;

    const persenHadirOverall = totalKehadiranAll > 0 ? Math.round((totalHadir / totalKehadiranAll) * 100) : 0;
    const persenIzinOverall = totalKehadiranAll > 0 ? Math.round((totalIzin / totalKehadiranAll) * 100) : 0;
    const persenSakitOverall = totalKehadiranAll > 0 ? Math.round((totalSakit / totalKehadiranAll) * 100) : 0;
    const persenAlpaOverall = totalKehadiranAll > 0 ? Math.round((totalAlpa / totalKehadiranAll) * 100) : 0;

    const rataKehadiran = siswaList.length > 0
      ? Math.round(siswaData.reduce((sum, s) => sum + s.totalKehadiran, 0) / siswaList.length)
      : 0;

    // Period text
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);
    const periodeText = `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;

    return NextResponse.json({
      kelasNama: kelas.nama,
      periodeText,
      summary: {
        jumlahSiswa: siswaList.length,
        totalPertemuan,
        rataKehadiran,
        persenHadir: persenHadirOverall,
        persenIzin: persenIzinOverall,
        persenSakit: persenSakitOverall,
        persenAlpa: persenAlpaOverall
      },
      siswaData,
      kehadiran
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { error: 'Gagal generate laporan kehadiran' },
      { status: 500 }
    );
  }
}
