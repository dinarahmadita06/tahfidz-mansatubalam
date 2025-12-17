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

    // Get hafalan data with penilaian for the period
    const hafalanData = await prisma.hafalan.findMany({
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
        penilaian: true
      }
    });

    // Calculate statistics per siswa
    const siswaData = siswaList.map(siswa => {
      const siswaKehadiran = kehadiran.filter(k => k.siswaId === siswa.id);

      const hadir = siswaKehadiran.filter(k => k.status === 'HADIR').length;
      const izin = siswaKehadiran.filter(k => k.status === 'IZIN').length;
      const sakit = siswaKehadiran.filter(k => k.status === 'SAKIT').length;
      const alpa = siswaKehadiran.filter(k => k.status === 'ALPA').length;

      // Get penilaian data for this siswa
      const siswaHafalan = hafalanData.filter(h => h.siswaId === siswa.id);
      const penilaianRecords = siswaHafalan
        .filter(h => h.penilaian)
        .map(h => h.penilaian);

      // Calculate average scores
      let avgTajwid = null;
      let avgKelancaran = null;
      let avgMakhraj = null;
      let avgImplementasi = null;
      let totalNilai = null;

      if (penilaianRecords.length > 0) {
        avgTajwid = Math.round(
          penilaianRecords.reduce((sum, p) => sum + p.tajwid, 0) / penilaianRecords.length
        );
        avgKelancaran = Math.round(
          penilaianRecords.reduce((sum, p) => sum + p.kelancaran, 0) / penilaianRecords.length
        );
        avgMakhraj = Math.round(
          penilaianRecords.reduce((sum, p) => sum + p.makhraj, 0) / penilaianRecords.length
        );
        avgImplementasi = Math.round(
          penilaianRecords.reduce((sum, p) => sum + p.adab, 0) / penilaianRecords.length
        );
        totalNilai = Math.round((avgTajwid + avgKelancaran + avgMakhraj + avgImplementasi) / 4);
      }

      return {
        nama: siswa.user.name,
        nisn: siswa.nisn,
        hadir,
        izin,
        sakit,
        alpa,
        tajwid: avgTajwid,
        kelancaran: avgKelancaran,
        makhraj: avgMakhraj,
        implementasi: avgImplementasi,
        totalNilai
      };
    });

    // Calculate overall statistics
    const totalHadir = siswaData.reduce((sum, s) => sum + s.hadir, 0);
    const totalIzin = siswaData.reduce((sum, s) => sum + s.izin, 0);
    const totalSakit = siswaData.reduce((sum, s) => sum + s.sakit, 0);
    const totalAlpa = siswaData.reduce((sum, s) => sum + s.alpa, 0);

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
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpa
      },
      siswaData
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { error: 'Gagal generate laporan kehadiran' },
      { status: 500 }
    );
  }
}
