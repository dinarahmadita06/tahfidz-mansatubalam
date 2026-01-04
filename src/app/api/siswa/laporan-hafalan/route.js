import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

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
    const month = parseInt(searchParams.get('month') || new Date().getMonth()); // 0-11

    // Calculate date range based on period
    let startDate, endDate;

    if (period === 'bulanan') {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      // tahunan
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // Fetch hafalan data
    const hafalan = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id,
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        penilaian: true,
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    // Calculate statistics
    const totalSetoran = hafalan.length;
    const uniqueDays = new Set();
    const juzMap = new Map();
    let totalNilai = 0;
    let totalTajwid = 0;
    let totalKelancaran = 0;
    let totalMakhraj = 0;
    let totalImplementasi = 0;
    let penilaianCount = 0;

    hafalan.forEach((h) => {
      // Track unique days
      const dateStr = h.tanggal.toISOString().split('T')[0];
      uniqueDays.add(dateStr);

      // Track juz distribution
      if (h.juz) {
        juzMap.set(h.juz, (juzMap.get(h.juz) || 0) + 1);
      }

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

    // Calculate averages
    const rataRataNilai = penilaianCount > 0 ? Math.round((totalNilai / penilaianCount) * 100) / 100 : 0;
    const rataRataTajwid = penilaianCount > 0 ? Math.round((totalTajwid / penilaianCount) * 100) / 100 : 0;
    const rataRataKelancaran = penilaianCount > 0 ? Math.round((totalKelancaran / penilaianCount) * 100) / 100 : 0;
    const rataRataMakhraj = penilaianCount > 0 ? Math.round((totalMakhraj / penilaianCount) * 100) / 100 : 0;
    const rataRataImplementasi = penilaianCount > 0 ? Math.round((totalImplementasi / penilaianCount) * 100) / 100 : 0;

    const konsistensi = uniqueDays.size;

    // Build juz distribution data
    const juzDistribution = Array.from(juzMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry, index) => {
        const juzNum = entry[0];
        const count = entry[1];
        const colorPalette = [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
          '#06B6D4', '#EC4899', '#14B8A6', '#6366F1', '#F97316',
          '#84CC16', '#0EA5E9', '#D946EF', '#F43F5E', '#14B8A6',
          '#A78BFA', '#FCA5A5', '#86EFAC', '#93C5FD', '#E9D5FF',
          '#FED7AA', '#FECACA', '#A7F3D0', '#BFDBFE', '#DDD6FE',
          '#FDE68A', '#FECDD3', '#C7D2FE', '#F5D4AC', '#ECC5C0'
        ];
        return {
          label: `Juz ${juzNum}`,
          value: count,
          color: colorPalette[juzNum % colorPalette.length] || '#10B981'
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
      aspectScores
    });
  } catch (error) {
    console.error('Error fetching siswa laporan hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan hafalan', details: error.message },
      { status: 500 }
    );
  }
}
