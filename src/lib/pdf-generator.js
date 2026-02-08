import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateLaporanPDF(siswaData, setoranData, periode) {
  // Membuat dokumen PDF baru
  const pdfDoc = await PDFDocument.create();
  
  // Load font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Menambahkan halaman
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  // Margin dan positioning
  const margin = 50;
  const contentWidth = width - 2 * margin;
  let yPosition = height - margin;
  
  // Helper function untuk menambah text dengan line break
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
      ...options
    });
    
    return y - (fontSize + 4); // Return next Y position
  };
  
  // Helper function untuk menambah line
  const addLine = (x1, y1, x2, y2, thickness = 1, color = rgb(0, 0, 0)) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color
    });
  };
  
  // HEADER
  yPosition = addText('LAPORAN HAFALAN INDIVIDU', margin, yPosition, {
    font: helveticaBoldFont,
    fontSize: 18,
    color: rgb(0, 0.2, 0.5)
  });
  
  yPosition = addText('MAN 1 Bandar Lampung', margin, yPosition, {
    fontSize: 14,
    color: rgb(0.3, 0.3, 0.3)
  });
  
  yPosition -= 20;
  addLine(margin, yPosition, width - margin, yPosition, 2, rgb(0, 0.2, 0.5));
  yPosition -= 20;
  
  // PROFIL SISWA
  yPosition = addText('PROFIL SISWA', margin, yPosition, {
    font: helveticaBoldFont,
    fontSize: 14,
    color: rgb(0, 0.2, 0.5)
  });
  yPosition -= 10;
  
  yPosition = addText(`Nama: ${siswaData.nama}`, margin + 20, yPosition);
  yPosition = addText(`Kelas: ${siswaData.kelas}`, margin + 20, yPosition);
  yPosition = addText(`NIS: ${siswaData.nis}`, margin + 20, yPosition);
  yPosition = addText(`Periode: ${periode}`, margin + 20, yPosition);
  yPosition -= 20;
  
  // REKAPITULASI
  const totalSetoran = setoranData.length;
  const totalHafal = setoranData.filter(s => s.statusHafalan === 'hafal').length;
  const totalKurangHafal = setoranData.filter(s => s.statusHafalan === 'kurang_hafal').length;
  const totalTidakHafal = setoranData.filter(s => s.statusHafalan === 'tidak_hafal').length;
  const rataRataKelancaran = setoranData.length > 0 
    ? Math.round(setoranData.reduce((sum, s) => sum + s.nilaiKelancaran, 0) / setoranData.length) 
    : 0;
  const rataRataTajwid = setoranData.length > 0 
    ? Math.round(setoranData.reduce((sum, s) => sum + s.nilaiTajwid, 0) / setoranData.length) 
    : 0;
  
  yPosition = addText('REKAPITULASI', margin, yPosition, {
    font: helveticaBoldFont,
    fontSize: 14,
    color: rgb(0, 0.2, 0.5)
  });
  yPosition -= 10;
  
  yPosition = addText(`Total Setoran: ${totalSetoran} kali`, margin + 20, yPosition);
  yPosition = addText(`Hafal: ${totalHafal} | Kurang Hafal: ${totalKurangHafal} | Tidak Hafal: ${totalTidakHafal}`, margin + 20, yPosition);
  yPosition = addText(`Rata-rata Kelancaran: ${rataRataKelancaran}`, margin + 20, yPosition);
  yPosition = addText(`Rata-rata Tajwid: ${rataRataTajwid}`, margin + 20, yPosition);
  yPosition -= 30;
  
  // RIWAYAT SETORAN (LOGBOOK FORMAT)
  yPosition = addText('RIWAYAT SETORAN HAFALAN', margin, yPosition, {
    font: helveticaBoldFont,
    fontSize: 14,
    color: rgb(0, 0.2, 0.5)
  });
  yPosition -= 20;
  
  // Jika tidak ada data
  if (setoranData.length === 0) {
    yPosition = addText('Tidak ada data setoran pada periode ini.', margin + 20, yPosition, {
      color: rgb(0.6, 0.6, 0.6)
    });
  } else {
    // Loop untuk setiap setoran
    setoranData.forEach((setoran, index) => {
      // Cek apakah perlu halaman baru
      if (yPosition < 150) {
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - margin;
      }
      
      // Box untuk setiap entry setoran
      const boxHeight = 120;
      const boxY = yPosition - boxHeight;
      
      // Background box
      page.drawRectangle({
        x: margin,
        y: boxY,
        width: contentWidth,
        height: boxHeight,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98)
      });
      
      // Entry number dan tanggal
      let entryY = yPosition - 15;
      entryY = addText(`${index + 1}. ${new Date(setoran.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, margin + 10, entryY, {
        font: helveticaBoldFont,
        fontSize: 12,
        color: rgb(0, 0.3, 0.6)
      });
      
      // Surah dan ayat
      entryY = addText(`Surah: ${setoran.surah} | Ayat: ${setoran.rentangAyat}`, margin + 20, entryY, {
        font: helveticaBoldFont,
        fontSize: 11
      });
      
      // Status hafalan dengan color coding
      let statusColor = rgb(0.2, 0.7, 0.2); // green
      let statusText = 'HAFAL';
      if (setoran.statusHafalan === 'kurang_hafal') {
        statusColor = rgb(0.9, 0.6, 0);
        statusText = 'KURANG HAFAL';
      } else if (setoran.statusHafalan === 'tidak_hafal') {
        statusColor = rgb(0.8, 0.2, 0.2);
        statusText = 'TIDAK HAFAL';
      }
      
      entryY = addText(`Status: ${statusText} | Nilai Akhir: ${setoran.nilaiAkhir}`, margin + 20, entryY, {
        color: statusColor,
        font: helveticaBoldFont,
        fontSize: 10
      });
      
      // Nilai detail
      entryY = addText(`Kelancaran: ${setoran.nilaiKelancaran} | Tajwid: ${setoran.nilaiTajwid}`, margin + 20, entryY, {
        fontSize: 10,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // Catatan (jika ada)
      if (setoran.catatan) {
        entryY = addText(`Catatan: ${setoran.catatan}`, margin + 20, entryY, {
          fontSize: 10,
          color: rgb(0.3, 0.3, 0.3)
        });
      }
      
      yPosition = boxY - 15; // Space after box
    });
  }
  
  // FOOTER
  const footerY = 80;
  addLine(margin, footerY + 20, width - margin, footerY + 20, 1, rgb(0.8, 0.8, 0.8));
  addText(`Digenerate pada: ${new Date().toLocaleDateString('id-ID')} - ${new Date().toLocaleTimeString('id-ID')}`, 
    margin, footerY, {
    fontSize: 8,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  addText('Laporan Hafalan - MAN 1 Bandar Lampung', 
    width - margin - 200, footerY, {
    fontSize: 8,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  return await pdfDoc.save();
}