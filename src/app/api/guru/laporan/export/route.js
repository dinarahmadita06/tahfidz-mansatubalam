import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// POST /api/guru/laporan/export - Export laporan to PDF or Excel
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { format, viewMode, kelasId, periode, data } = body;

    if (!format || !viewMode || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get guru data with signature
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      select: {
        tandaTangan: true,
        user: {
          select: {
            name: true,
            signatureUrl: true,
            ttdUrl: true
          },
        },
      },
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    let result = null;

    if (format === 'PDF') {
      // Generate PDF HTML template
      const pdfHtml = generatePDFTemplate(data, viewMode, guru, periode, kelasId);

      result = {
        success: true,
        format: 'PDF',
        html: pdfHtml,
        filename: `laporan-${viewMode}-${new Date().toISOString().split('T')[0]}.pdf`,
      };
    } else if (format === 'Excel') {
      // Generate CSV (Excel compatible)
      const csv = generateCSV(data, viewMode);
      const filename = `laporan-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`;

      result = {
        success: true,
        format: 'Excel',
        csv,
        filename,
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }

    // Log activity - Export Laporan
    const actionType = format === 'PDF' ? ACTIVITY_ACTIONS.GURU_EXPORT_PDF : ACTIVITY_ACTIONS.GURU_EXPORT_EXCEL;
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: actionType,
      title: `Export laporan ke ${format}`,
      description: `Export laporan ${viewMode} untuk ${data.length} siswa ke format ${format}`,
      metadata: {
        format,
        viewMode,
        siswaCount: data.length,
        periode,
        kelasId,
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error exporting laporan:', error);
    return NextResponse.json(
      { error: 'Failed to export laporan', details: error.message },
      { status: 500 }
    );
  }
}

// Generate CSV for Excel export
function generateCSV(data, viewMode) {
  let csv = '';

  if (viewMode === 'harian') {
    // Header
    csv += 'No,Nama Lengkap,Tanggal,Status Kehadiran,Nilai Tajwid,Nilai Kelancaran,Nilai Makhraj,Nilai Implementasi,Status Hafalan,Catatan\n';

    // Rows
    data.forEach((siswa, idx) => {
      if (siswa.pertemuan) {
        csv += `${idx + 1},"${siswa.namaLengkap}",`;
        csv += `"${siswa.pertemuan.tanggal}",`;
        csv += `"${siswa.pertemuan.statusKehadiran}",`;
        csv += `${siswa.pertemuan.nilaiTajwid || '-'},`;
        csv += `${siswa.pertemuan.nilaiKelancaran || '-'},`;
        csv += `${siswa.pertemuan.nilaiMakhraj || '-'},`;
        csv += `${siswa.pertemuan.nilaiImplementasi || '-'},`;
        csv += `"${siswa.pertemuan.statusHafalan}",`;
        csv += `"${siswa.pertemuan.catatan || '-'}"\n`;
      } else {
        csv += `${idx + 1},"${siswa.namaLengkap}",-,-,-,-,-,-,-,-\n`;
      }
    });
  } else {
    // Header for bulanan/semesteran
    csv += 'No,Nama Lengkap,Hadir,Izin,Sakit,Alfa,Jumlah Setoran,Hafalan Terakhir,Rata-rata Tajwid,Rata-rata Kelancaran,Rata-rata Makhraj,Rata-rata Implementasi,Rata-rata Nilai,Status Hafalan\n';

    // Rows
    data.forEach((siswa, idx) => {
      csv += `${siswa.no || (idx + 1)},"${siswa.namaLengkap}",`;
      csv += `${siswa.hadir || 0},`;
      csv += `${siswa.izin || 0},`;
      csv += `${siswa.sakit || 0},`;
      csv += `${siswa.alfa || 0},`;
      csv += `${siswa.jumlahSetoran || 0},`;
      csv += `"${siswa.hafalanTerakhir || '-'}",`;
      csv += `${formatNilai(siswa.rataRataTajwid)},`;
      csv += `${formatNilai(siswa.rataRataKelancaran)},`;
      csv += `${formatNilai(siswa.rataRataMakhraj)},`;
      csv += `${formatNilai(siswa.rataRataImplementasi)},`;
      csv += `${formatNilai(siswa.rataRataNilaiBulanan)},`;
      csv += `"${siswa.statusHafalan}"\n`;
    });
  }

  return csv;
}

// Generate PDF HTML template
function generatePDFTemplate(data, viewMode, guru, periode, kelasId) {
  const now = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  let modeTitle = '';
  let periodeText = '';
  
  if (viewMode === 'harian') {
    modeTitle = 'LAPORAN HARIAN/MINGGUAN';
    periodeText = periode;
  } else if (viewMode === 'bulanan') {
    modeTitle = 'LAPORAN REKAP BULANAN';
    periodeText = periode.replace('-', ' ').toUpperCase();
  } else {
    modeTitle = 'LAPORAN REKAP SEMESTERAN';
    periodeText = periode.replace('-', ' ').toUpperCase();
  }

  // Get signature URL if available
  const signatureUrl = guru.tandaTangan || guru.user.signatureUrl || guru.user.ttdUrl || null;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${modeTitle} - ${now}</title>
  <style>
    @page {
      size: landscape;
      margin: 1cm;
      margin-top: 0.8cm;
      margin-bottom: 0.8cm;
    }
    
    /* Remove default print headers/footers */
    @page :first {
      margin-top: 0.8cm;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none;
      }
      /* Remove default browser elements */
      html, body {
        background: white;
      }
    }
    
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 12px;
      color: #1B1B1B;
      background: white;
    }
    
    /* HEADER SECTION - With Logos */
    .header {
      margin-bottom: 10px;
      padding-bottom: 0;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 15px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .header-center {
      text-align: center;
      flex: 1;
      padding: 5px 0;
    }
    
    .school-name {
      font-size: 16px;
      font-weight: bold;
      margin: 0;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .school-address {
      font-size: 11px;
      margin: 0;
      line-height: 1.3;
      color: #333;
      margin-bottom: 2px;
    }
    
    /* Double Line Separator */
    .header-line {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 8px 0;
      padding: 0;
    }
    
    .header-line-top {
      border-top: 2px solid #1A936F;
      height: 0;
    }
    
    .header-line-bottom {
      border-top: 1px solid #000;
      height: 0;
    }
    
    .report-title {
      font-size: 18px;
      font-weight: bold;
      margin: 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
      text-align: center;
      padding: 4px 0;
    }
    
    /* META INFORMATION - Two Column Layout */
    .meta-section {
      margin-bottom: 12px;
      font-size: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 35px;
      line-height: 1.5;
    }
    
    .meta-column {
      display: flex;
      flex-direction: column;
    }
    
    .meta-row {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 8px;
      margin-bottom: 2px;
    }
    
    .meta-label {
      font-weight: 600;
      text-align: left;
    }
    
    .meta-value {
      text-align: left;
    }
    
    /* TABLE STYLING */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11px;
    }
    
    th {
      background-color: #E8F5E9;
      color: #1B1B1B;
      padding: 9px 5px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #1A936F;
    }
    
    th.center, td.center {
      text-align: center;
    }
    
    td {
      padding: 8px 5px;
      border: 1px solid #D1D5DB;
    }
    
    tr:nth-child(even) {
      background-color: #FAFAFA;
    }
    
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 9px;
      font-weight: 600;
    }
    
    .badge-hadir {
      background: #D1FAE5;
      color: #047857;
    }
    
    .badge-sakit, .badge-izin {
      background: #FDE68A;
      color: #B45309;
    }
    
    .badge-alfa {
      background: #FEE2E2;
      color: #991B1B;
    }
    
    .nilai-excellent {
      color: #1A936F;
      font-weight: 700;
    }
    
    .nilai-good {
      color: #F7C873;
      font-weight: 700;
    }
    
    .nilai-fair {
      color: #D97706;
      font-weight: 700;
    }
    
    /* FOOTER SUMMARY */
    .footer-summary {
      margin-top: 8px;
      margin-bottom: 25px;
      font-size: 12px;
      font-weight: 600;
    }
    
    /* SIGNATURE SECTION - Right Aligned Only */
    .signature-section {
      margin-top: 35px;
      text-align: right;
      padding-right: 15px;
    }
    
    .signature-date {
      font-size: 12px;
      margin-bottom: 25px;
      font-weight: normal;
    }
    
    .signature-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 75px;
    }
    
    .signature-image {
      max-width: 120px;
      max-height: 60px;
      margin-bottom: 5px;
      display: block;
      margin-left: auto;
    }
    
    .signature-name {
      font-size: 12px;
      font-weight: 600;
      margin-top: 0;
    }
    
    .button-print {
      background: #1A936F;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .button-print:hover {
      background: #047857;
    }
  </style>
</head>
<body>
  <button class="button-print no-print" onclick="window.print()">Cetak PDF</button>

  <div class="header">
    <div class="header-top">
      <div class="logo">
        <img src="/logo-man1.png" alt="Logo MAN 1" />
      </div>
      <div class="header-center">
        <div class="school-name">MADRASAH TAHFIDZ AL-QUR'AN</div>
        <div class="school-address">
          Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame<br>
          Kota Bandar Lampung, Lampung 35131
        </div>
      </div>
      <div class="logo">
        <img src="/logo-kemenag.png" alt="Logo Kemenag" />
      </div>
    </div>
    
    <div class="header-line">
      <div class="header-line-top"></div>
      <div class="header-line-bottom"></div>
    </div>
    
    <div class="report-title">${modeTitle}</div>
  </div>

  <div class="meta-section">
    <div class="meta-column">
      <div class="meta-row">
        <div class="meta-label">Periode:</div>
        <div class="meta-value">${periodeText}</div>
      </div>
      <div class="meta-row">
        <div class="meta-label">Tanggal Cetak:</div>
        <div class="meta-value">${now}</div>
      </div>
    </div>
    <div class="meta-column">
      <div class="meta-row">
        <div class="meta-label">Kelas:</div>
        <div class="meta-value">Tahfidz</div>
      </div>
      <div class="meta-row">
        <div class="meta-label">Guru Pembina:</div>
        <div class="meta-value">${guru.user.name}</div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>`;

  if (viewMode === 'harian') {
    html += `
        <th style="width: 5%;">No</th>
        <th style="width: 20%;">Nama Lengkap</th>
        <th class="center" style="width: 10%;">Tanggal</th>
        <th class="center" style="width: 10%;">Status Kehadiran</th>
        <th class="center" style="width: 8%;">Tajwid</th>
        <th class="center" style="width: 8%;">Kelancaran</th>
        <th class="center" style="width: 8%;">Makhraj</th>
        <th class="center" style="width: 8%;">Implementasi</th>
        <th class="center" style="width: 8%;">Status</th>
        <th style="width: 15%;">Catatan</th>`;
  } else {
    html += `
        <tr>
          <th colspan="2" style="background: #ECFDF5; border-bottom: 1px solid #A7F3D0; text-align: center; color: #047857; font-size: 10px; text-transform: none;">Informasi Siswa</th>
          <th colspan="4" style="background: #ECFDF5; border-bottom: 1px solid #A7F3D0; text-align: center; color: #047857; font-size: 10px; text-transform: none; border-left: 1px solid #A7F3D0; border-right: 1px solid #A7F3D0;">Rekap Kehadiran</th>
          <th colspan="8" style="background: #ECFDF5; border-bottom: 1px solid #A7F3D0; text-align: center; color: #047857; font-size: 10px; text-transform: none;">Capaian Hafalan & Nilai</th>
        </tr>
        <tr>
          <th style="width: 3%; background: #F9FAFB;">No</th>
          <th style="width: 15%; background: #F9FAFB;">Nama Lengkap</th>
          <th class="center" style="width: 4%; background: #F9FAFB; border-left: 1px solid #E5E7EB;">H</th>
          <th class="center" style="width: 4%; background: #F9FAFB;">I</th>
          <th class="center" style="width: 4%; background: #F9FAFB;">S</th>
          <th class="center" style="width: 4%; background: #F9FAFB; border-right: 1px solid #E5E7EB;">A</th>
          <th class="center" style="width: 6%; background: #F9FAFB;">Setoran</th>
          <th class="center" style="width: 9%; background: #F9FAFB;">Hafalan Terakhir</th>
          <th class="center" style="width: 7%; background: #F9FAFB;">Avg Tajwid</th>
          <th class="center" style="width: 7%; background: #F9FAFB;">Avg Lancar</th>
          <th class="center" style="width: 7%; background: #F9FAFB;">Avg Makhraj</th>
          <th class="center" style="width: 7%; background: #F9FAFB;">Avg Impl.</th>
          <th class="center" style="width: 12%; background: #ECFDF5; color: #047857;">Rata-rata Nilai</th>
          <th class="center" style="width: 8%; background: #F9FAFB;">Status</th>
        </tr>`;
  }

  html += `
      </tr>
    </thead>
    <tbody>`;

  data.forEach((siswa, idx) => {
    html += '<tr>';

    if (viewMode === 'harian') {
      const p = siswa.pertemuan;
      html += `<td>${idx + 1}</td>`;
      html += `<td>${siswa.namaLengkap}</td>`;
      html += `<td class="center">${p ? new Date(p.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}) : '-'}</td>`;
      html += `<td class="center">`;
      if (p) {
        const badgeClass = p.statusKehadiran === 'HADIR' ? 'badge-hadir' :
                          (p.statusKehadiran === 'SAKIT' || p.statusKehadiran === 'IZIN') ? 'badge-sakit' : 'badge-alfa';
        html += `<span class="badge ${badgeClass}">${p.statusKehadiran}</span>`;
      } else {
        html += '-';
      }
      html += `</td>`;
      html += `<td class="center ${getNilaiClass(p?.nilaiTajwid)}">${p?.nilaiTajwid || '-'}</td>`;
      html += `<td class="center ${getNilaiClass(p?.nilaiKelancaran)}">${p?.nilaiKelancaran || '-'}</td>`;
      html += `<td class="center ${getNilaiClass(p?.nilaiMakhraj)}">${p?.nilaiMakhraj || '-'}</td>`;
      html += `<td class="center ${getNilaiClass(p?.nilaiImplementasi)}">${p?.nilaiImplementasi || '-'}</td>`;
      html += `<td class="center">${p?.statusHafalan || '-'}</td>`;
      html += `<td style="font-size: 10px;">${p?.catatan || '-'}</td>`;
    } else {
      html += `<td>${siswa.no || (idx + 1)}</td>`;
      html += `<td>${siswa.namaLengkap}</td>`;
      html += `<td class="center" style="border-left: 1px solid #F3F4F6;">${siswa.hadir || 0}</td>`;
      html += `<td class="center">${siswa.izin || 0}</td>`;
      html += `<td class="center">${siswa.sakit || 0}</td>`;
      html += `<td class="center" style="border-right: 1px solid #F3F4F6;">${siswa.alfa || 0}</td>`;
      html += `<td class="center" style="font-weight: 600;">${siswa.jumlahSetoran || 0}</td>`;
      html += `<td class="center" style="font-size: 9px; color: #4B5563;">${siswa.hafalanTerakhir || '-'}</td>`;
      html += `<td class="center">${formatNilai(siswa.rataRataTajwid)}</td>`;
      html += `<td class="center">${formatNilai(siswa.rataRataKelancaran)}</td>`;
      html += `<td class="center">${formatNilai(siswa.rataRataMakhraj)}</td>`;
      html += `<td class="center">${formatNilai(siswa.rataRataImplementasi)}</td>`;
      html += `<td class="center" style="background: #ECFDF5; font-weight: bold; color: #1B1B1B;">${formatNilai(siswa.rataRataNilaiBulanan)}</td>`;
      html += `<td class="center" style="font-size: 9px;">${siswa.statusHafalan}</td>`;
    }

    html += '</tr>';
  });

  html += `
    </tbody>
  </table>

  <div class="footer-summary">
    <strong>Total Siswa:</strong> ${data.length}
  </div>

  <div class="signature-section">
    <div class="signature-date">Bandar Lampung, ${now}</div>
    <div class="signature-title">Guru Pembina Tahfidz</div>
    ${signatureUrl ? `<img src="${signatureUrl}" alt="Tanda Tangan" class="signature-image" />` : ''}
    <div class="signature-name">( ${guru.user.name} )</div>
  </div>
</body>
</html>`;

  return html;
}

// Helper function to get CSS class for nilai
function getNilaiClass(nilai) {
  if (!nilai) return '';
  if (nilai >= 90) return 'nilai-excellent';
  if (nilai >= 80) return 'nilai-good';
  return 'nilai-fair';
}

// Helper function untuk format angka (bulat jika tidak pecahan, koma jika pecahan)
function formatNilai(nilai) {
  if (nilai == null || nilai === '-') return '-';
  if (typeof nilai === 'string') return nilai; // Already formatted
  const rounded = Math.round(nilai);
  // Jika nilai sama dengan nilai bulatannya, tampilkan bulat
  if (Math.abs(nilai - rounded) < 0.01) {
    return rounded.toString();
  }
  // Jika ada pecahan, tampilkan dengan 1 desimal
  return nilai.toFixed(1);
}

// Helper function untuk hitung rata-rata
function hitungRataRata(tajwid, kelancaran, makhraj, implementasi) {
  const values = [tajwid, kelancaran, makhraj, implementasi].filter(v => v != null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
