/**
 * TASMI RECAP PDF GENERATOR
 * Menggunakan MASTER TEMPLATE untuk konsistensi dengan laporan lain
 */
import { generateReportPDF } from '@/lib/utils/pdfMasterTemplate';

/**
 * Generate Laporan Rekap Hasil Ujian Tasmi Al-Qur'an (LANDSCAPE)
 * @param {Object} data - Data rekap tasmi
 * @returns {Promise<void>} Download PDF
 */
export async function generateTasmiRecapPDF(data) {
  // Prepare metadata (2 kolom)
  const metaLeft = [
    { label: 'Periode', value: data.periodeText },
    { label: 'Tanggal Cetak', value: data.printDate },
  ];

  const metaRight = [
    { label: 'Kelas', value: data.kelasName },
    { label: 'Guru Penguji', value: data.guruName },
  ];

  // Prepare table header & body
  const tableHead = [
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

  const tableBody = data.tableData.map((item) => [
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

  // Column widths proportional calculation
  const contentWidth = 257; // 297mm - 2*20mm margin
  const colProportions = [4, 18, 10, 6, 18, 10, 8, 8, 10, 10, 8];
  const totalProportion = colProportions.reduce((a, b) => a + b, 0);
  const colWidths = colProportions.map(prop => (contentWidth * prop) / totalProportion);

  const columnStyles = {
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
  };

  // Summary data
  const summary = {
    label1: 'Total Peserta:',
    value1: data.totalPeserta.toString(),
    label2: 'Rata-rata Nilai:',
    value2: data.rataRata,
  };

  // Footer signature
  const footerSignature = {
    printDate: data.printDate,
    jabatan: 'Guru Tahfidz',
    guruName: data.guruName,
  };

  // Generate PDF menggunakan MASTER TEMPLATE
  await generateReportPDF({
    title: 'LAPORAN REKAP HASIL UJIAN TASMI\' AL-QUR\'AN',
    metaLeft,
    metaRight,
    tableHead,
    tableBody,
    columnStyles,
    summary,
    footerSignature,
    filename: `Rekap_Tasmi_${new Date().getTime()}.pdf`,
    headerColor: [0, 102, 51], // Hijau SIMTAQ
  });
}
