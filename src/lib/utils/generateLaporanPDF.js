import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/**
 * Format tanggal ke format Indonesia
 * @param {Date|string} date
 * @returns {string} contoh: "05 Januari 2026"
 */
const formatIndonesianDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy', { locale: idLocale });
};

/**
 * Generate Laporan Perkembangan Hafalan PDF
 * Format: Professional like Tasmi rapor
 * 
 * @param {Object} data - Data laporan
 * @param {Object} data.siswa - {id, nama, kelas}
 * @param {Object} data.guru - {id, nama, signatureUrl (optional)}
 * @param {Array} data.penilaianList - Array of penilaian data
 * @param {Object} data.statistics - {totalPenilaian, rataRataNilai, halalanTerakhir, konsistensi}
 * @param {Date} data.startDate - Tanggal mulai periode
 * @param {Date} data.endDate - Tanggal akhir periode
 * @param {string} data.periodType - "Mingguan" | "Bulanan" | "Semesteran" (for metadata)
 * @returns {jsPDF} - PDF document object
 */
export async function generateLaporanPDF(data) {
  const {
    siswa,
    guru,
    penilaianList = [],
    statistics = {},
    startDate,
    endDate,
    periodType = 'Mingguan',
  } = data;

  // Create PDF - A4 size, mm units
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // ============================================
  // A. HEADER SEKOLAH (dengan logo dan double line)
  // ============================================
  
  // Logo kiri & kanan (placeholder - will be implemented if logos available)
  // For now, hanya text header
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('MAN 1 Bandar Lampung', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Jalan Raya Pulau Mas, Bandar Lampung', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('Telp: (0721) 123-4567 | Email: info@tahfidz-al-quran.id', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Double line separator (like Tasmi rapor)
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 1;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // ============================================
  // B. JUDUL LAPORAN (Centered)
  // ============================================
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('LAPORAN PERKEMBANGAN HAFALAN SISWA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // ============================================
  // C. IDENTITAS SISWA (2 Kolom Format)
  // ============================================
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMASI IDENTITAS', margin, yPosition);
  yPosition += 7;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  const leftColX = margin + 5;
  const rightColX = margin + contentWidth / 2 + 5;
  const lineHeight = 6;

  // Left Column
  doc.text('Nama Siswa:', leftColX, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(siswa?.nama || '-', leftColX + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont(undefined, 'normal');
  doc.text('Kelas:', leftColX, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(siswa?.kelas || '-', leftColX + 35, yPosition);
  yPosition += lineHeight;

  doc.setFont(undefined, 'normal');
  doc.text('Guru Pembina:', leftColX, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(guru?.nama || '-', leftColX + 35, yPosition);
  yPosition -= lineHeight * 2; // Reset untuk kolom kanan

  // Right Column (sama tinggi)
  doc.setFont(undefined, 'normal');
  doc.text('Periode:', rightColX, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(periodType, rightColX + 25, yPosition);
  yPosition += lineHeight;

  doc.setFont(undefined, 'normal');
  doc.text('Rentang Tanggal:', rightColX, yPosition);
  doc.setFont(undefined, 'bold');
  const dateRange = `${formatIndonesianDate(startDate)} – ${formatIndonesianDate(endDate)}`;
  doc.text(dateRange, rightColX + 35, yPosition, { maxWidth: 50 });
  yPosition += lineHeight;

  doc.setFont(undefined, 'normal');
  doc.text('Tanggal Cetak:', rightColX, yPosition);
  doc.setFont(undefined, 'bold');
  doc.text(formatIndonesianDate(new Date()), rightColX + 25, yPosition);
  yPosition += 12;

  // ============================================
  // D. RINGKASAN STATISTIK (4 Box)
  // ============================================
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('RINGKASAN STATISTIK', margin, yPosition);
  yPosition += 8;

  const boxWidth = (contentWidth - 6) / 4; // 4 boxes dengan 2px gap
  const boxHeight = 15;
  const boxX = [margin, margin + boxWidth + 2, margin + (boxWidth + 2) * 2, margin + (boxWidth + 2) * 3];

  // Box data
  const statsBoxes = [
    { title: 'Total Penilaian', value: statistics?.totalPenilaian || 0 },
    { title: 'Rata-rata Nilai', value: statistics?.rataRataNilai ? `${statistics.rataRataNilai.toFixed(2)}` : '-' },
    { title: 'Hafalan Terakhir', value: statistics?.halalanTerakhir || '-' },
    { title: 'Konsistensi', value: statistics?.konsistensi ? `${statistics.konsistensi} hari` : '-' },
  ];

  statsBoxes.forEach((box, idx) => {
    const x = boxX[idx];

    // Draw box border
    doc.setDrawColor(200);
    doc.rect(x, yPosition, boxWidth, boxHeight);

    // Title
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(box.title, x + 2, yPosition + 4);

    // Value
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(String(box.value), x + 2, yPosition + 10, { maxWidth: boxWidth - 4 });
  });

  yPosition += boxHeight + 10;

  // ============================================
  // E. TABEL PENILAIAN HAFALAN
  // ============================================
  if (penilaianList && penilaianList.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('TABEL PENILAIAN HAFALAN', margin, yPosition);
    yPosition += 8;

    // Prepare table data
    const tableData = penilaianList.map((item, idx) => [
      String(idx + 1), // No
      formatIndonesianDate(item.tanggal), // Tanggal
      item.surah || '-', // Surah/Ayat (bisa multi-line nanti)
      item.ayat || '-',
      item.tajwid || '-', // Tajwid
      item.kelancaran || '-', // Kelancaran
      item.makhraj || '-', // Makhraj
      item.implementasi || '-', // Implementasi
      item.nilaiAkhir ? item.nilaiAkhir.toFixed(2) : '-', // Rata-rata
      item.status || '-', // Status (Lulus/Lanjut/Belum Setoran)
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['No', 'Tanggal', 'Surah', 'Ayat', 'Tajwid', 'Kelancaran', 'Makhraj', 'Implementasi', 'Rata-rata', 'Status']],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 18 },
        2: { cellWidth: 15 },
        3: { cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 12 },
        9: { halign: 'center', cellWidth: 14 },
      },
      didDrawPage: (data) => {
        // Optional: add page footer
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Belum ada data penilaian hafalan pada periode ini.', margin + 5, yPosition);
    yPosition += 15;
  }

  // ============================================
  // F. CATATAN GURU (Terpisah dari tabel)
  // ============================================
  const catatanList = penilaianList
    ?.filter((item) => item.catatan && item.catatan.trim() !== '')
    .map((item) => ({
      tanggal: formatIndonesianDate(item.tanggal),
      surah: item.surah || '?',
      ayat: item.ayat || '?',
      catatan: item.catatan,
    })) || [];

  // Check if we need a new page for catatan section
  if (yPosition > pageHeight - 60 && catatanList.length > 0) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('CATATAN GURU (Per Setoran)', margin, yPosition);
  yPosition += 8;

  if (catatanList.length > 0) {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    catatanList.forEach((item) => {
      const catatanText = `(${item.tanggal}) ${item.surah} Ayat ${item.ayat} → ${item.catatan}`;
      const lines = doc.splitTextToSize(catatanText, contentWidth - 10);

      lines.forEach((line, idx) => {
        if (idx === 0) {
          doc.text('• ' + line, margin + 5, yPosition);
        } else {
          doc.text(line, margin + 10, yPosition);
        }
        yPosition += 5;
      });

      yPosition += 2; // Extra space between items
    });
  } else {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Tidak ada catatan khusus dari guru pada periode ini.', margin + 5, yPosition);
    yPosition += 10;
  }

  // ============================================
  // G. TANDA TANGAN (Kanan Bawah)
  // ============================================
  yPosition = pageHeight - 50;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Bandar Lampung, ' + formatIndonesianDate(new Date()), pageWidth - margin - 50, yPosition, { align: 'center' });
  yPosition += 6;

  doc.text('Guru Pembina Tahfidz', pageWidth - margin - 50, yPosition, { align: 'center' });
  yPosition += 15;

  // Signature image if available - check both signatureUrl and ttdUrl
  const signatureUrl = guru?.signatureUrl || guru?.ttdUrl;
  if (signatureUrl) {
    try {
      // Detect image format from base64 data URL
      let format = 'PNG';
      if (signatureUrl.includes('image/jpeg') || signatureUrl.includes('image/jpg')) {
        format = 'JPEG';
      }
      doc.addImage(signatureUrl, format, pageWidth - margin - 50 - 15, yPosition - 5, 30, 15);
      yPosition += 15;
    } catch (err) {
      console.error('⚠️  Error loading signature:', err.message);
      // Just skip signature if error
      yPosition += 15;
    }
  } else {
    // Empty space for manual signature
    yPosition += 15;
  }

  // Nama guru
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`(${guru?.nama || '-'})`, pageWidth - margin - 50, yPosition, { align: 'center' });

  return doc;
}

/**
 * Download PDF dengan nama file yang proper
 * @param {jsPDF} doc - PDF document
 * @param {string} namaAnak - Nama siswa
 * @param {Date} startDate
 * @param {Date} endDate
 */
export function downloadPDF(doc, namaAnak, startDate, endDate) {
  const fileName = `Laporan_Hafalan_${namaAnak}_${format(new Date(startDate), 'ddMMyyyy')}_${format(new Date(endDate), 'ddMMyyyy')}.pdf`;
  doc.save(fileName);
}
