'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Eye, Users, Briefcase, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';

export default function AdminOrangTuaPage() {
  const [orangTua, setOrangTua] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrangTua, setEditingOrangTua] = useState(null);
  const [detailOrangTua, setDetailOrangTua] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    noHP: '',
    pekerjaan: '',
    alamat: '',
    image: ''
  });

  useEffect(() => {
    fetchOrangTua();
  }, [filterStatus, currentPage]);

  const fetchOrangTua = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/orangtua?page=${currentPage}&limit=10`;

      if (filterStatus) url += `&status=${filterStatus}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const response = await fetch(url);
      const result = await response.json();
      setOrangTua(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching orang tua:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrangTua();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingOrangTua ? `/api/admin/orangtua/${editingOrangTua.id}` : '/api/admin/orangtua';
      const method = editingOrangTua ? 'PUT' : 'POST';

      const submitData = { ...formData };

      // Don't send password if editing and password field is not shown
      if (editingOrangTua && !showPasswordField) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingOrangTua ? 'Orang tua berhasil diupdate' : 'Orang tua berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchOrangTua();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.error || 'Gagal menyimpan data orang tua');
      }
    } catch (error) {
      console.error('Error saving orang tua:', error);
      alert('Gagal menyimpan data orang tua: ' + error.message);
    }
  };

  const handleEdit = (orangTuaItem) => {
    setEditingOrangTua(orangTuaItem);
    setFormData({
      name: orangTuaItem.user.name,
      email: orangTuaItem.user.email,
      password: '',
      noHP: orangTuaItem.noHP || '',
      pekerjaan: orangTuaItem.pekerjaan || '',
      alamat: orangTuaItem.alamat || '',
      image: orangTuaItem.user.image || ''
    });
    setShowPasswordField(false);
    setShowModal(true);
  };

  const handleDelete = async (orangTuaItem) => {
    const childrenCount = orangTuaItem._count?.siswa || 0;
    let confirmMessage = 'Yakin ingin menghapus orang tua ini?';

    if (childrenCount > 0) {
      confirmMessage = `Orang tua ini memiliki ${childrenCount} anak terhubung. Jika dihapus, koneksi dengan anak-anak akan diputus. Yakin ingin melanjutkan?`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchOrangTua();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus orang tua');
      }
    } catch (error) {
      console.error('Error deleting orang tua:', error);
      alert('Gagal menghapus orang tua');
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await fetch(`/api/admin/orangtua/${id}`);
      const data = await response.json();
      setDetailOrangTua(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('Gagal mengambil detail orang tua');
    }
  };

  const handleToggleActive = async (orangTuaItem) => {
    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !orangTuaItem.user.isActive }),
      });

      if (response.ok) {
        alert(`Orang tua berhasil ${!orangTuaItem.user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchOrangTua();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengubah status orang tua');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Gagal mengubah status orang tua');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      noHP: '',
      pekerjaan: '',
      alamat: '',
      image: ''
    });
    setEditingOrangTua(null);
    setShowPasswordField(false);
  };

  if (loading && orangTua.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Orang Tua</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data orang tua siswa</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <UserPlus size={20} />
            Tambah Orang Tua
          </button>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari orang tua (nama, email, no HP)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </form>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orang Tua</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orangTua.filter(o => o.user.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Users className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orangTua.filter(o => !o.user.isActive).length}
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
                    Orang Tua
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No HP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pekerjaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jumlah Anak
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
                {orangTua.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                          {item.user.image ? (
                            <Image
                              src={item.user.image}
                              alt={item.user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                              <Users size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.noHP || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.pekerjaan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item._count?.siswa || 0} anak
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          item.user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200'
                        }`}
                      >
                        {item.user.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus"
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

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan {orangTua.length > 0 ? ((currentPage - 1) * pagination.limit) + 1 : 0} - {Math.min(currentPage * pagination.limit, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Halaman {currentPage} dari {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingOrangTua ? 'Edit Orang Tua' : 'Tambah Orang Tua'}
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

                  {editingOrangTua && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={showPasswordField}
                          onChange={(e) => setShowPasswordField(e.target.checked)}
                          className="rounded"
                        />
                        Ganti Password
                      </label>
                    </div>
                  )}

                  {(!editingOrangTua || showPasswordField) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password {editingOrangTua ? '' : '*'} (minimal 6 karakter)
                      </label>
                      <input
                        type="password"
                        required={!editingOrangTua}
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No. HP * (Format Indonesia)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={formData.noHP}
                      onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      value={formData.pekerjaan}
                      onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
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
                    {editingOrangTua ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && detailOrangTua && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detail Orang Tua
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setDetailOrangTua(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-neutral-700">
                  <div className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                    {detailOrangTua.user.image ? (
                      <Image
                        src={detailOrangTua.user.image}
                        alt={detailOrangTua.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {detailOrangTua.user.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{detailOrangTua.user.email}</p>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          detailOrangTua.user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {detailOrangTua.user.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No. HP</p>
                    <p className="text-gray-900 dark:text-white font-medium">{detailOrangTua.noHP || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pekerjaan</p>
                    <p className="text-gray-900 dark:text-white font-medium">{detailOrangTua.pekerjaan || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alamat</p>
                    <p className="text-gray-900 dark:text-white font-medium">{detailOrangTua.alamat || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bergabung Sejak</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(detailOrangTua.user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Children Section */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Anak Terhubung ({detailOrangTua.siswa?.length || 0})
                  </h4>
                  {detailOrangTua.siswa && detailOrangTua.siswa.length > 0 ? (
                    <div className="space-y-3">
                      {detailOrangTua.siswa.map((siswa) => (
                        <div
                          key={siswa.id}
                          className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {siswa.user.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                NISN: {siswa.nisn}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                              {siswa.kelas?.nama || 'Belum ada kelas'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Belum ada anak terhubung</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setDetailOrangTua(null);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
