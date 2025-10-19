'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  Star,
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function MateriMingguan() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [materials, setMaterials] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    surahNumber: '',
    ayatMulai: '',
    ayatSelesai: '',
    judul: '',
    keterangan: '',
    kelasId: '',
    weekStart: '',
    weekEnd: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'GURU') {
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [materialsRes, surahsRes, kelasRes] = await Promise.all([
        fetch('/api/weekly-material'),
        fetch('/api/quran/surahs'),
        fetch('/api/kelas'),
      ]);

      const materialsData = await materialsRes.json();
      const surahsData = await surahsRes.json();
      const kelasData = await kelasRes.json();

      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      setSurahs(surahsData);
      setKelasList(kelasData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/weekly-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          surahNumber: '',
          ayatMulai: '',
          ayatSelesai: '',
          judul: '',
          keterangan: '',
          kelasId: '',
          weekStart: '',
          weekEnd: '',
        });
        fetchData();
      } else {
        alert('Gagal menambahkan materi');
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/weekly-material?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Gagal menghapus materi');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Terjadi kesalahan');
    }
  };

  const getSurahName = (number) => {
    const surah = surahs.find((s) => s.number === number);
    return surah ? `${surah.transliteration} (${surah.name})` : `Surah ${number}`;
  };

  const isCurrentWeek = (weekStart, weekEnd) => {
    const now = new Date();
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    return now >= start && now <= end;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GuruLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Materi Hafalan Mingguan
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola materi hafalan yang ditandai untuk siswa
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={20} />
              Tambah Materi
            </button>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-lg shadow-sm">
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">Belum ada materi hafalan</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Tambah Materi Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {materials.map((material) => (
                <div key={material.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isCurrentWeek(material.weekStart, material.weekEnd) && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Minggu Ini
                          </span>
                        )}
                        {material.isActive && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {material.judul || 'Materi Hafalan'}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span>
                            {getSurahName(material.surahNumber)} Ayat{' '}
                            {material.ayatMulai}-{material.ayatSelesai}
                          </span>
                        </div>
                        {material.kelas && (
                          <div className="flex items-center gap-2">
                            <span>•</span>
                            <span>{material.kelas.nama}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {new Date(material.weekStart).toLocaleDateString(
                              'id-ID'
                            )}{' '}
                            -{' '}
                            {new Date(material.weekEnd).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {material.keterangan && (
                        <p className="text-sm text-gray-600 mt-2">
                          {material.keterangan}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah Materi Hafalan Mingguan
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Materi (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: Materi Hafalan Minggu 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surah <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.surahNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, surahNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Surah --</option>
                  {surahs.map((surah) => (
                    <option key={surah.number} value={surah.number}>
                      {surah.number}. {surah.transliteration} ({surah.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.ayatMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, ayatMulai: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    min="1"
                    value={formData.ayatSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, ayatSelesai: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas (Opsional)
                </label>
                <select
                  value={formData.kelasId}
                  onChange={(e) =>
                    setFormData({ ...formData, kelasId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Semua Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.weekStart}
                    onChange={(e) =>
                      setFormData({ ...formData, weekStart: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.weekEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, weekEnd: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Keterangan tambahan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
