import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateLaporanPDF } from '@/lib/utils/generateLaporanPDF';
import { format, parseISO } from 'date-fns';

/**
 * GET /api/orangtua/laporan-hafalan/pdf
 * Generate dan return PDF laporan perkembangan hafalan
 * 
 * Query params:
 * - anakId: ID siswa (required)
 * - startDate: ISO date string (required, contoh: 2026-01-01)
 * - endDate: ISO date string (required, contoh: 2026-01-07)
 * 
 * Response: PDF file download
 */
export async function GET(request) {
  try {
    const session = await auth();

    // Security: ORANG_TUA only
    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Validasi required params
    if (!anakId || !startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: anakId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Parse dates
    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO format: YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Security: Validasi parent-child relationship
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: anakId,
        orangTuaSiswa: {
          some: {
            orangTua: { userId: session.user.id }
          }
        }
      },
      include: {
        user: { select: { name: true } },
        kelas: { select: { nama: true } }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 403 }
      );
    }

    // Fetch guru pembina (first guru who created penilaian for this siswa in this period)
    const firstPenilaian = await prisma.penilaian.findFirst({
      where: {
        siswaId: anakId,
        createdAt: {
          gte: startDate,
          lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000) // Include end day
        }
      },
      include: {
        guru: { include: { user: { select: { name: true, ttdUrl: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const guru = firstPenilaian?.guru
      ? {
          id: firstPenilaian.guru.id,
          nama: firstPenilaian.guru.user.name,
          signatureUrl: firstPenilaian.guru.signatureUrl || firstPenilaian.guru.user?.ttdUrl || null
        }
      : {
          id: null,
          nama: 'Guru Pembina',
          signatureUrl: null
        };

    // Fetch penilaian data for period
    const penilaianList = await prisma.penilaian.findMany({
      where: {
        siswaId: anakId,
        createdAt: {
          gte: startDate,
          lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        hafalan: { select: { surah: true, ayatMulai: true, ayatSelesai: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format penilaian data
    const formattedPenilaian = penilaianList.map((p) => ({
      tanggal: p.createdAt,
      surah: p.hafalan?.surah || '-',
      ayat: `${p.hafalan?.ayatMulai || '?'}-${p.hafalan?.ayatSelesai || '?'}`,
      tajwid: p.tajwid || '-',
      kelancaran: p.kelancaran || '-',
      makhraj: p.makhraj || '-',
      implementasi: p.adab || '-',
      nilaiAkhir: p.nilaiAkhir || 0,
      catatan: p.catatan || '',
      status: p.nilaiAkhir
        ? p.nilaiAkhir >= 75
          ? 'Lulus'
          : p.nilaiAkhir >= 60
          ? 'Lanjut'
          : 'Belum Setoran'
        : 'Belum Setoran'
    }));

    // Calculate statistics
    const totalPenilaian = formattedPenilaian.length;
    let rataRataNilai = 0;
    let hafalanTerakhir = '-';
    let konsistensi = 0;

    if (totalPenilaian > 0) {
      const totalNilai = formattedPenilaian.reduce((sum, p) => {
        const nilai = typeof p.nilaiAkhir === 'number' ? p.nilaiAkhir : 0;
        return sum + nilai;
      }, 0);
      rataRataNilai = totalNilai / totalPenilaian;

      // Last hafalan
      const lastPenilaian = formattedPenilaian[formattedPenilaian.length - 1];
      hafalanTerakhir = `${lastPenilaian.surah} ${lastPenilaian.ayat}`;

      // Consistency: count unique dates with penilaian
      const uniqueDates = new Set(formattedPenilaian.map((p) => format(new Date(p.tanggal), 'yyyy-MM-dd')));
      konsistensi = uniqueDates.size;
    }

    // Determine period type
    const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const periodType = dayDiff <= 7 ? 'Mingguan' : dayDiff <= 30 ? 'Bulanan' : 'Semesteran';

    // Generate PDF
    const doc = await generateLaporanPDF({
      siswa: {
        id: siswa.id,
        nama: siswa.user.name,
        kelas: siswa.kelas?.nama || 'Tidak Ada'
      },
      guru,
      penilaianList: formattedPenilaian,
      statistics: {
        totalPenilaian,
        rataRataNilai,
        hafalanTerakhir,
        konsistensi
      },
      startDate,
      endDate,
      periodType
    });

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return as downloadable file
    const fileName = `Laporan_Hafalan_${siswa.user.name}_${format(startDate, 'ddMMyyyy')}_${format(endDate, 'ddMMyyyy')}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}
