import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calculateMonthRange } from '@/lib/utils/dateRangeHelpers';
import { surahNameToNumber, parseSurahRange } from '@/lib/quranUtils';
import { calculateJuzProgress } from '@/lib/utils/quranProgress';

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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'bulanan';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString()); // 0-11

    // Calculate date range based on period
    let startDate, endDate;

    if (period === 'bulanan') {
      const range = calculateMonthRange(month, year);
      startDate = range.startDate;
      endDate = range.endDate;
    } else {
      // tahunan
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // 1. Fetch ALL records up to endDate for cumulative progress calculation
    const allRecordsUpToDate = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id,
        tanggal: { lte: endDate }
      },
      select: {
        tanggal: true,
        surahNumber: true,
        surah: true,
        ayatMulai: true,
        ayatSelesai: true,
        surahTambahan: true,
        juz: true,
        penilaian: true,
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    // 2. Filter records that fall within the specific period for stats and list
    const hafalan = allRecordsUpToDate.filter(h => {
      const d = new Date(h.tanggal);
      return d >= startDate && d <= endDate;
    });

    // Calculate statistics for the PERIOD
    const totalSetoran = hafalan.length;
    const uniqueDays = new Set();
    let totalNilai = 0;
    let totalTajwid = 0;
    let totalKelancaran = 0;
    let totalMakhraj = 0;
    let totalImplementasi = 0;
    let penilaianCount = 0;

    hafalan.forEach((h) => {
      // Track unique days using local date string to avoid timezone shift
      const dateStr = new Date(h.tanggal).toLocaleDateString('en-CA'); // YYYY-MM-DD
      uniqueDays.add(dateStr);

      // Calculate penilaian averages
      if (h.penilaian && h.penilaian.length > 0) {
        h.penilaian.forEach((p) => {
          if (p.nilaiAkhir != null) totalNilai += p.nilaiAkhir;
          if (p.tajwid != null) totalTajwid += p.tajwid;
          if (p.kelancaran != null) totalKelancaran += p.kelancaran;
          if (p.makhraj != null) totalMakhraj += p.makhraj;
          if (p.adab != null) totalImplementasi += p.adab;
          penilaianCount++;
        });
      }
    });

    // 3. Calculate Cumulative Progress for the Chart (matching dashboard)
    const [schoolYear, ...results] = await Promise.all([
      prisma.tahunAjaran.findFirst({
        where: { isActive: true },
        select: { targetHafalan: true }
      })
    ]);

    const targetJuzSekolah = schoolYear?.targetHafalan || 2; // Default 2 if not found

    const entriesForProgress = [];
    const addEntry = (item) => {
      let sNum = item.surahNumber;
      if (!sNum && item.surah) {
        const parsed = parseSurahRange(item.surah);
        if (parsed.length > 0) sNum = parsed[0].surahNumber;
        else sNum = surahNameToNumber[item.surah];
      }
      if (sNum && item.ayatMulai && item.ayatSelesai) {
        entriesForProgress.push({
          surahNumber: sNum,
          ayatMulai: item.ayatMulai,
          ayatSelesai: item.ayatSelesai
        });
      }
    };

    allRecordsUpToDate.forEach(h => {
      addEntry(h);
      let tambahan = [];
      try {
        tambahan = typeof h.surahTambahan === 'string' ? JSON.parse(h.surahTambahan) : (h.surahTambahan || []);
      } catch (e) {}
      if (Array.isArray(tambahan)) {
        tambahan.forEach(item => addEntry(item));
      }
    });

    const progressResult = calculateJuzProgress(entriesForProgress);
    const juzProgress = progressResult.juzProgress;

    // Calculate averages for the PERIOD
    const rataRataNilai = penilaianCount > 0 ? Math.round((totalNilai / penilaianCount) * 100) / 100 : 0;
    const rataRataTajwid = penilaianCount > 0 ? Math.round((totalTajwid / penilaianCount) * 100) / 100 : 0;
    const rataRataKelancaran = penilaianCount > 0 ? Math.round((totalKelancaran / penilaianCount) * 100) / 100 : 0;
    const rataRataMakhraj = penilaianCount > 0 ? Math.round((totalMakhraj / penilaianCount) * 100) / 100 : 0;
    const rataRataImplementasi = penilaianCount > 0 ? Math.round((totalImplementasi / penilaianCount) * 100) / 100 : 0;

    const konsistensi = uniqueDays.size;

    // Build juz distribution data (Pie Chart with Progress Percentages)
    const colorPalette = [
      '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#EC4899', '#14B8A6', '#6366F1', '#F97316',
      '#84CC16', '#0EA5E9', '#D946EF', '#F43F5E', '#14B8A6',
      '#A78BFA', '#FCA5A5', '#86EFAC', '#93C5FD', '#E9D5FF',
      '#FED7AA', '#FECACA', '#A7F3D0', '#BFDBFE', '#DDD6FE',
      '#FDE68A', '#FECDD3', '#C7D2FE', '#F5D4AC', '#ECC5C0'
    ];

    const juzDistribution = juzProgress
      .filter(item => item.progress > 0)
      .map((item) => {
        return {
          label: `Juz ${item.juz}`,
          value: item.progress,
          color: colorPalette[item.juz % colorPalette.length] || '#10B981'
        };
      });

    console.log(`[SISWA LAPORAN] Period: ${period}, Year: ${year}, Month: ${month}, Total setoran: ${totalSetoran}, Juz distribution:`, juzDistribution);

    // Build aspect scores data
    const aspectScores = [
      { label: 'Tajwid', value: rataRataTajwid, color: 'bg-emerald-500' },
      { label: 'Kelancaran', value: rataRataKelancaran, color: 'bg-amber-500' },
      { label: 'Makhraj', value: rataRataMakhraj, color: 'bg-purple-500' },
      { label: 'Implementasi', value: rataRataImplementasi, color: 'bg-sky-500' }
    ];

    const stats = {
      bulanan: {
        totalSetoran,
        rataRataNilai,
        targetTercapai: 0, // Can be calculated if target exists
        konsistensi
      },
      tahunan: {
        totalSetoran,
        rataRataNilai,
        targetTercapai: 0,
        konsistensi
      }
    };

    return NextResponse.json({
      stats,
      juzDistribution,
      aspectScores,
      totalJuzSelesai: progressResult.totalJuz,
      targetJuzSekolah
    });
  } catch (error) {
    console.error('Error fetching siswa laporan hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan hafalan', details: error.message },
      { status: 500 }
    );
  }
}
