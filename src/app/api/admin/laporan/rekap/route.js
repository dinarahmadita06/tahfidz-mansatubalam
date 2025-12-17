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
    const periode = searchParams.get('periode'); // 'harian', 'bulanan', 'semester'
    const tanggal = searchParams.get('tanggal'); // for harian
    const tanggalMulai = searchParams.get('tanggalMulai'); // for bulanan/semester
    const tanggalSelesai = searchParams.get('tanggalSelesai'); // for bulanan/semester

    if (!kelasId || !periode) {
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

    // Get all students in the class
    const siswaList = await prisma.siswa.findMany({
      where: {
        kelasId,
        status: 'approved'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    if (periode === 'harian') {
      // Daily report mode
      if (!tanggal) {
        return NextResponse.json({ error: 'Tanggal diperlukan untuk laporan harian' }, { status: 400 });
      }

      const targetDate = new Date(tanggal);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const reportData = await Promise.all(
        siswaList.map(async (siswa) => {
          // Get attendance for the day
          const presensi = await prisma.presensi.findFirst({
            where: {
              siswaId: siswa.id,
              tanggal: {
                gte: startOfDay,
                lte: endOfDay
              }
            }
          });

          // Get penilaian for the day (from hafalan submitted on that day)
          const hafalan = await prisma.hafalan.findFirst({
            where: {
              siswaId: siswa.id,
              tanggalSetor: {
                gte: startOfDay,
                lte: endOfDay
              }
            },
            include: {
              penilaian: true
            }
          });

          const statusKehadiran = presensi?.status || 'ALFA';
          const isHadir = statusKehadiran === 'HADIR';

          // Only show scores if student is present
          const penilaian = isHadir && hafalan?.penilaian ? hafalan.penilaian : null;

          return {
            id: siswa.id,
            nama: siswa.user.name,
            kelas: kelas.nama,
            nisn: siswa.nisn,
            kehadiran: statusKehadiran,
            tajwid: penilaian?.tajwid ?? null,
            kelancaran: penilaian?.kelancaran ?? null,
            makhraj: penilaian?.makhraj ?? null,
            implementasi: penilaian?.adab ?? null, // adab maps to implementasi
            totalNilai: penilaian ?
              Math.round((penilaian.tajwid + penilaian.kelancaran + penilaian.makhraj + penilaian.adab) / 4) :
              null
          };
        })
      );

      return NextResponse.json({
        type: 'harian',
        kelasNama: kelas.nama,
        tanggal: new Date(tanggal).toLocaleDateString('id-ID'),
        periodeText: `Harian - ${new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        siswaData: reportData
      });

    } else {
      // Monthly/Semester report mode
      if (!tanggalMulai || !tanggalSelesai) {
        return NextResponse.json({ error: 'Tanggal mulai dan selesai diperlukan' }, { status: 400 });
      }

      const startDate = new Date(tanggalMulai);
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);

      const reportData = await Promise.all(
        siswaList.map(async (siswa) => {
          // Get all attendance records in the period
          const presensiRecords = await prisma.presensi.findMany({
            where: {
              siswaId: siswa.id,
              tanggal: {
                gte: startDate,
                lte: endDate
              }
            }
          });

          // Count attendance by status
          const hadir = presensiRecords.filter(p => p.status === 'HADIR').length;
          const sakit = presensiRecords.filter(p => p.status === 'SAKIT').length;
          const izin = presensiRecords.filter(p => p.status === 'IZIN').length;
          const alpa = presensiRecords.filter(p => p.status === 'ALFA').length;

          // Get all penilaian records in the period
          const hafalanRecords = await prisma.hafalan.findMany({
            where: {
              siswaId: siswa.id,
              tanggalSetor: {
                gte: startDate,
                lte: endDate
              }
            },
            include: {
              penilaian: true
            }
          });

          // Calculate average scores
          const penilaianRecords = hafalanRecords
            .filter(h => h.penilaian)
            .map(h => h.penilaian);

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
            id: siswa.id,
            nama: siswa.user.name,
            kelas: kelas.nama,
            nisn: siswa.nisn,
            hadir,
            sakit,
            izin,
            alpa,
            tajwid: avgTajwid,
            kelancaran: avgKelancaran,
            makhraj: avgMakhraj,
            implementasi: avgImplementasi,
            totalNilai
          };
        })
      );

      const periodeText = periode === 'bulanan' ?
        `Bulanan - ${new Date(tanggalMulai).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` :
        `Semester - ${new Date(tanggalMulai).toLocaleDateString('id-ID')} s/d ${new Date(tanggalSelesai).toLocaleDateString('id-ID')}`;

      return NextResponse.json({
        type: periode,
        kelasNama: kelas.nama,
        tanggalMulai: new Date(tanggalMulai).toISOString(),
        tanggalSelesai: new Date(tanggalSelesai).toISOString(),
        periodeText,
        siswaData: reportData
      });
    }

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Gagal generate laporan', details: error.message },
      { status: 500 }
    );
  }
}
