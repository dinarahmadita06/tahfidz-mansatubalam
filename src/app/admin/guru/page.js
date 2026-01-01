'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, Users, UserCheck, UserX, GraduationCap, RefreshCw, Upload } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { MultiSelectKelas } from './MultiSelectKelas';

// ===== REUSABLE COMPONENTS =====

// Modern Stat Card - Align with Dashboard Admin Style (Pastel Solid, Border-2, Icon Badge Right)
function StatCard({ icon: Icon, title, value, subtitle, theme = 'emerald' }) {
  const themeConfig = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-2 border-emerald-200',
      titleColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      subtitleColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-cyan-50',
      border: 'border-2 border-sky-200',
      titleColor: 'text-sky-600',
      valueColor: 'text-sky-700',
      subtitleColor: 'text-sky-700',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-2 border-amber-200',
      titleColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      subtitleColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${config.valueColor} text-3xl font-bold`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`${config.subtitleColor} text-xs font-medium mt-2`}>{subtitle}</p>
          )}
        </div>
        <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
          <Icon size={28} className={config.iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// Search & Filter Toolbar - Glass Effect
function SearchFilterBar({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">
            Cari Guru
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-emerald-200/60 rounded-xl bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">
            Filter Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-48 px-4 py-3 border border-emerald-200/60 rounded-xl bg-white/70 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function AdminGuruPage() {
  const [guru, setGuru] = useState([]);
  const [kelas, setKelas] = useState([]); // For kelas dropdown
  const [loading, setLoading] = useState(true);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    jenisKelamin: 'L',
    alamat: ''
  });
  const [selectedKelas, setSelectedKelas] = useState([]); // Track selected classes

  useEffect(() => {
    fetchGuru();
  }, []);

  const fetchGuru = async (skipCache = false) => {
    try {
      const url = skipCache ? `/api/guru?t=${Date.now()}` : '/api/guru';
      const response = await fetch(url);
      const data = await response.json();
      setGuru(data);
    } catch (error) {
      console.error('Error fetching guru:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKelas = async () => {
    setLoadingKelas(true);
    try {
      const response = await fetch('/api/kelas?showAll=true');
      const data = await response.json();
      const aktivKelas = data.filter(k => k.status === 'AKTIF');
      setKelas(aktivKelas);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    } finally {
      setLoadingKelas(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/clear-cache', { method: 'POST' });
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
    await fetchGuru(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: at least one class must be selected
    if (selectedKelas.length === 0) {
      alert('Pilih minimal 1 kelas yang akan diampu');
      return;
    }

    try {
      const url = editingGuru ? `/api/guru/${editingGuru.id}` : '/api/guru';
      const method = editingGuru ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        kelasIds: selectedKelas // Include selected classes
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      nip: '',
      jenisKelamin: 'L',
      alamat: ''
    });
    setSelectedKelas([]);
    setEditingGuru(null);
  };

  const generateEmail = () => {
    if (!formData.name) {
      alert('Masukkan nama terlebih dahulu');
      return;
    }
    const firstName = formData.name.trim().split(' ')[0].toLowerCase();
    const generatedEmail = `guru.${firstName}@tahfidz.sch.id`;
    setFormData({ ...formData, email: generatedEmail });
  };

  const generatePassword = () => {
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData({ ...formData, password });
  };

  // Filter data
  const filteredGuru = Array.isArray(guru) ? guru.filter(g => {
    const matchSearch = g.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.nip && g.nip.includes(searchTerm));

    const matchFilter = filterStatus === 'all' || filterStatus === 'active';

    return matchSearch && matchFilter;
  }) : [];

  // Statistics
  const stats = {
    total: Array.isArray(guru) ? guru.length : 0,
    active: Array.isArray(guru) ? guru.length : 0,
    inactive: 0,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Page Container - Full Width */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Header Card - Modern Gradient Hero */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden relative">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                  <Users className="text-white" size={32} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                    Manajemen Guru
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal">
                    Kelola data guru tahfidz dengan mudah dan efisien
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    fetchKelas(); // Fetch kelas when opening modal
                    setShowModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-600 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <UserPlus size={18} />
                  <span>Tambah Guru</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-xl font-semibold text-sm hover:bg-white/30 hover:shadow-md transition-all duration-300"
                >
                  <Upload size={18} />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => {
                    const csvContent = [
                      ['Nama Lengkap', 'Email', 'NIP', 'Status', 'Tanggal Bergabung'],
                      ...filteredGuru.map(g => [
                        g.user.name,
                        g.user.email,
                        g.nip || '-',
                        'Aktif',
                        new Date(g.user.createdAt).toLocaleDateString('id-ID')
                      ])
                    ].map(row => row.join(',')).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `data-guru-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-xl font-semibold text-sm hover:bg-white/30 hover:shadow-md transition-all duration-300"
                >
                  <Download size={18} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={Users}
              title="Total Guru"
              value={stats.total}
              subtitle="Total guru terdaftar"
              theme="emerald"
            />
            <StatCard
              icon={UserCheck}
              title="Guru Aktif"
              value={stats.active}
              subtitle="Guru yang aktif mengajar"
              theme="sky"
            />
            <StatCard
              icon={UserX}
              title="Guru Non-Aktif"
              value={stats.inactive}
              subtitle="Guru yang tidak aktif"
              theme="amber"
            />
          </div>

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {/* Table - Modern Glass Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50/50 text-emerald-800">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Kelas Binaan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tanggal Bergabung</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/40">
                  {filteredGuru.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-emerald-700/60 font-medium text-sm">
                        Tidak ada data guru yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredGuru.map((guruItem) => (
                      <tr
                        key={guruItem.id}
                        className="hover:bg-emerald-50/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-200/60 shadow-sm">
                              {guruItem.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {guruItem.user.name}
                              </div>
                              {guruItem.nip && (
                                <div className="text-xs text-gray-500">
                                  NIP: {guruItem.nip}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {guruItem.user.email}
                        </td>
                        <td className="px-6 py-4">
                          {guruItem.guruKelas && guruItem.guruKelas.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {guruItem.guruKelas.map((gk) => (
                                <span
                                  key={gk.id}
                                  className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50/70 border border-emerald-100/60 text-emerald-700 flex items-center gap-1"
                                >
                                  <GraduationCap size={12} />
                                  {gk.kelas.nama}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Belum ada kelas
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-4 py-1.5 text-xs font-semibold rounded-full bg-emerald-100/70 text-emerald-700 border border-emerald-200/60">
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(guruItem.user.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(guruItem)}
                              className="p-2 rounded-lg bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100/70 hover:shadow-md transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(guruItem.id)}
                              className="p-2 rounded-lg bg-rose-50/70 text-rose-600 hover:bg-rose-100/70 hover:shadow-md transition-all"
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
      </div>

      {/* Modal - New Layout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Nama Lengkap | NIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Email | Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="guru.nama@tahfidz.sch.id"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={generateEmail}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all"
                      title="Generate email otomatis"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Password {editingGuru ? '(kosongkan jika tidak diubah)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={!editingGuru}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="6 digit angka"
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all"
                      title="Generate password 6 digit"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Kelas yang Diampu | Jenis Kelamin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Kelas yang Diampu *
                  </label>
                  <MultiSelectKelas
                    kelas={kelas}
                    selectedKelas={selectedKelas}
                    onSelectionChange={setSelectedKelas}
                    loading={loadingKelas}
                    error={kelas.length === 0 && !loadingKelas ? 'Tidak ada kelas AKTIF tersedia' : null}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Jenis Kelamin *
                  </label>
                  <select
                    required
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Alamat (full width) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Alamat
                </label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  {editingGuru ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
