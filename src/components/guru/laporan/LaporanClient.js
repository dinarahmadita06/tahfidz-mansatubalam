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

  // Filters
  const [filters, setFilters] = useState({
    kelasId: '',
    periode: 'semester2',
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  const handleGenerateLaporan = async () => {
    if (!filters.kelasId) {
      toast.error('Pilih kelas terlebih dahulu');
      return;
    }

    setLoading(true);
    setReportGenerated(false);
    setLaporanData([]);

    try {
      const data = await fetchLaporan(filters);
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
      const viewMode = filters.periode === 'bulanan' ? 'bulanan' : 'semesteran';

      const result = await exportPDF({
        viewMode,
        kelasId: filters.kelasId,
        periode: filters.periode,
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
    if (filters.periode === 'bulanan') return 'bulanan';
    return 'semesteran';
  };

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 mb-6">
        <h2 className="text-xl font-bold mb-6 text-emerald-900">Filter Laporan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Kelas</label>
            <select
              value={filters.kelasId}
              onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">-- Pilih Kelas --</option>
              {initialKelas.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.nama} {kelas.tahunAjaran ? `(${kelas.tahunAjaran.nama})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Periode</label>
            <select
              value={filters.periode}
              onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="bulanan">Bulanan</option>
              <option value="semester1">Semester 1</option>
              <option value="semester2">Semester 2</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {filters.periode === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mulai</label>
                <input
                  type="date"
                  value={filters.tanggalMulai}
                  onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Selesai</label>
                <input
                  type="date"
                  value={filters.tanggalSelesai}
                  onChange={(e) => setFilters({ ...filters, tanggalSelesai: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-emerald-50 rounded-xl"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGenerateLaporan}
            disabled={loading || !filters.kelasId}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            {loading ? <LoadingIndicator size="small" inline /> : <BarChart3 size={20} />}
            Tampilkan Laporan
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting || !reportGenerated || laporanData.length === 0}
            className="px-8 py-3 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50 flex items-center gap-2"
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
