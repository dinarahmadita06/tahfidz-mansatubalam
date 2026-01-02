import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Konversi URL gambar ke base64 (client-side)
async function imageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Image not found: ${imageUrl}`);
    return null;
  }
}

export async function generateTasmiRecapPDF(data) {
  const doc = new jsPDF('l', 'mm', 'a4'); // LANDSCAPE
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPos = margin;

  // ===== A) KOP LAPORAN DENGAN LOGO KIRI-KANAN =====
  // Load logos dari public folder
  const logoMan1 = await imageUrlToBase64('/logo-man1.png');
  const logoKemenag = await imageUrlToBase64('/logo-kemenag.png');

  const logoY = yPos + 5;
  const logoWidth = 25;
  const logoHeight_ = 25;

  // Logo kiri
  if (logoMan1) {
    doc.addImage(logoMan1, 'PNG', margin, logoY, logoWidth, logoHeight_);
  }

  // Logo kanan
  if (logoKemenag) {
    doc.addImage(logoKemenag, 'PNG', pageWidth - margin - logoWidth, logoY, logoWidth, logoHeight_);
  }

  // Teks kop CENTER
  const kopCenterX = pageWidth / 2;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('MADRASAH TAHFIDZ AL-QUR\'AN', kopCenterX, yPos + 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame Kota Bandar Lampung, Lampung 35131', kopCenterX, yPos + 17, { align: 'center' });

  yPos += 32;

  // SEPARATOR LINE
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 1;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 102, 51);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  // ===== JUDUL LAPORAN =====
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN REKAP HASIL UJIAN TASMI\' AL-QUR\'AN', kopCenterX, yPos, { align: 'center' });
  yPos += 11;

  // ===== B) INFO LAPORAN (2 KOLOM GRID) =====
  doc.setFontSize(11);
  const col1X = margin;
  const col2X = margin + contentWidth / 2;
  const labelWidth = 55;
  const valueX1 = col1X + labelWidth + 2;
  const valueX2 = col2X + labelWidth + 2;

  // ROW 1: Periode & Kelas
  doc.setFont('helvetica', 'bold');
  doc.text('Periode:', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.periodeText, valueX1, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Kelas:', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.kelasName, valueX2, yPos);
  yPos += 5.5;

  // ROW 2: Tanggal Cetak & Guru Penguji
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.printDate, valueX1, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Guru Penguji:', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.guruName, valueX2, yPos);
  yPos += 11;

  // ===== C) TABEL REKAP (FULL HEADER TEXT, NO ABBREVIATION) =====
  // Column proportions - FULL WIDTH 100% dengan normalisasi
  // No:4% Nama:18% Kelas:10% Juz:6% JuzDiuji:18% TglUjian:10% Makhraj:8% Tajwid:8% Keindahan:10% Kefasihan:10% Nilai:8%
  const colProportions = [4, 18, 10, 6, 18, 10, 8, 8, 10, 10, 8]; // Total = 110% (normalized to 100%)
  // Normalize untuk ensure 100% width
  const totalProportion = colProportions.reduce((a, b) => a + b, 0);
  const colWidths = colProportions.map(prop => (contentWidth * prop) / totalProportion);

  // FULL HEADER TEXT (tidak ada singkatan) - dengan font size lebih kecil agar 1 baris
  const tableColumns = [
    'No',
    'Nama Siswa',
    'Kelas',
    'Juz',
    'Juz Diuji',
    'Tgl Ujian',
    'Makhraj',
    'Tajwid',
    'Keindahan',
    'Kefasihan',
    'Nilai'
  ];

  const tableRows = data.tableData.map((item) => [
    item.no.toString(),
    item.nama.length > 28 ? item.nama.substring(0, 25) + '...' : item.nama,
    item.kelas,
    item.totalJuz,
    item.juzDiuji.length > 18 ? item.juzDiuji.substring(0, 15) + '...' : item.juzDiuji,
    item.tanggal,
    item.makhraj,
    item.tajwid,
    item.keindahan,
    item.kefasihan,
    item.nilaiAkhir
  ]);

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: yPos,
    margin: { left: margin, right: margin, top: 0, bottom: 0 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      // Ensure table spans full width without extra space
    },
    pageBreak: 'auto',
    headerStyles: {
      fillColor: [0, 102, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
      padding: 2.5,
      lineWidth: 0.5,
      lineColor: [0, 102, 51]
    },
    bodyStyles: {
      fontSize: 8.5,
      padding: 2.5,
      lineWidth: 0.3,
      lineColor: [200, 200, 200]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: 'center', valign: 'middle', cellWidth: colWidths[0] },
      1: { halign: 'left', valign: 'middle', cellWidth: colWidths[1] },
      2: { halign: 'center', valign: 'middle', cellWidth: colWidths[2] },
      3: { halign: 'center', valign: 'middle', cellWidth: colWidths[3] },
      4: { halign: 'left', valign: 'middle', cellWidth: colWidths[4] },
      5: { halign: 'center', valign: 'middle', cellWidth: colWidths[5] },
      6: { halign: 'center', valign: 'middle', cellWidth: colWidths[6] },
      7: { halign: 'center', valign: 'middle', cellWidth: colWidths[7] },
      8: { halign: 'center', valign: 'middle', cellWidth: colWidths[8] },
      9: { halign: 'center', valign: 'middle', cellWidth: colWidths[9] },
      10: { halign: 'center', valign: 'middle', cellWidth: colWidths[10] },
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.3,
  });

  // Get final Y position after table
  yPos = doc.lastAutoTable.finalY + 9;

  // ===== D) SUMMARY (TOTAL PESERTA & RATA-RATA) =====
  const summaryRightX = pageWidth - margin - 75;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Peserta:', summaryRightX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(data.totalPeserta.toString(), summaryRightX + 40, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.text('Rata-rata Nilai:', summaryRightX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 51);
  doc.text(data.rataRata, summaryRightX + 40, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 13;

  // ===== E) TANDA TANGAN GURU (KANAN BAWAH, TEXT ALIGNED LURUS) =====
  // Tetapkan posisi x untuk blok TTD (semuanya sejajar dari titik ini)
  const ttdBlockX = pageWidth - margin - 70;
  const ttdStartY = yPos;

  // Tanggal kota
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bandar Lampung, ${data.printDate}`, ttdBlockX, ttdStartY);

  // "Mengetahui,"
  yPos = ttdStartY + 14;
  doc.setFont('helvetica', 'bold');
  doc.text('Mengetahui,', ttdBlockX, yPos);

  // Jabatan
  yPos += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Guru Tahfidz / Guru Penguji', ttdBlockX, yPos);

  // Ruang tanda tangan (60px)
  yPos += 20;
  doc.setLineWidth(0.5);
  doc.line(ttdBlockX, yPos, ttdBlockX + 35, yPos);

  // Nama guru (aligned dengan awal blok TTD)
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.guruName, ttdBlockX, yPos);

  // SAVE PDF
  doc.save(`Rekap_Tasmi_${new Date().getTime()}.pdf`);
}
