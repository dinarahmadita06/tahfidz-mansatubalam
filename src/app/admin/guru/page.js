'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Eye, EyeOff, GraduationCap } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminGuruPage() {
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    jenisKelamin: 'L',
    noHP: '',
    alamat: ''
  });

  useEffect(() => {
    fetchGuru();
  }, []);

  const fetchGuru = async () => {
    try {
      const response = await fetch('/api/guru');
      const data = await response.json();
      setGuru(data);
    } catch (error) {
      console.error('Error fetching guru:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingGuru ? `/api/guru/${editingGuru.id}` : '/api/guru';
      const method = editingGuru ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingGuru ? 'Guru berhasil diupdate' : 'Guru berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data guru');
      }
    } catch (error) {
      console.error('Error saving guru:', error);
      alert('Gagal menyimpan data guru');
    }
  };

  const handleEdit = (guruItem) => {
    setEditingGuru(guruItem);
    setFormData({
      name: guruItem.user.name,
      email: guruItem.user.email,
      password: '',
      nip: guruItem.nip || '',
      jenisKelamin: guruItem.jenisKelamin,
      noHP: guruItem.noHP || '',
      alamat: guruItem.alamat || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus guru ini?')) return;

    try {
      const response = await fetch(`/api/guru/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Guru berhasil dihapus');
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus guru');
      }
    } catch (error) {
      console.error('Error deleting guru:', error);
      alert('Gagal menghapus guru');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/guru/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        alert(`Guru berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengubah status guru');
      }
    } catch (error) {
      console.error('Error toggling guru status:', error);
      alert('Gagal mengubah status guru');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      nip: '',
      jenisKelamin: 'L',
      noHP: '',
      alamat: ''
    });
    setEditingGuru(null);
  };

  const filteredGuru = guru.filter(g =>
    g.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.nip && g.nip.includes(searchTerm))
  );

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Guru</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data guru tahfidz</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <UserPlus size={20} />
            Tambah Guru
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Guru</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{guru.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guru Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {guru.filter(g => g.user.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <EyeOff className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guru Nonaktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {guru.filter(g => !g.user.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filteredGuru.map((guruItem) => (
                  <tr key={guruItem.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {guruItem.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {guruItem.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {guruItem.nip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {guruItem.noHP || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {guruItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(guruItem.id, guruItem.user.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          guruItem.user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {guruItem.user.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(guruItem)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(guruItem.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingGuru ? 'Edit Guru' : 'Tambah Guru'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password {editingGuru ? '(kosongkan jika tidak diubah)' : '*'}
                    </label>
                    <input
                      type="password"
                      required={!editingGuru}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      required
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No. HP
                    </label>
                    <input
                      type="text"
                      value={formData.noHP}
                      onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingGuru ? 'Update' : 'Simpan'}
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
