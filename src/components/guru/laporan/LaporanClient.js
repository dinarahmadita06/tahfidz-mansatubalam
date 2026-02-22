'use client';

import { useState } from 'react';
import { BarChart3, FileText, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import TabelBulanan from '@/components/laporan/TabelBulanan';
import TabelSemesteran from '@/components/laporan/TabelSemesteran';
import { fetchLaporan, handleExportPDF as exportPDF } from '@/lib/reportService';

export default function LaporanClient({ initialKelas = [] }) {
  const [loading, setLoading] = useState(false);
  const [laporanData, setLaporanData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters - Updated to match admin style
  const [filters, setFilters] = useState({
    kelasId: '',
    tipeFilter: 'bulanan', // 'bulanan' or 'semester'
    bulan: (new Date().getMonth() + 1).toString(), // 1-12
    tahun: new Date().getFullYear().toString(),
    semester: '', // '1' or '2'
  });

  const handleGenerateLaporan = async () => {
    if (!filters.kelasId) {
      toast.error('Pilih kelas terlebih dahulu');
      return;
    }

    // Validate based on filter type
    if (filters.tipeFilter === 'bulanan') {
      if (!filters.bulan || !filters.tahun) {
        toast.error('Pilih bulan dan tahun terlebih dahulu');
        return;
      }
    } else if (filters.tipeFilter === 'semester') {
      if (!filters.semester) {
        toast.error('Pilih semester terlebih dahulu');
        return;
      }
    }

    setLoading(true);
    setReportGenerated(false);
    setLaporanData([]);

    try {
      // Build the correct periode value for API
      let periode;
      if (filters.tipeFilter === 'bulanan') {
        periode = 'bulanan';
      } else if (filters.semester === '1') {
        periode = 'semester1';
      } else if (filters.semester === '2') {
        periode = 'semester2';
      }

      const apiFilters = {
        kelasId: filters.kelasId,
        periode: periode,
        bulan: filters.tipeFilter === 'bulanan' ? parseInt(filters.bulan) : undefined,
        tahun: filters.tipeFilter === 'bulanan' ? parseInt(filters.tahun) : undefined,
      };

      const data = await fetchLaporan(apiFilters);
      setLaporanData(data);
      setReportGenerated(true);

      if (data.length > 0) {
        toast.success(`Laporan berhasil dimuat (${data.length} siswa)`);
      }
    } catch (error) {
      toast.error('Gagal memuat laporan. Coba lagi.');
      console.error('Error generating laporan:', error);
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportGenerated || laporanData.length === 0) {
      toast.error('Generate laporan terlebih dahulu');
      return;
    }

    setExporting(true);
    try {
      const selectedKelas = initialKelas.find((k) => k.id === filters.kelasId);
      const viewMode = filters.tipeFilter === 'bulanan' ? 'bulanan' : 'semesteran';

      // Build periode string for PDF
      let periode;
      if (filters.tipeFilter === 'bulanan') {
        periode = 'bulanan';
      } else if (filters.semester === '1') {
        periode = 'semester1';
      } else if (filters.semester === '2') {
        periode = 'semester2';
      }

      const result = await exportPDF({
        viewMode,
        kelasId: filters.kelasId,
        periode: periode,
        laporanData,
        kelasNama: selectedKelas?.nama || 'Kelas',
      });

      if (result.success) {
        toast.success('PDF berhasil dibuka');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Gagal export PDF');
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const getViewMode = () => {
    if (filters.tipeFilter === 'bulanan') return 'bulanan';
    return 'semesteran';
  };

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 mb-6">
        <h2 className="text-xl font-bold mb-6 text-emerald-900">Filter Laporan</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Tipe Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Tipe Filter</label>
            <select
              value={filters.tipeFilter}
              onChange={(e) => setFilters({ ...filters, tipeFilter: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="bulanan">Bulanan</option>
              <option value="semester">Per Semester</option>
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">
              Kelas <span className="text-rose-600">*</span>
            </label>
            <select
              value={filters.kelasId}
              onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Pilih Kelas</option>
              {initialKelas.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.nama} {kelas.tahunAjaran ? `(${kelas.tahunAjaran.nama})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional: Semester Filter */}
          {filters.tipeFilter === 'semester' && (
            <div>
              <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Pilih Semester</option>
                <option value="1">Semester 1 (Juli - Desember)</option>
                <option value="2">Semester 2 (Januari - Juni)</option>
              </select>
            </div>
          )}

          {/* Conditional: Bulan + Tahun Filters */}
          {filters.tipeFilter === 'bulanan' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-2 text-emerald-900 uppercase tracking-wide">Bulan</label>
                <select
                  value={filters.bulan}
                  onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
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
                  value={filters.tahun}
                  onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year.toString()}>{year}</option>;
                  })}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGenerateLaporan}
            disabled={loading || !filters.kelasId}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {loading ? <LoadingIndicator size="small" inline /> : <BarChart3 size={20} />}
            Tampilkan Laporan
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting || !reportGenerated || laporanData.length === 0}
            className="px-8 py-3 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? <LoadingIndicator size="small" inline /> : <FileText size={20} />}
            Export PDF
          </button>
        </div>
      </div>

      {/* Content */}
      {reportGenerated ? (
        laporanData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Data</h3>
            <p className="text-slate-500">Tidak ada aktivitas hafalan atau presensi pada periode ini.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 overflow-x-auto">
            {getViewMode() === 'bulanan' ? (
              <TabelBulanan data={laporanData} />
            ) : (
              <TabelSemesteran data={laporanData} />
            )}
          </div>
        )
      ) : (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-emerald-200 p-12 text-center">
          <BarChart3 className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-800 font-medium">Siap Generate Laporan</p>
          <p className="text-emerald-600/70 text-sm">Pilih kelas dan klik tampilkan untuk melihat data</p>
        </div>
      )}
    </>
  );
}
