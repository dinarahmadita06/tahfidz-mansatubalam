'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader, AlertTriangle, Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function LaporanHafalanPage() {
  const [kelas, setKelas] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    kelasId: '',
    siswaId: '',
    periode: 'bulanan',
    tanggalMulai: '',
    tanggalSelesai: ''
  });

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    if (filters.kelasId) {
      fetchSiswaByKelas(filters.kelasId);
    } else {
      setSiswaList([]);
      setFilters(prev => ({ ...prev, siswaId: '' }));
    }
  }, [filters.kelasId]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchSiswaByKelas = async (kelasId) => {
    if (!kelasId || kelasId.trim() === '') {
      console.warn('Invalid kelasId provided to fetchSiswaByKelas');
      setSiswaList([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/siswa?kelasId=${encodeURIComponent(kelasId)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch siswa`);
      }
      const data = await response.json();
      setSiswaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswaList([]);
    }
  };

  const calculateDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (filters.periode) {
      case 'mingguan':
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        break;
      case 'bulanan':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'semester1':
        startDate = new Date(today.getFullYear(), 6, 1); // Juli
        endDate = new Date(today.getFullYear(), 11, 31); // Desember
        break;
      case 'semester2':
        startDate = new Date(today.getFullYear(), 0, 1); // Januari
        endDate = new Date(today.getFullYear(), 5, 30); // Juni
        break;
      case 'tahunan':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        startDate = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
        endDate = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  const handleGeneratePreview = async () => {
    if (!filters.kelasId || filters.kelasId.trim() === '') {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    const { startDate, endDate } = calculateDateRange();

    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Periode tanggal tidak valid');
      return;
    }

    // Warning for large data
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (!filters.siswaId && daysDiff > 365) {
      if (!confirm('Periode lebih dari 1 tahun untuk semua siswa. Data mungkin terlalu besar. Lanjutkan?')) {
        return;
      }
    }

    setLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams({
        kelasId: filters.kelasId,
        tanggalMulai: startDate.toISOString(),
        tanggalSelesai: endDate.toISOString()
      });

      if (filters.siswaId && filters.siswaId.trim() !== '') {
        params.append('siswaId', filters.siswaId);
      }

      const response = await fetch(`/api/admin/laporan/hafalan?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch report data`);
      }
      
      const data = await response.json();

      if (!data || (!data.hafalan && !data.siswaData)) {
        alert('Tidak ada data hafalan di periode ini');
        setReportData(null);
        return;
      }
      
      if ((Array.isArray(data.hafalan) && data.hafalan.length === 0) || 
          (Array.isArray(data.siswaData) && data.siswaData.length === 0)) {
        alert('Tidak ada data hafalan di periode ini');
        setReportData(null);
        return;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Gagal generate laporan: ${error.message}`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper to add image to PDF
    const addSignatureImage = async (url, x, y, width, height) => {
      try {
        if (!url) return false;
        
        // Make sure URL is absolute for server-side fetch
        let absoluteUrl = url;
        if (url.startsWith('/')) {
          // Convert relative URL to absolute
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          absoluteUrl = `${baseUrl}${url}`;
        }
        
        // Fetch image as blob and convert to data URL to avoid CORS/loading issues in jsPDF
        const response = await fetch(absoluteUrl);
        if (!response.ok) {
          console.error('Failed to fetch signature image:', response.status, response.statusText);
          return false;
        }
        const blob = await response.blob();
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, 'PNG', x, y, width, height);
        return true;
      } catch (err) {
        console.error('Failed to add signature image:', err);
        return false;
      }
    };

    // Kop Surat - Professional Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MAN 1 BANDAR LAMPUNG', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame', pageWidth / 2, 22, { align: 'center' });
    doc.text('Kota Bandar Lampung, Lampung 35131', pageWidth / 2, 27, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);
    doc.setLineWidth(0.2);
    doc.line(14, 31, pageWidth - 14, 31);

    // Document title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN HAFALAN TAHFIDZ AL-QUR\'AN', pageWidth / 2, 40, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${reportData.periodeText}`, 14, 50);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 55);
    doc.text(`Kelas: ${reportData.kelasNama}`, 14, 60);

    // Summary
    let yPos = 70;
    if (reportData.type === 'kelas') {
      doc.setFont('helvetica', 'bold');
      doc.text('RINGKASAN:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
      doc.text(`Jumlah Siswa: ${reportData.summary.jumlahSiswa}`, 14, yPos);
      yPos += 5;
      doc.text(`Rata-rata Hafalan: ${reportData.summary.rataHafalan} juz`, 14, yPos);
      yPos += 5;
      doc.text(`Rata-rata Nilai: ${reportData.summary.rataNilai}`, 14, yPos);
      yPos += 5;
      doc.text(`Total Setoran: ${reportData.summary.totalSetoran} kali`, 14, yPos);
      yPos += 10;

      // Table
      const tableData = reportData.siswaData.map((s, idx) => [
        idx + 1,
        s.nama,
        s.nisn,
        `${s.totalJuz} juz`,
        `${s.jumlahSetoran}x`,
        s.nilaiRata,
        s.statusTarget
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Nama Siswa', 'NISN', 'Total Hafalan', 'Setoran', 'Nilai', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 9 },
        margin: { bottom: 60 }
      });
    } else {
      // Per siswa
      doc.setFont('helvetica', 'bold');
      doc.text('DATA SISWA:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
      doc.text(`Nama: ${reportData.siswa.nama}`, 14, yPos);
      yPos += 5;
      doc.text(`NISN: ${reportData.siswa.nisn}`, 14, yPos);
      yPos += 5;
      doc.text(`Total Hafalan: ${reportData.siswa.totalJuz} juz`, 14, yPos);
      yPos += 5;
      doc.text(`Jumlah Setoran: ${reportData.siswa.jumlahSetoran} kali`, 14, yPos);
      yPos += 5;
      doc.text(`Nilai Rata-rata: ${reportData.siswa.nilaiRata}`, 14, yPos);
      yPos += 10;

      // Table detail setoran
      const tableData = reportData.hafalan.map((h, idx) => [
        idx + 1,
        new Date(h.tanggal).toLocaleDateString('id-ID'),
        h.surah.namaLatin,
        `${h.ayatMulai}-${h.ayatSelesai}`,
        h.juz,
        h.nilaiAkhir || '-',
        h.status,
        h.catatan || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Tanggal', 'Surah', 'Ayat', 'Juz', 'Nilai', 'Status', 'Catatan']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 8 },
        margin: { bottom: 60 }
      });
    }

    // Signature section - Dynamic positioning following table
    const tableEndY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 100;

    // Check if there's enough space for signature, otherwise add new page
    let signatureY = tableEndY + 15;
    if (signatureY + 45 > pageHeight - 20) {
      doc.addPage();
      signatureY = 20;
    }

    // Date and location
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Bandar Lampung, ${today}`, pageWidth - 14, signatureY, { align: 'right' });

    signatureY += 10;

    // Left signature (Guru Tahfidz)
    doc.text('Mengetahui,', 14, signatureY);
    doc.text(reportData.teacher?.jabatan || 'Guru Tahfidz', 14, signatureY + 5);
    
    // Attempt to add teacher signature image
    const teacherTtdAdded = await addSignatureImage(reportData.teacher?.ttdUrl, 14, signatureY + 7, 30, 15);
    
    if (!teacherTtdAdded) {
      toast.error(`TTD guru ${reportData.teacher?.nama || ''} belum diupload, laporan akan menggunakan placeholder.`, { duration: 4000 });
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('(TTD belum diupload)', 14, signatureY + 15);
      doc.setTextColor(0);
      doc.setFontSize(10);
    }

    doc.text(`(${reportData.teacher?.nama || '_____________________'})`, 14, signatureY + 28);

    // Right signature (Admin/Koordinator)
    doc.text('Koordinator Tahfidz,', pageWidth - 14, signatureY, { align: 'right' });
    doc.text(reportData.admin?.jabatan || 'Koordinator Tahfidz', pageWidth - 14, signatureY + 5, { align: 'right' });

    // Attempt to add admin signature image
    const adminTtdAdded = await addSignatureImage(reportData.admin?.ttdUrl, pageWidth - 44, signatureY + 7, 30, 15);
    
    if (!adminTtdAdded) {
      toast.error(`TTD admin ${reportData.admin?.nama || ''} belum diupload.`, { duration: 4000 });
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('(TTD belum diupload)', pageWidth - 14, signatureY + 15, { align: 'right' });
      doc.setTextColor(0);
      doc.setFontSize(10);
    }

    doc.text(`(${reportData.admin?.nama || '_____________________'})`, pageWidth - 14, signatureY + 28, { align: 'right' });

    doc.save(`Laporan_Hafalan_${reportData.kelasNama}_${new Date().getTime()}.pdf`);
  };

  const exportExcel = () => {
    if (!reportData) return;

    let worksheetData;
    let filename;

    if (reportData.type === 'kelas') {
      worksheetData = [
        ['LAPORAN HAFALAN TAHFIDZ AL-QURAN'],
        ['MAN 1 BANDAR LAMPUNG'],
        [],
        ['Periode:', reportData.periodeText],
        ['Kelas:', reportData.kelasNama],
        ['Tanggal Cetak:', new Date().toLocaleDateString('id-ID')],
        [],
        ['RINGKASAN'],
        ['Jumlah Siswa:', reportData.summary.jumlahSiswa],
        ['Rata-rata Hafalan:', `${reportData.summary.rataHafalan} juz`],
        ['Rata-rata Nilai:', reportData.summary.rataNilai],
        ['Total Setoran:', `${reportData.summary.totalSetoran} kali`],
        [],
        ['No', 'Nama Siswa', 'NISN', 'Total Hafalan', 'Setoran', 'Nilai', 'Status'],
        ...reportData.siswaData.map((s, idx) => [
          idx + 1,
          s.nama,
          s.nisn,
          `${s.totalJuz} juz`,
          `${s.jumlahSetoran}x`,
          s.nilaiRata,
          s.statusTarget
        ])
      ];
      filename = `Laporan_Hafalan_${reportData.kelasNama}`;
    } else {
      worksheetData = [
        ['LAPORAN HAFALAN TAHFIDZ AL-QURAN'],
        ['MAN 1 BANDAR LAMPUNG'],
        [],
        ['Periode:', reportData.periodeText],
        ['Nama:', reportData.siswa.nama],
        ['NISN:', reportData.siswa.nisn],
        ['Kelas:', reportData.kelasNama],
        ['Total Hafalan:', `${reportData.siswa.totalJuz} juz`],
        ['Jumlah Setoran:', `${reportData.siswa.jumlahSetoran} kali`],
        ['Nilai Rata-rata:', reportData.siswa.nilaiRata],
        [],
        ['No', 'Tanggal', 'Surah', 'Ayat', 'Juz', 'Nilai', 'Status', 'Catatan'],
        ...reportData.hafalan.map((h, idx) => [
          idx + 1,
          new Date(h.tanggal).toLocaleDateString('id-ID'),
          h.surah.namaLatin,
          `${h.ayatMulai}-${h.ayatSelesai}`,
          h.juz,
          h.nilaiAkhir || '-',
          h.status,
          h.catatan || '-'
        ])
      ];
      filename = `Laporan_Hafalan_${reportData.siswa.nama}`;
    }

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Hafalan');
    XLSX.writeFile(wb, `${filename}_${new Date().getTime()}.xlsx`);
  };

  return (
    <AdminLayout>
      <style jsx>{`
        .filter-card {
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          border: 1px solid #E6F4EF;
        }
        .filter-card:hover {
          border-color: #00C98D;
        }
        .preview-empty {
          background: #F3FCF8;
          border-radius: 16px;
          padding: 32px;
        }
        .select-input {
          height: 48px;
          border: 1px solid #DDE6E1;
          border-radius: 12px;
          background: white;
          color: #2F3E3A;
          transition: border-color 0.2s ease;
        }
        .select-input:hover {
          border-color: #00C98D;
        }
        .select-input:focus {
          border-color: #00C98D;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 201, 141, 0.3);
        }
        .btn-primary {
          background: linear-gradient(90deg, #00C98D, #00B77E);
          color: white;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #00B77E;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 201, 141, 0.3);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Mobile Responsive Padding */
        .laporan-header {
          padding: 48px;
          margin-bottom: 24px;
        }
        
        .laporan-container {
          padding: 0 48px 48px 48px;
        }
        
        @media (max-width: 768px) {
          .laporan-header {
            padding: 24px 16px 20px 16px;
            margin-bottom: 16px;
          }
          
          .laporan-container {
            padding: 0 16px 24px 16px;
          }
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FEFFD9 0%, #F7FFE5 40%, #F5FBEF 100%)'
      }}>
        {/* Header Card - SIMTAQ Baseline Style */}
        <div className="px-6 lg:px-10 py-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 rounded-2xl shadow-lg shadow-emerald-200/40 p-8 ring-1 ring-emerald-200/30">
            {/* Soft overlay highlight */}
            <div className="absolute inset-0 bg-white/5 opacity-70 pointer-events-none"></div>
            
            {/* Decorative blur circles */}
            <div className="absolute top-0 -right-16 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-16 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-4 sm:gap-6">
              {/* Icon Container - SIMTAQ Style */}
              <div className="bg-white/15 border border-white/10 backdrop-blur-sm rounded-2xl w-14 h-14 sm:w-auto sm:h-auto p-0 sm:p-4 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={28} className="text-white sm:w-8 sm:h-8" />
              </div>
              
              {/* Header Content */}
              <div className="flex-1 flex flex-col justify-center text-left">
                <h1 className="text-xl sm:text-4xl font-bold text-white leading-tight mb-1 sm:mb-2">Laporan Hafalan</h1>
                <p className="text-white/90 text-sm sm:text-base leading-snug">Generate dan unduh laporan hafalan siswa secara terperinci</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="px-6 lg:px-10 pb-8">
          {/* Filter Card */}
          <div className="filter-card p-8 mb-8">
            <h2 className="text-xl font-bold mb-8" style={{ color: '#2F3E3A', fontWeight: 700, letterSpacing: '-0.3px' }}>Filter Laporan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Pilih Kelas <span style={{ color: '#F9844A' }}>*</span></label>
                <select
                  value={filters.kelasId}
                  onChange={(e) => setFilters({ ...filters, kelasId: e.target.value, siswaId: '' })}
                  className="select-input w-full px-4"
                >
                  <option value="">Pilih Kelas</option>
                  {kelas.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Pilih Siswa</label>
                <select
                  value={filters.siswaId}
                  onChange={(e) => setFilters({ ...filters, siswaId: e.target.value })}
                  disabled={!filters.kelasId}
                  className="select-input w-full px-4"
                  style={{ opacity: !filters.kelasId ? 0.5 : 1 }}
                >
                  <option value="">Semua Siswa</option>
                  {Array.isArray(siswaList) && siswaList.length > 0 && siswaList.map((s) => (
                    s && s.id && s.user && s.user.name ? (
                      <option key={s.id} value={s.id}>{s.user.name}</option>
                    ) : null
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Periode</label>
                <select
                  value={filters.periode}
                  onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                  className="select-input w-full px-4"
                >
                  <option value="bulanan">Bulanan</option>
                  <option value="semester1">Semester 1 (Juli - Desember)</option>
                  <option value="semester2">Semester 2 (Januari - Juni)</option>
                </select>
              </div>

              {filters.periode === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Dari Tanggal</label>
                    <input
                      type="date"
                      value={filters.tanggalMulai}
                      onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                      className="select-input w-full px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Sampai Tanggal</label>
                    <input
                      type="date"
                      value={filters.tanggalSelesai}
                      onChange={(e) => setFilters({ ...filters, tanggalSelesai: e.target.value })}
                      className="select-input w-full px-4"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGeneratePreview}
                disabled={loading || !filters.kelasId}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <LoadingIndicator inline text="Memproses..." size="small" />
                ) : (
                  <>
                    <FileText size={20} />
                    Generate Preview
                  </>
                )}
              </button>
            </div>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="filter-card p-12 text-center">
            <LoadingIndicator text="Memproses data laporan..." />
          </div>
        )}

        {/* Error State */}
        {!loading && reportData === null && filters.kelasId && (
          <div className="filter-card p-6 flex items-start gap-4" style={{ border: '1px solid #FED7AA', background: '#FEFCE8' }}>
            <AlertTriangle className="flex-shrink-0 mt-1" size={24} style={{ color: '#D97706' }} />
            <div>
              <h3 className="font-semibold" style={{ color: '#92400E' }}>Perhatian</h3>
              <p className="text-sm mt-1" style={{ color: '#B45309' }}>
                Tidak ada data hafalan untuk periode yang dipilih. Coba ubah filter atau periode tanggal.
              </p>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {reportData && !loading && (
          <>
            {/* Summary Cards */}
            {reportData.type === 'kelas' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="filter-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg" style={{ background: '#F3FCF8' }}>
                      <Users size={28} style={{ color: '#00C98D' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#6B7E75' }}>Jumlah Siswa</p>
                      <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.jumlahSiswa}</p>
                    </div>
                  </div>
                </div>
                <div className="filter-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg" style={{ background: '#F3FCF8' }}>
                      <BookOpen size={28} style={{ color: '#00C98D' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#6B7E75' }}>Rata-rata Hafalan</p>
                      <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.rataHafalan} juz</p>
                    </div>
                  </div>
                </div>
                <div className="filter-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg" style={{ background: '#FFE7C2' }}>
                      <TrendingUp size={28} style={{ color: '#F9844A' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#6B7E75' }}>Rata-rata Nilai</p>
                      <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.rataNilai}</p>
                    </div>
                  </div>
                </div>
                <div className="filter-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg" style={{ background: '#FFE7C2' }}>
                      <CheckCircle size={28} style={{ color: '#F9844A' }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#6B7E75' }}>Total Setoran</p>
                      <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.totalSetoran}x</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="filter-card p-8 mb-8">
                <h3 className="text-lg font-bold mb-6" style={{ color: '#2F3E3A' }}>Data Siswa</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Nama</p>
                    <p className="font-semibold" style={{ color: '#2F3E3A' }}>{reportData.siswa.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>NISN</p>
                    <p className="font-semibold" style={{ color: '#2F3E3A' }}>{reportData.siswa.nisn}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Total Hafalan</p>
                    <p className="font-semibold" style={{ color: '#2F3E3A' }}>{reportData.siswa.totalJuz} juz</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Nilai Rata-rata</p>
                    <p className="font-semibold" style={{ color: '#2F3E3A' }}>{reportData.siswa.nilaiRata}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Preview */}
            <div className="filter-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: '#F3FCF8', borderBottom: '2px solid #DDE6E1' }}
                  >
                    <tr>
                      {reportData.type === 'kelas' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>No</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nama Siswa</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>NISN</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Total Hafalan</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Setoran</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nilai</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Surah</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Ayat</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Juz</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nilai</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Catatan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '2px solid #DDE6E1' }}>
                    {reportData.type === 'kelas' && Array.isArray(reportData.siswaData) && reportData.siswaData.length > 0 ? (
                      reportData.siswaData.map((siswa, idx) => (
                        siswa && siswa.id ? (
                          <tr key={siswa.id || idx} style={{ borderBottom: '1px solid #DDE6E1' }}>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{idx + 1}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nama || '-'}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nisn || '-'}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.totalJuz || 0} juz</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.jumlahSetoran || 0}x</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nilaiRata || '-'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                background: siswa.statusTarget === 'Tercapai' ? '#D4F8E8' : '#FFF4E6',
                                color: siswa.statusTarget === 'Tercapai' ? '#00A57A' : '#D97706'
                              }}>
                                {siswa.statusTarget || 'Belum Tercapai'}
                              </span>
                            </td>
                          </tr>
                        ) : null
                      ))
                    ) : reportData.type !== 'kelas' && Array.isArray(reportData.hafalan) && reportData.hafalan.length > 0 ? (
                      reportData.hafalan.map((h, idx) => (
                        h && h.id ? (
                          <tr key={h.id || idx} style={{ borderBottom: '1px solid #DDE6E1' }}>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>
                              {h.tanggal ? new Date(h.tanggal).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{h.surah?.namaLatin || '-'}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{h.ayatMulai || '-'}-{h.ayatSelesai || '-'}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{h.juz || '-'}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{h.nilaiAkhir || '-'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                background: h.status === 'LANCAR' ? '#D4F8E8' : h.status === 'PERLU_PERBAIKAN' ? '#FFF4E6' : '#FEE2E2',
                                color: h.status === 'LANCAR' ? '#00A57A' : h.status === 'PERLU_PERBAIKAN' ? '#D97706' : '#DC2626'
                              }}>
                                {h.status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{h.catatan || '-'}</td>
                          </tr>
                        ) : null
                      ))
                    ) : (
                      <tr>
                        <td colSpan={reportData.type === 'kelas' ? 7 : 8} className="px-6 py-4 text-center" style={{ color: '#6B7E75' }}>
                          Tidak ada data untuk ditampilkan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(90deg, #00C98D, #00B77E)' }}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0, 201, 141, 0.3)'}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
              >
                <Download size={20} />
                Export PDF
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(90deg, #F9844A, #F9C74F)' }}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(249, 132, 74, 0.3)'}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
              >
                <Download size={20} />
                Export Excel
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!reportData && !loading && (!filters.kelasId || filters.kelasId === '') && (
          <div className="preview-empty text-center">
            <FileText size={48} className="mx-auto mb-4" style={{ color: '#00C98D', opacity: 0.9 }} />
            <p style={{ color: '#6B7E75', fontSize: '15px' }}>
              Pilih kelas dan klik &quot;Generate Preview&quot; untuk melihat laporan hafalan
            </p>
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
