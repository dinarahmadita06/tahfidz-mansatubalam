'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function InputHafalanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [surahList, setSurahList] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    siswaId: '',
    surahId: '',
    ayatMulai: '',
    ayatSelesai: '',
    juz: '',
    halaman: '',
    status: 'LANCAR',
    nilaiTartil: '',
    nilaiTajwid: '',
    nilaiMakhraj: '',
    nilaiKelancaran: '',
    catatan: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchSiswa();
    fetchSurah();
  }, []);

  const fetchSiswa = async () => {
    try {
      const res = await fetch('/api/siswa');
      const data = await res.json();
      // Ensure data is always an array
      setSiswaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswaList([]); // Set to empty array on error
    }
  };

  const fetchSurah = async () => {
    try {
      const res = await fetch('/api/surah');
      const data = await res.json();
      // Ensure data is always an array
      setSurahList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching surah:', error);
      setSurahList([]); // Set to empty array on error
    }
  };

  const handleSurahChange = (e) => {
    const surahId = e.target.value;
    const surah = surahList.find(s => s.id === surahId);

    setFormData({ ...formData, surahId });
    setSelectedSurah(surah);

    // Auto-fill juz if surah has only one juz
    if (surah && surah.juz.length === 1) {
      setFormData(prev => ({ ...prev, surahId, juz: surah.juz[0].toString() }));
    } else {
      setFormData(prev => ({ ...prev, surahId, juz: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/hafalan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          siswaId: '',
          surahId: '',
          ayatMulai: '',
          ayatSelesai: '',
          juz: '',
          halaman: '',
          status: 'LANCAR',
          nilaiTartil: '',
          nilaiTajwid: '',
          nilaiMakhraj: '',
          nilaiKelancaran: '',
          catatan: '',
        });
        setSelectedSurah(null);

        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save hafalan'));
      }
    } catch (error) {
      console.error('Error submitting hafalan:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <GuruLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Input Setoran Hafalan</h1>
        <p className="text-sm text-gray-600">Catat hafalan siswa</p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✓ Hafalan berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Pilih Siswa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Siswa <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.siswaId}
              onChange={(e) => setFormData({ ...formData, siswaId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Pilih Siswa --</option>
              {Array.isArray(siswaList) && siswaList.map((siswa) => (
                <option key={siswa.id} value={siswa.id}>
                  {siswa.user.name} - {siswa.kelas.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Surah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Surah <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.surahId}
              onChange={handleSurahChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Pilih Surah --</option>
              {Array.isArray(surahList) && surahList.map((surah) => (
                <option key={surah.id} value={surah.id}>
                  {surah.nomor}. {surah.namaLatin} ({surah.nama}) - {surah.jumlahAyat} ayat
                </option>
              ))}
            </select>
            {selectedSurah && (
              <p className="mt-1 text-sm text-gray-500">
                Jumlah ayat: {selectedSurah.jumlahAyat} • {selectedSurah.tempatTurun}
              </p>
            )}
          </div>

          {/* Ayat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayat Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedSurah?.jumlahAyat || 999}
                value={formData.ayatMulai}
                onChange={(e) => setFormData({ ...formData, ayatMulai: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayat Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={formData.ayatMulai || 1}
                max={selectedSurah?.jumlahAyat || 999}
                value={formData.ayatSelesai}
                onChange={(e) => setFormData({ ...formData, ayatSelesai: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          {/* Juz & Halaman */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Juz <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={formData.juz}
                onChange={(e) => setFormData({ ...formData, juz: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1-30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Halaman (Opsional)
              </label>
              <input
                type="number"
                min="1"
                max="604"
                value={formData.halaman}
                onChange={(e) => setFormData({ ...formData, halaman: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1-604"
              />
            </div>
          </div>

          {/* Status Hafalan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Hafalan <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="LANCAR"
                  checked={formData.status === 'LANCAR'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Lancar</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="PERLU_PERBAIKAN"
                  checked={formData.status === 'PERLU_PERBAIKAN'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Perlu Perbaikan</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="DITOLAK"
                  checked={formData.status === 'DITOLAK'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm">Ditolak</span>
              </label>
            </div>
          </div>

          {/* Penilaian */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penilaian (0-100)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Tartil
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nilaiTartil}
                  onChange={(e) => setFormData({ ...formData, nilaiTartil: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Tajwid
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nilaiTajwid}
                  onChange={(e) => setFormData({ ...formData, nilaiTajwid: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Makhraj
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nilaiMakhraj}
                  onChange={(e) => setFormData({ ...formData, nilaiMakhraj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Kelancaran
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nilaiKelancaran}
                  onChange={(e) => setFormData({ ...formData, nilaiKelancaran: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Guru (Opsional)
            </label>
            <textarea
              rows={4}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Berikan feedback untuk siswa..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Simpan Hafalan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </GuruLayout>
  );
}
