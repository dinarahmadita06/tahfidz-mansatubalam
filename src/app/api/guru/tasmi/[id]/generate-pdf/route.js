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
      // Bar hijau dengan text di tengah vertikal (tidak overlap)
      const barHeight = 32;
      const barY = yPos - barHeight;
      
      page.drawRectangle({
        x: margin,
        y: barY,
        width: contentWidth,
        height: barHeight,
        color: rgb(0, 0.4, 0.2), // SIMTAQ hijau
      });
      
      // Text di tengah bar
      addText(title, margin + 10, barY + 10, { 
        font: helveticaBoldFont, 
        fontSize: 12, 
        color: rgb(1, 1, 1),
        lineGap: 0
      });
      
      return barY - 12; // Space after bar
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
    const labelWidth = 110;

    // Row 1: Nama Siswa
    yPosition = addText('Nama Siswa', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.siswa.user.name, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 5;

    // Row 2: Kelas
    yPosition = addText('Kelas', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.siswa.kelas.nama, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 5;

    // Row 3: Guru Penguji
    yPosition = addText('Guru Penguji', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.guruPenguji?.user?.name || '-', col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 5;

    // Row 4: Tanggal Ujian
    const tanggalStr = tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' }) : '-';
    yPosition = addText('Tanggal Ujian', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tanggalStr, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 16;

    // ===== DETAIL UJIAN =====
    yPosition = addSection('DETAIL UJIAN', yPosition);

    // Row 1: Juz yang Ditasmi
    yPosition = addText('Juz yang Ditasmi', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(tasmi.juzYangDitasmi, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 5;

    // Row 2: Total Hafalan
    yPosition = addText('Total Hafalan', col1X, yPosition, { fontSize: 10, color: rgb(0.3, 0.3, 0.3) });
    addText(`${tasmi.jumlahHafalan} Juz`, col1X + labelWidth, yPosition, { fontSize: 10, font: helveticaBoldFont });
    yPosition -= 16;

    // ===== PENILAIAN KOMPONEN (TABEL RAPI) =====
    yPosition = addSection('PENILAIAN KOMPONEN', yPosition);
    yPosition -= 5;

    // Tabel positioning
    const tableMargin = margin + 10;
    const tableCol1 = tableMargin;
    const tableCol2 = tableMargin + 350; // Kolom nilai (align center/kanan)
    const tableRowHeight = 14;
    
    // Header tabel dengan background abu-abu
    page.drawRectangle({
      x: tableMargin - 5,
      y: yPosition - tableRowHeight,
      width: contentWidth - 10,
      height: tableRowHeight,
      color: rgb(0.93, 0.93, 0.93),
    });

    addText('Komponen Penilaian', tableCol1, yPosition - 3, { font: helveticaBoldFont, fontSize: 10 });
    addText('Nilai', tableCol2, yPosition - 3, { font: helveticaBoldFont, fontSize: 10, halign: 'center' });
    yPosition -= tableRowHeight + 2;

    // Data rows dengan alternating background
    const components = [
      { label: 'Makhrajul Huruf (0-100)', value: tasmi.nilaiKelancaran },
      { label: 'Keindahan Melantunkan (0-100)', value: tasmi.nilaiAdab },
      { label: 'Tajwid (0-100)', value: tasmi.nilaiTajwid },
      { label: 'Kefasihan & Kelancaran (0-100)', value: tasmi.nilaiIrama },
    ];

    components.forEach((comp, idx) => {
      // Alternating row background (stripe)
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: tableMargin - 5,
          y: yPosition - tableRowHeight,
          width: contentWidth - 10,
          height: tableRowHeight,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      addText(comp.label, tableCol1, yPosition - 2, { fontSize: 10 });
      addText((comp.value || '-').toString(), tableCol2, yPosition - 2, { fontSize: 10, font: helveticaBoldFont });
      yPosition -= tableRowHeight + 1;
    });

    yPosition -= 5;

    // ===== NILAI AKHIR (HIGHLIGHT PASTEL HIJAU) =====
    yPosition -= 8;
    const nilaiBoxHeight = 70;
    const nilaiBoxY = yPosition - nilaiBoxHeight;
    
    // Box highlight pastel hijau
    page.drawRectangle({
      x: margin,
      y: nilaiBoxY,
      width: contentWidth,
      height: nilaiBoxHeight,
      color: rgb(0.85, 0.95, 0.88), // Pastel hijau muda
    });
    
    // Border tipis
    page.drawRectangle({
      x: margin,
      y: nilaiBoxY,
      width: contentWidth,
      height: nilaiBoxHeight,
      borderColor: rgb(0, 0.4, 0.2),
      borderWidth: 1,
    });

    addText('NILAI AKHIR', margin + 14, nilaiBoxY + 50, { fontSize: 12, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    addText(tasmi.nilaiAkhir.toFixed(2), margin + contentWidth - 80, nilaiBoxY + 35, { fontSize: 24, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    
    yPosition = nilaiBoxY - 12;

    // ===== FOOTER INFO (KECIL & RAPI) =====
    const footerY = 45;
    const footerX = margin + 10;
    const footerRightX = width - margin - 120;
    
    const printDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' });
    addText(`Dicetak pada: ${printDate}`, footerX, footerY, { fontSize: 9, color: rgb(0.5, 0.5, 0.5) });
    addText(`Guru Penguji: ${tasmi.guruPenguji?.user?.name || '-'}`, footerRightX, footerY, { fontSize: 9, color: rgb(0.5, 0.5, 0.5) });

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
