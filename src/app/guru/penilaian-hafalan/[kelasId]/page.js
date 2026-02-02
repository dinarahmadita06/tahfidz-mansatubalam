'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { useParams, useRouter } from 'next/navigation';
import { getSurahSetoranText, formatSurahSetoran } from '@/lib/helpers/formatSurahSetoran';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {
  BookOpen,
  Calendar,
  Save,
  X,
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

// ===== CONSTANTS =====

// Primary green gradient - unified across page
const PRIMARY_GREEN_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const TABLE_HEADER_GRADIENT = 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600';

// Table column configuration
const TABLE_COLUMNS = [
  { key: 'no', label: 'No', width: 'w-[60px]', align: 'text-left' },
  { key: 'nama', label: 'Nama Siswa', width: 'w-[180px]', align: 'text-left' },
  { key: 'kehadiran', label: 'Kehadiran', width: 'w-[130px]', align: 'text-center' },
  { key: 'surah', label: 'Surah yang Disetorkan', width: 'w-[220px]', align: 'text-left' },
  { key: 'catatan', label: 'Catatan', width: 'w-[180px]', align: 'text-left' },
  { key: 'nilai', label: 'Rata-rata Nilai', width: 'w-[140px]', align: 'text-center' },
  { key: 'aksi', label: 'Aksi', width: 'w-[100px]', align: 'text-center' },
];

// Daftar 114 Surah Al-Quran
const surahList = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Ma\'idah',
  'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Taubah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
  'Asy-Syu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba\'', 'Fatir',
  'Yasin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Asy-Syura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jasiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Az-Zariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hasyr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddassir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Insyiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-A\'la', 'Al-Ghasyiyah', 'Al-Fajr', 'Al-Balad',
  'Asy-Syams', 'Al-Lail', 'Ad-Duha', 'Asy-Syarh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qari\'ah', 'At-Takasur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraisy', 'Al-Ma\'un', 'Al-Kausar', 'Al-Kafirun', 'An-Nasr',
  'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

// Helper function untuk format nilai
const formatNilai = (nilai) => {
  if (nilai == null) return '-';
  const rounded = Math.round(nilai);
  if (Math.abs(nilai - rounded) < 0.01) {
    return rounded.toString();
  }
  return nilai.toFixed(1);
};

// Helper function untuk hitung rata-rata
const hitungRataRata = (tajwid, kelancaran, makhraj, implementasi) => {
  const values = [tajwid, kelancaran, makhraj, implementasi].filter(v => v != null && v !== '');
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + parseFloat(v), 0) / values.length;
};

export default function PenilaianHafalanPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId;

  const [loading, setLoading] = useState(true);
  const [siswaList, setSiswaList] = useState([]);
  const [kelasInfo, setKelasInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // State untuk data penilaian per siswa per tanggal
  const [penilaianData, setPenilaianData] = useState({});

  // State untuk expand/collapse catatan di tabel
  const [expandedCatatan, setExpandedCatatan] = useState({});

  // State untuk popup penilaian
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [popupForm, setPopupForm] = useState({
    surah: '',
    ayatMulai: '',
    ayatSelesai: '',
    tajwid: '',
    kelancaran: '',
    makhraj: '',
    implementasi: '',
    catatan: '',
    surahTambahan: [],
    submissionStatus: 'DINILAI', // DINILAI or MENGULANG
    repeatReason: '', // Alasan mengulang (optional)
  });

  // Fetch data siswa dan kelas
  useEffect(() => {
    fetchSiswaData();
  }, [kelasId]);

  // Fetch penilaian data when date changes
  useEffect(() => {
    if (selectedDate && siswaList.length > 0) {
      fetchPenilaianData();
    }
  }, [selectedDate, siswaList]);

  const fetchSiswaData = async () => {
    try {
      setLoading(true);
      // Try to fetch from /api/siswa with kelasId filter
      const response = await fetch(`/api/siswa?kelasId=${kelasId}`);
      const result = await response.json();

      if (result && Array.isArray(result)) {
        setSiswaList(result);
        // Get kelas info
        const kelasRes = await fetch(`/api/kelas/${kelasId}`);
        const kelasData = await kelasRes.json();
        setKelasInfo(kelasData);
      } else {
        toast.error('Gagal memuat data siswa');
        setSiswaList([]);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswaList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenilaianData = async () => {
    try {
      const response = await fetch(
        `/api/guru/penilaian-hafalan?kelasId=${kelasId}`
      );
      const result = await response.json();

      // API returns array of hafalan with penilaian data
      if (Array.isArray(result)) {
        const dataMap = {};
        result.forEach((hafalan) => {
          // Extract year, month, day from tanggal
          const hafalanDate = new Date(hafalan.tanggal);
          const hafalanDateString = hafalanDate.getFullYear() + '-' + 
            String(hafalanDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(hafalanDate.getDate()).padStart(2, '0');
          
          // Only include if date matches selected date
          if (hafalanDateString === selectedDate) {
            // Get penilaian from the array (could have multiple)
            const penilaianData = hafalan.penilaian && hafalan.penilaian.length > 0 ? hafalan.penilaian[0] : null;
            
            dataMap[hafalan.siswaId] = {
              penilaian: penilaianData ? {
                surah: hafalan.surah || '',
                ayatMulai: hafalan.ayatMulai || '',
                ayatSelesai: hafalan.ayatSelesai || '',
                surahTambahan: hafalan.surahTambahan || [],
                tajwid: penilaianData.tajwid || '',
                kelancaran: penilaianData.kelancaran || '',
                makhraj: penilaianData.makhraj || '',
                implementasi: penilaianData.adab || '',
              } : {},
              statusKehadiran: 'HADIR',
              catatan: penilaianData?.catatan || '',
            };
          }
        });
        setPenilaianData(dataMap);
      }
    } catch (error) {
      console.error('Error fetching penilaian data:', error);
    }
  };

  const handlePrevDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleStatusChange = async (siswaId, status) => {
    try {
      const response = await fetch('/api/guru/penilaian-hafalan/presensi', {
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
        // Update local state
        setPenilaianData((prev) => ({
          ...prev,
          [siswaId]: {
            ...prev[siswaId],
            statusKehadiran: status,
          },
        }));
        toast.success('Status kehadiran disimpan');
      } else {
        toast.error(result.error || 'Gagal menyimpan status kehadiran');
      }
    } catch (error) {
      console.error('Error saving status:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleTodayDate = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };


  const openPenilaianPopup = (siswa) => {
    setSelectedSiswa(siswa);

    // Load existing data if available
    const existingData = penilaianData[siswa.id];
    if (existingData && existingData.penilaian) {
      setPopupForm({
        surah: existingData.penilaian.surah || '',
        ayatMulai: existingData.penilaian.ayatMulai || '',
        ayatSelesai: existingData.penilaian.ayatSelesai || '',
        tajwid: existingData.penilaian.tajwid || '',
        kelancaran: existingData.penilaian.kelancaran || '',
        makhraj: existingData.penilaian.makhraj || '',
        implementasi: existingData.penilaian.implementasi || '',
        catatan: existingData.catatan || '',
        surahTambahan: existingData.penilaian.surahTambahan || [],
      });
    } else {
      // Reset form
      setPopupForm({
        surah: '',
        ayatMulai: '',
        ayatSelesai: '',
        tajwid: '',
        kelancaran: '',
        makhraj: '',
        implementasi: '',
        catatan: '',
        surahTambahan: [],
        submissionStatus: 'DINILAI',
        repeatReason: '',
      });
    }

    setShowPopup(true);
  };

  const handleSavePenilaian = async () => {
    try {
      // Validation
      if (!popupForm.surah || !popupForm.ayatMulai || !popupForm.ayatSelesai) {
        toast.error('Surah dan ayat harus diisi');
        return;
      }

      // Validation based on submission status
      if (popupForm.submissionStatus === 'MENGULANG') {
        // For MENGULANG: if repeatReason is empty, catatan is mandatory (min 10 chars)
        if (!popupForm.repeatReason || popupForm.repeatReason.trim() === '') {
          if (!popupForm.catatan || popupForm.catatan.trim().length < 10) {
            toast.error('Catatan wajib diisi minimal 10 karakter jika alasan belum dipilih');
            return;
          }
        }
        // If repeatReason is filled, catatan is optional
      } else {
        // For DINILAI: all scores are mandatory
        if (!popupForm.tajwid || !popupForm.kelancaran || !popupForm.makhraj || !popupForm.implementasi) {
          toast.error('Semua nilai penilaian harus diisi');
          return;
        }
      }

      // Build payload based on submission status
      const payload = {
        siswaId: selectedSiswa.id,
        tanggal: selectedDate,
        surah: popupForm.surah,
        ayatMulai: parseInt(popupForm.ayatMulai),
        ayatSelesai: parseInt(popupForm.ayatSelesai),
        surahTambahan: popupForm.surahTambahan || [],
        submissionStatus: popupForm.submissionStatus,
        catatan: popupForm.catatan || null,
      };

      if (popupForm.submissionStatus === 'DINILAI') {
        // Add scores only if DINILAI
        payload.tajwid = parseInt(popupForm.tajwid);
        payload.kelancaran = parseInt(popupForm.kelancaran);
        payload.makhraj = parseInt(popupForm.makhraj);
        payload.implementasi = parseInt(popupForm.implementasi);
      } else {
        // For MENGULANG: set scores to null and add repeat reason
        payload.tajwid = null;
        payload.kelancaran = null;
        payload.makhraj = null;
        payload.implementasi = null;
        payload.repeatReason = popupForm.repeatReason || null;
      }

      const response = await fetch('/api/guru/penilaian-hafalan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          popupForm.submissionStatus === 'MENGULANG' 
            ? 'Status mengulang berhasil disimpan!' 
            : 'Penilaian berhasil disimpan'
        );
        setShowPopup(false);
        fetchPenilaianData(); // Refresh data
      } else {
        toast.error(result.error || 'Gagal menyimpan penilaian');
      }
    } catch (error) {
      console.error('Error saving penilaian:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleCatatanChange = async (siswaId, catatan) => {
    try {
      const response = await fetch('/api/guru/penilaian-hafalan/catatan', {
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
        // Update local state
        setPenilaianData((prev) => ({
          ...prev,
          [siswaId]: {
            ...prev[siswaId],
            catatan,
          },
        }));
        toast.success('Catatan disimpan');
      }
    } catch (error) {
      console.error('Error saving catatan:', error);
    }
  };

  if (loading) {
    return (
      <GuruLayout>
        <LoadingIndicator fullPage text="Memuat data siswa..." />
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3 sm:px-4 lg:px-5 py-6 w-full">
        {/* Header Card with Gradient - Full Width */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-1 whitespace-normal break-words">
                Penilaian Hafalan
              </h1>
              <p className="text-white/90 text-sm sm:text-base font-medium break-words">
                {kelasInfo?.nama ? `Input penilaian hafalan per pertemuan — ${kelasInfo.nama}` : 'Input penilaian hafalan per pertemuan'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          {/* Date Filter Card with Navigation Group - Blue Theme */}
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -ml-12 -mb-12 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tanggal Pertemuan</h3>
                  <p className="text-xs text-slate-500 font-medium">Navigasi tanggal untuk input penilaian</p>
                </div>
              </div>

              {/* Mobile: Compact Layout */}
              <div className="flex md:hidden flex-col gap-2 w-full">
                {/* Row 1: Prev + Date + Next */}
                <div className="flex items-center gap-2 w-full">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevDate}
                    className="flex items-center justify-center w-11 h-11 bg-white hover:bg-blue-50 text-blue-600 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95 flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Date Picker */}
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10 pointer-events-none">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextDate}
                    className="flex items-center justify-center w-11 h-11 bg-white hover:bg-blue-50 text-blue-600 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95 flex-shrink-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Row 2: Today Button (Smaller) */}
                <button
                  onClick={handleTodayDate}
                  className="px-4 py-2 bg-blue-100/50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 font-bold text-xs uppercase tracking-wide shadow-sm active:scale-95 self-start"
                >
                  Hari Ini
                </button>
              </div>

              {/* Desktop: Original Layout */}
              <div className="hidden md:flex items-center gap-2 bg-blue-50/40 p-2 rounded-2xl border border-blue-100 shadow-inner flex-wrap justify-center backdrop-blur-sm">
                {/* Previous Button */}
                <button
                  onClick={handlePrevDate}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-500" />
                  <span className="text-sm font-bold">Sebelumnya</span>
                </button>

                {/* Date Picker - Center Focus */}
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 z-10 pointer-events-none group-focus-within:text-blue-700 transition-colors">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2.5 text-sm bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-bold text-slate-800 transition-all duration-200 min-w-[160px] shadow-sm cursor-pointer"
                  />
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextDate}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm active:scale-95 group"
                >
                  <span className="text-sm font-bold">Berikutnya</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-blue-500" />
                </button>

                {/* Today Button - Distinct Blue Outline */}
                <div className="w-px h-8 bg-blue-200 mx-1 hidden sm:block"></div>
                <button
                  onClick={handleTodayDate}
                  className="px-4 py-2 bg-blue-100/50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-sm active:scale-95"
                >
                  Hari Ini
                </button>
              </div>

              {/* Formatted Date Display */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-black text-blue-700">
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long'
                  })}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[900px]">
                <thead className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-t-2xl shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold w-[60px]">No</th>
                    <th className="px-6 py-4 text-left text-sm font-bold w-[180px]">Nama Siswa</th>
                    <th className="px-6 py-4 text-center text-sm font-bold w-[130px]">Kehadiran</th>
                    <th className="px-6 py-4 text-left text-sm font-bold w-[220px]">Surah yang Disetorkan</th>
                    <th className="px-6 py-4 text-left text-sm font-bold w-[180px]">Catatan</th>
                    <th className="px-6 py-4 text-center text-sm font-bold w-[140px]">Rata-rata Nilai</th>
                    <th className="px-6 py-4 text-center text-sm font-bold w-[100px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {siswaList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-10 h-10 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 font-medium text-lg">Belum ada siswa di kelas ini</p>
                          <p className="text-gray-500 text-sm mt-2">Data siswa akan tampil di sini ketika kelas memiliki anggota</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    siswaList.map((siswa, index) => {
                      const data = penilaianData[siswa.id] || {};
                      const penilaian = data.penilaian || {};
                      const rataRata = hitungRataRata(
                        penilaian.tajwid,
                        penilaian.kelancaran,
                        penilaian.makhraj,
                        penilaian.implementasi
                      );
                      const statusKehadiran = data.statusKehadiran || 'HADIR';

                      const getStatusStyle = () => {
                        switch (statusKehadiran) {
                          case 'HADIR':
                            return 'bg-emerald-100 text-emerald-700 border-emerald-300';
                          case 'IZIN':
                            return 'bg-amber-100 text-amber-700 border-amber-300';
                          case 'SAKIT':
                            return 'bg-blue-100 text-blue-700 border-blue-300';
                          case 'ALFA':
                            return 'bg-red-100 text-red-700 border-red-300';
                          default:
                            return 'bg-gray-100 text-gray-700 border-gray-300';
                        }
                      };

                      const statusLabels = {
                        HADIR: 'Hadir',
                        IZIN: 'Izin',
                        SAKIT: 'Sakit',
                        ALFA: 'Alpa',
                      };

                      const isValidated = siswa.status === 'approved';
                      
                      return (
                    <tr key={siswa.id} className="hover:bg-emerald-50 transition-colors">
                      {/* No */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{index + 1}</td>

                      {/* Nama Siswa */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <span>{siswa.user?.name || siswa.nama}</span>
                          {!isValidated && (
                            <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-300">
                              Menunggu Validasi
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kehadiran */}
                      <td className="px-6 py-4 text-center">
                        <select
                          value={statusKehadiran}
                          onChange={(e) => handleStatusChange(siswa.id, e.target.value)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer ${getStatusStyle()}`}
                        >
                          <option value="HADIR">Hadir</option>
                          <option value="SAKIT">Sakit</option>
                          <option value="IZIN">Izin</option>
                          <option value="ALFA">Alpa</option>
                        </select>
                      </td>

                      {/* Surah yang Disetorkan */}
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-[220px] break-words whitespace-normal">
                          {penilaian.surah ? (
                            <span className="text-slate-800 font-medium">
                              {getSurahSetoranText(penilaian)}
                            </span>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                        </div>
                      </td>

                      {/* Catatan */}
                      <td className="px-6 py-4 text-sm">
                        <div className="min-w-[240px] max-w-[360px] space-y-2">
                          {data.catatan ? (
                            <>
                              <p className={`text-slate-700 leading-relaxed ${
                                expandedCatatan[siswa.id] ? '' : 'line-clamp-2'
                              } break-words whitespace-normal`}>
                                {data.catatan}
                              </p>
                              {data.catatan.length > 60 && (
                                <button
                                  onClick={() => setExpandedCatatan((prev) => ({
                                    ...prev,
                                    [siswa.id]: !prev[siswa.id],
                                  }))}
                                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                                >
                                  {expandedCatatan[siswa.id] ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">–</span>
                          )}
                        </div>
                      </td>

                      {/* Rata-rata Nilai */}
                      <td className="px-6 py-4 text-center">
                        {rataRata != null ? (
                          <span className="text-lg font-bold text-emerald-700">
                            {formatNilai(rataRata)}
                          </span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPenilaianPopup(siswa)}
                          className="rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                        >
                          {penilaian.surah ? 'Edit' : 'Input'}
                        </button>
                      </td>
                    </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Penilaian */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 sm:px-8 py-6 flex items-center justify-between border-b border-white/10 flex-shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Form Penilaian – {selectedSiswa?.user?.name || selectedSiswa?.nama}
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Surah Utama */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Surah Utama <span className="text-red-500">*</span>
                </label>
                <select
                  value={popupForm.surah}
                  onChange={(e) => setPopupForm({ ...popupForm, surah: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="">Pilih Surah</option>
                  {surahList.map((surah) => (
                    <option key={surah} value={surah}>
                      {surah}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayat Mulai & Selesai untuk Surah Utama */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={popupForm.ayatMulai}
                    onChange={(e) => setPopupForm({ ...popupForm, ayatMulai: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Ayat Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={popupForm.ayatSelesai}
                    onChange={(e) => setPopupForm({ ...popupForm, ayatSelesai: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Checkbox Hafalan Lebih Dari 1 Surah */}
              <div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <input
                    type="checkbox"
                    id="hafalan_lebih_dari_1_surah"
                    checked={popupForm.surahTambahan.length > 0}
                    onChange={(e) => setPopupForm({ ...popupForm, surahTambahan: e.target.checked ? [{ surah: '', ayatMulai: '', ayatSelesai: '' }] : [] })}
                    className="mt-1 w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="hafalan_lebih_dari_1_surah" className="flex-1 cursor-pointer">
                    <p className="font-medium text-slate-700">☑ Hafalan lebih dari 1 surah</p>
                    <p className="text-xs text-slate-600 mt-1">Centang jika siswa menyetorkan lebih dari 1 surah dalam sesi ini (penilaian tetap dihitung 1x)</p>
                  </label>
                </div>
              </div>

              {/* Surah Tambahan - Conditional Card */}
              {popupForm.surahTambahan.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 text-sm">Surah Tambahan (Opsional)</h4>
                    <button
                      type="button"
                      onClick={() => setPopupForm({ ...popupForm, surahTambahan: [...popupForm.surahTambahan, { surah: '', ayatMulai: '', ayatSelesai: '' }] })}
                      className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      + Tambah Surah
                    </button>
                  </div>

                  <div className="space-y-4">
                    {popupForm.surahTambahan.map((item, idx) => (
                      <div key={idx} className="bg-white/60 rounded-xl p-4 border border-emerald-200/50 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-slate-600">Surah #{idx + 1}</p>
                          {popupForm.surahTambahan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPopupForm({ ...popupForm, surahTambahan: popupForm.surahTambahan.filter((_, i) => i !== idx) })}
                              className="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-semibold border border-red-200"
                            >
                              x Hapus
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nama Surah
                          </label>
                          <input
                            type="text"
                            value={item.surah}
                            onChange={(e) => {
                              const updated = [...popupForm.surahTambahan];
                              updated[idx].surah = e.target.value;
                              setPopupForm({ ...popupForm, surahTambahan: updated });
                            }}
                            placeholder="Contoh: Al-Ikhlas, Al-Falaq"
                            className="w-full h-11 px-4 rounded-xl bg-white border border-emerald-100/60 focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Ayat Mulai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.ayatMulai}
                              onChange={(e) => {
                                const updated = [...popupForm.surahTambahan];
                                updated[idx].ayatMulai = e.target.value;
                                setPopupForm({ ...popupForm, surahTambahan: updated });
                              }}
                              className="w-full h-11 px-4 rounded-xl bg-white border border-emerald-100/60 focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Ayat Selesai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.ayatSelesai}
                              onChange={(e) => {
                                const updated = [...popupForm.surahTambahan];
                                updated[idx].ayatSelesai = e.target.value;
                                setPopupForm({ ...popupForm, surahTambahan: updated });
                              }}
                              className="w-full h-11 px-4 rounded-xl bg-white border border-emerald-100/60 focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                              placeholder="5"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-3">
                    Setiap surah dengan ayat berbeda dihitung sebagai setoran terpisah.
                  </p>
                </div>
              )}

              {/* Status Setoran - Segmented Control */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Status Setoran <span className="text-red-500">*</span>
                </label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPopupForm({...popupForm, submissionStatus: 'DINILAI'})}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      popupForm.submissionStatus === 'DINILAI' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    DINILAI (LANJUT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopupForm({...popupForm, submissionStatus: 'MENGULANG'})}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      popupForm.submissionStatus === 'MENGULANG' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    MENGULANG (BELUM LAYAK DINILAI)
                  </button>
                </div>
              </div>

              {/* Penilaian 4 Aspek or Repeat Reason - Conditional */}
              {popupForm.submissionStatus === 'DINILAI' ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-6 text-lg">Penilaian (0-100)</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tajwid <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.tajwid}
                      onChange={(e) => setPopupForm({ ...popupForm, tajwid: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Kelancaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.kelancaran}
                      onChange={(e) => setPopupForm({ ...popupForm, kelancaran: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Makhraj <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.makhraj}
                      onChange={(e) => setPopupForm({ ...popupForm, makhraj: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="88"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Implementasi<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.implementasi}
                      onChange={(e) => setPopupForm({ ...popupForm, implementasi: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="92"
                    />
                  </div>
                </div>

                {/* Preview Rata-rata */}
                {popupForm.tajwid && popupForm.kelancaran && popupForm.makhraj && popupForm.implementasi && (
                  <div className="mt-6 p-4 bg-white border border-emerald-200 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm text-slate-700 font-medium mb-2">Rata-rata Nilai</p>
                      <div className="text-4xl font-bold text-emerald-600">
                        {formatNilai(hitungRataRata(
                          parseFloat(popupForm.tajwid),
                          parseFloat(popupForm.kelancaran),
                          parseFloat(popupForm.makhraj),
                          parseFloat(popupForm.implementasi)
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ) : (
              <div className="space-y-5">
                {/* Alasan Mengulang (Optional dropdown) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Alasan Mengulang (Opsional)
                  </label>
                  <select
                    value={popupForm.repeatReason}
                    onChange={(e) => setPopupForm({ ...popupForm, repeatReason: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none font-medium bg-white"
                  >
                    <option value="">-- Pilih alasan cepat (opsional) --</option>
                    <option value="Belum lancar">Belum lancar</option>
                    <option value="Masih banyak kesalahan tajwid">Masih banyak kesalahan tajwid</option>
                    <option value="Ayat belum hafal">Ayat belum hafal</option>
                    <option value="Kurang murajaah">Kurang murajaah</option>
                    <option value="Tidak hadir setoran">Tidak hadir setoran</option>
                  </select>
                </div>

                {/* Catatan - Conditional required based on repeatReason */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Catatan {!popupForm.repeatReason || popupForm.repeatReason.trim() === '' ? <span className="text-red-500">* (Wajib jika alasan belum dipilih)</span> : '(Opsional)'}
                  </label>
                  <textarea
                    value={popupForm.catatan || ''}
                    onChange={(e) => setPopupForm({ ...popupForm, catatan: e.target.value })}
                    rows="4"
                    maxLength="500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium resize-none"
                    placeholder={!popupForm.repeatReason || popupForm.repeatReason.trim() === '' ? "Wajib diisi jika alasan belum dipilih (min 10 karakter)..." : "Opsional. Isi jika perlu detail tambahan untuk orang tua..."}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {(popupForm.catatan || '').length}/500 karakter
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    {!popupForm.repeatReason || popupForm.repeatReason.trim() === '' 
                      ? 'Wajib diisi jika alasan belum dipilih (min 10 karakter).' 
                      : 'Opsional. Isi jika perlu detail tambahan untuk orang tua.'}
                  </p>
                </div>
              </div>
              )}

              {/* Catatan (Only for DINILAI status) */}
              {popupForm.submissionStatus === 'DINILAI' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={popupForm.catatan || ''}
                  onChange={(e) => setPopupForm({ ...popupForm, catatan: e.target.value })}
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium resize-none"
                  placeholder="Tulis catatan evaluasi bacaan, koreksi tajwid/makhraj, atau arahan perbaikan untuk siswa..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {(popupForm.catatan || '').length}/500 karakter
                </p>
              </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 sm:px-8 py-4 flex items-center justify-end gap-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => setShowPopup(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSavePenilaian}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
