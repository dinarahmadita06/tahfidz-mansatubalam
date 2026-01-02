import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// POST - Generate PDF laporan hasil ujian tasmi per siswa
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat generate PDF' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch tasmi data dengan nilai lengkap
    const tasmi = await prisma.tasmi.findUnique({
      where: { id },
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
    });

    if (!tasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi: Hanya bisa generate PDF jika sudah ada nilai
    if (!tasmi.nilaiAkhir) {
      return NextResponse.json(
        { message: 'Nilai belum tersedia. Silakan simpan penilaian terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Generate PDF menggunakan pdf-lib
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margin = 50;
    const contentWidth = width - 2 * margin;

    let yPosition = height - margin;

    // Helper function untuk menambah text
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

    // Helper untuk line
    const addLine = (x1, y1, x2, y2, thickness = 1, color = rgb(0, 0, 0)) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      });
    };

    // HEADER
    yPosition = addText('LAPORAN HASIL UJIAN TASMI\' AL-QUR\'AN', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 16,
      color: rgb(0, 0.4, 0.2),
    });

    yPosition = addText('Ujian Bacaan dan Kefasihan Al-Qur\'an', margin, yPosition, {
      fontSize: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 10;
    addLine(margin, yPosition, width - margin, yPosition, 2, rgb(0, 0.4, 0.2));
    yPosition -= 15;

    // IDENTITAS SISWA
    yPosition = addText('DATA IDENTITAS', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 12,
      color: rgb(0, 0.3, 0.6),
    });
    yPosition -= 8;

    yPosition = addText(`Nama Siswa     : ${tasmi.siswa.user.name}`, margin + 15, yPosition, { fontSize: 11 });
    yPosition = addText(`Kelas          : ${tasmi.siswa.kelas.nama}`, margin + 15, yPosition, { fontSize: 11 });
    yPosition = addText(`Guru Penguji   : ${tasmi.guruPenguji?.user?.name || 'Belum ditentukan'}`, margin + 15, yPosition, { fontSize: 11 });
    yPosition = addText(`Tanggal Ujian  : ${tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID') : 'Belum dijadwalkan'}`, margin + 15, yPosition, { fontSize: 11 });

    yPosition -= 15;

    // DETAIL UJIAN
    yPosition = addText('DETAIL UJIAN', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 12,
      color: rgb(0, 0.3, 0.6),
    });
    yPosition -= 8;

    yPosition = addText(`Juz yang Ditasmi : ${tasmi.juzYangDitasmi}`, margin + 15, yPosition, { fontSize: 11 });
    yPosition = addText(`Total Hafalan   : ${tasmi.jumlahHafalan} Juz`, margin + 15, yPosition, { fontSize: 11 });
    yPosition = addText(`Status          : ${tasmi.statusPendaftaran === 'SELESAI' ? 'Selesai' : tasmi.statusPendaftaran}`, margin + 15, yPosition, { fontSize: 11 });

    yPosition -= 15;

    // NILAI KOMPONEN
    yPosition = addText('PENILAIAN KOMPONEN', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 12,
      color: rgb(0, 0.3, 0.6),
    });
    yPosition -= 8;

    // Tabel simple (manual)
    const tableX = margin + 15;
    const col1X = tableX;
    const col2X = tableX + 250;

    // Header tabel
    yPosition = addText('Komponen', col1X, yPosition, { font: helveticaBoldFont, fontSize: 11 });
    addText('Nilai', col2X, yPosition, { font: helveticaBoldFont, fontSize: 11 });
    yPosition -= 12;

    // Row 1: Makhraj
    yPosition = addText('Makhrajul Huruf', col1X, yPosition, { fontSize: 10 });
    addText(tasmi.nilaiKelancaran?.toString() || '-', col2X, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 12;

    // Row 2: Keindahan
    yPosition = addText('Keindahan Melantunkan', col1X, yPosition, { fontSize: 10 });
    addText(tasmi.nilaiAdab?.toString() || '-', col2X, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 12;

    // Row 3: Tajwid
    yPosition = addText('Tajwid', col1X, yPosition, { fontSize: 10 });
    addText(tasmi.nilaiTajwid?.toString() || '-', col2X, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 12;

    // Row 4: Kefasihan
    yPosition = addText('Kefasihan & Kelancaran', col1X, yPosition, { fontSize: 10 });
    addText(tasmi.nilaiIrama?.toString() || '-', col2X, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 15;

    // Garis separator
    addLine(margin + 15, yPosition, width - margin - 15, yPosition, 1, rgb(0.7, 0.7, 0.7));
    yPosition -= 12;

    // NILAI AKHIR (HIGHLIGHT)
    yPosition = addText('NILAI AKHIR', col1X, yPosition, { font: helveticaBoldFont, fontSize: 12, color: rgb(0, 0.5, 0.2) });
    addText(tasmi.nilaiAkhir?.toFixed(2).toString() || '-', col2X + 120, yPosition, {
      font: helveticaBoldFont,
      fontSize: 20,
      color: rgb(0, 0.5, 0.2),
    });
    yPosition -= 20;

    // CATATAN PENGUJI
    if (tasmi.catatanPenguji) {
      yPosition = addText('CATATAN PENGUJI', margin, yPosition, {
        font: helveticaBoldFont,
        fontSize: 11,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 8;

      // Word wrap untuk catatan
      const maxLineWidth = contentWidth - 30;
      const catatanLines = tasmi.catatanPenguji.match(/[\s\S]{1,80}/g) || [tasmi.catatanPenguji];
      catatanLines.forEach((line) => {
        yPosition = addText(line.trim(), margin + 15, yPosition, { fontSize: 10, color: rgb(0.2, 0.2, 0.2) });
      });
      yPosition -= 15;
    }

    // FOOTER
    yPosition = 50;
    addLine(margin, yPosition, width - margin, yPosition, 1, rgb(0.8, 0.8, 0.8));
    yPosition -= 10;

    addText(`Guru Penguji: ${tasmi.guruPenguji?.user?.name || ''}`, margin, yPosition, { fontSize: 9, color: rgb(0.5, 0.5, 0.5) });
    addText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, width - margin - 150, yPosition, { fontSize: 9, color: rgb(0.5, 0.5, 0.5) });

    // Save PDF ke buffer
    const pdfBytes = await pdfDoc.save();

    // Return PDF sebagai response dengan Content-Disposition untuk download
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan_Tasmi_${tasmi.siswa.user.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { message: 'Gagal membuat PDF', error: error.message },
      { status: 500 }
    );
  }
}
