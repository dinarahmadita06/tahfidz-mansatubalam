import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * MASTER TEMPLATE PDF UNTUK SEMUA LAPORAN SIMTAQ
 * Format: LANDSCAPE A4 (297mm x 210mm)
 * 
 * Digunakan untuk:
 * - Laporan Rekap Hasil Ujian Tasmi (Guru)
 * - Laporan Perkembangan Hafalan Siswa (Orang Tua)
 * 
 * STRUKTUR SERAGAM:
 * 1. Header/Kop dengan logo kiri-kanan
 * 2. Separator (double line)
 * 3. Judul laporan
 * 4. Metadata (2 kolom)
 * 5. Tabel data (style seragam)
 * 6. Footer & tanda tangan
 */

/**
 * Konversi URL gambar ke base64 (client-side only)
 * @param {string} imageUrl - URL gambar
 * @returns {Promise<string|null>} Base64 string atau null jika gagal
 */
export async function imageUrlToBase64(imageUrl) {
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

/**
 * Render Header/Kop Surat dengan Logo
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} options - { pageWidth, margin, logoMan1, logoKemenag }
 * @returns {number} yPos setelah header
 */
export function renderReportHeader(doc, options) {
  const { pageWidth, margin, logoMan1, logoKemenag } = options;
  let yPos = margin;

  // ===== LOGO KIRI & KANAN =====
  const logoY = yPos + 8;
  const logoWidth = 20;
  const logoHeight = 20;

  // Logo kiri
  if (logoMan1) {
    doc.addImage(logoMan1, 'PNG', margin + 5, logoY, logoWidth, logoHeight);
  }

  // Logo kanan
  if (logoKemenag) {
    doc.addImage(logoKemenag, 'PNG', pageWidth - margin - logoWidth - 5, logoY, logoWidth, logoHeight);
  }

  // ===== TEKS KOP (CENTER) =====
  const kopCenterX = pageWidth / 2;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('MAN 1 BANDAR LAMPUNG', kopCenterX, yPos + 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame Kota Bandar Lampung, Lampung 35131', kopCenterX, yPos + 17, { align: 'center' });

  yPos += 32;

  // ===== SEPARATOR (DOUBLE LINE) =====
  doc.setLineWidth(0.8);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 1;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 102, 51); // Hijau SIMTAQ
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 9;

  return yPos;
}

/**
 * Render Judul Laporan (Center, Bold)
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} title - Judul laporan
 * @param {number} pageWidth - Lebar halaman
 * @param {number} yPos - Posisi Y awal
 * @returns {number} yPos setelah judul
 */
export function renderReportTitle(doc, title, pageWidth, yPos) {
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  return yPos + 11;
}

/**
 * Render Metadata (2 Kolom Grid Layout)
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} options - { pageWidth, margin, metaLeft, metaRight, yPos }
 * metaLeft: Array of {label, value}
 * metaRight: Array of {label, value}
 * @returns {number} yPos setelah metadata
 */
export function renderMetadata(doc, options) {
  const { pageWidth, margin, metaLeft, metaRight, yPos: startY } = options;
  
  doc.setFontSize(11);
  const col1X = margin;
  const col2X = margin + ((pageWidth - 2 * margin) / 2);
  const labelWidth = 55;
  const valueX1 = col1X + labelWidth + 2;
  const valueX2 = col2X + labelWidth + 2;
  const rowHeight = 5.5;
  
  let yPos = startY;
  const maxRows = Math.max(metaLeft.length, metaRight.length);

  for (let i = 0; i < maxRows; i++) {
    // Left column
    if (metaLeft[i]) {
      doc.setFont('helvetica', 'bold');
      doc.text(metaLeft[i].label + ':', col1X, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(metaLeft[i].value, valueX1, yPos);
    }

    // Right column
    if (metaRight[i]) {
      doc.setFont('helvetica', 'bold');
      doc.text(metaRight[i].label + ':', col2X, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(metaRight[i].value, valueX2, yPos);
    }

    yPos += rowHeight;
  }

  return yPos + 5.5; // Extra spacing after metadata
}

/**
 * Render Tabel dengan Style Seragam
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} options - { startY, margin, head, body, columnStyles, theme, headerColor }
 * @returns {number} finalY setelah tabel
 */
export function renderTable(doc, options) {
  const {
    startY,
    margin,
    head,
    body,
    columnStyles = {},
    theme = 'grid',
    headerColor = [0, 102, 51], // Default: Hijau SIMTAQ
  } = options;

  autoTable(doc, {
    head: [head],
    body,
    startY,
    margin: { left: margin, right: margin },
    theme,
    pageBreak: 'auto',
    headerStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
      padding: 2.5,
      lineWidth: 0.5,
      lineColor: headerColor,
    },
    bodyStyles: {
      fontSize: 8.5,
      padding: 2.5,
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles,
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.3,
  });

  return doc.lastAutoTable.finalY;
}

/**
 * Render Footer & Tanda Tangan (Kanan Bawah)
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} options - { pageWidth, margin, yPos, printDate, jabatan, guruName, signatureUrl }
 * @returns {number} yPos setelah footer
 */
export function renderFooterSignature(doc, options) {
  const { pageWidth, margin, yPos: startY, printDate, jabatan, guruName, signatureUrl } = options;
  
  const ttdBlockX = pageWidth - margin - 70;
  let yPos = startY;

  // Tanggal kota
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bandar Lampung, ${printDate}`, ttdBlockX, yPos);

  // "Mengetahui,"
  yPos += 14;
  doc.setFont('helvetica', 'bold');
  doc.text('Mengetahui,', ttdBlockX, yPos);

  // Jabatan
  yPos += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(jabatan, ttdBlockX, yPos);

  // Ruang tanda tangan
  yPos += 4;
  
  // Render signature image if available
  if (signatureUrl) {
    try {
      console.log('[PDF] Rendering signature image...');
      // Detect image format from base64 data URL
      let format = 'PNG';
      if (signatureUrl.includes('image/jpeg') || signatureUrl.includes('image/jpg')) {
        format = 'JPEG';
      }
      
      // Add signature image (30mm width, 15mm height)
      doc.addImage(signatureUrl, format, ttdBlockX, yPos, 30, 15);
      console.log('[PDF] Signature rendered successfully');
      yPos += 16;
    } catch (err) {
      console.error('[PDF] ❌ Error loading signature:', err.message);
      console.error('[PDF] Signature URL length:', signatureUrl?.length || 0);
      // Fallback: draw line if image fails
      yPos += 16;
      doc.setLineWidth(0.5);
      doc.line(ttdBlockX, yPos, ttdBlockX + 35, yPos);
      yPos += 3;
    }
  } else {
    console.log('[PDF] No signature URL provided, drawing line');
    // No signature: draw line for manual signature
    yPos += 16;
    doc.setLineWidth(0.5);
    doc.line(ttdBlockX, yPos, ttdBlockX + 35, yPos);
    yPos += 3;
  }

  // Nama guru
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(guruName, ttdBlockX, yPos);

  return yPos;
}

/**
 * CREATE MASTER PDF DOCUMENT (LANDSCAPE A4)
 * @returns {Object} { doc, pageWidth, pageHeight, margin, contentWidth }
 */
export function createMasterPDF() {
  const doc = new jsPDF('l', 'mm', 'a4'); // LANDSCAPE
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  return { doc, pageWidth, pageHeight, margin, contentWidth };
}

/**
 * GENERATE PDF DENGAN MASTER TEMPLATE
 * @param {Object} config - { title, metaLeft, metaRight, tableHead, tableBody, columnStyles, summary, footerSignature, filename }
 * @param {Object} config.footerSignature - { printDate, jabatan, guruName, signatureUrl (optional) }
 * @returns {Promise<void>} Download PDF
 */
export async function generateReportPDF(config) {
  const {
    title,
    metaLeft,
    metaRight,
    tableHead,
    tableBody,
    columnStyles,
    summary = null,
    footerSignature,
    filename,
    headerColor = [0, 102, 51], // Default hijau
  } = config;

  // Create PDF
  const { doc, pageWidth, pageHeight, margin, contentWidth } = createMasterPDF();

  // Load logos (client-side only)
  const logoMan1 = await imageUrlToBase64('/logo-man1.png');
  const logoKemenag = await imageUrlToBase64('/logo-kemenag.png');

  // Render Header
  let yPos = renderReportHeader(doc, { pageWidth, margin, logoMan1, logoKemenag });

  // Render Title
  yPos = renderReportTitle(doc, title, pageWidth, yPos);

  // Render Metadata
  yPos = renderMetadata(doc, { pageWidth, margin, metaLeft, metaRight, yPos });

  // Render Table
  const finalTableY = renderTable(doc, {
    startY: yPos,
    margin,
    head: tableHead,
    body: tableBody,
    columnStyles,
    headerColor,
  });

  yPos = finalTableY + 9;

  // Render Summary (if provided)
  if (summary) {
    const summaryRightX = pageWidth - margin - 75;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(summary.label1, summaryRightX, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(summary.value1, summaryRightX + 40, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.text(summary.label2, summaryRightX, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 51);
    doc.text(summary.value2, summaryRightX + 40, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 13;
  }

  // Render Footer & Signature
  renderFooterSignature(doc, {
    pageWidth,
    margin,
    yPos,
    printDate: footerSignature.printDate,
    jabatan: footerSignature.jabatan,
    guruName: footerSignature.guruName,
    signatureUrl: footerSignature.signatureUrl || null,
  });

  // Save PDF
  doc.save(filename);
}
