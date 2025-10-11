'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Edit, Trash2, Eye, EyeOff, Users, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminPenggunaSiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    isActive: true
  });

  useEffect(() => {
    fetchSiswa();
  }, [filterStatus]);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/siswa';
      const params = new URLSearchParams();

      if (filterStatus === 'active') {
        params.append('status', 'approved');
      } else if (filterStatus === 'inactive') {
        params.append('status', 'approved');
      }

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      // Filter by active status
      let filteredData = data;
      if (filterStatus === 'active') {
        filteredData = data.filter(s => s.user.isActive);
      } else if (filterStatus === 'inactive') {
        filteredData = data.filter(s => !s.user.isActive);
      }

      setSiswa(filteredData);
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (siswaItem) => {
    if (!confirm(`Reset password untuk ${siswaItem.user.name}?\n\nPassword baru akan di-generate otomatis dan dikirim ke email.`)) return;

    try {
      const response = await fetch(`/api/admin/siswa/${siswaItem.id}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Password berhasil direset!\n\nPassword baru: ${result.newPassword}\n\nSilakan informasikan ke siswa atau kirim via email.`);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Gagal reset password');
    }
  };

  const handleEdit = (siswaItem) => {
    setEditingSiswa(siswaItem);
    setEditFormData({
      email: siswaItem.user.email,
      isActive: siswaItem.user.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/siswa/${editingSiswa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: editFormData.email,
          isActive: editFormData.isActive
        }),
      });

      if (response.ok) {
        alert('Akun siswa berhasil diupdate');
        setShowEditModal(false);
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal update akun siswa');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Gagal update akun siswa');
    }
  };

  const handleToggleActive = async (siswaItem) => {
    const newStatus = !siswaItem.user.isActive;
    if (!confirm(`${newStatus ? 'Aktifkan' : 'Nonaktifkan'} akun ${siswaItem.user.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/siswa/${siswaItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        alert(`Akun siswa berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengubah status akun');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Gagal mengubah status akun');
    }
  };

  const handleDelete = async (siswaItem) => {
    if (!confirm(`Hapus akun ${siswaItem.user.name}?\n\nAkun akan dinonaktifkan (soft delete).`)) return;

    try {
      const response = await fetch(`/api/admin/siswa/${siswaItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        alert('Akun siswa berhasil dihapus (dinonaktifkan)');
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus akun');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Gagal menghapus akun');
    }
  };

  const filteredSiswa = siswa.filter(s => {
    const matchSearch = searchTerm === '' ||
      s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Akun Siswa</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola akun user siswa (email dan password). Untuk mengelola data siswa lengkap, buka menu <strong>Kelas & Tahun Ajaran → Kelola Siswa</strong>.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Halaman ini hanya untuk mengelola akun user siswa</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Reset password dan kirim ke email</li>
              <li>Aktifkan/nonaktifkan akun siswa</li>
              <li>Update email login</li>
            </ul>
            <p className="mt-2">
              Untuk menambah siswa baru atau mengedit data lengkap (NISN, kelas, dll), gunakan menu <strong>Kelas → Kelola Siswa</strong>.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari siswa (nama atau email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{siswa.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Siswa Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {siswa.filter(s => s.user.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <EyeOff className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {siswa.filter(s => !s.user.isActive).length}
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
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
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
                {filteredSiswa.map((siswaItem) => (
                  <tr key={siswaItem.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {siswaItem.user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {siswaItem.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(siswaItem)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          siswaItem.user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {siswaItem.user.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetPassword(siswaItem)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Reset Password"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(siswaItem)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Akun"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(siswaItem)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus Akun (Soft Delete)"
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

        {/* Edit Modal */}
        {showEditModal && editingSiswa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Akun Siswa
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Siswa (readonly)
                  </label>
                  <input
                    type="text"
                    value={editingSiswa.user.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Untuk mengedit nama, gunakan menu Kelas → Kelola Siswa
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Akun Aktif
                    </span>
                  </label>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Catatan:</strong> Untuk reset password, gunakan tombol "Reset Password" di tabel.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Simpan
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
