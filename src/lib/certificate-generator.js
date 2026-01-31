/**
 * Certificate Generator Module with Absolute Positioning
 * Uses active template from database as background with precise overlay positioning
 * Reference canvas: 932×661 px (landscape)
 * 
 * Template System:
 * - Templates are uploaded by users and stored in database
 * - Only one template is active at a time
 * - All certificates use the active template as background
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';

// Canvas reference size (from template)
const CANVAS_WIDTH = 932;
const CANVAS_HEIGHT = 661;

// Position mapping based on color-coded boxes (all in pixels)
const POSITIONS = {
  // Red box - Nama area
  NAMA: {
    x: 177,
    y: 287,
    width: 586,
    height: 103,
    label: {
      text: 'Diberikan kepada',
      fontSize: 14,
      offsetY: 20 // Label offset from top of box
    },
    nama: {
      fontSize: 32,
      fontSizeLarge: 36,
      maxFontSize: 40,
      minFontSize: 20
    }
  },
  
  // Yellow box - Capaian/Juz area  
  CAPAIAN: {
    x: 175,
    y: 393,
    width: 589,
    height: 33,
    fontSize: 16,
    maxFontSize: 18,
    minFontSize: 12
  },
  
  // Purple box - Tempat & Tanggal
  TEMPAT_TANGGAL: {
    x: 548,
    y: 503,
    width: 271,
    height: 29,
    fontSize: 12,
    align: 'right'
  },
  
  // Blue box - TTD Kiri (Kepala MAN)
  TTD_KIRI: {
    x: 132,
    y: 539,
    width: 271,
    height: 117,
    jabatan: {
      fontSize: 10,
      offsetY: 5
    },
    signature: {
      height: 60,
      offsetY: 15
    },
    nama: {
      fontSize: 11,
      fontSizeBold: 12,
      offsetY: -5
    }
  },
  
  // Orange box - TTD Kanan (Ketua Asrama)
  TTD_KANAN: {
    x: 546,
    y: 535,
    width: 271,
    height: 117,
    jabatan: {
      fontSize: 10,
      offsetY: 5
    },
    signature: {
      height: 60,
      offsetY: 15
    },
    nama: {
      fontSize: 11,
      fontSizeBold: 12,
      offsetY: -5
    }
  }
};

/**
 * Calculate scale factor and positioning for A4 landscape page
 */
function calculatePageScale(paperSize) {
  // A4 Landscape: 841.89 × 595.28 points (297mm × 210mm)
  // F4 Landscape: 935.43 × 595.28 points (330mm × 210mm)
  
  let pageWidth, pageHeight;
  
  if (paperSize === 'F4') {
    pageWidth = 935.43;
    pageHeight = 595.28;
  } else {
    // Default A4
    pageWidth = 841.89;
    pageHeight = 595.28;
  }
  
  // Calculate scale to fit template proportionally
  const scaleX = pageWidth / CANVAS_WIDTH;
  const scaleY = pageHeight / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY); // Use smaller scale to fit fully
  
  // Center the template on page
  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;
  const offsetX = (pageWidth - scaledWidth) / 2;
  const offsetY = (pageHeight - scaledHeight) / 2;
  
  return { pageWidth, pageHeight, scale, offsetX, offsetY };
}

/**
 * Convert template coordinates to PDF coordinates with scaling
 */
function toPageCoords(x, y, scale, offsetX, offsetY, pageHeight, scaledHeight) {
  // Template Y is from top, PDF Y is from bottom
  // Convert: PDF_Y = pageHeight - (template_Y * scale + offsetY)
  const scaledX = x * scale + offsetX;
  const scaledY = pageHeight - (y * scale + offsetY);
  
  return { x: scaledX, y: scaledY };
}

/**
 * Auto-fit text to width with font size adjustment
 */
function autoFitFontSize(text, font, maxWidth, maxFontSize, minFontSize = 8) {
  let fontSize = maxFontSize;
  
  while (fontSize >= minFontSize) {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    if (textWidth <= maxWidth) {
      return fontSize;
    }
    fontSize -= 0.5;
  }
  
  return minFontSize;
}

/**
 * Generate single certificate
 * @param {Buffer|string} templateSource - Template buffer or path (for backward compatibility)
 * @param {string} paperSize - 'A4' or 'F4'
 * @param {Object} data - Certificate data
 * @returns {Promise<Buffer>} PDF bytes
 */
async function generateCertificate(templateSource, paperSize = 'A4', data) {
  // Validate required fields
  if (!data.nama_siswa) {
    throw new Error('nama_siswa is required');
  }
  
  if (!data.juz) {
    throw new Error('juz is required');
  }
  
  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Calculate page dimensions and scale
  const { pageWidth, pageHeight, scale, offsetX, offsetY } = calculatePageScale(paperSize);
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  
  // Load template image as background
  let templateImage;
  let templateBuffer;
  
  // Support both buffer and file path for flexibility
  if (Buffer.isBuffer(templateSource)) {
    templateBuffer = templateSource;
  } else if (typeof templateSource === 'string') {
    templateBuffer = await fs.readFile(templateSource);
  } else if (templateSource instanceof ArrayBuffer) {
    templateBuffer = Buffer.from(templateSource);
  } else {
    throw new Error('Invalid template source. Must be Buffer, string path, or ArrayBuffer');
  }
  
  const isPng = templateBuffer[0] === 0x89 && templateBuffer[1] === 0x50;
  
  if (isPng) {
    templateImage = await pdfDoc.embedPng(templateBuffer);
  } else {
    templateImage = await pdfDoc.embedJpg(templateBuffer);
  }
  
  // Draw template as full background (cover mode)
  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;
  
  page.drawImage(templateImage, {
    x: offsetX,
    y: offsetY,
    width: scaledWidth,
    height: scaledHeight,
  });
  
  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Prepare dynamic data
  const namaSiswa = data.nama_siswa;
  
  // Smart JUZ handling - avoid duplicate "JUZ" prefix
  const juzValue = (data.juz || '').toString().trim();
  const containsJuz = juzValue.toLowerCase().includes('juz');
  const juzText = containsJuz ? juzValue : `JUZ ${juzValue}`;
  const capaianText = `Telah Menyelesaikan Tahfidzul Qur'an ${juzText}`;
  
  // 🐛 Debug: Log JUZ processing
  console.log(`[Certificate Generator] juz_raw="${data.juz}" → juzValue="${juzValue}" → containsJuz=${containsJuz} → juzText="${juzText}"`);
  
  const tempatTanggal = `${data.tempat || 'Bandar Lampung'}, ${data.tanggal_cetak || formatDate(new Date())}`;
  const jabatanKiri = data.jabatan_kiri || 'Kepala MAN 1 Bandar Lampung';
  const namaKiri = data.nama_pejabat_kiri || 'Luqman Hakim, S.Pd., M.M.';
  const jabatanKanan = data.jabatan_kanan || 'Ketua Asrama Luqman El-Hakim';
  const namaKanan = data.nama_pejabat_kanan || 'Siti Rowiyah, M.P.dI';
  
  // ========== AREA NAMA (Red Box) ==========
  const namaPos = POSITIONS.NAMA;
  
  // Draw "Diberikan kepada" label (TIDAK DITAMPILKAN - sudah ada di template)
  // const labelCoords = toPageCoords(
  //   namaPos.x + namaPos.width / 2,
  //   namaPos.y + namaPos.label.offsetY,
  //   scale,
  //   offsetX,
  //   offsetY,
  //   pageHeight,
  //   scaledHeight
  // );
  // 
  // const labelWidth = fontRegular.widthOfTextAtSize(namaPos.label.text, namaPos.label.fontSize * scale);
  // page.drawText(namaPos.label.text, {
  //   x: labelCoords.x - labelWidth / 2,
  //   y: labelCoords.y,
  //   size: namaPos.label.fontSize * scale,
  //   font: fontRegular,
  //   color: rgb(0, 0, 0),
  // });
  
  // Draw nama siswa (centered, auto-fit)
  const namaFontSize = autoFitFontSize(
    namaSiswa,
    fontBold,
    namaPos.width * scale * 0.95,
    namaPos.nama.maxFontSize * scale,
    namaPos.nama.minFontSize * scale
  );
  
  const namaCoords = toPageCoords(
    namaPos.x + namaPos.width / 2,
    namaPos.y + namaPos.height / 2 + 15,
    scale,
    offsetX,
    offsetY,
    pageHeight,
    scaledHeight
  );
  
  const namaWidth = fontBold.widthOfTextAtSize(namaSiswa, namaFontSize);
  page.drawText(namaSiswa, {
    x: namaCoords.x - namaWidth / 2,
    y: namaCoords.y,
    size: namaFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  // ========== AREA CAPAIAN (Yellow Box) ==========
  const capaianPos = POSITIONS.CAPAIAN;
  
  const capaianFontSize = autoFitFontSize(
    capaianText,
    fontRegular,
    capaianPos.width * scale * 0.95,
    capaianPos.fontSize * scale,
    capaianPos.minFontSize * scale
  );
  
  const capaianCoords = toPageCoords(
    capaianPos.x + capaianPos.width / 2,
    capaianPos.y + capaianPos.height / 2 - 2,
    scale,
    offsetX,
    offsetY,
    pageHeight,
    scaledHeight
  );
  
  const capaianWidth = fontRegular.widthOfTextAtSize(capaianText, capaianFontSize);
  page.drawText(capaianText, {
    x: capaianCoords.x - capaianWidth / 2,
    y: capaianCoords.y,
    size: capaianFontSize,
    font: fontRegular,
    color: rgb(0, 0, 0),
  });
  
  // ========== TEMPAT & TANGGAL (Dipindahkan ke atas TTD kanan) ==========
  // const tanggalPos = POSITIONS.TEMPAT_TANGGAL;
  // 
  // const tanggalCoords = toPageCoords(
  //   tanggalPos.x + tanggalPos.width - 10,
  //   tanggalPos.y + tanggalPos.height / 2 + 3,
  //   scale,
  //   offsetX,
  //   offsetY,
  //   pageHeight,
  //   scaledHeight
  // );
  // 
  // const tanggalWidth = fontRegular.widthOfTextAtSize(tempatTanggal, tanggalPos.fontSize * scale);
  // page.drawText(tempatTanggal, {
  //   x: tanggalCoords.x - tanggalWidth,
  //   y: tanggalCoords.y,
  //   size: tanggalPos.fontSize * scale,
  //   font: fontRegular,
  //   color: rgb(0, 0, 0),
  // });
  
  // ========== TTD KIRI (Blue Box) ==========
  const ttdKiriPos = POSITIONS.TTD_KIRI;
  
  // Jabatan kiri (TIDAK DITAMPILKAN - sudah ada di template)
  // const jabatanKiriCoords = toPageCoords(
  //   ttdKiriPos.x + ttdKiriPos.width / 2,
  //   ttdKiriPos.y + ttdKiriPos.jabatan.offsetY,
  //   scale,
  //   offsetX,
  //   offsetY,
  //   pageHeight,
  //   scaledHeight
  // );
  // 
  // const jabatanKiriWidth = fontRegular.widthOfTextAtSize(jabatanKiri, ttdKiriPos.jabatan.fontSize * scale);
  // page.drawText(jabatanKiri, {
  //   x: jabatanKiriCoords.x - jabatanKiriWidth / 2,
  //   y: jabatanKiriCoords.y,
  //   size: ttdKiriPos.jabatan.fontSize * scale,
  //   font: fontRegular,
  //   color: rgb(0, 0, 0),
  // });
  
  // Signature image kiri (middle) - if provided
  if (data.ttd_kepala_man) {
    const ttdKiriImage = await loadSignatureImage(pdfDoc, data.ttd_kepala_man);
    
    const sigKiriCoords = toPageCoords(
      ttdKiriPos.x + ttdKiriPos.width / 2 - 30,
      ttdKiriPos.y + 85,
      scale,
      offsetX,
      offsetY,
      pageHeight,
      scaledHeight
    );
    
    const ttdWidth = 60 * scale;
    const ttdHeight = ttdKiriPos.signature.height * scale;
    
    page.drawImage(ttdKiriImage, {
      x: sigKiriCoords.x,
      y: sigKiriCoords.y,
      width: ttdWidth,
      height: ttdHeight,
    });
    
    // Cap overlay kiri - if provided
    if (data.cap_kepala_man) {
      const capKiriImage = await loadSignatureImage(pdfDoc, data.cap_kepala_man);
      const capScale = data.cap_kepala_man_scale || 1.0;
      const capWidth = 50 * scale * capScale;
      const capHeight = 50 * scale * capScale;
      const capX = sigKiriCoords.x + (ttdWidth - capWidth) / 2 + (data.cap_kepala_man_offsetX || 0) * scale;
      const capY = sigKiriCoords.y + (ttdHeight - capHeight) / 2 + (data.cap_kepala_man_offsetY || 0) * scale;
      
      page.drawImage(capKiriImage, {
        x: capX,
        y: capY,
        width: capWidth,
        height: capHeight,
        opacity: data.cap_kepala_man_opacity || 0.4
      });
    }
  }
  
  // Nama pejabat kiri (bottom)
  const namaKiriCoords = toPageCoords(
    ttdKiriPos.x + ttdKiriPos.width / 2,
    ttdKiriPos.y + ttdKiriPos.height - 15,
    scale,
    offsetX,
    offsetY,
    pageHeight,
    scaledHeight
  );
  
  const namaKiriWidth = fontBold.widthOfTextAtSize(namaKiri, ttdKiriPos.nama.fontSizeBold * scale);
  page.drawText(namaKiri, {
    x: namaKiriCoords.x - namaKiriWidth / 2,
    y: namaKiriCoords.y,
    size: ttdKiriPos.nama.fontSizeBold * scale,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  // ========== TTD KANAN (Orange Box) ==========
  const ttdKananPos = POSITIONS.TTD_KANAN;
  
  // Tempat & Tanggal (dipindahkan ke posisi jabatan kanan - area atas)
  const tempatTanggalKananCoords = toPageCoords(
    ttdKananPos.x + ttdKananPos.width / 2,
    ttdKananPos.y + ttdKananPos.jabatan.offsetY,
    scale,
    offsetX,
    offsetY,
    pageHeight,
    scaledHeight
  );
  
  const tempatTanggalKananWidth = fontRegular.widthOfTextAtSize(tempatTanggal, ttdKananPos.jabatan.fontSize * scale);
  page.drawText(tempatTanggal, {
    x: tempatTanggalKananCoords.x - tempatTanggalKananWidth / 2,
    y: tempatTanggalKananCoords.y,
    size: ttdKananPos.jabatan.fontSize * scale,
    font: fontRegular,
    color: rgb(0, 0, 0),
  });
  
  // Signature image kanan (middle) - if provided
  if (data.ttd_ketua_asrama) {
    const ttdKananImage = await loadSignatureImage(pdfDoc, data.ttd_ketua_asrama);
    
    const sigKananCoords = toPageCoords(
      ttdKananPos.x + ttdKananPos.width / 2 - 30,
      ttdKananPos.y + 87,
      scale,
      offsetX,
      offsetY,
      pageHeight,
      scaledHeight
    );
    
    const ttdWidth = 60 * scale;
    const ttdHeight = ttdKananPos.signature.height * scale;
    
    page.drawImage(ttdKananImage, {
      x: sigKananCoords.x,
      y: sigKananCoords.y,
      width: ttdWidth,
      height: ttdHeight,
    });
    
    // Cap overlay kanan - if provided
    if (data.cap_ketua_asrama) {
      const capKananImage = await loadSignatureImage(pdfDoc, data.cap_ketua_asrama);
      const capScale = data.cap_ketua_asrama_scale || 1.0;
      const capWidth = 50 * scale * capScale;
      const capHeight = 50 * scale * capScale;
      const capX = sigKananCoords.x + (ttdWidth - capWidth) / 2 + (data.cap_ketua_asrama_offsetX || 0) * scale;
      const capY = sigKananCoords.y + (ttdHeight - capHeight) / 2 + (data.cap_ketua_asrama_offsetY || 0) * scale;
      
      page.drawImage(capKananImage, {
        x: capX,
        y: capY,
        width: capWidth,
        height: capHeight,
        opacity: data.cap_ketua_asrama_opacity || 0.4
      });
    }
  }
  
  // Nama pejabat kanan (bottom)
  const namaKananCoords = toPageCoords(
    ttdKananPos.x + ttdKananPos.width / 2,
    ttdKananPos.y + ttdKananPos.height - 15,
    scale,
    offsetX,
    offsetY,
    pageHeight,
    scaledHeight
  );
  
  const namaKananWidth = fontBold.widthOfTextAtSize(namaKanan, ttdKananPos.nama.fontSizeBold * scale);
  page.drawText(namaKanan, {
    x: namaKananCoords.x - namaKananWidth / 2,
    y: namaKananCoords.y,
    size: ttdKananPos.nama.fontSizeBold * scale,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  // Return PDF as bytes
  return await pdfDoc.save();
}

/**
 * Load signature image (PNG or JPG) from file path, buffer, or base64
 */
async function loadSignatureImage(pdfDoc, imageSource) {
  let imageBuffer;
  
  if (typeof imageSource === 'string') {
    // Check if it's base64 data URL
    if (imageSource.startsWith('data:image')) {
      const base64Data = imageSource.split(',')[1] || imageSource;
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // File path
      imageBuffer = await fs.readFile(imageSource);
    }
  } else if (Buffer.isBuffer(imageSource)) {
    imageBuffer = imageSource;
  } else {
    imageBuffer = Buffer.from(imageSource);
  }
  
  const isPng = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
  
  if (isPng) {
    return await pdfDoc.embedPng(imageBuffer);
  } else {
    return await pdfDoc.embedJpg(imageBuffer);
  }
}

/**
 * Format date to Indonesian format
 */
function formatDate(date) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const d = new Date(date);
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Batch generate certificates
 * @param {Buffer|string} templateSource - Template buffer or path
 * @param {string} paperSize - 'A4' or 'F4'
 * @param {Array} dataList - Array of certificate data
 * @returns {Promise<Object>} { results, errors }
 */
async function batchGenerateCertificates(templateSource, paperSize, dataList) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < dataList.length; i++) {
    const data = dataList[i];
    
    try {
      // Validate data
      if (!data.nama_siswa || !data.juz) {
        throw new Error('Missing required fields: nama_siswa and juz');
      }
      
      const pdfBytes = await generateCertificate(templateSource, paperSize, data);
      
      // Generate filename
      const filename = `Sertifikat_${sanitizeFilename(data.nama_siswa)}_JUZ_${data.juz.replace(/,/g, '-')}.pdf`;
      
      results.push({
        index: i,
        data,
        pdfBytes,
        filename
      });
      
    } catch (error) {
      errors.push({
        index: i,
        data,
        error: error.message
      });
    }
  }
  
  return { results, errors };
}

/**
 * Merge multiple PDFs into one
 */
async function mergePDFs(pdfBytesList) {
  const mergedPdf = await PDFDocument.create();
  
  for (const pdfBytes of pdfBytesList) {
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  
  return await mergedPdf.save();
}

/**
 * Sanitize filename
 */
function sanitizeFilename(str) {
  return str
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

export {
  generateCertificate,
  batchGenerateCertificates,
  mergePDFs
};
