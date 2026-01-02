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

    // ===== HEADER JUDUL (CENTER) =====
    yPosition -= 10; // Padding top minimal
    const titleText = 'LAPORAN HASIL UJIAN TASMI\' AL-QUR\'AN';
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(titleText, 18);
    const titleX = (width - titleWidth) / 2; // Center horizontally
    
    page.drawText(titleText, {
      x: titleX,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0, 0.4, 0.2),
    });
    yPosition -= 28; // Spacing setelah judul

    // ===== IDENTITAS SISWA (FORMAT TABEL 3 KOLOM: Label : Value) =====
    yPosition = addSection('DATA IDENTITAS', yPosition);
    yPosition -= 10; // Padding top lebih kecil (naikin identitas)

    const identitasLabelCol = margin + 15;      // Kolom label (fixed 150px)
    const identitasColonCol = identitasLabelCol + 150;  // Kolom ":" (20px)
    const identitasValueCol = identitasColonCol + 20;   // Kolom value (auto)
    const identitasRowHeight = 12;              // Consistent row height

    // Helper: Render key-value pair dalam 3 kolom dengan spacing proper
    const renderKeyValueRow = (label, value) => {
      addText(label, identitasLabelCol, yPosition, { fontSize: 11, color: rgb(0.2, 0.2, 0.2) });
      addText(':', identitasColonCol, yPosition, { fontSize: 11, color: rgb(0.2, 0.2, 0.2) });
      addText(value, identitasValueCol, yPosition, { fontSize: 11, font: helveticaBoldFont });
      yPosition -= identitasRowHeight + 4; // Row height + bottom padding
    };

    // Render rows
    renderKeyValueRow('Nama Siswa', tasmi.siswa.user.name);
    renderKeyValueRow('Kelas', tasmi.siswa.kelas.nama);
    renderKeyValueRow('Guru Penguji', tasmi.guruPenguji?.user?.name || '-');
    
    const tanggalStr = tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' }) : '-';
    renderKeyValueRow('Tanggal Ujian', tanggalStr);

    yPosition -= 10; // Padding bottom setelah section

    // ===== DETAIL UJIAN (FORMAT TABEL 3 KOLOM: Label : Value) =====
    yPosition = addSection('DETAIL UJIAN', yPosition);
    yPosition -= 12; // Padding top setelah header

    const detailLabelCol = margin + 15;        // Kolom label (fixed 150px)
    const detailColonCol = detailLabelCol + 150;     // Kolom ":" (20px)
    const detailValueCol = detailColonCol + 20;      // Kolom value (auto)
    const detailRowHeight = 12;               // Consistent row height

    // Helper: Render key-value pair untuk detail section (reuse renderKeyValueRow jika possible)
    const renderDetailRow = (label, value) => {
      addText(label, detailLabelCol, yPosition, { fontSize: 11, color: rgb(0.2, 0.2, 0.2) });
      addText(':', detailColonCol, yPosition, { fontSize: 11, color: rgb(0.2, 0.2, 0.2) });
      addText(value, detailValueCol, yPosition, { fontSize: 11, font: helveticaBoldFont });
      yPosition -= detailRowHeight + 4; // Row height + bottom padding
    };

    // Render rows
    renderDetailRow('Juz yang Ditasmi', tasmi.juzYangDitasmi);
    renderDetailRow('Total Hafalan', `${tasmi.jumlahHafalan} Juz`);

    yPosition -= 10; // Padding bottom setelah section

    // ===== PENILAIAN KOMPONEN (TABEL 2 KOLOM RAPI) =====
    yPosition = addSection('PENILAIAN KOMPONEN', yPosition);
    yPosition -= 12; // Padding top setelah header

    // Tabel positioning
    const tableCol1 = margin + 15;      // Komponen label
    const tableCol2 = margin + 400;     // Nilai (kanan)
    const tableRowHeight = 16;          // Consistent row height dengan padding
    const tableRowPaddingY = 4;         // Padding dalam row
    const tableBottomMargin = margin + contentWidth - 15; // Right boundary
    
    // HEADER ROW (tanpa background abu-abu, cukup text tegas)
    addText('Komponen Penilaian', tableCol1, yPosition, { font: helveticaBoldFont, fontSize: 10, color: rgb(0, 0.4, 0.2) });
    addText('Nilai', tableCol2, yPosition, { font: helveticaBoldFont, fontSize: 10, color: rgb(0, 0.4, 0.2) });
    
    // Garis pembatas header (sejajar dengan baseline text)
    addLine(tableCol1 - 5, yPosition - 1, tableBottomMargin, yPosition - 1, 0.5, rgb(0.6, 0.6, 0.6));
    yPosition -= 10; // Spacing setelah divider ke row pertama

    // Data rows dengan alternating background halus
    const components = [
      { label: 'Makhraj', value: tasmi.nilaiKelancaran },
      { label: 'Keindahan', value: tasmi.nilaiAdab },
      { label: 'Tajwid', value: tasmi.nilaiTajwid },
      { label: 'Kefasihan', value: tasmi.nilaiIrama },
    ];

    components.forEach((comp, idx) => {
      // Render row: label | value (clean polos, tanpa border)
      addText(comp.label, tableCol1, yPosition - tableRowPaddingY, { fontSize: 11, color: rgb(0.2, 0.2, 0.2) });
      const valueStr = (comp.value || '-').toString();
      addText(valueStr, tableCol2, yPosition - tableRowPaddingY, { fontSize: 11, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
      
      yPosition -= tableRowHeight;
    });

    yPosition -= 12; // Spacing setelah tabel

    // ===== NILAI AKHIR (HIGHLIGHT PASTEL HIJAU - HORIZONTAL CENTER LAYOUT) =====
    yPosition -= 8;
    const nilaiBoxHeight = 50;  // Fixed height
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

    // Layout horizontal center: "NILAI AKHIR" (kiri) dan "80.25" (kanan), kedua-duanya center vertikal
    // Padding top-bottom yang cukup (setara dengan py-4/py-5)
    const nilaiBoxPadding = 8;  // padding atas-bawah
    const nilaiBoxCenterY = nilaiBoxY + (nilaiBoxHeight / 2) + 2;  // Vertical center dari box
    
    addText('NILAI AKHIR', margin + 18, nilaiBoxCenterY, { fontSize: 12, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    addText(tasmi.nilaiAkhir.toFixed(2), margin + contentWidth - 90, nilaiBoxCenterY, { fontSize: 16, font: helveticaBoldFont, color: rgb(0, 0.4, 0.2) });
    
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
