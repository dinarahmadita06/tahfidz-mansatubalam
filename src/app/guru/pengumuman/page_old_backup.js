'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trophy, Plus, Send, Trash2, Eye, Edit, X, Award, Users, Search, Loader2, Megaphone, Calendar, Sparkles } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function PengumumanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [wisudaList, setWisudaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tanggalWisuda: '',
    lokasiWisuda: '',
    keterangan: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSiswa();
      fetchWisuda();
    }
  }, [status, router]);

  const fetchSiswa = async () => {
    try {
      const res = await fetch('/api/siswa');
      const data = await res.json();
      setSiswaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswaList([]);
    }
  };

  const fetchWisuda = async () => {
    try {
      const res = await fetch('/api/wisuda');
      const data = await res.json();
      setWisudaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wisuda:', error);
      setWisudaList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSiswa.length === 0) {
      alert('Pilih minimal 1 siswa untuk wisuda');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/wisuda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggalWisuda: formData.tanggalWisuda,
          lokasiWisuda: formData.lokasiWisuda,
          keterangan: formData.keterangan,
          siswaList: selectedSiswa,
        }),
      });

      if (response.ok) {
        alert('Wisuda berhasil dibuat!');
        setShowModal(false);
        setFormData({ tanggalWisuda: '', lokasiWisuda: '', keterangan: '' });
        setSelectedSiswa([]);
        fetchWisuda();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to create wisuda'));
      }
    } catch (error) {
      console.error('Error creating wisuda:', error);
      alert('Terjadi kesalahan saat membuat wisuda');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedSiswa.length === 0) {
      alert('Pilih minimal 1 siswa untuk wisuda');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/wisuda', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editModal.id,
          tanggalWisuda: formData.tanggalWisuda,
          lokasiWisuda: formData.lokasiWisuda,
          keterangan: formData.keterangan,
          siswaList: selectedSiswa,
        }),
      });

      if (response.ok) {
        alert('Wisuda berhasil diperbarui!');
        setEditModal(null);
        setFormData({ tanggalWisuda: '', lokasiWisuda: '', keterangan: '' });
        setSelectedSiswa([]);
        fetchWisuda();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to update wisuda'));
      }
    } catch (error) {
      console.error('Error updating wisuda:', error);
      alert('Terjadi kesalahan saat memperbarui wisuda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus wisuda ini?')) return;

    try {
      const response = await fetch(`/api/wisuda?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Wisuda berhasil dihapus!');
        fetchWisuda();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to delete wisuda'));
      }
    } catch (error) {
      console.error('Error deleting wisuda:', error);
      alert('Terjadi kesalahan saat menghapus wisuda');
    }
  };

  const openEditModal = (wisuda) => {
    setFormData({
      tanggalWisuda: new Date(wisuda.tanggalWisuda).toISOString().split('T')[0],
      lokasiWisuda: wisuda.lokasiWisuda,
      keterangan: wisuda.keterangan || '',
    });
    setSelectedSiswa(wisuda.siswa.map(s => s.id));
    setEditModal(wisuda);
  };

  const toggleSiswa = (siswaId) => {
    setSelectedSiswa(prev =>
      prev.includes(siswaId)
        ? prev.filter(id => id !== siswaId)
        : [...prev, siswaId]
    );
  };

  const filteredSiswa = siswaList.filter(siswa =>
    siswa.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wisuda Tahfidz</h1>
              <p className="text-sm text-gray-600">Kelola pengumuman wisuda tahfidz</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition shadow-md"
          >
            <Plus size={20} />
            Buat Pengumuman Wisuda
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Wisuda</p>
                <p className="text-2xl font-bold text-gray-900">{wisudaList.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Wisudawan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wisudaList.reduce((sum, w) => sum + w.jumlahSiswa, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Wisuda Mendatang</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wisudaList.filter(w => w.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wisuda List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="font-semibold text-gray-900">Daftar Wisuda Tahfidz</h3>
          </div>

          {wisudaList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Belum ada pengumuman wisuda</p>
              <p className="text-sm mt-1">Buat pengumuman wisuda untuk siswa yang telah menyelesaikan hafalan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {wisudaList.map((wisuda) => (
                <div key={wisuda.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy size={20} className="text-yellow-500" />
                        <h3 className="font-semibold text-lg text-gray-900">
                          {wisuda.keterangan || 'Wisuda Tahfidz'}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📅 Tanggal:</span>
                          <span>
                            {new Date(wisuda.tanggalWisuda).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📍 Lokasi:</span>
                          <span>{wisuda.lokasiWisuda}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">👥 Wisudawan:</span>
                          <span className="font-semibold text-green-600">{wisuda.jumlahSiswa} siswa</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {wisuda.siswa.slice(0, 3).map((siswa, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs border border-green-200">
                            {siswa.nama} - {siswa.kelas}
                          </span>
                        ))}
                        {wisuda.siswa.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{wisuda.siswa.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setViewModal(wisuda)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(wisuda)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(wisuda.id)}
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

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-800">
            <strong>🎓 Tentang Wisuda Tahfidz:</strong> Wisuda tahfidz adalah acara penganugerahan kepada siswa yang telah menyelesaikan target hafalan mereka. Pastikan semua data siswa sudah benar sebelum membuat pengumuman wisuda.
          </p>
        </div>
      </div>

      {/* Modal Buat/Edit Pengumuman Wisuda */}
      {(showModal || editModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {editModal ? 'Edit Pengumuman Wisuda' : 'Buat Pengumuman Wisuda'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditModal(null);
                  setSelectedSiswa([]);
                  setFormData({ tanggalWisuda: '', lokasiWisuda: '', keterangan: '' });
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editModal ? handleUpdate : handleSubmit} className="p-6 space-y-6">
              {/* Info Wisuda */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Wisuda</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Wisuda <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalWisuda}
                      onChange={(e) => setFormData({ ...formData, tanggalWisuda: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi Wisuda <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lokasiWisuda}
                      onChange={(e) => setFormData({ ...formData, lokasiWisuda: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Contoh: Aula Madrasah"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan
                    </label>
                    <textarea
                      rows={3}
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Contoh: Wisuda Tahfidz 30 Juz Angkatan 2024/2025"
                    />
                  </div>
                </div>
              </div>

              {/* Pilih Siswa */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Pilih Siswa Wisuda <span className="text-red-500">*</span>
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({selectedSiswa.length} siswa dipilih)
                  </span>
                </h4>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau kelas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Siswa List */}
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {filteredSiswa.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Tidak ada siswa yang sesuai</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredSiswa.map((siswa) => (
                        <label
                          key={siswa.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSiswa.includes(siswa.id)}
                            onChange={() => toggleSiswa(siswa.id)}
                            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{siswa.user.name}</p>
                            <p className="text-xs text-gray-500">{siswa.kelas.nama}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditModal(null);
                    setSelectedSiswa([]);
                    setFormData({ tanggalWisuda: '', lokasiWisuda: '', keterangan: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editModal ? 'Memperbarui...' : 'Mengumumkan...'}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {editModal ? 'Perbarui Wisuda' : 'Umumkan Wisuda'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Wisuda */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <Trophy size={28} className="text-yellow-500" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {viewModal.keterangan || 'Wisuda Tahfidz'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {viewModal.jumlahSiswa} siswa akan diwisuda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal(null)}
                  className="text-gray-600 hover:text-gray-900 ml-4"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">📅 Tanggal Wisuda</p>
                  <p className="font-medium text-gray-900">
                    {new Date(viewModal.tanggalWisuda).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">📍 Lokasi</p>
                  <p className="font-medium text-gray-900">{viewModal.lokasiWisuda}</p>
                </div>
              </div>

              {/* Daftar Siswa */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={20} className="text-green-600" />
                  Daftar Wisudawan ({viewModal.siswa.length} siswa)
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Juz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewModal.siswa.map((siswa, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{siswa.nama}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{siswa.kelas}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {siswa.totalJuz} Juz
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setViewModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setViewModal(null);
                  openEditModal(viewModal);
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition flex items-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
