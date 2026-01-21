export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { formatMengulangText } from '@/lib/helpers/formatMengulangText';
import {
  renderReportHeader,
  renderReportTitle,
  renderMetadata,
  renderTable,
  renderFooterSignature,
  imageUrlToBase64,
} from '@/lib/utils/pdfMasterTemplate';
import { formatSurahSetoran } from '@/lib/helpers/formatSurahSetoran';

/**
 * GET /api/orangtua/laporan-hafalan/pdf
 * Generate PDF Laporan Perkembangan Hafalan Siswa (LANDSCAPE A4)
 * Menggunakan MASTER TEMPLATE yang sama dengan Laporan Tasmi
 * 
 * Query params:
 * - anakId: ID siswa (required)
 * - month: 0-11 (required, bulan 0=Januari)
 * - year: tahun (required, contoh: 2026)
 * 
 * Response: PDF file download (LANDSCAPE)
 */
export async function GET(request) {
  try {
    const session = await auth();

    // Security: ORANG_TUA only
    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');
    const month = parseInt(searchParams.get('month')); // 0-11
    const year = parseInt(searchParams.get('year'));

    // Validasi required params
    if (!anakId || isNaN(month) || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: anakId, month (0-11), year' },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Security: Validasi parent-child relationship
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: anakId,
        orangTuaSiswa: {
          some: {
            orangTua: { userId: session.user.id }
          }
        }
      },
      include: {
        user: true,
        kelas: {
          include: {
            guruKelas: {
              where: { peran: 'utama', isActive: true },
              include: { guru: { include: { user: true } } }
            }
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 403 }
      );
    }

    const guruPembina = siswa.kelas?.guruKelas[0]?.guru?.user?.name || '....................';

    // Fetch Presensi (by tanggal, not createdAt)
    const presensiList = await prisma.presensi.findMany({
      where: {
        siswaId: anakId,
        tanggal: { gte: startDate, lte: endDate }
      },
      orderBy: { tanggal: 'asc' }
    });

    // Group by tanggal for display
    const presensiMap = {};
    presensiList.forEach(p => {
      const dateKey = format(new Date(p.tanggal), 'yyyy-MM-dd');
      presensiMap[dateKey] = p.status; // HADIR, IZIN, SAKIT, ALFA
    });

    // Fetch Penilaian (by hafalan.tanggal) - HARUS INCLUDE surahTambahan + submissionStatus
    const penilaianList = await prisma.penilaian.findMany({
      where: {
        siswaId: anakId,
        hafalan: { tanggal: { gte: startDate, lte: endDate } }
      },
      select: {
        id: true,
        tajwid: true,
        kelancaran: true,
        makhraj: true,
        adab: true,
        nilaiAkhir: true,
        catatan: true,
        submissionStatus: true,
        repeatReason: true,
        guruId: true,
        hafalan: {
          select: {
            surah: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true,
            surahTambahan: true  // ✅ WAJIB untuk multi-surah
          }
        },
        guru: { select: { user: { select: { name: true } } } }
      },
      orderBy: { hafalan: { tanggal: 'asc' } }
    });

    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(startDate);

    // ============================================
    // CREATE PDF - LANDSCAPE A4 (MASTER TEMPLATE)
    // ============================================
    const doc = new jsPDF('l', 'mm', 'a4'); // LANDSCAPE
    const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Load logos (server-side: read from public folder)
    let logoMan1 = null;
    let logoKemenag = null;
    try {
      const publicDir = join(process.cwd(), 'public');
      const logoMan1Path = join(publicDir, 'logo-man1.png');
      const logoKemenagPath = join(publicDir, 'logo-kemenag.png');
      
      const logoMan1Buffer = readFileSync(logoMan1Path);
      const logoKemenagBuffer = readFileSync(logoKemenagPath);
      
      logoMan1 = 'data:image/png;base64,' + logoMan1Buffer.toString('base64');
      logoKemenag = 'data:image/png;base64,' + logoKemenagBuffer.toString('base64');
    } catch (err) {
      console.warn('Failed to load logo images:', err.message);
      // Continue without logos if not found
    }

    // ============================================
    // RENDER HEADER/KOP SURAT (SAMA DENGAN TASMI)
    // ============================================
    let yPos = renderReportHeader(doc, { pageWidth, margin, logoMan1, logoKemenag });

    // ============================================
    // RENDER JUDUL LAPORAN
    // ============================================
    yPos = renderReportTitle(doc, 'LAPORAN PERKEMBANGAN HAFALAN SISWA', pageWidth, yPos);

    // ============================================
    // RENDER METADATA (2 KOLOM) - KIRI: Nama/Kelas/Guru | KANAN: Periode/Tanggal
    // ============================================
    const metaLeft = [
      { label: 'Nama Siswa', value: siswa.user.name },
      { label: 'Kelas', value: siswa.kelas?.nama || '-' },
      { label: 'Guru Pembina', value: guruPembina },
    ];

    const metaRight = [
      { label: 'Periode', value: `${monthName} ${year}` },
      { label: 'Tanggal Cetak', value: format(new Date(), 'dd/MM/yyyy') },
    ];

    yPos = renderMetadata(doc, { pageWidth, margin, metaLeft, metaRight, yPos });

    // ============================================
    // RENDER TABEL RIWAYAT PENILAIAN
    // Header: FULL TEXT (tidak disingkat)
    // Data: GROUP BY tanggal + guru, aggregate surah (SAMA dengan UI)
    // ============================================
    
    // Group penilaian by tanggal + guruId (SAMA dengan UI logic)
    const penilaianByDateGuru = {};
    penilaianList.forEach(p => {
      const tanggal = new Date(p.hafalan.tanggal);
      const dateKey = format(tanggal, 'yyyy-MM-dd');
      const guruId = p.guruId || 'unknown';
      const groupKey = `${dateKey}_${guruId}`;
      
      if (!penilaianByDateGuru[groupKey]) {
        penilaianByDateGuru[groupKey] = {
          tanggal: tanggal,
          dateKey: dateKey,
          guruId: guruId,
          hafalanItems: [],
          nilaiTotal: [],
          submissionStatus: p.submissionStatus || 'DINILAI',
          repeatReason: p.repeatReason || null,
        };
      }
      
      // Collect hafalan items (untuk format surah dengan surahTambahan)
      penilaianByDateGuru[groupKey].hafalanItems.push(p.hafalan);
      
      // Collect nilai untuk averaging
      penilaianByDateGuru[groupKey].nilaiTotal.push({
        tajwid: p.tajwid,
        kelancaran: p.kelancaran,
        makhraj: p.makhraj,
        implementasi: p.adab,
        nilaiAkhir: p.nilaiAkhir,
        catatan: p.catatan,
        submissionStatus: p.submissionStatus,
        repeatReason: p.repeatReason,
      });
    });

    // Sort by date ASC
    const sortedGroupKeys = Object.keys(penilaianByDateGuru).sort((a, b) => {
      const dateA = penilaianByDateGuru[a].dateKey;
      const dateB = penilaianByDateGuru[b].dateKey;
      return dateA.localeCompare(dateB);
    });
    
    // HEADER TABEL - FULL TEXT (TIDAK DISINGKAT)
    const tableHead = [
      'Tanggal', 
      'Kehadiran', 
      'Surah/Ayat', 
      'Tajwid', 
      'Kelancaran', 
      'Makhraj', 
      'Implementasi', 
      'Rata-rata', 
      'Catatan'
    ];

    const tableBody = sortedGroupKeys.map(groupKey => {
      const groupData = penilaianByDateGuru[groupKey];
      const kehadiran = presensiMap[groupData.dateKey] || '-';
      
      // ✅ FORMAT SURAH SAMA DENGAN UI: gunakan formatSurahSetoran untuk setiap hafalan
      // Ini akan otomatis include main surah + surahTambahan
      const allSurahTexts = [];
      groupData.hafalanItems.forEach(hafalan => {
        const surahArray = formatSurahSetoran(hafalan); // Returns array of formatted strings
        allSurahTexts.push(...surahArray);
      });
      
      // Dedupe (karena bisa ada duplicate dari multiple penilaian)
      const uniqueSurahs = [...new Set(allSurahTexts)];
      
      // Join dengan line break untuk PDF
      const surahText = uniqueSurahs.length > 0 ? uniqueSurahs.join('\n') : '-';
      
      // Detect if MENGULANG (not graded)
      const isMengulang = 
        groupData.submissionStatus === 'MENGULANG' ||
        groupData.nilaiTotal.every(n => n.tajwid == null && n.kelancaran == null && n.makhraj == null && n.implementasi == null);
      
      // Calculate average nilai - tampilkan "-" jika MENGULANG
      let avgTajwid, avgKelancaran, avgMakhraj, avgImplementasi, avgNilaiAkhir;
      
      if (isMengulang) {
        avgTajwid = '-';
        avgKelancaran = '-';
        avgMakhraj = '-';
        avgImplementasi = '-';
        avgNilaiAkhir = '-';
      } else {
        avgTajwid = Math.round(
          groupData.nilaiTotal.reduce((sum, n) => sum + (n.tajwid || 0), 0) / groupData.nilaiTotal.length
        );
        avgKelancaran = Math.round(
          groupData.nilaiTotal.reduce((sum, n) => sum + (n.kelancaran || 0), 0) / groupData.nilaiTotal.length
        );
        avgMakhraj = Math.round(
          groupData.nilaiTotal.reduce((sum, n) => sum + (n.makhraj || 0), 0) / groupData.nilaiTotal.length
        );
        avgImplementasi = Math.round(
          groupData.nilaiTotal.reduce((sum, n) => sum + (n.implementasi || 0), 0) / groupData.nilaiTotal.length
        );
        avgNilaiAkhir = (
          groupData.nilaiTotal.reduce((sum, n) => sum + (n.nilaiAkhir || 0), 0) / groupData.nilaiTotal.length
        ).toFixed(2);
      }
      
      // Format catatan: gunakan formatMengulangText jika MENGULANG
      let catatan;
      if (isMengulang && groupData.submissionStatus === 'MENGULANG') {
        // Use helper untuk format konsisten
        const catatanList = groupData.nilaiTotal.map(n => n.catatan).filter(c => c && c !== '-');
        const combinedCatatan = catatanList.length > 0 ? [...new Set(catatanList)].join('; ') : null;
        catatan = formatMengulangText(groupData.repeatReason, combinedCatatan);
      } else {
        // Normal catatan
        const catatanList = groupData.nilaiTotal.map(n => n.catatan).filter(c => c && c !== '-');
        catatan = catatanList.length > 0 ? [...new Set(catatanList)].join('; ') : '-';
      }
      
      return {
        data: [
          format(groupData.tanggal, 'dd/MM/yyyy'),
          kehadiran,
          surahText,
          avgTajwid,
          avgKelancaran,
          avgMakhraj,
          avgImplementasi,
          avgNilaiAkhir,
          catatan
        ],
        isMengulang: isMengulang // Flag untuk styling
      };
    });

    // Column widths untuk landscape (contentWidth = 257mm)
    const columnStyles = {
      0: { cellWidth: 24, halign: 'center' },      // Tanggal
      1: { cellWidth: 22, halign: 'center' },      // Kehadiran
      2: { cellWidth: 60 },                        // Surah/Ayat (LEBAR untuk multi-line)
      3: { cellWidth: 18, halign: 'center' },      // Tajwid (FULL)
      4: { cellWidth: 22, halign: 'center' },      // Kelancaran (FULL)
      5: { cellWidth: 18, halign: 'center' },      // Makhraj (FULL)
      6: { cellWidth: 28, halign: 'center' },      // Implementasi (FULL)
      7: { cellWidth: 20, halign: 'center' },      // Rata-rata (FULL)
      8: { cellWidth: 45 }                         // Catatan (sisa width)
    };

    const finalTableY = renderTable(doc, {
      startY: yPos,
      margin,
      head: tableHead,
      body: tableBody.map(row => row.data), // Extract data array
      columnStyles,
      headerColor: [0, 102, 51], // Hijau SIMTAQ (SAMA dengan Tasmi)
      didDrawCell: (data) => {
        // Apply red background to MENGULANG rows
        if (data.section === 'body' && tableBody[data.row.index]?.isMengulang) {
          doc.setFillColor(254, 226, 226); // #FEE2E2 (red-50)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Redraw text
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
          
          // Get cell alignment from columnStyles
          const colStyle = columnStyles[data.column.index];
          const halign = colStyle?.halign || 'left';
          
          // Calculate text position based on alignment
          let textX = data.cell.x + 2;
          if (halign === 'center') {
            textX = data.cell.x + data.cell.width / 2;
          } else if (halign === 'right') {
            textX = data.cell.x + data.cell.width - 2;
          }
          
          doc.text(String(data.cell.text), textX, data.cell.y + data.cell.height / 2, {
            align: halign,
            baseline: 'middle'
          });
        }
      }
    });

    let yPosFinal = finalTableY + 12;

    // ============================================
    // TOTAL DATA (untuk validasi)
    // ============================================
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Data: ${sortedGroupKeys.length} hari penilaian`, margin, yPosFinal);
    yPosFinal += 8;

    // ============================================
    // RENDER FOOTER & TANDA TANGAN
    // ============================================
    renderFooterSignature(doc, {
      pageWidth,
      margin,
      yPos: yPosFinal,
      printDate: format(new Date(), 'dd/MM/yyyy'),
      jabatan: 'Guru Tahfidz / Guru Penguji',
      guruName: guruPembina,
    });

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan-Perkembangan-${siswa.user.name.replace(/\s+/g, '_')}-${monthName}-${year}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
