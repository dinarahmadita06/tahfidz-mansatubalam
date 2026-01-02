import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// POST - Generate rekap PDF untuk semua tasmi yang sudah dinilai
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat generate rekap PDF' },
        { status: 401 }
      );
    }

    // Get query params untuk filter
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const kelasId = searchParams.get('kelasId');
    const status = searchParams.get('status');
    const juz = searchParams.get('juz');

    // Build where clause untuk filter
    const whereClause = {};

    // Filter by date range jika ada
    if (startDate || endDate) {
      whereClause.tanggalTasmi = {};
      if (startDate) {
        whereClause.tanggalTasmi.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.tanggalTasmi.lte = new Date(endDate);
      }
    }

    // Filter by kelas
    if (kelasId) {
      whereClause.siswa = {
        kelas: {
          id: kelasId,
        },
      };
    }

    // Filter by status
    if (status) {
      whereClause.statusPendaftaran = status;
    }

    // Filter by juz
    if (juz) {
      whereClause.juzYangDitasmi = {
        contains: juz,
      };
    }

    // CRITICAL: Hanya ambil yang sudah dinilai (nilaiAkhir exists)
    whereClause.nilaiAkhir = {
      not: null,
    };

    // Fetch filtered tasmi data
    const tasmiList = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true },
            },
            kelas: {
              select: { nama: true },
            },
          },
        },
        guruPenguji: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        tanggalTasmi: 'desc',
      },
    });

    // Jika tidak ada data yang memenuhi kriteria
    if (tasmiList.length === 0) {
      return NextResponse.json(
        { message: 'Belum ada hasil ujian yang bisa direkap. Silakan pastikan ada data tasmi yang sudah dinilai.' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margin = 40;
    const contentWidth = width - 2 * margin;

    let yPosition = height - margin;

    // Helper functions
    const addText = (text, x, y, options = {}) => {
      const fontSize = options.fontSize || 12;
      const font = options.font || helveticaFont;
      const color = options.color || rgb(0, 0, 0);

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color,
        ...options,
      });

      return y - (fontSize + 4);
    };

    const addLine = (x1, y1, x2, y2, thickness = 1, color = rgb(0, 0, 0)) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      });
    };

    const checkPageBreak = (spaceNeeded) => {
      if (yPosition - spaceNeeded < margin + 80) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - margin;
      }
    };

    // HEADER
    yPosition = addText('REKAP HASIL UJIAN TASMI\' AL-QUR\'AN', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 16,
      color: rgb(0, 0.4, 0.2),
    });

    yPosition = addText('Periode: ' + new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }), margin, yPosition, {
      fontSize: 11,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 5;
    addLine(margin, yPosition, width - margin, yPosition, 2, rgb(0, 0.4, 0.2));
    yPosition -= 15;

    // INFO GURU & FILTER
    yPosition = addText(`Guru Penguji: ${session.user.name}`, margin + 10, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    yPosition = addText(`Total Peserta: ${tasmiList.length}`, margin + 10, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });

    const rataRataNilai = tasmiList.reduce((sum, t) => sum + (t.nilaiAkhir || 0), 0) / tasmiList.length;
    yPosition = addText(`Rata-rata Nilai: ${rataRataNilai.toFixed(2)}`, margin + 10, yPosition, { fontSize: 10, color: rgb(0, 0.4, 0.2), font: helveticaBoldFont });

    yPosition -= 15;

    // TABLE HEADER
    checkPageBreak(20);

    const col1 = margin + 5; // No
    const col2 = margin + 35; // Nama
    const col3 = margin + 180; // Kelas
    const col4 = margin + 260; // Total Juz
    const col5 = margin + 320; // Juz Diuji
    const col6 = margin + 400; // Nilai Akhir
    const col7 = margin + 460; // Tanggal Ujian

    // Table header background
    page.drawRectangle({
      x: margin,
      y: yPosition - 15,
      width: contentWidth,
      height: 15,
      color: rgb(0, 0.4, 0.2),
    });

    // Table header text
    addText('No', col1, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Nama Siswa', col2, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Kelas', col3, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Total', col4, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Juz Diuji', col5, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Nilai', col6, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });
    addText('Tanggal Ujian', col7, yPosition, { font: helveticaBoldFont, fontSize: 9, color: rgb(1, 1, 1) });

    yPosition -= 18;

    // TABLE ROWS
    tasmiList.forEach((tasmi, index) => {
      checkPageBreak(12);

      const namaShort = tasmi.siswa.user.name.substring(0, 20);
      const juzShort = tasmi.juzYangDitasmi.substring(0, 15);
      const tanggalStr = tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' }) : '-';

      addText((index + 1).toString(), col1, yPosition, { fontSize: 8 });
      addText(namaShort, col2, yPosition, { fontSize: 8 });
      addText(tasmi.siswa.kelas.nama.substring(0, 12), col3, yPosition, { fontSize: 8 });
      addText(tasmi.jumlahHafalan.toString(), col4, yPosition, { fontSize: 8 });
      addText(juzShort, col5, yPosition, { fontSize: 8 });
      addText(tasmi.nilaiAkhir.toFixed(1), col6, yPosition, { fontSize: 8, font: helveticaBoldFont });
      addText(tanggalStr, col7, yPosition, { fontSize: 8 });

      yPosition -= 11;
    });

    yPosition -= 10;

    // FOOTER SUMMARY
    checkPageBreak(40);

    addLine(margin, yPosition, width - margin, yPosition, 1, rgb(0.8, 0.8, 0.8));
    yPosition -= 12;

    yPosition = addText(`Total Peserta: ${tasmiList.length}`, margin + 10, yPosition, { fontSize: 10 });
    yPosition = addText(`Rata-rata Nilai: ${rataRataNilai.toFixed(2)}`, margin + 10, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition = addText(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, margin + 10, yPosition, { fontSize: 9, color: rgb(0.5, 0.5, 0.5) });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rekap_Tasmi_${new Date().getTime()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating rekap PDF:', error);
    return NextResponse.json(
      { message: 'Gagal membuat rekap PDF', error: error.message },
      { status: 500 }
    );
  }
}
