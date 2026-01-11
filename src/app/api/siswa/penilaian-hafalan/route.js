import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calcStatisticAverage } from '@/lib/helpers/calcAverageScore';
import { getSurahSetoranText } from '@/lib/helpers/formatSurahSetoran';

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
              ayatSelesai: true,
              surahTambahan: true
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

    // --- GROUPING LOGIC START ---
    // Group assessments by date and guru to represent a single "meeting"
    const groupedMap = new Map();

    penilaianList.forEach((p) => {
      const assessmentDate = p.hafalan?.tanggal || p.createdAt;
      const dateKey = assessmentDate instanceof Date ? assessmentDate.toISOString().split('T')[0] : new Date(assessmentDate).toISOString().split('T')[0];
      const guruId = p.guruId || 'unknown';
      const groupKey = `${dateKey}_${guruId}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          id: p.id,
          tanggal: assessmentDate,
          dateKey: dateKey,
          guru: p.guru?.user?.name || 'Unknown',
          guruId: guruId,
          hafalanItems: [], // Store all related hafalan records for surah formatting
          scores: {
            tajwid: [],
            kelancaran: [],
            makhraj: [],
            adab: [],
            nilaiAkhir: []
          },
          catatanList: []
        });
      }

      const group = groupedMap.get(groupKey);
      
      // Collect hafalan info for surah list
      if (p.hafalan) {
        group.hafalanItems.push(p.hafalan);
      }

      // Collect scores
      group.scores.tajwid.push(p.tajwid || 0);
      group.scores.kelancaran.push(p.kelancaran || 0);
      group.scores.makhraj.push(p.makhraj || 0);
      group.scores.adab.push(p.adab || 0);
      group.scores.nilaiAkhir.push(p.nilaiAkhir || 0);

      if (p.catatan && p.catatan.trim()) {
        group.catatanList.push(p.catatan);
      }
    });

    // Process grouped data into final penilaianData
    const penilaianData = Array.from(groupedMap.values()).map((group) => {
      const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      const avgNilaiAkhir = avg(group.scores.nilaiAkhir);
      let status = 'belum';
      if (avgNilaiAkhir >= 75) status = 'lulus';
      else if (avgNilaiAkhir >= 60) status = 'revisi';

      const attendanceStatus = attendanceMap.get(group.dateKey) || null;

      // Format all surahs from all hafalan items in this meeting
      const surahTexts = group.hafalanItems.map(h => getSurahSetoranText(h)).filter(Boolean);
      const combinedSurah = [...new Set(surahTexts)].join(', ');

      // For "ayat", we'll just show the range from the first item if there's only one, 
      // or "Beragam" or a combined range. But "Surah yang disetorkan" already has ayat in it from getSurahSetoranText.
      // So we can simplify the "ayat" field for the UI or leave it.
      // In getSurahSetoranText, it returns "Surah (Ayat-Ayat)".
      
      return {
        id: group.id,
        surah: combinedSurah || '-',
        ayat: '', // Already included in surah text now
        tanggal: group.tanggal,
        guru: group.guru,
        nilaiAspek: {
          tajwid: parseFloat(avg(group.scores.tajwid).toFixed(2)),
          kelancaran: parseFloat(avg(group.scores.kelancaran).toFixed(2)),
          makhraj: parseFloat(avg(group.scores.makhraj).toFixed(2)),
          implementasi: parseFloat(avg(group.scores.adab).toFixed(2))
        },
        nilaiTotal: parseFloat(avgNilaiAkhir.toFixed(2)),
        catatan: [...new Set(group.catatanList)].join('; ') || '',
        status: status,
        attendanceStatus: attendanceStatus
      };
    });

    // Update statistics based on grouped data for consistency
    const totalPenilaian = penilaianData.length;
    let rataRataNilai = 0;
    let rataRataTajwid = 0;
    let rataRataKelancaran = 0;
    let rataRataMakhraj = 0;
    let rataRataImplementasi = 0;
    let lastAssessment = null;

    if (totalPenilaian > 0) {
      rataRataNilai = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiTotal, 0) / totalPenilaian).toFixed(2));
      rataRataTajwid = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiAspek.tajwid, 0) / totalPenilaian).toFixed(2));
      rataRataKelancaran = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiAspek.kelancaran, 0) / totalPenilaian).toFixed(2));
      rataRataMakhraj = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiAspek.makhraj, 0) / totalPenilaian).toFixed(2));
      rataRataImplementasi = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiAspek.implementasi, 0) / totalPenilaian).toFixed(2));

      const last = penilaianData[0];
      lastAssessment = {
        tanggal: last.tanggal,
        surah: last.surah,
        nilai: last.nilaiTotal
      };
    }
    // --- GROUPING LOGIC END ---

    // Build chart data - group by month from hafalan.tanggal
    const chartDataMap = new Map();

    penilaianData.forEach((p) => {
      if (p.tanggal) {
        const date = new Date(p.tanggal);
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
        item.total += p.nilaiTotal || 0;
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
