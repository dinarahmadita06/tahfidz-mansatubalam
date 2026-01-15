'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, Users, UserCheck, UserX, GraduationCap, RefreshCw, Upload, FileSpreadsheet } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';
import AdminLayout from '@/components/layout/AdminLayout';
import { MultiSelectKelas } from './MultiSelectKelas';
import { generateGuruEmail, generateGuruPassword } from '@/lib/passwordUtils';
import * as XLSX from 'xlsx';
import SmartImport from '@/components/SmartImport';

// Constant for class status
const STATUS_AKTIF = 'AKTIF';

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
    <div className={`${config.bg} rounded-2xl ${config.border} p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-[10px] lg:text-xs font-bold mb-1 lg:mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${config.valueColor} text-xl lg:text-2xl xl:text-3xl font-bold leading-tight`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`${config.subtitleColor} text-[10px] lg:text-xs font-medium mt-1`}>{subtitle}</p>
          )}
        </div>
        <div className={`${config.iconBg} p-2.5 lg:p-3 rounded-xl lg:rounded-2xl shadow-sm flex-shrink-0`}>
          {(() => {
            if (!Icon) return null;
            if (React.isValidElement(Icon)) return Icon;
            
            const isComponent = 
              typeof Icon === 'function' || 
              (typeof Icon === 'object' && Icon !== null && (
                Icon.$$typeof === Symbol.for('react.forward_ref') || 
                Icon.$$typeof === Symbol.for('react.memo') ||
                Icon.render || 
                Icon.displayName
              ));

            if (isComponent) {
              const IconComp = Icon;
              return <IconComp size={22} className={config.iconColor} strokeWidth={2} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

// Search & Filter Toolbar - Glass Effect
function SearchFilterBar({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-4 lg:p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 lg:gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-[10px] lg:text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wide">
            Cari Guru
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 lg:py-2.5 border border-emerald-200/60 rounded-xl bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-[10px] lg:text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wide">
            Filter Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-44 px-4 py-2 lg:py-2.5 border border-emerald-200/60 rounded-xl bg-white/70 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

// ===== HELPER FUNCTIONS =====

// Get only AKTIF classes from guruKelas array
const getAktifKelas = (guruKelas) => {
  if (!Array.isArray(guruKelas)) return [];
  return guruKelas.filter(gk => gk.kelas && gk.kelas.status === STATUS_AKTIF);
};

// ===== MAIN COMPONENT =====

import useSWR from 'swr';
import Skeleton, { TableRowSkeleton, StatCardSkeleton } from '@/components/shared/Skeleton';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminGuruPage() {
  const { data: guruData, error: guruError, mutate: refetchGuru } = useSWR('/api/guru', fetcher);
  const { data: kelasData, error: kelasError } = useSWR('/api/kelas?showAll=true', fetcher);

  const guru = Array.isArray(guruData) ? guruData : [];
  const allKelas = Array.isArray(kelasData) ? kelasData : (kelasData?.data || []);
  const aktivKelasList = allKelas.filter(k => k.status === STATUS_AKTIF);
  
  const loading = !guruData && !guruError;
  const loadingKelas = !kelasData && !kelasError;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '', // Kosong secara default
    username: '',
    nip: '',
    jenisKelamin: 'L',
    tanggalLahir: '',
    kelasIds: []
  });
  const [selectedKelas, setSelectedKelas] = useState([]);

  // Replace fetchGuru with refetchGuru from SWR
  const handleRefresh = async () => {
    try {
      await fetch('/api/admin/clear-cache', { method: 'POST' });
      refetchGuru();
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingGuru ? 'PUT' : 'POST';

    try {
      const url = editingGuru ? `/api/guru/${editingGuru.id}` : '/api/guru';
      const payload = {
        ...formData,
        username: formData.username, // Include username in the payload
        kelasIds: selectedKelas
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
        refetchGuru();
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
    // Filter dan prefill hanya kelas AKTIF
    const aktivKelasFromGuru = getAktifKelas(guruItem.guruKelas);
    const aktivKelasIds = aktivKelasFromGuru.map(gk => gk.kelasId);

    setEditingGuru(guruItem);
    setFormData({
      name: guruItem.user.name,
      password: '',
      username: guruItem.user.username || '',
      nip: guruItem.nip || '',
      jenisKelamin: guruItem.jenisKelamin,
      tanggalLahir: guruItem.tanggalLahir ? new Date(guruItem.tanggalLahir).toISOString().split('T')[0] : '',
      kelasIds: aktivKelasIds
    });
    setSelectedKelas(aktivKelasIds);
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
        refetchGuru();
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
      password: '', // Kosong secara default
      username: '',
      nip: '',
      jenisKelamin: 'L',
      tanggalLahir: '',
      kelasIds: []
    });
    setSelectedKelas([]);
    setEditingGuru(null);
  };



  const generateNextUsername = async () => {
    try {
      // Call the new API endpoint to generate the next available username
      const response = await fetch('/api/guru/generate-username');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil username guru');
      }
      
      const data = await response.json();
      setFormData({ ...formData, username: data.username });
    } catch (error) {
      console.error('Error generating username:', error);
      alert('Gagal menghasilkan username guru: ' + error.message);
    }
  };

  const generatePasswordFromDOB = () => {
    // Generate password from tanggalLahir (YYYY-MM-DD format)
    if (!formData.tanggalLahir) {
      alert('Tanggal lahir harus diisi terlebih dahulu');
      return;
    }
    
    // Format: YYYY-MM-DD (keep dashes)
    setFormData({ ...formData, password: formData.tanggalLahir });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap': 'Ahmad Fauzi',
        'NIP': '198501012010011001',
        'Jenis Kelamin': 'L',
        'Tanggal Lahir': '1985-05-20',
        'Kelas Binaan': '7A, 7B'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import Guru');
    XLSX.writeFile(wb, 'Template_Import_Guru.xlsx');
  };

  const handleExportData = () => {
    if (filteredGuru.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    const exportData = filteredGuru.map(item => {
      const aktifKelas = (item.guruKelas || [])
        .filter(gk => gk.kelas && gk.kelas.status === 'AKTIF')
        .map(gk => gk.kelas.nama)
        .join(', ');

      return {
        'Nama Lengkap': item.user?.name || item.nama || '',
        'NIP': item.nip || '',
        'Jenis Kelamin': item.jenisKelamin === 'LAKI_LAKI' || item.jenisKelamin === 'L' ? 'L' : 'P',
        'Tanggal Lahir': item.tanggalLahir ? new Date(item.tanggalLahir).toISOString().split('T')[0] : '',
        'Kelas Binaan': aktifKelas,
        'Status': item.user?.isActive ? 'Aktif' : 'Non-Aktif',
        'Tanggal Bergabung': item.user?.createdAt ? new Date(item.user.createdAt).toISOString().split('T')[0] : ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
    XLSX.writeFile(wb, `Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter guru data
  const filteredGuru = Array.isArray(guru) ? guru.filter(g => {
    const matchSearch = g.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // No full page loading, use skeletons instead


  return (
    <AdminLayout>
      <div className="w-full space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-5 sm:px-8 sm:py-6 lg:py-7 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 lg:p-3.5 rounded-xl lg:rounded-2xl flex-shrink-0">
                  <Users className="text-white" size={24} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
                    Manajemen Guru
                  </h1>
                  <p className="text-green-50 text-xs sm:text-sm mt-0.5 whitespace-normal opacity-90">
                    Kelola data guru tahfidz dengan mudah dan efisien
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex md:flex-row md:items-center md:justify-end gap-3 w-full md:w-auto">
                  <button
                  onClick={async () => {
                    resetForm();
                    setShowModal(true);
                    
                    // Generate next username when creating a new teacher
                    try {
                      const response = await fetch('/api/guru/generate-username');
                      if (response.ok) {
                        const data = await response.json();
                        setFormData(prev => ({ ...prev, username: data.username }));
                      }
                    } catch (error) {
                      console.error('Error auto-generating username:', error);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm md:text-xs lg:text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
                >
                  <UserPlus size={16} />
                  <span>Tambah Guru</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 hover:shadow-md transition-all duration-300 whitespace-nowrap"
                >
                  <FileSpreadsheet size={16} />
                  <span>Template</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 hover:shadow-md transition-all duration-300 whitespace-nowrap"
                >
                  <Upload size={16} />
                  <span>Import</span>
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 hover:shadow-md transition-all duration-300 whitespace-nowrap"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            ) : (
              <>
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
              </>
            )}
          </div>


          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {/* Table */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50/50 text-emerald-800">
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">USERNAME</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">NIP</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">Kelas Binaan (Pembina)</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-[10px] lg:text-xs font-bold uppercase tracking-wider">Tanggal Bergabung</th>
                    <th className="px-4 py-3 lg:px-6 lg:py-4 text-center text-[10px] lg:text-xs font-bold uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/40">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} columns={6} />
                    ))
                  ) : (!Array.isArray(filteredGuru) || filteredGuru.length === 0) ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <EmptyState
                          title="Tidak ada data guru"
                          description="Tidak ditemukan data guru yang sesuai dengan pencarian atau filter saat ini."
                          icon={Users}
                          className="bg-transparent border-none shadow-none py-0"
                        />
                      </td>
                    </tr>
                  ) : (
                    (Array.isArray(filteredGuru) ? filteredGuru : []).map((guruItem) => {
                      const aktivKelas = getAktifKelas(guruItem.guruKelas);
                      return (
                        <tr
                          key={guruItem.id}
                          className="hover:bg-emerald-50/30 transition-colors duration-200"
                        >
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3">
                            <div className="flex items-center gap-2.5 lg:gap-3">
                              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs lg:text-sm ring-2 ring-emerald-200/60 shadow-sm">
                                {guruItem.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs lg:text-sm">
                                  {guruItem.user.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3 text-xs lg:text-sm text-gray-600">
                            {guruItem.user.username || '-'}
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3 text-xs lg:text-sm text-gray-600">
                            {guruItem.nip || '-'}
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3">
                            {aktivKelas && aktivKelas.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                                {(Array.isArray(aktivKelas) ? aktivKelas : []).map((gk) => (
                                  <span
                                    key={gk.id}
                                    className="px-2 py-0.5 lg:px-3 lg:py-1 text-[10px] lg:text-xs font-semibold rounded-full bg-emerald-50/70 border border-emerald-100/60 text-emerald-700 flex items-center gap-1"
                                  >
                                    <GraduationCap size={11} />
                                    {gk.kelas.nama}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] lg:text-xs text-gray-400">
                                Belum ada kelas aktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3">
                            <span className="inline-flex px-3 py-1 lg:px-4 lg:py-1.5 text-[10px] lg:text-xs font-semibold rounded-full bg-emerald-100/70 text-emerald-700 border border-emerald-200/60">
                              Aktif
                            </span>
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3 text-xs lg:text-sm text-gray-600">
                            {new Date(guruItem.user.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-2.5 lg:px-6 lg:py-3">
                            <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                              <button
                                onClick={() => handleEdit(guruItem)}
                                className="p-1.5 lg:p-2 rounded-lg bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100/70 hover:shadow-md transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(guruItem.id)}
                                className="p-1.5 lg:p-2 rounded-lg bg-rose-50/70 text-rose-600 hover:bg-rose-100/70 hover:shadow-md transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <SmartImport 
              type="guru"
              onClose={() => setShowImportModal(false)}
              onSuccess={() => {
                setShowImportModal(false);
                refetchGuru();
              }}
            />
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-4 lg:mb-5">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <span className="text-xl lg:text-2xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {/* Row 1: Nama Lengkap | NIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 lg:py-2.5 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-4 py-2 lg:py-2.5 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Jenis Kelamin | Tanggal Lahir */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Jenis Kelamin *
                  </label>
                  <select
                    required
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="w-full px-4 py-2 lg:py-2.5 border border-slate-300 rounded-xl bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalLahir}
                    onChange={(e) => {
                      setFormData({ ...formData, tanggalLahir: e.target.value });
                      // Auto-update password when date of birth changes
                      if (e.target.value) {
                        setFormData(prev => ({ ...prev, password: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-2 lg:py-2.5 border border-slate-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Username Guru | Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Username Guru (Otomatis) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={!editingGuru}
                      readOnly
                      value={formData.username}
                      className="w-full px-4 py-2 lg:py-2.5 pr-11 border border-slate-300 rounded-xl bg-slate-50 text-gray-500 text-sm focus:outline-none cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={generateNextUsername}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all"
                      title="Generate username otomatis"
                      disabled={editingGuru} // Disable for edit mode
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Username dibuat otomatis (G001, G002, ...)
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Password (Otomatis) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formData.password}
                      className="w-full px-4 py-2 lg:py-2.5 pr-11 border border-slate-300 rounded-xl bg-slate-50 text-gray-500 text-sm focus:outline-none cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={generatePasswordFromDOB}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all"
                      title="Reset ke DOB (YYYY-MM-DD)"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Password akan di-generate dari tanggal lahir (YYYY-MM-DD)
                  </p>
                </div>
              </div>

              {/* Row 3: Kelas Binaan (Pembina) */}
              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Kelas Binaan (Pembina)
                  </label>
                  <MultiSelectKelas
                    kelas={aktivKelasList}
                    selectedKelas={selectedKelas}
                    onSelectionChange={setSelectedKelas}
                    loading={loadingKelas}
                    error={aktivKelasList.length === 0 && !loadingKelas ? 'Tidak ada kelas AKTIF tersedia' : null}
                  />
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Opsional. Guru akan menjadi Pembina untuk kelas yang dipilih. Dapat ditambahkan nanti.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2 lg:px-6 lg:py-2.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold text-xs lg:text-sm hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-xs lg:text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
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
