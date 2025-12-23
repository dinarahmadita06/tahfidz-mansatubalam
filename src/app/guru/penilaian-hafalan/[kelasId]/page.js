'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Save,
  X,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

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
                tajwid: penilaianData.tajwid || '',
                kelancaran: penilaianData.kelancaran || '',
                makhraj: penilaianData.makhraj || '',
                implementasi: penilaianData.adab || '', // map 'adab' to 'implementasi'
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

      if (!popupForm.tajwid || !popupForm.kelancaran || !popupForm.makhraj || !popupForm.implementasi) {
        toast.error('Semua nilai penilaian harus diisi');
        return;
      }

      const response = await fetch('/api/guru/penilaian-hafalan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          tanggal: selectedDate,
          surah: popupForm.surah,
          ayatMulai: parseInt(popupForm.ayatMulai),
          ayatSelesai: parseInt(popupForm.ayatSelesai),
          tajwid: parseInt(popupForm.tajwid),
          kelancaran: parseInt(popupForm.kelancaran),
          makhraj: parseInt(popupForm.makhraj),
          implementasi: parseInt(popupForm.implementasi),
          catatan: popupForm.catatan || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Penilaian berhasil disimpan');
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Memuat data siswa...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 mb-8">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Penilaian Hafalan – Kelas {kelasInfo?.nama || 'Loading...'}</h1>
              <p className="text-emerald-50 text-lg">Input penilaian hafalan per pertemuan</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-8 pb-8">

          {/* Date Filter Card */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-100 p-6 mb-8">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Pertemuan</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                  <span className="text-gray-700 font-medium">
                    {new Date(selectedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white w-12">No</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Nama Siswa</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white w-40">Status Kehadiran</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white" style={{ minWidth: '300px' }}>Penilaian</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white w-32">Rata-rata Nilai</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white" style={{ minWidth: '200px' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {siswaList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
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

                      return (
                    <tr key={siswa.id} className="hover:bg-emerald-50 transition-colors duration-200 border-l-4 border-l-emerald-300">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{siswa.user?.name || siswa.nama}</td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={statusKehadiran}
                          onChange={(e) => handleStatusChange(siswa.id, e.target.value)}
                          className={`px-3 py-2 border-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer ${getStatusStyle()}`}
                        >
                          <option value="HADIR">Hadir</option>
                          <option value="SAKIT">Sakit</option>
                          <option value="IZIN">Izin</option>
                          <option value="ALFA">Alpa</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openPenilaianPopup(siswa)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                        >
                          {penilaian.surah ? 'Edit' : 'Input'}
                        </button>
                        {penilaian.surah && (
                          <div className="mt-2 text-xs text-emerald-700 font-medium">
                            {penilaian.surah} ({penilaian.ayatMulai}-{penilaian.ayatSelesai})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rataRata != null ? (
                          <div className={`inline-flex items-center px-3 py-2 rounded-lg font-bold text-sm ${
                            rataRata >= 90 ? 'bg-emerald-100 text-emerald-700' :
                            rataRata >= 80 ? 'bg-amber-100 text-amber-700' :
                            rataRata >= 70 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {formatNilai(rataRata)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={data.catatan || ''}
                          onChange={(e) => {
                            setPenilaianData((prev) => ({
                              ...prev,
                              [siswa.id]: {
                                ...prev[siswa.id],
                                catatan: e.target.value,
                              },
                            }));
                          }}
                          onBlur={(e) => handleCatatanChange(siswa.id, e.target.value)}
                          placeholder="Tambahkan catatan..."
                          className="w-full px-3 py-2 text-sm border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                        />
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-100">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">
                Form Penilaian – {selectedSiswa?.user?.name || selectedSiswa?.nama}
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Surah */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Surah <span className="text-red-500">*</span>
                </label>
                <select
                  value={popupForm.surah}
                  onChange={(e) => setPopupForm({ ...popupForm, surah: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="">Pilih Surah</option>
                  {surahList.map((surah) => (
                    <option key={surah} value={surah}>
                      {surah}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayat */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={popupForm.ayatMulai}
                    onChange={(e) => setPopupForm({ ...popupForm, ayatMulai: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
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
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Penilaian 4 Aspek */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-6 text-lg">Penilaian (0-100)</h4>

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
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
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
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
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
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="88"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Implementasi/Adab <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.implementasi}
                      onChange={(e) => setPopupForm({ ...popupForm, implementasi: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium"
                      placeholder="92"
                    />
                  </div>
                </div>

                {/* Preview Rata-rata */}
                {popupForm.tajwid && popupForm.kelancaran && popupForm.makhraj && popupForm.implementasi && (
                  <div className="mt-6 p-4 bg-white border-2 border-emerald-300 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-700 font-medium mb-2">Rata-rata Nilai</p>
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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

              {/* Catatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={popupForm.catatan || ''}
                  onChange={(e) => setPopupForm({ ...popupForm, catatan: e.target.value })}
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-medium resize-none"
                  placeholder="Tulis catatan evaluasi bacaan, koreksi tajwid/makhraj, atau arahan perbaikan untuk siswa..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {(popupForm.catatan || '').length}/500 karakter
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex items-center justify-end gap-3 border-t-2 border-emerald-100">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSavePenilaian}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
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
