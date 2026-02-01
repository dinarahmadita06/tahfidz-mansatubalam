'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { UserPlus, Upload, Search, Users, UserCheck, UserX } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import ParentActionMenu from '@/components/admin/ParentActionMenu';
import ParentDetailModal from '@/components/admin/ParentDetailModal';
import ResetPasswordModal from '@/components/admin/ResetPasswordModal';
import LinkStudentModal from '@/components/admin/LinkStudentModal';
import UnlinkStudentModal from '@/components/admin/UnlinkStudentModal';
import ToggleStatusModal from '@/components/admin/ToggleStatusModal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import Toast from '@/components/ui/Toast';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { calculateParentDisplayStatus, getParentStatusDisplay, getParentStatusContext } from '@/lib/helpers/parentStatusHelper';

const fetcher = (url) => fetch(url).then((res) => res.json());

/**
 * Format tanggal ke format Indonesia (dd Bulan yyyy)
 */
function formatTanggal(dateValue) {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

// Komponen StatCard (Tailwind - Pastel Style)
function StatCard({ icon: Icon, title, value, subtitle, theme = 'indigo' }) {
  const themeConfig = {
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-2 border-indigo-200/70',
      titleColor: 'text-indigo-800',
      valueColor: 'text-indigo-800',
      subtitleColor: 'text-indigo-800',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-2 border-emerald-200/70',
      titleColor: 'text-emerald-800',
      valueColor: 'text-emerald-800',
      subtitleColor: 'text-emerald-800',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-2 border-amber-200/70',
      titleColor: 'text-amber-800',
      valueColor: 'text-amber-800',
      subtitleColor: 'text-amber-800',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
    },
    red: {
      bg: 'bg-red-50/70',
      border: 'border-2 border-red-200/70',
      titleColor: 'text-red-800',
      valueColor: 'text-red-800',
      subtitleColor: 'text-red-800',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-800',
    },
  };

  const config = themeConfig[theme];

  return (
    <div className={`${config.bg} ${config.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center gap-4">
        <div className={`${config.iconBg} rounded-full p-4 shadow-md flex-shrink-0`}>
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
              return <IconComp size={24} className={config.iconColor} />;
            }
            
            return null;
          })()}
        </div>
        <div className="flex-1">
          <p className={`${config.titleColor} text-xs font-semibold mb-1 tracking-wide`}>
            {title}
          </p>
          <p className={`${config.valueColor} text-3xl font-bold leading-tight mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className={`${config.subtitleColor} text-xs`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrangTuaPage() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterConnectionStatus, setFilterConnectionStatus] = useState('all');
  const [filterAccountStatus, setFilterAccountStatus] = useState('all');
  
  // Build query params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  if (searchTerm) queryParams.append('search', searchTerm);
  if (filterStatus !== 'all') queryParams.append('status', filterStatus);
  if (filterConnectionStatus !== 'all') queryParams.append('keterhubungan', filterConnectionStatus === 'connected' ? 'connected' : 'not-connected');
  
  const { data: orangTuaData, error: orangTuaError, mutate: refetchOrangTua } = useSWR(`/api/admin/orangtua?${queryParams.toString()}`, fetcher);
  const { data: siswaData, error: siswaError } = useSWR('/api/admin/siswa?page=1&limit=10000', fetcher);

  const orangTua = orangTuaData?.data || [];
  const stats = orangTuaData?.statistics || { total: 0, active: 0, inactive: 0, connected: 0, notConnected: 0 };
  const paginationMeta = orangTuaData?.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 0 };
  const siswa = siswaData?.data || [];
  
  const loading = !orangTuaData && !orangTuaError;
  
  const [showModal, setShowModal] = useState(false);
  const [editingOrangTua, setEditingOrangTua] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [formData, setFormData] = useState({
    nisSiswa: '',
    name: '',
    jenisKelamin: 'L',
    noHP: '',
    pekerjaan: '',
    alamat: '',
  });

  // Modal states
  const [modalState, setModalState] = useState({
    detailModal: null,
    resetPasswordModal: null,
    linkStudentModal: null,
    unlinkStudentModal: null,
    toggleStatusModal: null,
    deleteConfirmModal: null,
  });

  // Additional state for filters already defined above in pagination setup

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, filterConnectionStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/orangtua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success with credentials
        const credInfo = data.credentials 
          ? `\n\nKredensial Login Wali:\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}\n\n${data.credentials.info}`
          : '';
        
        alert(`Wali berhasil dihubungkan dengan siswa ${data.siswa?.name} (NIS: ${data.siswa?.nis})${credInfo}`);
        setShowModal(false);
        resetForm();
        refetchOrangTua();
      } else {
        alert(data.error || 'Gagal menghubungkan wali');
      }
    } catch (error) {
      console.error('Error saving orang tua:', error);
      alert('Gagal menghubungkan wali');
    }
  };

  const resetForm = () => {
    setFormData({
      nisSiswa: '',
      name: '',
      jenisKelamin: 'L',
      noHP: '',
      pekerjaan: '',
      alamat: '',
    });
  };

  const handleViewDetail = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      detailModal: orangTuaItem
    }));
  };

  const handleResetPassword = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      resetPasswordModal: orangTuaItem
    }));
  };

  const confirmResetPassword = async (orangTuaItem, newPassword) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPassword
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setToast({ type: 'success', message: 'Password berhasil di-reset' });
        setModalState(prev => ({ ...prev, resetPasswordModal: null }));
        refetchOrangTua();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal mereset password' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setToast({ type: 'error', message: 'Gagal mereset password' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLinkStudent = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      linkStudentModal: orangTuaItem
    }));
  };

  const confirmLinkStudent = async (orangTuaItem, siswaId) => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/admin/orangtua-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orangTuaId: orangTuaItem.id,
          siswaId: siswaId,
          hubungan: 'ORANG_TUA'
        }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: '✓ Siswa berhasil dihubungkan' });
        setModalState(prev => ({ ...prev, linkStudentModal: null }));
        refetchOrangTua();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal menghubungkan siswa' });
      }
    } catch (error) {
      console.error('Error linking student:', error);
      setToast({ type: 'error', message: 'Gagal menghubungkan siswa' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      toggleStatusModal: orangTuaItem
    }));
  };

  const handleUnlinkStudent = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      unlinkStudentModal: orangTuaItem
    }));
  };

  const confirmUnlinkStudent = async (orangTuaItem, siswaId) => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/admin/orangtua-siswa/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orangTuaId: orangTuaItem.id,
          siswaId: siswaId,
        }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: '✓ Hubungan anak berhasil diputus' });
        setModalState(prev => ({ ...prev, unlinkStudentModal: null }));
        refetchOrangTua();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal memutus hubungan anak' });
      }
    } catch (error) {
      console.error('Error unlinking student:', error);
      setToast({ type: 'error', message: 'Gagal memutus hubungan anak' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmToggleStatus = async (orangTuaItem, newStatus) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orangTuaItem.user.name,
          email: orangTuaItem.user.email,
          noHP: orangTuaItem.noHP || '',
          pekerjaan: orangTuaItem.pekerjaan || '',
          alamat: orangTuaItem.alamat || '',
          isActive: newStatus
        }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: `✓ Akun berhasil di${newStatus ? 'aktifkan' : 'nonaktifkan'}` });
        setModalState(prev => ({ ...prev, toggleStatusModal: null }));
        refetchOrangTua();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal mengubah status akun' });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setToast({ type: 'error', message: 'Gagal mengubah status akun' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteAccount = (orangTuaItem) => {
    setModalState(prev => ({
      ...prev,
      deleteConfirmModal: orangTuaItem
    }));
  };

  const confirmDeleteAccount = async (orangTuaItem) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setToast({ type: 'success', message: '✓ Akun berhasil dihapus' });
        setModalState(prev => ({ ...prev, deleteConfirmModal: null }));
        refetchOrangTua();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal menghapus akun' });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setToast({ type: 'error', message: 'Gagal menghapus akun' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // No client-side filtering - all handled server-side

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Hero Header with Green Gradient */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 py-8 rounded-3xl shadow-lg px-6">
          {/* Decorative Blur Circles */}
          <div className="absolute top-0 -right-16 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-full relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Manajemen Orang Tua</h1>
                    <p className="text-white/90 text-sm mt-1">Kelola akun wali siswa tahfidz dengan mudah dan efisien</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-[10px] sm:text-xs lg:text-sm hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all"
                >
                  <UserPlus size={18} />
                  <span>Tambah / Hubungkan Wali</span>
                </button>
                <button
                  onClick={() => {
                    const csvContent = [
                      ['Nama Lengkap', 'NIS Anak', 'Pekerjaan', 'Anak Terhubung', 'Status Akun', 'Tanggal Pendaftaran'],
                      ...(Array.isArray(orangTua) ? orangTua : []).map(o => [
                        o.user.name,
                        (() => {
                          const siswa = o.siswa;
                          if (siswa && siswa.length > 0) {
                            return siswa.map(s => s.siswa?.nis).filter(Boolean).join('; ') || '-';
                          }
                          return '-';
                        })(),
                        o.pekerjaan || '-',
                        `${o._count?.siswa || 0} anak`,
                        (o._count?.siswa || 0) > 0 ? 'Terhubung' : 'Belum Terhubung',
                        formatTanggal(o.user.createdAt)
                      ])
                    ].map(row => row.join(',')).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `data-orangtua-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-[10px] sm:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full py-2">
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                icon={Users}
                title="Total Akun"
                value={stats.total}
                subtitle="Total orang tua terdaftar"
                theme="indigo"
              />
              <StatCard
                icon={UserCheck}
                title="Terhubung dengan Siswa"
                value={stats.connected}
                subtitle="Memiliki anak terhubung"
                theme="emerald"
              />
              <StatCard
                icon={UserX}
                title="Belum Terhubung"
                value={stats.disconnected}
                subtitle="Belum ada anak terhubung"
                theme="amber"
              />
              <StatCard
                icon={UserCheck}
                title="Akun Aktif"
                value={stats.active}
                subtitle="Status akun aktif"
                theme="emerald"
              />
              <StatCard
                icon={UserX}
                title="Akun Tidak Aktif"
                value={stats.inactive}
                subtitle="Status akun tidak aktif"
                theme="red"
              />
            </div>

            {/* Search & Filter Section - Glass Effect */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Search Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Cari Orang Tua
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIS anak..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/50 hover:bg-white/70"
                    />
                  </div>
                </div>

                {/* Filter Keterhubungan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Filter Keterhubungan
                  </label>
                  <select
                    value={filterConnectionStatus}
                    onChange={(e) => setFilterConnectionStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua Status</option>
                    <option value="connected">Terhubung dengan Siswa</option>
                    <option value="disconnected">Belum Terhubung</option>
                  </select>
                </div>

                {/* Filter Status Akun */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Filter Status Akun
                  </label>
                  <select
                    value={filterAccountStatus}
                    onChange={(e) => setFilterAccountStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua Akun</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table - Glass Effect Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/50 border-b border-emerald-100/40">
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Nama Lengkap</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">NIS Anak</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Anak Terhubung</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Status Akun</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Tanggal Pendaftaran</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <LoadingIndicator text="Memuat data..." />
                        </td>
                      </tr>
                    ) : (!Array.isArray(orangTua) || orangTua.length === 0) ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <EmptyState
                            title="Tidak ada data orang tua"
                            description="Tidak ditemukan data orang tua yang sesuai dengan filter atau pencarian saat ini."
                            icon={Users}
                            className="bg-transparent border-none shadow-none py-0"
                          />
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(orangTua) ? orangTua : []).map((orangTuaItem, index) => {
                        const childrenCount = orangTuaItem._count?.siswa || 0;
                        const isConnected = childrenCount > 0;

                        return (
                          <tr key={orangTuaItem.id} className="hover:bg-emerald-50/30 border-b border-emerald-100/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {orangTuaItem.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {orangTuaItem.user.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                {(() => {
                                  const siswaRelations = orangTuaItem.siswa || [];
                                  if (siswaRelations.length === 0) {
                                    return <span className="text-sm text-gray-400 font-medium">-</span>;
                                  }

                                  const displayedSiswa = siswaRelations.slice(0, 2);
                                  const extraCount = siswaRelations.length - displayedSiswa.length;

                                  return (
                                    <>
                                      {displayedSiswa.map((rel, idx) => (
                                        <span 
                                          key={rel.id || idx}
                                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold shadow-sm"
                                        >
                                          {rel.siswa?.nis || '-'}
                                        </span>
                                      ))}
                                      {extraCount > 0 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold shadow-sm">
                                          +{extraCount}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                isConnected
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {childrenCount > 0 ? '✓' : '○'} {childrenCount} {childrenCount === 1 ? 'anak' : 'anak'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const statusContext = getParentStatusContext(orangTuaItem);
                                const statusDisplay = statusContext.statusDisplay;
                                return (
                                  <div className="flex flex-col gap-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                                      {statusDisplay.emoji} {statusContext.statusText}
                                    </span>
                                    {statusContext.badgeText && (
                                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 w-fit" title={statusContext.tooltip}>
                                        {statusDisplay.badgeEmoji} {statusContext.badgeText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatTanggal(orangTuaItem.user.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <ParentActionMenu
                                orangTuaItem={orangTuaItem}
                                onViewDetail={handleViewDetail}
                                onResetPassword={handleResetPassword}
                                onLinkStudent={handleLinkStudent}
                                onUnlinkStudent={handleUnlinkStudent}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDeleteAccount}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Component */}
              {!loading && orangTua.length > 0 && (
                <Pagination
                  currentPage={paginationMeta.page}
                  totalPages={paginationMeta.totalPages}
                  totalItems={paginationMeta.totalItems}
                  limit={paginationMeta.limit}
                  onPageChange={(newPage) => setPage(newPage)}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalState.detailModal && (
        <ParentDetailModal
          orangTuaItem={modalState.detailModal}
          onClose={() => setModalState(prev => ({ ...prev, detailModal: null }))}
        />
      )}

      {modalState.resetPasswordModal && (
        <ResetPasswordModal
          orangTuaItem={modalState.resetPasswordModal}
          onConfirm={confirmResetPassword}
          onClose={() => setModalState(prev => ({ ...prev, resetPasswordModal: null }))}
          isLoading={isActionLoading}
        />
      )}

      {modalState.linkStudentModal && (
        <LinkStudentModal
          orangTuaItem={modalState.linkStudentModal}
          siswaList={siswa}
          onConfirm={confirmLinkStudent}
          onClose={() => setModalState(prev => ({ ...prev, linkStudentModal: null }))}
          isLoading={isActionLoading}
        />
      )}

      {modalState.unlinkStudentModal && (
        <UnlinkStudentModal
          orangTuaItem={modalState.unlinkStudentModal}
          onConfirm={confirmUnlinkStudent}
          onClose={() => setModalState(prev => ({ ...prev, unlinkStudentModal: null }))}
          isLoading={isActionLoading}
        />
      )}

      {modalState.toggleStatusModal && (
        <ToggleStatusModal
          orangTuaItem={modalState.toggleStatusModal}
          onConfirm={confirmToggleStatus}
          onClose={() => setModalState(prev => ({ ...prev, toggleStatusModal: null }))}
          isLoading={isActionLoading}
        />
      )}

      {modalState.deleteConfirmModal && (
        <ConfirmDeleteModal
          orangTuaItem={modalState.deleteConfirmModal}
          onConfirm={confirmDeleteAccount}
          onClose={() => setModalState(prev => ({ ...prev, deleteConfirmModal: null }))}
          isLoading={isActionLoading}
        />
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tambah / Hubungkan Wali
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info Helper */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  <strong>ℹ️ Informasi:</strong> Username wali sama dengan NIS siswa. 
                  Password otomatis dari tanggal lahir siswa (format: DDMMYYYY).
                </p>
              </div>

              {/* NIS Siswa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIS Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nisSiswa}
                  onChange={(e) => setFormData({ ...formData, nisSiswa: e.target.value })}
                  placeholder="Contoh: 2671"
                  required
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">NIS siswa yang akan dihubungkan dengan wali</p>
              </div>

              {/* Nama Wali */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Zaki"
                  required
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="L">Laki-laki (Ayah)</option>
                  <option value="P">Perempuan (Ibu)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Jenis wali akan ditentukan otomatis (L = Ayah, P = Ibu)</p>
              </div>

              {/* No HP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. HP (opsional)
                </label>
                <input
                  type="text"
                  value={formData.noHP}
                  onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Pekerjaan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pekerjaan (opsional)
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Contoh: Wiraswasta"
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat (opsional)
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Contoh No. 123"
                  rows="3"
                  className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  className="flex-1 px-4 py-2.5 border-2 border-emerald-200 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                >
                  Hubungkan Wali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
