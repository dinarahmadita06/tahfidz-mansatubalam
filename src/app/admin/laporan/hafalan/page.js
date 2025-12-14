'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader, AlertTriangle, Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
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

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

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
        new Date(h.tanggalSetor).toLocaleDateString('id-ID'),
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
    const pageHeight = doc.internal.pageSize.getHeight();

    // Check if there's enough space for signature, otherwise add new page
    let signatureY = tableEndY + 15;
    if (signatureY + 35 > pageHeight - 20) {
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
    doc.text('Guru Tahfidz', 14, signatureY + 20);
    doc.text('_____________________', 14, signatureY + 25);

    // Right signature (Kepala Sekolah)
    doc.text('Kepala Sekolah', pageWidth - 14, signatureY, { align: 'right' });
    doc.text('_____________________', pageWidth - 14, signatureY + 25, { align: 'right' });

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
          new Date(h.tanggalSetor).toLocaleDateString('id-ID'),
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Hafalan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate dan unduh laporan hafalan siswa</p>
        </div>

        {/* Filter Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Laporan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Kelas *
              </label>
              <select
                value={filters.kelasId}
                onChange={(e) => setFilters({ ...filters, kelasId: e.target.value, siswaId: '' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="">Pilih Kelas</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Siswa
              </label>
              <select
                value={filters.siswaId}
                onChange={(e) => setFilters({ ...filters, siswaId: e.target.value })}
                disabled={!filters.kelasId}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white disabled:opacity-50"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Periode
              </label>
              <select
                value={filters.periode}
                onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              >
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="semester1">Semester 1</option>
                <option value="semester2">Semester 2</option>
                <option value="tahunan">Tahunan</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {filters.periode === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalMulai}
                    onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalSelesai}
                    onChange={(e) => setFilters({ ...filters, tanggalSelesai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGeneratePreview}
              disabled={loading || !filters.kelasId}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Generating...
                </>
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
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800">
            <Loader className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Memproses data laporan...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && reportData === null && filters.kelasId && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 flex items-start gap-4">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">Perhatian</h3>
              <p className="text-amber-800 dark:text-amber-300 text-sm mt-1">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Jumlah Siswa</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.jumlahSiswa}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <BookOpen className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata Hafalan</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.rataHafalan} juz</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata Nilai</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.rataNilai}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <CheckCircle className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Setoran</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.totalSetoran}x</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Siswa</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{reportData.siswa.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">NISN</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{reportData.siswa.nisn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Hafalan</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{reportData.siswa.totalJuz} juz</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nilai Rata-rata</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{reportData.siswa.nilaiRata}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Preview */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      {reportData.type === 'kelas' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Siswa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NISN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Hafalan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Setoran</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Surah</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ayat</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Juz</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Catatan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {reportData.type === 'kelas' && Array.isArray(reportData.siswaData) && reportData.siswaData.length > 0 ? (
                      reportData.siswaData.map((siswa, idx) => (
                        siswa && siswa.id ? (
                          <tr key={siswa.id || idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{siswa.nama || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{siswa.nisn || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{siswa.totalJuz || 0} juz</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{siswa.jumlahSetoran || 0}x</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{siswa.nilaiRata || '-'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                siswa.statusTarget === 'Tercapai'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {siswa.statusTarget || 'Belum Tercapai'}
                              </span>
                            </td>
                          </tr>
                        ) : null
                      ))
                    ) : reportData.type !== 'kelas' && Array.isArray(reportData.hafalan) && reportData.hafalan.length > 0 ? (
                      reportData.hafalan.map((h, idx) => (
                        h && h.id ? (
                          <tr key={h.id || idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {h.tanggalSetor ? new Date(h.tanggalSetor).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{h.surah?.namaLatin || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{h.ayatMulai || '-'}-{h.ayatSelesai || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{h.juz || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{h.nilaiAkhir || '-'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                h.status === 'LANCAR'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : h.status === 'PERLU_PERBAIKAN'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {h.status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{h.catatan || '-'}</td>
                          </tr>
                        ) : null
                      ))
                    ) : (
                      <tr>
                        <td colSpan={reportData.type === 'kelas' ? 7 : 8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada data untuk ditampilkan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-4">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Download size={20} />
                Export PDF
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download size={20} />
                Export Excel
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!reportData && !loading && (!filters.kelasId || filters.kelasId === '') && (
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Pilih filter dan klik "Generate Preview" untuk melihat laporan
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
