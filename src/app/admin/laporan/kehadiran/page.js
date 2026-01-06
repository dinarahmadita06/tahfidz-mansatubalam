'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import { FileText, Download, Loader, AlertTriangle, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Import logos as data URLs
const logoMan1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const logoKemenag = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function LaporanKehadiranPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [filterType, setFilterType] = useState('range'); // 'range', 'bulanan', 'semester'
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await fetch('/api/kelas');
      if (res.ok) {
        const data = await res.json();
        setKelasList(data);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const handleGenerateReport = async () => {
    let startDate, endDate;

    if (filterType === 'semester') {
      if (!selectedKelas || !semester) {
        alert('Mohon lengkapi semua filter (kelas dan semester)');
        return;
      }
      const year = new Date().getFullYear();
      if (semester === '1') {
        // Semester 1: Juli - Desember
        startDate = new Date(year, 6, 1).toISOString().split('T')[0];
        endDate = new Date(year, 11, 31).toISOString().split('T')[0];
      } else {
        // Semester 2: Januari - Juni
        startDate = new Date(year, 0, 1).toISOString().split('T')[0];
        endDate = new Date(year, 5, 30).toISOString().split('T')[0];
      }
    } else if (filterType === 'bulanan') {
      if (!selectedKelas || !bulan || !tahun) {
        alert('Mohon lengkapi semua filter (kelas, bulan, tahun)');
        return;
      }
      const monthNum = parseInt(bulan);
      const yearNum = parseInt(tahun);
      startDate = new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0];
      endDate = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];
    } else {
      if (!selectedKelas || !tanggalMulai || !tanggalSelesai) {
        alert('Mohon lengkapi semua filter');
        return;
      }
      if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
        alert('Tanggal mulai tidak boleh lebih dari tanggal selesai');
        return;
      }
      startDate = tanggalMulai;
      endDate = tanggalSelesai;
    }

    setLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams({
        kelasId: selectedKelas,
        tanggalMulai: startDate,
        tanggalSelesai: endDate,
      });
      const res = await fetch(`/api/admin/laporan/kehadiran?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal membuat laporan');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Terjadi kesalahan saat membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!reportData) return;

    try {
      // Fetch admin profile data for signature names
      let adminData = { nama: 'Admin', jabatan: 'Koordinator Tahfidz' };
      try {
        const profileRes = await fetch('/api/admin/profile');
        if (profileRes.ok) {
          const profileResponse = await profileRes.json();
          if (profileResponse.profile) {
            adminData = {
              nama: profileResponse.profile.nama,
              jabatan: profileResponse.profile.jabatan
            };
          }
        }
      } catch (profileError) {
        console.error('Error fetching admin profile:', profileError);
        // Continue with default values
      }

      // Fetch logos as base64
      const logoMan1Data = await fetch('/logo-man1.png')
        .then(res => res.blob())
        .then(blob => new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }))
        .catch(() => null);

      const logoKemenagData = await fetch('/logo-kemenag.png')
        .then(res => res.blob())
        .then(blob => new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }))
        .catch(() => null);

      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header with logos
      const logoSize = 15;
      const logoY = 8;
      
      // Left logo (MAN 1)
      if (logoMan1Data) {
        doc.addImage(logoMan1Data, 'PNG', 10, logoY, logoSize, logoSize);
      }
      
      // Right logo (Kemenag)
      if (logoKemenagData) {
        doc.addImage(logoKemenagData, 'PNG', pageWidth - 10 - logoSize, logoY, logoSize, logoSize);
      }

      // Kop Surat - Professional Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MAN 1 BANDAR LAMPUNG', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame', pageWidth / 2, 27, { align: 'center' });
      doc.text('Kota Bandar Lampung, Lampung 35131', pageWidth / 2, 32, { align: 'center' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(10, 35, pageWidth - 10, 35);
      doc.setLineWidth(0.2);
      doc.line(10, 36, pageWidth - 10, 36);

      // Document title
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN REKAP KEHADIRAN DAN PENILAIAN HAFALAN', pageWidth / 2, 45, { align: 'center' });

      // Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Periode: ${reportData.periodeText}`, 14, 54);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 59);
      doc.text(`Kelas: ${reportData.kelasNama}`, 14, 64);

      // Start table position
      let yPos = 72;

      // Table with attendance and assessment data
      const tableData = reportData.siswaData.map((s, idx) => [
        idx + 1,
        s.nama,
        s.hadir || 0,
        s.sakit || 0,
        s.izin || 0,
        s.alpa || 0,
        s.tajwid ?? '-',
        s.kelancaran ?? '-',
        s.makhraj ?? '-',
        s.implementasi ?? '-',
        s.totalNilai ?? '-'
      ]);

      // Calculate balanced column widths for landscape A4 (297mm width)
      // Available width = 297 - (left margin + right margin) = 297 - 28 = 269mm
      const availableWidth = pageWidth - 28;
      const columnWidths = {
        no: availableWidth * 0.05,           // 5% - ~13.5mm
        nama: availableWidth * 0.25,         // 25% - ~67mm
        hadir: availableWidth * 0.07,        // 7% - ~19mm
        sakit: availableWidth * 0.07,        // 7% - ~19mm
        izin: availableWidth * 0.07,         // 7% - ~19mm
        alpa: availableWidth * 0.07,         // 7% - ~19mm
        tajwid: availableWidth * 0.08,       // 8% - ~21.5mm
        kelancaran: availableWidth * 0.10,   // 10% - ~27mm
        makhraj: availableWidth * 0.08,      // 8% - ~21.5mm
        implementasi: availableWidth * 0.10, // 10% - ~27mm
        total: availableWidth * 0.06         // 6% - ~16mm
      };

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Tajwid', 'Kelancaran', 'Makhraj', 'Implementasi', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 201, 141],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 8,
          halign: 'center',
          valign: 'middle'
        },
        margin: { left: 14, right: 14, bottom: 70 },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: columnWidths.no, halign: 'center' },
          1: { cellWidth: columnWidths.nama, halign: 'left' },
          2: { cellWidth: columnWidths.hadir },
          3: { cellWidth: columnWidths.sakit },
          4: { cellWidth: columnWidths.izin },
          5: { cellWidth: columnWidths.alpa },
          6: { cellWidth: columnWidths.tajwid },
          7: { cellWidth: columnWidths.kelancaran },
          8: { cellWidth: columnWidths.makhraj },
          9: { cellWidth: columnWidths.implementasi },
          10: { cellWidth: columnWidths.total }
        }
      });

      // Signature section - Simple 2-column layout (left-right, not centered)
      const tableEndY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 100;

      // Check if there's enough space for signature, otherwise add new page
      let signatureY = tableEndY + 15;
      if (signatureY + 60 > pageHeight - 15) {
        doc.addPage();
        signatureY = 20;
      }

      // 2-COLUMN LAYOUT FOR SIGNATURE SECTION - FULLY ALIGNED
      // Row 1: Mengetahui, | Bandar Lampung, date
      // Row 2: Guru Tahfidz | Koordinator Tahfidz
      // Row 3: [TTD Guru] | [TTD Admin] (SAME Y POSITION)
      // Row 4: (Guru Tahfidz) | (Administrator) (SAME Y POSITION)
      
      const colWidth = (pageWidth - 28) / 2; // Two equal columns
      const leftColX = 14;                    // Left column at 14
      const rightColX = 14 + colWidth + 4;  // Right column starts after left col
      const colCenterX1 = leftColX + colWidth / 2;   // Left column center
      const colCenterX2 = rightColX + colWidth / 2;  // Right column center
      const sigImageMaxWidth = 38;
      const sigImageMaxHeight = 24;

      let currentY = signatureY;
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // ROW 1: Mengetahui, | Bandar Lampung, date
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Mengetahui,', colCenterX1, currentY, { align: 'center' });
      doc.text(`Bandar Lampung, ${today}`, colCenterX2, currentY, { align: 'center' });
      currentY += 8;

      // ROW 2: Guru Tahfidz | Koordinator Tahfidz
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Guru Tahfidz', colCenterX1, currentY, { align: 'center' });
      doc.text(adminData.jabatan, colCenterX2, currentY, { align: 'center' });
      currentY += 8;

      // ROW 3: [TTD Guru] | [TTD Admin] - BOTH AT SAME Y
      let sigY = currentY;

      // LEFT: Guru Tahfidz Signature (centered in left column)
      try {
        const guruRes = await fetch('/api/admin/signature-upload?type=guru');
        if (guruRes.ok) {
          const guruData = await guruRes.json();
          if (guruData.signature && guruData.signature.data) {
            // Center signature horizontally in left column
            const sigXLeft = colCenterX1 - sigImageMaxWidth / 2;
            doc.addImage(
              guruData.signature.data,
              'PNG',
              sigXLeft,
              sigY,
              sigImageMaxWidth,
              sigImageMaxHeight,
              undefined,
              'FAST'
            );
          } else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text('TTD belum diupload', colCenterX1, sigY + 12, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(150, 150, 150);
          doc.text('TTD belum diupload', colCenterX1, sigY + 12, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } catch (err) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('TTD belum diupload', colCenterX1, sigY + 12, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      // RIGHT: Koordinator Tahfidz Signature (at rightColX, centered in col)
      try {
        const koordinatorRes = await fetch('/api/admin/signature-upload?type=koordinator');
        if (koordinatorRes.ok) {
          const koordinatorData = await koordinatorRes.json();
          if (koordinatorData.signature && koordinatorData.signature.data) {
            // Position signature centered in right column
            const sigXRight = colCenterX2 - sigImageMaxWidth / 2;
            doc.addImage(
              koordinatorData.signature.data,
              'PNG',
              sigXRight,
              sigY,
              sigImageMaxWidth,
              sigImageMaxHeight,
              undefined,
              'FAST'
            );
          } else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text('TTD belum diupload', colCenterX2, sigY + 12, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(150, 150, 150);
          doc.text('TTD belum diupload', colCenterX2, sigY + 12, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } catch (err) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('TTD belum diupload', colCenterX2, sigY + 12, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      sigY += sigImageMaxHeight + 6;

      // Names below signatures - centered in each column
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('( Guru Tahfidz )', colCenterX1, sigY, { align: 'center' });
      doc.text(`( ${adminData.nama} )`, colCenterX2, sigY, { align: 'center' });

      doc.save(`Laporan_Kehadiran_${reportData.kelasNama}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal export PDF. Silahkan coba lagi.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#F6FBEF] via-[#FBFDF6] to-white">
        {/* Header Card - SIMTAQ Baseline Style (identik Manajemen Siswa) */}
        <div className="px-6 lg:px-10 py-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 rounded-2xl shadow-lg shadow-emerald-200/40 p-8 ring-1 ring-emerald-200/30">
            {/* Soft overlay highlight */}
            <div className="absolute inset-0 bg-white/5 opacity-70 pointer-events-none"></div>
            
            {/* Decorative blur circles */}
            <div className="absolute top-0 -right-16 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-16 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-6">
              {/* Icon Container - SIMTAQ Style */}
              <div className="bg-white/15 border border-white/10 backdrop-blur-sm rounded-2xl p-4 flex-shrink-0">
                <BarChart3 size={32} className="text-white" />
              </div>
              
              {/* Header Content */}
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Laporan Kehadiran & Penilaian</h1>
                <p className="text-white/90 text-sm sm:text-base">Rekap terintegrasi kehadiran dan penilaian hafalan siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="px-6 lg:px-10 py-8">
          <div className="space-y-6">
          {/* Filter Card */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6 text-emerald-900">Filter Laporan</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Tipe Filter</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                >
                  <option value="range">Range Tanggal</option>
                  <option value="bulanan">Bulanan</option>
                  <option value="semester">Per Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Kelas <span className="text-rose-600">*</span></label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>
                  ))}
                </select>
              </div>

              {filterType === 'semester' && (
                <div>
                  <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                  >
                    <option value="">Pilih Semester</option>
                    <option value="1">Semester 1 (Juli - Desember)</option>
                    <option value="2">Semester 2 (Januari - Juni)</option>
                  </select>
                </div>
              )}

              {filterType === 'bulanan' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Bulan</label>
                    <select
                      value={bulan}
                      onChange={(e) => setBulan(e.target.value)}
                      className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                    >
                      <option value="">Pilih Bulan</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Tahun</label>
                    <select
                      value={tahun}
                      onChange={(e) => setTahun(e.target.value)}
                      className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year.toString()}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}

              {filterType === 'range' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full px-4 py-2.5 border border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 hover:bg-white/70 transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={handleGenerateReport}
                disabled={loading || !selectedKelas}
                className="flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-semibold text-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingIndicator inline text="Memproses..." size="small" />
                ) : (
                  <>
                    <FileText size={18} />
                    Tampilkan Laporan
                  </>
                )}
              </button>
              
              {/* Export PDF Button - Conditional Render */}
              {reportData && !loading && (
                <button
                  onClick={exportPDF}
                  className="flex items-center justify-center gap-2 h-11 px-5 border border-emerald-200 text-emerald-700 bg-white/60 rounded-xl font-semibold text-sm hover:bg-emerald-50 shadow-sm transition-all duration-200"
                >
                  <Download size={18} />
                  Export PDF
                </button>
              )}
            </div>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm p-12 text-center">
            <LoadingIndicator text="Memproses data laporan..." />
          </div>
        )}

        {/* Error State */}
        {!loading && reportData === null && selectedKelas && (
          <div className="bg-amber-50/70 backdrop-blur rounded-2xl border border-amber-200/60 shadow-sm p-6 flex items-start gap-4">
            <AlertTriangle className="flex-shrink-0 mt-1 text-amber-600" size={24} />
            <div>
              <h3 className="font-semibold text-amber-900">Perhatian</h3>
              <p className="text-sm mt-1 text-amber-800/80">
                Tidak ada data kehadiran untuk periode yang dipilih. Coba ubah filter atau periode tanggal.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!reportData && !loading && !selectedKelas && (
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-emerald-600" />
            <p className="text-emerald-700 text-sm">
              Pilih kelas dan klik &apos;Tampilkan Laporan&apos; untuk melihat laporan kehadiran
            </p>
          </div>
        )}

        {/* Report Preview */}
        {reportData && !loading && (
          <>
            {/* Detail Table */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-emerald-50/70 border-b border-emerald-100/50">
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase text-emerald-900 tracking-wide">No</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase text-emerald-900 tracking-wide">Nama Siswa</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Hadir</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Sakit</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Izin</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Alpa</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Tajwid</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Kelancaran</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Makhraj</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Implementasi</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase text-emerald-900 tracking-wide">Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.siswaData.map((siswa, idx) => (
                      <tr key={idx} className="border-b border-emerald-100/40 hover:bg-emerald-50/40 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{siswa.nama}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-emerald-600">{siswa.hadir || 0}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-rose-600">{siswa.sakit || 0}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-amber-600">{siswa.izin || 0}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-red-600">{siswa.alpa || 0}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.tajwid ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.kelancaran ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.makhraj ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">{siswa.implementasi ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-center font-semibold text-emerald-600">{siswa.totalNilai ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons - Removed from here */}
          </>
        )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
