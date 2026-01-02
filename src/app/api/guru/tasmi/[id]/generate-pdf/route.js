import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// POST - Generate PDF laporan hasil ujian tasmi per siswa (PROFESIONAL FORMAT)
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

    // Generate PDF dengan format PROFESIONAL
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margin = 30;
    const contentWidth = width - 2 * margin;

    let yPosition = height - margin;

    // ===== HELPER FUNCTIONS =====
    const addText = (text, x, y, options = {}) => {
      const fontSize = options.fontSize || 11;
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

      return y - (fontSize + (options.lineGap || 3));
    };

    const addLine = (x1, y1, x2, y2, thickness = 1, color = rgb(0, 0, 0)) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      });
    };

    const addSection = (title, yPos) => {
      // Section header dengan background hijau SIMTAQ
      page.drawRectangle({
        x: margin,
        y: yPos - 18,
        width: contentWidth,
        height: 18,
        color: rgb(0, 0.4, 0.2), // SIMTAQ hijau
      });
      addText(title, margin + 8, yPos - 4, { font: helveticaBoldFont, fontSize: 12, color: rgb(1, 1, 1) });
      return yPos - 25;
    };

    // ===== HEADER JUDUL =====
    yPosition = addText('LAPORAN HASIL UJIAN TASMI\' AL-QUR\'AN', margin, yPosition, {
      font: helveticaBoldFont,
      fontSize: 18,
      color: rgb(0, 0.4, 0.2),
      lineGap: 8,
    });
    yPosition -= 8;

    // ===== IDENTITAS SISWA (GRID 2 KOLOM) =====
    yPosition = addSection('DATA IDENTITAS', yPosition);

    const col1X = margin + 10;
    const col2X = margin + contentWidth / 2 + 10;
    const labelWidth = 100;

    // Row 1: Nama & Kelas
    yPosition = addText('Nama Siswa', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.siswa.user.name, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition = addText('Kelas', col2X, yPosition + 11, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.siswa.kelas.nama, col2X + labelWidth, yPosition + 11, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 15;

    // Row 2: Guru Penguji & Tanggal Ujian
    yPosition = addText('Guru Penguji', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.guruPenguji?.user?.name || '-', col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition = addText('Tanggal Ujian', col2X, yPosition + 11, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    const tanggalStr = tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' }) : '-';
    addText(tanggalStr, col2X + labelWidth, yPosition + 11, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 25;

    // ===== DETAIL UJIAN =====
    yPosition = addSection('DETAIL UJIAN', yPosition);

    yPosition = addText('Juz yang Ditasmi', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.juzYangDitasmi, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition = addText('Total Hafalan', col2X, yPosition + 11, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(`${tasmi.jumlahHafalan} Juz`, col2X + labelWidth, yPosition + 11, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 25;

    // ===== PENILAIAN KOMPONEN (TABEL) =====
    yPosition = addSection('PENILAIAN KOMPONEN', yPosition);
    yPosition -= 5;

    // Tabel header
    const tableMargin = margin + 10;
    const col1 = tableMargin;
    const col2 = tableMargin + 350; // Align kanan untuk nilai

    // Header background
    page.drawRectangle({
      x: tableMargin - 5,
      y: yPosition - 14,
      width: contentWidth - 10,
      height: 14,
      color: rgb(0.95, 0.95, 0.95),
    });

    addText('Komponen Penilaian', col1, yPosition - 2, { font: helveticaBoldFont, fontSize: 10 });
    addText('Nilai', col2, yPosition - 2, { font: helveticaBoldFont, fontSize: 10 });
    yPosition -= 18;

    // Data rows
    const components = [
      { label: 'Makhrajul Huruf (0-100)', value: tasmi.nilaiKelancaran },
      { label: 'Keindahan Melantunkan (0-100)', value: tasmi.nilaiAdab },
      { label: 'Tajwid (0-100)', value: tasmi.nilaiTajwid },
      { label: 'Kefasihan & Kelancaran (0-100)', value: tasmi.nilaiIrama },
    ];

    components.forEach((comp) => {
      addText(comp.label, col1, yPosition, { fontSize: 10 });
      addText((comp.value || '-').toString(), col2, yPosition, { fontSize: 10, font: helveticaBoldFont });
      yPosition -= 13;
    });

    yPosition -= 5;
    addLine(margin, yPosition, width - margin, yPosition, 1, rgb(0.7, 0.7, 0.7));
    yPosition -= 10;

    // ===== NILAI AKHIR (MENONJOL) =====
    page.drawRectangle({
      x: margin,
      y: yPosition - 40,
      width: contentWidth,
      height: 40,
      color: rgb(0, 0.4, 0.2),
      opacity: 0.1,
    });

    addText('NILAI AKHIR', margin + 10, yPosition - 8, { fontSize: 12, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    addText(tasmi.nilaiAkhir.toFixed(2), margin + 300, yPosition - 15, { fontSize: 28, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    yPosition -= 50;

    // ===== CATATAN PENGUJI (HANYA JIKA ADA) =====
    if (tasmi.catatanPenguji && tasmi.catatanPenguji.trim()) {
      yPosition = addSection('CATATAN PENGUJI', yPosition);
      yPosition -= 5;

      // Word wrap untuk catatan (simple approach)
      const maxCharsPerLine = 90;
      const lines = tasmi.catatanPenguji.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [tasmi.catatanPenguji];
      lines.forEach((line) => {
        yPosition = addText(line, margin + 10, yPosition, { fontSize: 10, color: rgb(0.1, 0.1, 0.1) });
      });
      yPosition -= 10;
    }

    // ===== FOOTER SIGNATURE =====
    yPosition = 80;
    addText('Mengetahui,', margin + 50, yPosition, { fontSize: 10, font: helveticaBoldFont });
    addText('Guru Tahfidz/Guru Penguji', margin + 30, yPosition - 30, { fontSize: 9 });
    addText(tasmi.guruPenguji?.user?.name || '', margin + 30, yPosition - 45, { fontSize: 9 });

    // Tanggal cetak di kanan
    const printDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' });
    addText(`Tanggal: ${printDate}`, width - margin - 120, 50, { fontSize: 9 });

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
