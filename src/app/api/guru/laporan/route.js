import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/guru/laporan - Get laporan data with various view modes
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode') || 'harian'; // harian, bulanan, semesteran
    const kelasId = searchParams.get('kelasId');
    const periode = searchParams.get('periode') || 'bulan-ini';
    const tanggal = searchParams.get('tanggal'); // Specific date for harian mode

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // Calculate date range based on periode
    const dateRange = calculateDateRange(periode);

    // Base query for students
    let whereClause = {};
    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    // Get students
    const students = await prisma.siswa.findMany({
      where: whereClause,
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
    });

    if (viewMode === 'harian') {
      // Harian/Mingguan View - Get data for specific date or first meeting
      const laporanData = await Promise.all(
        students.map(async (siswa) => {
          let penilaianWhere = {
            siswaId: siswa.id,
            guruId: guru.id,
          };

          let presensiWhere = {
            siswaId: siswa.id,
            guruId: guru.id,
          };

          // If specific date is provided, query for that date
          if (tanggal) {
            const selectedDate = new Date(tanggal);
            const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

            penilaianWhere.createdAt = {
              gte: startOfDay,
              lte: endOfDay,
            };

            presensiWhere.tanggal = {
              gte: startOfDay,
              lte: endOfDay,
            };
          } else {
            // Default to first meeting in period
            penilaianWhere.createdAt = {
              gte: dateRange.start,
              lte: dateRange.end,
            };

            presensiWhere.tanggal = {
              gte: dateRange.start,
              lte: dateRange.end,
            };
          }

          // Get penilaian data
          const firstPenilaian = await prisma.penilaian.findFirst({
            where: penilaianWhere,
            include: {
              hafalan: {
                select: {
                  tanggal: true,
                  surah: true,
                  ayatMulai: true,
                  ayatSelesai: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          });

          // Get presensi data
          const firstPresensi = await prisma.presensi.findFirst({
            where: presensiWhere,
            orderBy: {
              tanggal: 'asc',
            },
          });

          let pertemuan = null;

          if (firstPenilaian) {
            pertemuan = {
              tanggal: firstPenilaian.hafalan.tanggal.toISOString().split('T')[0],
              statusKehadiran: 'HADIR',
              nilaiTajwid: firstPenilaian.tajwid,
              nilaiKelancaran: firstPenilaian.kelancaran,
              nilaiMakhraj: firstPenilaian.makhraj,
              nilaiImplementasi: firstPenilaian.adab,
              statusHafalan: 'LANJUT',
              catatan: firstPenilaian.catatan || '',
            };
          } else if (firstPresensi) {
            pertemuan = {
              tanggal: firstPresensi.tanggal.toISOString().split('T')[0],
              statusKehadiran: firstPresensi.status,
              nilaiTajwid: null,
              nilaiKelancaran: null,
              nilaiMakhraj: null,
              nilaiImplementasi: null,
              statusHafalan: '-',
              catatan: firstPresensi.keterangan || '',
            };
          }

          return {
            siswaId: siswa.id,
            namaLengkap: siswa.user.name,
            kelas: siswa.kelas?.nama,
            pertemuan,
          };
        })
      );

      return NextResponse.json({
        success: true,
        viewMode: 'harian',
        data: laporanData,
      });
    } else if (viewMode === 'bulanan') {
      // Bulanan View - Aggregate monthly data
      const laporanData = await Promise.all(
        students.map(async (siswa) => {
          // Get penilaian data
          const penilaianData = await prisma.penilaian.findMany({
            where: {
              siswaId: siswa.id,
              guruId: guru.id,
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          });

          // Get presensi data
          const presensiData = await prisma.presensi.findMany({
            where: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          });

          // Calculate aggregates
          const totalHadir = presensiData.filter(p => p.status === 'HADIR').length;
          const totalTidakHadir = presensiData.filter(p => p.status !== 'HADIR').length;

          const validPenilaian = penilaianData.filter(p =>
            p.tajwid != null && p.kelancaran != null && p.makhraj != null && p.adab != null
          );

          const rataRataTajwid = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.tajwid, 0) / validPenilaian.length
            : 0;

          const rataRataKelancaran = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.kelancaran, 0) / validPenilaian.length
            : 0;

          const rataRataMakhraj = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.makhraj, 0) / validPenilaian.length
            : 0;

          const rataRataImplementasi = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.adab, 0) / validPenilaian.length
            : 0;

          return {
            siswaId: siswa.id,
            namaLengkap: siswa.user.name,
            kelas: siswa.kelas?.nama,
            totalHadir,
            totalTidakHadir,
            rataRataTajwid: parseFloat(rataRataTajwid.toFixed(1)),
            rataRataKelancaran: parseFloat(rataRataKelancaran.toFixed(1)),
            rataRataMakhraj: parseFloat(rataRataMakhraj.toFixed(1)),
            rataRataImplementasi: parseFloat(rataRataImplementasi.toFixed(1)),
            statusHafalan: validPenilaian.length > 0 ? 'LANJUT' : '-',
            catatanAkhir: `Mengikuti ${validPenilaian.length} sesi penilaian dalam periode ini`,
          };
        })
      );

      return NextResponse.json({
        success: true,
        viewMode: 'bulanan',
        data: laporanData,
      });
    } else if (viewMode === 'semesteran') {
      // Semesteran View - Aggregate semester data (6 months)
      const laporanData = await Promise.all(
        students.map(async (siswa) => {
          // Get penilaian data
          const penilaianData = await prisma.penilaian.findMany({
            where: {
              siswaId: siswa.id,
              guruId: guru.id,
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          });

          // Get presensi data
          const presensiData = await prisma.presensi.findMany({
            where: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          });

          // Calculate aggregates
          const totalHadir = presensiData.filter(p => p.status === 'HADIR').length;
          const totalTidakHadir = presensiData.filter(p => p.status !== 'HADIR').length;

          const validPenilaian = penilaianData.filter(p =>
            p.tajwid != null && p.kelancaran != null && p.makhraj != null && p.adab != null
          );

          const rataRataTajwid = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.tajwid, 0) / validPenilaian.length
            : 0;

          const rataRataKelancaran = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.kelancaran, 0) / validPenilaian.length
            : 0;

          const rataRataMakhraj = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.makhraj, 0) / validPenilaian.length
            : 0;

          const rataRataImplementasi = validPenilaian.length > 0
            ? validPenilaian.reduce((sum, p) => sum + p.adab, 0) / validPenilaian.length
            : 0;

          const performanceLevel = getPerformanceLevel(
            (rataRataTajwid + rataRataKelancaran + rataRataMakhraj + rataRataImplementasi) / 4
          );

          return {
            siswaId: siswa.id,
            namaLengkap: siswa.user.name,
            kelas: siswa.kelas?.nama,
            totalHadir,
            totalTidakHadir,
            rataRataTajwid: parseFloat(rataRataTajwid.toFixed(1)),
            rataRataKelancaran: parseFloat(rataRataKelancaran.toFixed(1)),
            rataRataMakhraj: parseFloat(rataRataMakhraj.toFixed(1)),
            rataRataImplementasi: parseFloat(rataRataImplementasi.toFixed(1)),
            statusHafalan: validPenilaian.length > 0 ? 'LANJUT' : '-',
            catatanAkhir: `${performanceLevel} - Mengikuti ${validPenilaian.length} sesi selama semester`,
          };
        })
      );

      return NextResponse.json({
        success: true,
        viewMode: 'semesteran',
        data: laporanData,
      });
    }

    return NextResponse.json(
      { error: 'Invalid view mode' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate date range
function calculateDateRange(periode) {
  const now = new Date();
  let start, end;

  switch (periode) {
    case 'bulan-ini':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'bulan-lalu':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'semester-ini':
      // Assuming semester is 6 months
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  return { start, end };
}

// Helper function to determine performance level
function getPerformanceLevel(avgScore) {
  if (avgScore >= 90) return 'Outstanding performance';
  if (avgScore >= 85) return 'Excellent performance';
  if (avgScore >= 80) return 'Very good performance';
  if (avgScore >= 75) return 'Good performance';
  if (avgScore >= 70) return 'Satisfactory performance';
  return 'Needs improvement';
}
