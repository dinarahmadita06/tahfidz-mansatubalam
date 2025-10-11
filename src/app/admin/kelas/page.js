'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, UserPlus, UserMinus, Shield, ShieldCheck, ArrowRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

export default function AdminKelasPage() {
  const router = useRouter();
  const [kelas, setKelas] = useState([]);
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showGuruModal, setShowGuruModal] = useState(false);
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);
  const [guruList, setGuruList] = useState([]);
  const [kelasGuru, setKelasGuru] = useState([]);
  const [kelasFormData, setKelasFormData] = useState({
    nama: '',
    tingkat: 1,
    tahunAjaranId: '',
    targetJuz: 1
  });

  useEffect(() => {
    fetchKelas();
    fetchTahunAjaran();
  }, []);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/tahun-ajaran');
      const data = await response.json();
      setTahunAjaran(data);
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    }
  };

  const fetchGuruList = async () => {
    try {
      const response = await fetch('/api/guru');
      const data = await response.json();
      setGuruList(data);
    } catch (error) {
      console.error('Error fetching guru:', error);
    }
  };

  const fetchKelasGuru = async (kelasId) => {
    try {
      const response = await fetch(`/api/kelas/${kelasId}/guru`);
      const data = await response.json();
      setKelasGuru(data);
    } catch (error) {
      console.error('Error fetching kelas guru:', error);
    }
  };

  const handleManageGuru = async (kelasItem) => {
    setSelectedKelas(kelasItem);
    setShowGuruModal(true);
    await fetchGuruList();
    await fetchKelasGuru(kelasItem.id);
  };

  const handleAddGuru = async (guruId, peran) => {
    try {
      const response = await fetch(`/api/kelas/${selectedKelas.id}/add-guru`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guruId,
          peran,
          isActive: true
        }),
      });

      if (response.ok) {
        await fetchKelasGuru(selectedKelas.id);
        await fetchKelas();
        alert('Guru berhasil ditambahkan');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menambahkan guru');
      }
    } catch (error) {
      console.error('Error adding guru:', error);
      alert('Gagal menambahkan guru');
    }
  };

  const handleUpdateGuruStatus = async (guruId, isActive) => {
    try {
      const response = await fetch(`/api/kelas/${selectedKelas.id}/update-guru`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guruId,
          isActive
        }),
      });

      if (response.ok) {
        await fetchKelasGuru(selectedKelas.id);
        await fetchKelas();
        alert(`Guru berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengubah status guru');
      }
    } catch (error) {
      console.error('Error updating guru status:', error);
      alert('Gagal mengubah status guru');
    }
  };

  const handleRemoveGuru = async (guruId) => {
    if (!confirm('Yakin ingin menghapus guru dari kelas ini?')) return;

    try {
      const response = await fetch(`/api/kelas/${selectedKelas.id}/guru?guruId=${guruId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchKelasGuru(selectedKelas.id);
        await fetchKelas();
        alert('Guru berhasil dihapus dari kelas');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus guru');
      }
    } catch (error) {
      console.error('Error removing guru:', error);
      alert('Gagal menghapus guru');
    }
  };

  const handleKelasSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingKelas ? `/api/admin/kelas/${editingKelas.id}` : '/api/admin/kelas';
      const method = editingKelas ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kelasFormData),
      });

      if (response.ok) {
        alert(editingKelas ? 'Kelas berhasil diupdate' : 'Kelas berhasil ditambahkan');
        setShowKelasModal(false);
        resetKelasForm();
        fetchKelas();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data kelas');
      }
    } catch (error) {
      console.error('Error saving kelas:', error);
      alert('Gagal menyimpan data kelas');
    }
  };

  const handleEditKelas = (kelasItem) => {
    setEditingKelas(kelasItem);
    setKelasFormData({
      nama: kelasItem.nama,
      tingkat: kelasItem.tingkat,
      tahunAjaranId: kelasItem.tahunAjaranId,
      targetJuz: kelasItem.targetJuz || 1
    });
    setShowKelasModal(true);
  };

  const handleDeleteKelas = async (id) => {
    if (!confirm('Yakin ingin menghapus kelas ini? Semua data siswa di kelas ini akan terpengaruh.')) return;

    try {
      const response = await fetch(`/api/admin/kelas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Kelas berhasil dihapus');
        fetchKelas();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus kelas');
      }
    } catch (error) {
      console.error('Error deleting kelas:', error);
      alert('Gagal menghapus kelas');
    }
  };

  const resetKelasForm = () => {
    setKelasFormData({
      nama: '',
      tingkat: 1,
      tahunAjaranId: '',
      targetJuz: 1
    });
    setEditingKelas(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Kelas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola kelas dan guru pengampu</p>
          </div>
          <button
            onClick={() => {
              resetKelasForm();
              setShowKelasModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Tambah Kelas
          </button>
        </div>

        {/* Kelas List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelas.map((kelasItem) => (
            <div key={kelasItem.id} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{kelasItem.nama}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{kelasItem.tahunAjaran?.nama}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                    Tingkat {kelasItem.tingkat}
                  </span>
                  <button
                    onClick={() => handleEditKelas(kelasItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteKelas(kelasItem.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Guru Info */}
              <div className="space-y-2 mb-4">
                {kelasItem.guruKelas && kelasItem.guruKelas.length > 0 ? (
                  kelasItem.guruKelas.map((gk) => (
                    <div key={gk.id} className="flex items-center gap-2 text-sm">
                      {gk.peran === 'utama' ? (
                        <ShieldCheck size={16} className="text-orange-500" />
                      ) : (
                        <Shield size={16} className="text-gray-400" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {gk.guru.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({gk.peran})
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada guru</p>
                )}
              </div>

              {/* Stats and Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users size={18} />
                    <span className="text-sm">{kelasItem._count?.siswa || 0} siswa</span>
                  </div>
                  <button
                    onClick={() => handleManageGuru(kelasItem)}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium"
                  >
                    Kelola Guru
                  </button>
                </div>
                <button
                  onClick={() => router.push(`/admin/kelas/${kelasItem.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Users size={18} />
                  Kelola Siswa
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guru Management Modal */}
        {showGuruModal && selectedKelas && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kelola Guru - {selectedKelas.nama}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedKelas.tahunAjaran?.nama}
                  </p>
                </div>
                <button
                  onClick={() => setShowGuruModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Current Guru */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guru Saat Ini</h3>
                <div className="space-y-3">
                  {kelasGuru.length > 0 ? (
                    kelasGuru.map((gk) => (
                      <div key={gk.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {gk.peran === 'utama' ? (
                            <ShieldCheck size={20} className="text-orange-500" />
                          ) : (
                            <Shield size={20} className="text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {gk.guru.user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {gk.peran} • {gk.isActive ? 'Aktif' : 'Nonaktif'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateGuruStatus(gk.guruId, !gk.isActive)}
                            className={`px-3 py-1 rounded text-sm ${
                              gk.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {gk.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => handleRemoveGuru(gk.guruId)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Belum ada guru di kelas ini
                    </p>
                  )}
                </div>
              </div>

              {/* Add Guru */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tambah Guru</h3>
                <div className="space-y-3">
                  {guruList
                    .filter(guru => !kelasGuru.find(kg => kg.guruId === guru.id))
                    .map((guru) => (
                      <div key={guru.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {guru.user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {guru.user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddGuru(guru.id, 'utama')}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                          >
                            Tambah sebagai Utama
                          </button>
                          <button
                            onClick={() => handleAddGuru(guru.id, 'pengganti')}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            Tambah sebagai Pengganti
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kelas Add/Edit Modal */}
        {showKelasModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingKelas ? 'Edit Kelas' : 'Tambah Kelas'}
                </h2>
                <button
                  onClick={() => {
                    setShowKelasModal(false);
                    resetKelasForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleKelasSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={kelasFormData.nama}
                    onChange={(e) => setKelasFormData({ ...kelasFormData, nama: e.target.value })}
                    placeholder="Contoh: Kelas 1A"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tingkat *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="12"
                    value={kelasFormData.tingkat}
                    onChange={(e) => setKelasFormData({ ...kelasFormData, tingkat: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tahun Ajaran *
                  </label>
                  <select
                    required
                    value={kelasFormData.tahunAjaranId}
                    onChange={(e) => setKelasFormData({ ...kelasFormData, tahunAjaranId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    {tahunAjaran.map((ta) => (
                      <option key={ta.id} value={ta.id}>
                        {ta.nama} - Semester {ta.semester} {ta.isActive && '(Aktif)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Juz
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={kelasFormData.targetJuz}
                    onChange={(e) => setKelasFormData({ ...kelasFormData, targetJuz: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target hafalan untuk kelas ini (opsional)
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowKelasModal(false);
                      resetKelasForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingKelas ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
