'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  Volume2,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  Save,
  Users
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

export default function TahsinKelasPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const kelasId = params.kelasId;

  // State Management
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [tahsinList, setTahsinList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [guruId, setGuruId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    siswaId: '',
    tanggal: new Date().toISOString().split('T')[0],
    surah: '',
    ayatAwal: 1,
    ayatAkhir: 1,
    catatan: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch data when component mounts
  useEffect(() => {
    if (session) {
      fetchGuruData();
      fetchKelasData();
      fetchSiswaData();
      fetchTahsinData();
    }
  }, [session, kelasId]);

  const fetchGuruData = async () => {
    try {
      const response = await fetch('/api/guru');
      if (response.ok) {
        const data = await response.json();
        setGuruId(data.guru?.id);
      }
    } catch (error) {
      console.error('Error fetching guru data:', error);
    }
  };

  const fetchKelasData = async () => {
    try {
      const response = await fetch(`/api/guru/kelas/${kelasId}`);
      if (response.ok) {
        const data = await response.json();
        setKelas(data.kelas);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchSiswaData = async () => {
    try {
      const response = await fetch(`/api/guru/kelas/${kelasId}/siswa`);
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data.siswa || []);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const fetchTahsinData = async () => {
    try {
      const response = await fetch(`/api/guru/tahsin?kelasId=${kelasId}`);
      if (response.ok) {
        const data = await response.json();
        setTahsinList(data.tahsin || []);
      }
    } catch (error) {
      console.error('Error fetching tahsin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.siswaId) newErrors.siswaId = 'Pilih siswa';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.surah) newErrors.surah = 'Surah wajib diisi';
    if (!formData.ayatAwal || formData.ayatAwal < 1) {
      newErrors.ayatAwal = 'Ayat awal wajib diisi (min 1)';
    }
    if (!formData.ayatAkhir || formData.ayatAkhir < 1) {
      newErrors.ayatAkhir = 'Ayat akhir wajib diisi (min 1)';
    }
    if (formData.ayatAwal && formData.ayatAkhir && parseInt(formData.ayatAkhir) < parseInt(formData.ayatAwal)) {
      newErrors.ayatAkhir = 'Ayat akhir harus >= ayat awal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi form dengan benar');
      return;
    }

    if (!guruId) {
      toast.error('Data guru tidak ditemukan');
      return;
    }

    try {
      const payload = {
        siswaId: formData.siswaId,
        guruId: guruId,
        tanggal: new Date(formData.tanggal).toISOString(),
        surah: formData.surah,
        ayatAwal: parseInt(formData.ayatAwal),
        ayatAkhir: parseInt(formData.ayatAkhir),
        catatan: formData.catatan || null,
      };

      const url = editingId
        ? `/api/guru/tahsin/${editingId}`
        : `/api/guru/tahsin`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Tahsin berhasil diperbarui' : 'Tahsin berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchTahsinData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menyimpan tahsin');
      }
    } catch (error) {
      console.error('Error submitting tahsin:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleEdit = (tahsin) => {
    setEditingId(tahsin.id);
    setFormData({
      siswaId: tahsin.siswaId,
      tanggal: new Date(tahsin.tanggal).toISOString().split('T')[0],
      surah: tahsin.surah,
      ayatAwal: tahsin.ayatAwal,
      ayatAkhir: tahsin.ayatAkhir,
      catatan: tahsin.catatan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data tahsin ini?')) return;

    try {
      const response = await fetch(`/api/guru/tahsin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Tahsin berhasil dihapus');
        fetchTahsinData();
      } else {
        toast.error('Gagal menghapus tahsin');
      }
    } catch (error) {
      console.error('Error deleting tahsin:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const resetForm = () => {
    setFormData({
      siswaId: '',
      tanggal: new Date().toISOString().split('T')[0],
      surah: '',
      ayatAwal: 1,
      ayatAkhir: 1,
      catatan: '',
    });
    setEditingId(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/guru/tahsin"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Kelas</span>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Volume2 size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Tahsin - {kelas?.nama || 'Loading...'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{siswaList.length} Siswa</span>
                  </div>
                </div>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                <span>Tambah Tahsin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Surah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ayat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Catatan / Progres</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tahsinList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Belum ada data tahsin. Klik "Tambah Tahsin" untuk mencatat progres bacaan.
                    </td>
                  </tr>
                ) : (
                  tahsinList.map((tahsin) => (
                    <tr key={tahsin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(tahsin.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tahsin.siswa?.user?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{tahsin.surah}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tahsin.ayatAwal === tahsin.ayatAkhir
                          ? `Ayat ${tahsin.ayatAwal}`
                          : `Ayat ${tahsin.ayatAwal} - ${tahsin.ayatAkhir}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {tahsin.catatan || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(tahsin)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tahsin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Tahsin' : 'Tambah Tahsin'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Siswa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  name="siswaId"
                  value={formData.siswaId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    errors.siswaId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={editingId}
                >
                  <option value="">Pilih Siswa</option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.user?.name || siswa.nis}
                    </option>
                  ))}
                </select>
                {errors.siswaId && <p className="text-red-500 text-xs mt-1">{errors.siswaId}</p>}
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    errors.tanggal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}
              </div>

              {/* Surah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surah <span className="text-red-500">*</span>
                </label>
                <select
                  name="surah"
                  value={formData.surah}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    errors.surah ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Surah</option>
                  {surahList.map((surah) => (
                    <option key={surah} value={surah}>
                      {surah}
                    </option>
                  ))}
                </select>
                {errors.surah && <p className="text-red-500 text-xs mt-1">{errors.surah}</p>}
              </div>

              {/* Ayat Awal & Akhir */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ayat Awal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="ayatAwal"
                    value={formData.ayatAwal}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Contoh: 1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                      errors.ayatAwal ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ayatAwal && <p className="text-red-500 text-xs mt-1">{errors.ayatAwal}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ayat Akhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="ayatAkhir"
                    value={formData.ayatAkhir}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Contoh: 10"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                      errors.ayatAkhir ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ayatAkhir && <p className="text-red-500 text-xs mt-1">{errors.ayatAkhir}</p>}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Contoh: Masih perlu perbaikan di tajwid huruf ra"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>Simpan Progres</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
