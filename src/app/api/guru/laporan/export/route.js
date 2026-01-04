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

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
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
        csv += `"${siswa.pertemuan.catatan}"\n`;
      } else {
        csv += `${idx + 1},"${siswa.namaLengkap}",-,-,-,-,-,-,-,-\n`;
      }
    });
  } else {
    // Header for bulanan/semesteran
    csv += 'No,Nama Lengkap,Total Hadir,Total Tidak Hadir,Rata-rata Tajwid,Rata-rata Kelancaran,Rata-rata Makhraj,Rata-rata Implementasi,Rata-rata Nilai,Status Hafalan,Catatan Akhir\n';

    // Rows
    data.forEach((siswa, idx) => {
      const rataRataNilai = hitungRataRata(
        siswa.rataRataTajwid,
        siswa.rataRataKelancaran,
        siswa.rataRataMakhraj,
        siswa.rataRataImplementasi
      );

      csv += `${idx + 1},"${siswa.namaLengkap}",`;
      csv += `${siswa.totalHadir},`;
      csv += `${siswa.totalTidakHadir},`;
      csv += `${formatNilai(siswa.rataRataTajwid)},`;
      csv += `${formatNilai(siswa.rataRataKelancaran)},`;
      csv += `${formatNilai(siswa.rataRataMakhraj)},`;
      csv += `${formatNilai(siswa.rataRataImplementasi)},`;
      csv += `${formatNilai(rataRataNilai)},`;
      csv += `"${siswa.statusHafalan}",`;
      csv += `"${siswa.catatanAkhir}"\n`;
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
  if (viewMode === 'harian') modeTitle = 'Laporan Harian/Mingguan';
  else if (viewMode === 'bulanan') modeTitle = 'Laporan Rekap Bulanan';
  else modeTitle = 'Laporan Rekap Semesteran';

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${modeTitle} - ${now}</title>
  <style>
    @page { size: landscape; margin: 1cm; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      color: #1B1B1B;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #1A936F;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #1A936F;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header h2 {
      color: #444444;
      margin: 0;
      font-size: 18px;
      font-weight: normal;
    }
    .meta-info {
      margin-bottom: 20px;
      font-size: 12px;
      color: #6B7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }
    th {
      background: linear-gradient(135deg, #1A936F 0%, #059669 100%);
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #1A936F;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      padding: 10px 8px;
      border: 1px solid #E5E7EB;
    }
    tr:nth-child(even) {
      background-color: #F9FAFB;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 10px;
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
    .footer {
      margin-top: 40px;
      text-align: right;
      font-size: 12px;
    }
    .signature {
      margin-top: 60px;
      text-align: right;
    }
    .signature-line {
      border-top: 1px solid #1B1B1B;
      width: 200px;
      display: inline-block;
      margin-top: 50px;
    }
    .button-print {
      background: #1A936F;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .button-print:hover {
      background: #047857;
    }
  </style>
</head>
<body>
  <button class="button-print no-print" onclick="window.print()">Cetak PDF</button>

  <div class="header">
    <h1>TAHFIDZ QURAN - MAN SATU BALAM</h1>
    <h2>${modeTitle}</h2>
  </div>

  <div class="meta-info">
    <strong>Guru:</strong> ${guru.user.name} |
    <strong>Periode:</strong> ${periode.replace('-', ' ').toUpperCase()} |
    <strong>Tanggal Cetak:</strong> ${now}
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
        <th style="width: 5%;">No</th>
        <th style="width: 22%;">Nama Lengkap</th>
        <th class="center" style="width: 7%;">Hadir</th>
        <th class="center" style="width: 7%;">Tidak Hadir</th>
        <th class="center" style="width: 7%;">Avg Tajwid</th>
        <th class="center" style="width: 7%;">Avg Kelancaran</th>
        <th class="center" style="width: 7%;">Avg Makhraj</th>
        <th class="center" style="width: 7%;">Avg Impl.</th>
        <th class="center" style="width: 8%; background: #ECFDF5;">Rata-rata Nilai</th>
        <th class="center" style="width: 7%;">Status</th>
        <th style="width: 12%;">Catatan</th>`;
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
      const rataRataNilai = hitungRataRata(
        siswa.rataRataTajwid,
        siswa.rataRataKelancaran,
        siswa.rataRataMakhraj,
        siswa.rataRataImplementasi
      );

      html += `<td>${idx + 1}</td>`;
      html += `<td>${siswa.namaLengkap}</td>`;
      html += `<td class="center" style="color: #1A936F; font-weight: 700;">${siswa.totalHadir}</td>`;
      html += `<td class="center" style="color: #D97706; font-weight: 700;">${siswa.totalTidakHadir}</td>`;
      html += `<td class="center ${getNilaiClass(siswa.rataRataTajwid)}">${formatNilai(siswa.rataRataTajwid)}</td>`;
      html += `<td class="center ${getNilaiClass(siswa.rataRataKelancaran)}">${formatNilai(siswa.rataRataKelancaran)}</td>`;
      html += `<td class="center ${getNilaiClass(siswa.rataRataMakhraj)}">${formatNilai(siswa.rataRataMakhraj)}</td>`;
      html += `<td class="center ${getNilaiClass(siswa.rataRataImplementasi)}">${formatNilai(siswa.rataRataImplementasi)}</td>`;
      html += `<td class="center ${getNilaiClass(rataRataNilai)}" style="background: #ECFDF5; font-weight: 700;">${formatNilai(rataRataNilai)}</td>`;
      html += `<td class="center">${siswa.statusHafalan}</td>`;
      html += `<td style="font-size: 10px;">${siswa.catatanAkhir}</td>`;
    }

    html += '</tr>';
  });

  html += `
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Total Siswa:</strong> ${data.length}</p>
  </div>

  <div class="signature">
    <p style="margin-bottom: 8px;">Bandar Lampung, ${now}</p>
    <p style="margin-bottom: 60px; font-weight: 600;">Guru Pembina Tahfidz</p>
    <div class="signature-line"></div>
    <p style="margin-top: 5px; font-weight: 600;">( ${guru.user.name} )</p>
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
  if (nilai == null) return '-';
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
