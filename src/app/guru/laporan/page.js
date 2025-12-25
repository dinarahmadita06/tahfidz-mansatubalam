'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import TabelHarian from '@/components/laporan/TabelHarian';
import TabelBulanan from '@/components/laporan/TabelBulanan';
import TabelSemesteran from '@/components/laporan/TabelSemesteran';
import PopupPenilaian from '@/components/laporan/PopupPenilaian';
import { toast, Toaster } from 'react-hot-toast';

export default function LaporanGuruPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('harian'); // harian, bulanan, semesteran
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // For harian mode date picker
  const [laporanData, setLaporanData] = useState([]);

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

  useEffect(() => {
    fetchLaporanData();
  }, [viewMode, selectedKelas, selectedPeriod, selectedDate]);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        viewMode,
        periode: selectedPeriod,
      });

      if (selectedKelas) {
        params.append('kelasId', selectedKelas);
      }

      // Add selected date for harian mode
      if (viewMode === 'harian' && selectedDate) {
        params.append('tanggal', selectedDate);
      }

      const response = await fetch(`/api/guru/laporan?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLaporanData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
        // Fallback to mock data if API fails
        const mockData = generateMockData(viewMode);
        setLaporanData(mockData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on error
      const mockData = generateMockData(viewMode);
      setLaporanData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (mode) => {
    if (mode === 'harian') {
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          pertemuan: {
            tanggal: '2025-01-05',
            statusKehadiran: 'HADIR',
            nilaiTajwid: 85,
            nilaiKelancaran: 88,
            nilaiMakhraj: 82,
            nilaiImplementasi: 86,
            statusHafalan: 'LANJUT',
            catatan: 'Bagus, terus tingkatkan',
          },
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          pertemuan: {
            tanggal: '2025-01-05',
            statusKehadiran: 'HADIR',
            nilaiTajwid: 92,
            nilaiKelancaran: 94,
            nilaiMakhraj: 90,
            nilaiImplementasi: 93,
            statusHafalan: 'LANJUT',
            catatan: 'Sangat baik',
          },
        },
      ];
    } else if (mode === 'bulanan') {
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          totalHadir: 4,
          totalTidakHadir: 0,
          rataRataTajwid: 87.5,
          rataRataKelancaran: 89.8,
          rataRataMakhraj: 85.3,
          rataRataImplementasi: 88.0,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Progres sangat baik sepanjang bulan',
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          totalHadir: 3,
          totalTidakHadir: 1,
          rataRataTajwid: 92.0,
          rataRataKelancaran: 94.0,
          rataRataMakhraj: 90.0,
          rataRataImplementasi: 93.0,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Excellent, satu kali sakit',
        },
      ];
    } else {
      // semesteran
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          totalHadir: 22,
          totalTidakHadir: 2,
          rataRataTajwid: 88.2,
          rataRataKelancaran: 90.1,
          rataRataMakhraj: 86.5,
          rataRataImplementasi: 89.3,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Progres konsisten selama semester',
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          totalHadir: 21,
          totalTidakHadir: 3,
          rataRataTajwid: 93.5,
          rataRataKelancaran: 95.2,
          rataRataMakhraj: 91.8,
          rataRataImplementasi: 94.1,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Outstanding performance selama semester',
        },
      ];
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch('/api/guru/laporan/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          viewMode,
          kelasId: selectedKelas,
          periode: selectedPeriod,
          data: laporanData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (format === 'Excel' && result.csv) {
          // Download CSV directly
          const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename || `laporan-${viewMode}-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'PDF' && result.html) {
          // Open PDF in new window for printing
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(result.html);
            printWindow.document.close();
          } else {
            toast.error('Pop-up blocker mencegah membuka window cetak. Silakan izinkan pop-up untuk situs ini.');
          }
        } else {
          toast.success(`${format} berhasil diunduh!`);
        }
      } else {
        toast.error(`Gagal mengunduh ${format}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(`Terjadi kesalahan saat mengunduh ${format}`);
    }
  };

  const handleStatusChange = async (siswaId, status) => {
    try {
      const response = await fetch('/api/guru/laporan/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          tanggal: selectedDate,
          status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchLaporanData();
        toast.success('Status kehadiran disimpan');
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

    // Load existing data if available
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
      // Validation
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
          tanggal: selectedDate,
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
        fetchLaporanData();
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
          tanggal: selectedDate,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchLaporanData();
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
          periode: selectedPeriod,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Optionally refetch data or just update local state
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
          periode: selectedPeriod,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Optionally refetch data or just update local state
        console.log('Catatan semesteran saved successfully');
      }
    } catch (error) {
      console.error('Error saving catatan semesteran:', error);
    }
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat laporan...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  // Calculate summary statistics
  const totalSiswa = laporanData.length;
  const rataRataHadir =
    viewMode === 'harian'
      ? laporanData.filter((s) => s.pertemuan?.statusKehadiran === 'HADIR').length
      : laporanData.length > 0
      ? Math.round(laporanData.reduce((acc, s) => acc + (s.totalHadir || 0), 0) / laporanData.length)
      : 0;

  const rataRataNilai =
    viewMode === 'harian'
      ? laporanData.length > 0
        ? (
            laporanData.reduce(
              (acc, s) =>
                acc +
                (s.pertemuan
                  ? ((s.pertemuan.nilaiTajwid || 0) +
                      (s.pertemuan.nilaiKelancaran || 0) +
                      (s.pertemuan.nilaiMakhraj || 0) +
                      (s.pertemuan.nilaiImplementasi || 0)) /
                    4
                  : 0),
              0
            ) / laporanData.length
          ).toFixed(1)
        : '0.0'
      : laporanData.length > 0
      ? (
          laporanData.reduce(
            (acc, s) =>
              acc +
              (s.rataRataTajwid || 0) +
              (s.rataRataKelancaran || 0) +
              (s.rataRataMakhraj || 0) +
              (s.rataRataImplementasi || 0),
            0
          ) /
          (laporanData.length * 4)
        ).toFixed(1)
      : '0.0';

  const totalSesi =
    viewMode === 'harian' ? laporanData.length : viewMode === 'bulanan' ? '4x' : '24x';

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau - Style Tasmi */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-md p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <BarChart3 size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">Laporan Hafalan & Kehadiran</h1>
                  <span className="hidden md:inline-block bg-white/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Laporan
                  </span>
                </div>
                <p className="text-green-50 text-base md:text-lg">
                  Laporan terpadu hafalan dan kehadiran siswa dengan berbagai mode tampilan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - 4 Kolom Tasmi Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Siswa */}
          <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-xs font-semibold mb-1">TOTAL SISWA</p>
                <h3 className="text-3xl font-bold text-emerald-700">{totalSiswa}</h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Users size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Rata-rata Hadir */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs font-semibold mb-1">
                  {viewMode === 'harian' ? 'HADIR HARI INI' : 'RATA-RATA HADIR'}
                </p>
                <h3 className="text-3xl font-bold text-blue-700">{rataRataHadir}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Rata-rata Nilai */}
          <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-xs font-semibold mb-1">RATA-RATA NILAI</p>
                <h3 className="text-3xl font-bold text-emerald-700">{rataRataNilai}</h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <TrendingUp size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 4: Total Sesi */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">TOTAL SESI PENILAIAN</p>
                <h3 className="text-3xl font-bold text-gray-700">{totalSesi}</h3>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <BookOpen size={24} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Laporan + Filter Section - Clean White Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Segmented Tabs - Tasmi Style */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
            <button
              onClick={() => setViewMode('harian')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'harian'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-300'
              }`}
            >
              <Calendar size={18} />
              Harian/Mingguan
            </button>
            <button
              onClick={() => setViewMode('bulanan')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'bulanan'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-300'
              }`}
            >
              <TrendingUp size={18} />
              Rekap Bulanan
            </button>
            <button
              onClick={() => setViewMode('semesteran')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'semesteran'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-emerald-300'
              }`}
            >
              <BookOpen size={18} />
              Rekap Semesteran
            </button>

            {/* Export Buttons - Right aligned on desktop */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                <FileText size={18} />
                PDF
              </button>
              <button
                onClick={() => handleExport('Excel')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
            </div>
          </div>

          {/* Filter Section - Grid 3 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {viewMode === 'harian' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Pertemuan
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {viewMode === 'harian' ? 'Bulan' : 'Periode'}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="bulan-ini">Bulan Ini</option>
                <option value="bulan-lalu">Bulan Lalu</option>
                <option value="semester-ini">Semester Ini</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Semua Kelas</option>
                <option value="xii-ipa-1">XII IPA 1</option>
                <option value="xi-ipa-2">XI IPA 2</option>
                <option value="x-mia-3">X MIA 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section or Empty State */}
        {laporanData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <FileText className="text-emerald-600" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada data laporan</h3>
            <p className="text-gray-500">
              Belum ada data untuk periode dan filter yang dipilih
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
            {viewMode === 'harian' ? (
              <TabelHarian
                data={laporanData}
                onStatusChange={handleStatusChange}
                onPenilaianClick={handlePenilaianClick}
                onCatatanChange={handleCatatanChange}
              />
            ) : viewMode === 'bulanan' ? (
              <TabelBulanan data={laporanData} onCatatanChange={handleCatatanBulananChange} />
            ) : (
              <TabelSemesteran data={laporanData} onCatatanChange={handleCatatanSemesteranChange} />
            )}
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
