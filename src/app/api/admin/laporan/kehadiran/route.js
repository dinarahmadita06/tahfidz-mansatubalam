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

      // Get hafalan and penilaian data for this siswa
      const siswaHafalan = hafalanData.filter(h => h.siswaId === siswa.id);
      
      // Flatten penilaian arrays - use spread operator to handle nested arrays
      const penilaianList = [];
      siswaHafalan.forEach(h => {
        if (h.penilaian && h.penilaian.length > 0) {
          penilaianList.push(...h.penilaian);
        }
      });

      // Calculate average scores from flattened penilaian list
      let avgTajwid = null;
      let avgKelancaran = null;
      let avgMakhraj = null;
      let avgImplementasi = null;
      let totalNilai = null;
      const jumlahSetoran = siswaHafalan.length;

      if (penilaianList.length > 0) {
        const tajwidValues = penilaianList.filter(p => p.tajwid != null).map(p => p.tajwid);
        const kelancaranValues = penilaianList.filter(p => p.kelancaran != null).map(p => p.kelancaran);
        const makhrajValues = penilaianList.filter(p => p.makhraj != null).map(p => p.makhraj);
        const adabValues = penilaianList.filter(p => p.adab != null).map(p => p.adab);
        
        if (tajwidValues.length > 0) avgTajwid = Math.round(tajwidValues.reduce((a, b) => a + b, 0) / tajwidValues.length);
        if (kelancaranValues.length > 0) avgKelancaran = Math.round(kelancaranValues.reduce((a, b) => a + b, 0) / kelancaranValues.length);
        if (makhrajValues.length > 0) avgMakhraj = Math.round(makhrajValues.reduce((a, b) => a + b, 0) / makhrajValues.length);
        if (adabValues.length > 0) avgImplementasi = Math.round(adabValues.reduce((a, b) => a + b, 0) / adabValues.length);
        
        // Calculate overall average
        if (avgTajwid && avgKelancaran && avgMakhraj && avgImplementasi) {
          totalNilai = Math.round((avgTajwid + avgKelancaran + avgMakhraj + avgImplementasi) / 4);
        }
      }
      
      // Determine status
      const statusHafalan = jumlahSetoran > 0 ? 'LANJUT' : 'BELUM SETORAN';
      
      // Get hafalan terakhir (latest from the list - sorted by date descending)
      const hafalanTerakhir = siswaHafalan.length > 0 ? siswaHafalan[0] : null;
      const hafalanTerakhirText = hafalanTerakhir ? `Surah ${hafalanTerakhir.surah}` : '-';
      
      // Fallback null values to '-'
      const formatValue = (val) => val === null || val === undefined ? '-' : val;

      return {
        nama: siswa.user.name,
        nisn: siswa.nisn,
        hadir,
        izin,
        sakit,
        alpa,
        jumlahSetoran,
        hafalanTerakhir: hafalanTerakhirText,
        tajwid: formatValue(avgTajwid),
        kelancaran: formatValue(avgKelancaran),
        makhraj: formatValue(avgMakhraj),
        implementasi: formatValue(avgImplementasi),
        totalNilai: formatValue(totalNilai),
        statusHafalan
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
