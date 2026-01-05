import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calcStatisticAverage, normalizeNilaiAkhir } from '@/lib/helpers/calcAverageScore';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    // Parse date range query parameters
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Build where clause with optional date filter
    const whereClause = {
      siswaId: siswa.id
    };

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Debug range
      console.log("[SISWA PENILAIAN] Filter Range:", { startDate, endDate, startDateStr, endDateStr });

      whereClause.hafalan = {
        tanggal: {
          gte: startDate,
          lt: endDate
        }
      };
    }

    // Fetch all penilaian and presensi in parallel
    const [penilaianList, presensiList, presensiStats] = await Promise.all([
      prisma.penilaian.findMany({
        where: whereClause,
        include: {
          hafalan: {
            select: {
              tanggal: true,
              surah: true,
              ayatMulai: true,
              ayatSelesai: true
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
          }
        },
        orderBy: {
          hafalan: {
            tanggal: 'desc'
          }
        }
      }),
      prisma.presensi.findMany({
        where: {
          siswaId: siswa.id,
          tanggal: whereClause.hafalan?.tanggal || undefined
        },
        select: {
          tanggal: true,
          status: true
        }
      }),
      prisma.presensi.groupBy({
        by: ['status'],
        where: {
          siswaId: siswa.id,
          tanggal: whereClause.hafalan?.tanggal || undefined
        },
        _count: {
          id: true
        }
      })
    ]);

    // Map attendance status by date (YYYY-MM-DD)
    const attendanceMap = new Map();
    presensiList.forEach(p => {
      const dateKey = p.tanggal.toISOString().split('T')[0];
      attendanceMap.set(dateKey, p.status);
    });

    const counts = {
      HADIR: 0,
      IZIN: 0,
      SAKIT: 0,
      ALFA: 0
    };

    presensiStats.forEach(stat => {
      counts[stat.status] = stat._count.id;
    });

    // Calculate statistics
    const totalPenilaian = penilaianList.length;

    let rataRataNilai = 0;
    let rataRataTajwid = 0;
    let rataRataKelancaran = 0;
    let rataRataMakhraj = 0;
    let rataRataImplementasi = 0;
    let lastAssessment = null;

    if (totalPenilaian > 0) {
      // ✅ Use shared utility for consistent calculation with 2 decimal rounding
      rataRataNilai = calcStatisticAverage(penilaianList, 'nilaiAkhir', 2);
      rataRataTajwid = calcStatisticAverage(penilaianList, 'tajwid', 2);
      rataRataKelancaran = calcStatisticAverage(penilaianList, 'kelancaran', 2);
      rataRataMakhraj = calcStatisticAverage(penilaianList, 'makhraj', 2);
      rataRataImplementasi = calcStatisticAverage(penilaianList, 'adab', 2);

      // Last assessment is the first one because of DESC order
      const last = penilaianList[0];
      lastAssessment = {
        tanggal: last.hafalan?.tanggal || last.createdAt,
        surah: last.hafalan?.surah || '-',
        nilai: last.nilaiAkhir || 0
      };
    }

    // Format penilaian data
    const penilaianData = penilaianList.map((p) => {
      const nilaiAkhir = p.nilaiAkhir || 0;
      let status = 'belum';
      if (nilaiAkhir >= 75) status = 'lulus';
      else if (nilaiAkhir >= 60) status = 'revisi';

      const assessmentDate = p.hafalan?.tanggal || p.createdAt;
      const dateKey = assessmentDate instanceof Date ? assessmentDate.toISOString().split('T')[0] : new Date(assessmentDate).toISOString().split('T')[0];
      const attendanceStatus = attendanceMap.get(dateKey) || null;

      return {
        id: p.id,
        surah: p.hafalan?.surah || '-',
        ayat: p.hafalan ? `${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}` : '-',
        tanggal: assessmentDate,
        guru: p.guru?.user?.name || 'Unknown',
        nilaiAspek: {
          tajwid: p.tajwid || 0,
          kelancaran: p.kelancaran || 0,
          makhraj: p.makhraj || 0,
          implementasi: p.adab || 0
        },
        nilaiTotal: parseFloat(nilaiAkhir.toFixed(2)),  // ✅ Normalize to 2 decimals
        catatan: p.catatan || '',
        status: status, // Use lowercase keys matching UI (lulus, revisi, belum)
        attendanceStatus: attendanceStatus
      };
    });

    // Build chart data - group by month from hafalan.tanggal
    const chartDataMap = new Map();

    penilaianList.forEach((p) => {
      if (p.hafalan?.tanggal) {
        const date = new Date(p.hafalan.tanggal);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('id-ID', { month: 'short' });

        if (!chartDataMap.has(monthKey)) {
          chartDataMap.set(monthKey, {
            key: monthKey,
            label: monthLabel,
            total: 0,
            count: 0
          });
        }

        const item = chartDataMap.get(monthKey);
        item.total += p.nilaiAkhir || 0;
        item.count += 1;
      }
    });

    // Convert to array and calculate averages
    const chartData = Array.from(chartDataMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => ({
        label: item.label,
        value: parseFloat((item.total / item.count).toFixed(2))  // ✅ Normalize to 2 decimals
      }));

    console.log(`[SISWA PENILAIAN GET] Fetched ${totalPenilaian} penilaian with avg nilai: ${rataRataNilai}`);

    return NextResponse.json({
      statistics: {
        rataRataNilai,
        rataRataTajwid,
        rataRataKelancaran,
        rataRataMakhraj,
        rataRataImplementasi,
        totalPenilaian,
        lastAssessment,
        hadir: counts.HADIR,
        izin: counts.IZIN,
        sakit: counts.SAKIT,
        alfa: counts.ALFA
      },
      penilaianData,
      chartData
    });

  } catch (error) {
    console.error('Error fetching penilaian hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch penilaian hafalan', details: error.message },
      { status: 500 }
    );
  }
}
