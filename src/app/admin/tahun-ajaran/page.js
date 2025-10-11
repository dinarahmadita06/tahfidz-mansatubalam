'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function TahunAjaranPage() {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    semester: 1,
    tanggalMulai: '',
    tanggalSelesai: '',
    isActive: false
  });

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch('/api/tahun-ajaran');
      const data = await res.json();
      setTahunAjaran(data);
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/admin/tahun-ajaran/${editingId}`
        : '/api/admin/tahun-ajaran';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Terjadi kesalahan');
        return;
      }

      await fetchTahunAjaran();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving tahun ajaran:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      semester: item.semester,
      tanggalMulai: new Date(item.tanggalMulai).toISOString().split('T')[0],
      tanggalSelesai: new Date(item.tanggalSelesai).toISOString().split('T')[0],
      isActive: item.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tahun ajaran ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tahun-ajaran/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus tahun ajaran');
        return;
      }

      await fetchTahunAjaran();
    } catch (error) {
      console.error('Error deleting tahun ajaran:', error);
      alert('Gagal menghapus tahun ajaran');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/tahun-ajaran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Gagal mengubah status');
        return;
      }

      await fetchTahunAjaran();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Gagal mengubah status');
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      semester: 1,
      tanggalMulai: '',
      tanggalSelesai: '',
      isActive: false
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tahun Ajaran</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola tahun ajaran dan semester</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={20} />
            Tambah Tahun Ajaran
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tahun Ajaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Periode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Jumlah Kelas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tahunAjaran.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.nama}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    Semester {item.semester}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(item.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(item.tanggalSelesai).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {item._count?.kelas || 0} kelas
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

          {tahunAjaran.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada tahun ajaran</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Mulai dengan menambahkan tahun ajaran baru
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {editingId ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: 2024/2025"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Semester 1 (Ganjil)</option>
                    <option value={2}>Semester 2 (Genap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Aktifkan tahun ajaran ini
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingId ? 'Update' : 'Simpan'}
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
