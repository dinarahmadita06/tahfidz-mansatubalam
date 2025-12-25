'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import { FileText, Loader, AlertTriangle, BarChart3 } from 'lucide-react';
import TabelHarian from '@/components/laporan/TabelHarian';
import TabelBulanan from '@/components/laporan/TabelBulanan';
import TabelSemesteran from '@/components/laporan/TabelSemesteran';
import PopupPenilaian from '@/components/laporan/PopupPenilaian';
import { toast, Toaster } from 'react-hot-toast';
import { fetchKelasGuru, fetchLaporan, handleExportPDF as exportPDF, getPeriodLabel } from '@/lib/reportService';

export default function LaporanGuruPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [laporanData, setLaporanData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    kelasId: '',
    periode: 'bulanan',
    tanggalMulai: '',
    tanggalSelesai: '',
    tanggal: new Date().toISOString().split('T')[0], // for harian mode
  });

  // State for editable harian mode
  const [showPenilaianPopup, setShowPenilaianPopup] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [penilaianForm, setPenilaianForm] = useState({
    surah: '',
    ayatMulai: '',
    ayatSelesai: '',
    tajwid: '',
    kelancaran: '',
    makhraj: '',
    implementasi: '',
  });

  // Fetch kelas when guru logs in
  useEffect(() => {
    if (session?.user?.id) {
      loadKelasGuru();
    }
  }, [session]);

  const loadKelasGuru = async () => {
    try {
      const kelas = await fetchKelasGuru(session.user.id);
      setKelasList(kelas);
    } catch (error) {
      toast.error('Gagal memuat kelas');
      console.error('Error loading kelas:', error);
    }
  };

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

      if (data.length === 0) {
        toast.info('Tidak ada data laporan untuk periode ini');
      } else {
        toast.success('Laporan berhasil dimuat');
      }
    } catch (error) {
      toast.error('Gagal memuat laporan');
      console.error('Error generating laporan:', error);
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
      const selectedKelas = kelasList.find((k) => k.id === filters.kelasId);
      const viewMode =
        filters.periode === 'harian'
          ? 'harian'
          : filters.periode === 'mingguan' || filters.periode === 'bulanan'
          ? 'bulanan'
          : 'semesteran';

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

  const handleStatusChange = async (siswaId, status) => {
    try {
      const response = await fetch('/api/guru/laporan/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          tanggal: filters.tanggal,
          status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Status kehadiran disimpan');
        handleGenerateLaporan(); // Refresh data
      } else {
        toast.error('Gagal menyimpan status kehadiran');
      }
    } catch (error) {
      console.error('Error saving status:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handlePenilaianClick = (siswa) => {
    setSelectedSiswa(siswa);

    if (siswa.pertemuan) {
      setPenilaianForm({
        surah: siswa.pertemuan.surah || '',
        ayatMulai: siswa.pertemuan.ayatMulai || '',
        ayatSelesai: siswa.pertemuan.ayatSelesai || '',
        tajwid: siswa.pertemuan.nilaiTajwid || '',
        kelancaran: siswa.pertemuan.nilaiKelancaran || '',
        makhraj: siswa.pertemuan.nilaiMakhraj || '',
        implementasi: siswa.pertemuan.nilaiImplementasi || '',
      });
    } else {
      setPenilaianForm({
        surah: '',
        ayatMulai: '',
        ayatSelesai: '',
        tajwid: '',
        kelancaran: '',
        makhraj: '',
        implementasi: '',
      });
    }

    setShowPenilaianPopup(true);
  };

  const handleSavePenilaian = async () => {
    try {
      if (!penilaianForm.surah || !penilaianForm.ayatMulai || !penilaianForm.ayatSelesai) {
        toast.error('Surah dan ayat harus diisi');
        return;
      }

      if (
        !penilaianForm.tajwid ||
        !penilaianForm.kelancaran ||
        !penilaianForm.makhraj ||
        !penilaianForm.implementasi
      ) {
        toast.error('Semua nilai penilaian harus diisi');
        return;
      }

      const response = await fetch('/api/guru/laporan/penilaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.siswaId,
          tanggal: filters.tanggal,
          surah: penilaianForm.surah,
          ayatMulai: parseInt(penilaianForm.ayatMulai),
          ayatSelesai: parseInt(penilaianForm.ayatSelesai),
          tajwid: parseInt(penilaianForm.tajwid),
          kelancaran: parseInt(penilaianForm.kelancaran),
          makhraj: parseInt(penilaianForm.makhraj),
          implementasi: parseInt(penilaianForm.implementasi),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Penilaian berhasil disimpan');
        setShowPenilaianPopup(false);
        handleGenerateLaporan(); // Refresh data
      } else {
        toast.error('Gagal menyimpan penilaian');
      }
    } catch (error) {
      console.error('Error saving penilaian:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleCatatanChange = async (siswaId, catatan) => {
    try {
      const response = await fetch('/api/guru/laporan/catatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          tanggal: filters.tanggal,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Optionally show success toast
      }
    } catch (error) {
      console.error('Error saving catatan:', error);
    }
  };

  const handleCatatanBulananChange = async (siswaId, catatan) => {
    try {
      const response = await fetch('/api/guru/laporan/catatan-bulanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          periode: filters.periode,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Catatan bulanan saved successfully');
      }
    } catch (error) {
      console.error('Error saving catatan bulanan:', error);
    }
  };

  const handleCatatanSemesteranChange = async (siswaId, catatan) => {
    try {
      const response = await fetch('/api/guru/laporan/catatan-semesteran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          periode: filters.periode,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Catatan semesteran saved successfully');
      }
    } catch (error) {
      console.error('Error saving catatan semesteran:', error);
    }
  };

  const getViewMode = () => {
    if (filters.periode === 'harian') return 'harian';
    if (filters.periode === 'mingguan' || filters.periode === 'bulanan') return 'bulanan';
    return 'semesteran';
  };

  if (!session) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        {/* Header - Simple & Clean */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-md p-8 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BarChart3 size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Laporan Hafalan & Kehadiran</h1>
              <p className="text-green-50 text-base md:text-lg mt-2">
                Generate dan unduh laporan hafalan siswa secara terperinci
              </p>
            </div>
          </div>
        </div>

        {/* Filter Card - Clean Admin Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Filter Laporan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Kelas Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.kelasId}
                onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Periode Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Periode</label>
              <select
                value={filters.periode}
                onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan (7 hari terakhir)</option>
                <option value="bulanan">Bulanan</option>
                <option value="semester1">Semester 1 (Juli - Desember)</option>
                <option value="semester2">Semester 2 (Januari - Juni)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Tanggal Harian */}
            {filters.periode === 'harian' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={filters.tanggal}
                  onChange={(e) => setFilters({ ...filters, tanggal: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}

            {/* Custom Date Range */}
            {filters.periode === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalMulai}
                    onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.tanggalSelesai}
                    onChange={(e) => setFilters({ ...filters, tanggalSelesai: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleGenerateLaporan}
              disabled={loading || !filters.kelasId}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Memuat Laporan...
                </>
              ) : (
                <>
                  <BarChart3 size={20} />
                  Tampilkan Laporan
                </>
              )}
            </button>

            {reportGenerated && laporanData.length > 0 && (
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg border-2 border-emerald-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Export PDF...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Export PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Report Table or Empty State */}
        {reportGenerated && (
          <>
            {laporanData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-amber-50 rounded-full">
                    <AlertTriangle className="text-amber-600" size={48} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada data laporan</h3>
                <p className="text-gray-500">
                  Belum ada data untuk periode dan kelas yang dipilih
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
                {getViewMode() === 'harian' ? (
                  <TabelHarian
                    data={laporanData}
                    onStatusChange={handleStatusChange}
                    onPenilaianClick={handlePenilaianClick}
                    onCatatanChange={handleCatatanChange}
                  />
                ) : getViewMode() === 'bulanan' ? (
                  <TabelBulanan data={laporanData} onCatatanChange={handleCatatanBulananChange} />
                ) : (
                  <TabelSemesteran
                    data={laporanData}
                    onCatatanChange={handleCatatanSemesteranChange}
                  />
                )}
              </div>
            )}
          </>
        )}

        {!reportGenerated && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <FileText className="text-emerald-600" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Siap Generate Laporan</h3>
            <p className="text-gray-500">Pilih kelas dan periode, lalu klik "Tampilkan Laporan"</p>
          </div>
        )}
      </div>

      {/* Popup Penilaian */}
      <PopupPenilaian
        show={showPenilaianPopup}
        onClose={() => setShowPenilaianPopup(false)}
        siswa={selectedSiswa}
        form={penilaianForm}
        onFormChange={setPenilaianForm}
        onSave={handleSavePenilaian}
      />
    </GuruLayout>
  );
}
