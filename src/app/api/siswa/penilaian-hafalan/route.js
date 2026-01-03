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

    // Fetch all penilaian for this siswa
    const penilaianList = await prisma.penilaian.findMany({
      where: {
        siswaId: siswa.id
      },
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
        tanggal: 'desc'  // ✅ Order by hafalan tanggal, not createdAt
      }
    });

    // Calculate statistics
    const totalPenilaian = penilaianList.length;

    let rataRataNilai = 0;
    let rataRataTajwid = 0;
    let rataRataKelancaran = 0;
    let rataRataMakhraj = 0;
    let rataRataImplementasi = 0;

    if (totalPenilaian > 0) {
      // ✅ Use shared utility for consistent calculation with 2 decimal rounding
      rataRataNilai = calcStatisticAverage(penilaianList, 'nilaiAkhir', 2);
      rataRataTajwid = calcStatisticAverage(penilaianList, 'tajwid', 2);
      rataRataKelancaran = calcStatisticAverage(penilaianList, 'kelancaran', 2);
      rataRataMakhraj = calcStatisticAverage(penilaianList, 'makhraj', 2);
      rataRataImplementasi = calcStatisticAverage(penilaianList, 'adab', 2);
    }

    // Format penilaian data
    const penilaianData = penilaianList.map((p) => ({
      id: p.id,
      surah: p.hafalan?.surah || '-',
      ayat: p.hafalan ? `${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}` : '-',
      tanggal: p.hafalan?.tanggal || p.createdAt,
      guru: p.guru?.user?.name || 'Unknown',
      nilaiAspek: {
        tajwid: p.tajwid || 0,
        kelancaran: p.kelancaran || 0,
        makhraj: p.makhraj || 0,
        implementasi: p.adab || 0
      },
      nilaiTotal: parseFloat((p.nilaiAkhir || 0).toFixed(2)),  // ✅ Normalize to 2 decimals
      catatan: p.catatan || ''
    }));

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
        totalPenilaian
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
