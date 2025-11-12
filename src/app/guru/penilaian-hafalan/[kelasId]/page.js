'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Save,
  X,
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
      const response = await fetch(`/api/guru/kelas/${kelasId}/siswa`);
      const result = await response.json();

      if (result.success) {
        setSiswaList(result.siswa || []);
        setKelasInfo(result.kelas || null);
      } else {
        toast.error('Gagal memuat data siswa');
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPenilaianData = async () => {
    try {
      const response = await fetch(
        `/api/guru/penilaian-hafalan?kelasId=${kelasId}&tanggal=${selectedDate}`
      );
      const result = await response.json();

      if (result.success) {
        // Convert array to object keyed by siswaId
        const dataMap = {};
        result.data.forEach((item) => {
          dataMap[item.siswaId] = item;
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/guru/penilaian-hafalan"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Kelas
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Penilaian Hafalan - {kelasInfo?.nama || 'Kelas'}
                </h1>
                <p className="text-gray-600">
                  Input penilaian hafalan per pertemuan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Tanggal Pertemuan:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <span className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500 to-teal-600">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-white w-12">
                    No
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                    Nama Siswa
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-white w-40">
                    Status Kehadiran
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-white" style={{ minWidth: '300px' }}>
                    Penilaian
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-white w-32">
                    Rata-rata Nilai
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-white" style={{ minWidth: '200px' }}>
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {siswaList.map((siswa, index) => {
                  const data = penilaianData[siswa.id] || {};
                  const penilaian = data.penilaian || {};
                  const rataRata = hitungRataRata(
                    penilaian.tajwid,
                    penilaian.kelancaran,
                    penilaian.makhraj,
                    penilaian.implementasi
                  );

                  return (
                    <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {siswa.user?.name || siswa.nama}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={data.statusKehadiran || 'HADIR'}
                          onChange={(e) => handleStatusChange(siswa.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="HADIR">Hadir</option>
                          <option value="SAKIT">Sakit</option>
                          <option value="IZIN">Izin</option>
                          <option value="ALFA">Alpa</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => openPenilaianPopup(siswa)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                          {penilaian.surah ? 'Edit Penilaian' : 'Input Penilaian'}
                        </button>
                        {penilaian.surah && (
                          <div className="mt-2 text-xs text-gray-600">
                            {penilaian.surah} ({penilaian.ayatMulai}-{penilaian.ayatSelesai})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-lg font-bold ${
                          rataRata >= 90 ? 'text-emerald-600' :
                          rataRata >= 80 ? 'text-yellow-600' :
                          rataRata >= 70 ? 'text-orange-600' :
                          'text-gray-400'
                        }`}>
                          {rataRata != null ? formatNilai(rataRata) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {siswaList.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data siswa di kelas ini
            </div>
          )}
        </div>
      </div>

      {/* Popup Penilaian */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Form Penilaian - {selectedSiswa?.user?.name || selectedSiswa?.nama}
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Surah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surah <span className="text-red-500">*</span>
                </label>
                <select
                  value={popupForm.surah}
                  onChange={(e) => setPopupForm({ ...popupForm, surah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={popupForm.ayatMulai}
                    onChange={(e) => setPopupForm({ ...popupForm, ayatMulai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ayat Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={popupForm.ayatSelesai}
                    onChange={(e) => setPopupForm({ ...popupForm, ayatSelesai: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Penilaian 4 Aspek */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Penilaian (0-100)</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tajwid <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.tajwid}
                      onChange={(e) => setPopupForm({ ...popupForm, tajwid: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelancaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.kelancaran}
                      onChange={(e) => setPopupForm({ ...popupForm, kelancaran: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Makhraj <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.makhraj}
                      onChange={(e) => setPopupForm({ ...popupForm, makhraj: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="88"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Implementasi/Adab <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={popupForm.implementasi}
                      onChange={(e) => setPopupForm({ ...popupForm, implementasi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="92"
                    />
                  </div>
                </div>

                {/* Preview Rata-rata */}
                {popupForm.tajwid && popupForm.kelancaran && popupForm.makhraj && popupForm.implementasi && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-700">
                      Rata-rata Nilai:{' '}
                      <span className="text-xl font-bold text-emerald-600">
                        {formatNilai(hitungRataRata(
                          parseFloat(popupForm.tajwid),
                          parseFloat(popupForm.kelancaran),
                          parseFloat(popupForm.makhraj),
                          parseFloat(popupForm.implementasi)
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSavePenilaian}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
