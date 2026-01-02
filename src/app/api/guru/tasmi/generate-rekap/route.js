import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Generate rekap PDF dengan jsPDF (SAME FORMAT SEPERTI LAPORAN KEHADIRAN)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const kelasId = searchParams.get('kelasId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, message: 'Tanggal wajib diisi' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return NextResponse.json(
        { ok: false, message: 'Rentang tanggal tidak valid' },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause = {
      statusPendaftaran: 'SELESAI',
      nilaiAkhir: { not: null },
      tanggalTasmi: {
        gte: start,
        lte: end,
      },
    };

    if (kelasId) {
      whereClause.siswa = { kelas: { id: kelasId } };
    }

    // Fetch tasmi data
    const tasmiList = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        guruPenguji: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { tanggalTasmi: 'desc' },
    });

    if (tasmiList.length === 0) {
      return NextResponse.json(
        { ok: true, empty: true, message: 'Tidak ada data selesai' },
        { status: 200 }
      );
    }

    // Return data untuk frontend PDF generation
    const periodeText = `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
    const kelasName = kelasId && tasmiList[0]?.siswa?.kelas?.nama ? tasmiList[0].siswa.kelas.nama : 'Semua Kelas';
    const guruName = session.user.name || 'Guru Tahfidz';

    const tableData = tasmiList.map((tasmi, idx) => ({
      no: idx + 1,
      nama: tasmi.siswa.user.name,
      kelas: tasmi.siswa.kelas?.nama || '-',
      totalJuz: tasmi.jumlahHafalan?.toString() || '-',
      juzDiuji: tasmi.juzYangDitasmi?.substring(0, 15) || '-',
      tanggal: tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID') : '-',
      makhraj: tasmi.nilaiKelancaran ? tasmi.nilaiKelancaran.toFixed(0) : '-',
      tajwid: tasmi.nilaiTajwid ? tasmi.nilaiTajwid.toFixed(0) : '-',
      keindahan: tasmi.nilaiAdab ? tasmi.nilaiAdab.toFixed(0) : '-',
      kefasihan: tasmi.nilaiIrama ? tasmi.nilaiIrama.toFixed(0) : '-',
      nilaiAkhir: tasmi.nilaiAkhir ? tasmi.nilaiAkhir.toFixed(2) : '-',
    }));

    const totalNilai = tasmiList.reduce((sum, t) => sum + (t.nilaiAkhir || 0), 0);
    const rataRata = (totalNilai / tasmiList.length).toFixed(2);

    return NextResponse.json({
      ok: true,
      data: {
        periodeText,
        kelasName,
        guruName,
        printDate: new Date().toLocaleDateString('id-ID'),
        totalPeserta: tasmiList.length,
        rataRata,
        tableData,
      },
    });
  } catch (error) {
    console.error('ERROR GENERATE REKAP TASMI:', error);
    return NextResponse.json(
      { ok: false, message: 'Gagal generate data rekap', error: error.message },
      { status: 500 }
    );
  }
}
