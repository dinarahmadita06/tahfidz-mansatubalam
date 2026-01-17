'use client';

import React, { useState, useEffect, memo } from 'react';
import useSWR from 'swr';
import Skeleton, { TableRowSkeleton, StatCardSkeleton } from '@/components/shared/Skeleton';

import { UserPlus, Upload, Download, Search, Edit, Trash2, Users, UserCheck, AlertCircle, GraduationCap, BookOpen, CheckCircle, XCircle, ArrowUpRight, Award } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';
import AdminLayout from '@/components/layout/AdminLayout';
import SmartImport from '@/components/SmartImport';
import StudentCreateModal from '@/components/admin/StudentCreateModal';
import RowActionMenu from '@/components/admin/RowActionMenu';
import * as XLSX from 'xlsx';
import { getStatusBadgeConfig } from '@/lib/helpers/statusHelpers';

/**
 * Format tanggal ke format Indonesia (dd Bulan yyyy)
 * @param {string|Date} dateValue - Tanggal dari database (createdAt)
 * @returns {string} Tanggal terformat atau '-' jika tidak valid
 */
function formatTanggal(dateValue) {
  // Jika tidak ada tanggal
  if (!dateValue) {
    return '-';
  }

  try {
    const date = new Date(dateValue);
    
    // Validasi apakah date valid
    if (isNaN(date.getTime())) {
      return '-';
    }

    // Format: dd Bulan yyyy (contoh: 29 Desember 2025)
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

// Komponen StatCard (Reusable - Tasmi Style)
const StatCard = memo(function StatCard({ icon: Icon, title, value, subtitle, theme = 'indigo' }) {

  const themeConfig = {
    cyan: {
      bg: 'bg-yellow-50/80',
      border: 'border-2 border-yellow-200/70',
      titleColor: 'text-yellow-900',
      valueColor: 'text-yellow-900',
      subtitleColor: 'text-yellow-900',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-900',
    },
    sky: {
      bg: 'bg-sky-50/70',
      border: 'border-2 border-sky-200/70',
      titleColor: 'text-sky-800',
      valueColor: 'text-sky-800',
      subtitleColor: 'text-sky-800',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-800',
    },
    orange: {
      bg: 'bg-orange-50/70',
      border: 'border-2 border-orange-200/70',
      titleColor: 'text-orange-800',
      valueColor: 'text-orange-800',
      subtitleColor: 'text-orange-800',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-800',
    },
    emerald: {
      bg: 'bg-stone-50/80',
      border: 'border-2 border-stone-200/70',
      titleColor: 'text-stone-900',
      valueColor: 'text-stone-900',
      subtitleColor: 'text-stone-900',
      iconBg: 'bg-stone-100',
      iconColor: 'text-stone-900',
    },
    fuchsia: {
      bg: 'bg-fuchsia-50/70',
      border: 'border-2 border-fuchsia-200/70',
      titleColor: 'text-fuchsia-800',
      valueColor: 'text-fuchsia-800',
      subtitleColor: 'text-fuchsia-800',
      iconBg: 'bg-fuchsia-100',
      iconColor: 'text-fuchsia-800',
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-2 border-rose-200/70',
      titleColor: 'text-rose-800',
      valueColor: 'text-rose-800',
      subtitleColor: 'text-rose-800',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-800',
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
});

// Format date to YYYY-MM-DD without timezone shift
const formatDateOnly = (dateValue) => {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  // Use UTC methods to avoid timezone shift
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminSiswaPage() {
  const { data: siswaData, error: siswaError, mutate: refetchSiswa } = useSWR('/api/admin/siswa', fetcher);
  const { data: kelasData, error: kelasError } = useSWR('/api/kelas', fetcher);

  const siswa = siswaData?.data || (Array.isArray(siswaData) ? siswaData : []);
  const kelas = Array.isArray(kelasData) ? kelasData : (kelasData?.data || []);
  const loading = !siswaData && !siswaError;

  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeoutId, setSearchTimeoutId] = useState(null);
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStatusSiswa, setFilterStatusSiswa] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchError = siswaError?.message || kelasError?.message;


  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    if (!searchTerm.trim()) {
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(() => {
      // Search is done client-side via filteredSiswa below
      setSearching(false);
    }, 300);

    setSearchTimeoutId(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchTerm, searchTimeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutId) clearTimeout(searchTimeoutId);
    };
  }, [searchTimeoutId]);

  // Refresh data after status change or create
  // Mutate is handled by SWR mutate function refetchSiswa


  const handleImport = async (e) => {
    e.preventDefault();
    // TODO: Implement import CSV
    alert('Fitur import CSV akan segera tersedia.');
    setShowImportModal(false);
  };

  const handleDownloadTemplate = () => {
    // Simplified template with 7 required columns
    const templateData = [
      {
        'Nama Lengkap Siswa': 'Abdullah Rahman',
        'NISN': '0012345678',
        'NIS': '24001',
        'Tanggal Lahir': '2010-05-15',
        'Jenis Kelamin': 'L',
        'Nama Wali': 'Ahmad Rahman',
        'Jenis Kelamin Wali': 'L'
      },
      {
        'Nama Lengkap Siswa': 'Fatimah Azzahra',
        'NISN': '0012345679',
        'NIS': '24002',
        'Tanggal Lahir': '2010-08-22',
        'Jenis Kelamin': 'P',
        'Nama Wali': 'Siti Aminah',
        'Jenis Kelamin Wali': 'P'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 25 }, // Nama Lengkap Siswa
      { wch: 15 }, // NISN
      { wch: 12 }, // NIS
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // Jenis Kelamin
      { wch: 25 }, // Nama Wali
      { wch: 15 }  // Jenis Kelamin Wali
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import Siswa');
    XLSX.writeFile(wb, 'Template_Import_Siswa_SIMTAQ.xlsx');
  };

  const handleExportData = () => {
    try {
      // Prepare siswa data for export (ordered columns)
      const exportDataSiswa = (Array.isArray(filteredSiswa) ? filteredSiswa : []).map(s => ({
        'Nama Lengkap': s.user?.name || '-',
        'NISN': s.nisn || '-',
        'NIS': s.nis || '-',
        'Tempat Lahir': s.tempatLahir || '-',
        'Tanggal Lahir': formatDateOnly(s.tanggalLahir) || '-',
        'Alamat': s.alamat || '-',
        'No. HP': '-', // TODO: Will be added when User.phone is implemented
        'Kelas': s.kelas?.nama || '-',
        'Status': s.user?.isActive ? 'Aktif' : 'Tidak Aktif',
        'Validasi': s.status === 'approved' ? 'Tervalidasi' : s.status === 'rejected' ? 'Ditolak' : 'Pending'
      }));

      // Prepare orang tua data for export
      const exportDataOrangTua = [];
      (Array.isArray(filteredSiswa) ? filteredSiswa : []).forEach(s => {
        if (s.orangTuaSiswa && s.orangTuaSiswa.length > 0) {
          s.orangTuaSiswa.forEach(relation => {
            const ortu = relation.orangTua;
            if (ortu && ortu.user) {
              // Password format: NISN-YYYY (from birth year)
              const birthYear = s.tanggalLahir ? new Date(s.tanggalLahir).getFullYear() : '';
              const passwordOrtu = birthYear ? `${s.nisn}-${birthYear}` : s.nisn;
              
              exportDataOrangTua.push({
                'Nama Orang Tua': ortu.user.name || '-',
                'Username': ortu.user.username || `${s.nis}_WALI`,
                'Password': passwordOrtu,
                'Jenis Kelamin': ortu.jenisKelamin || '-',
                'Hubungan': relation.hubungan || 'Orang Tua',
                'Nama Siswa': s.user?.name || '-',
                'NIS Siswa': s.nis || '-'
              });
            }
          });
        }
      });

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Data Siswa
      const wsSiswa = XLSX.utils.json_to_sheet(exportDataSiswa);
      wsSiswa['!cols'] = [
        { wch: 25 }, // Nama Lengkap
        { wch: 15 }, // NISN
        { wch: 12 }, // NIS
        { wch: 20 }, // Tempat Lahir
        { wch: 15 }, // Tanggal Lahir
        { wch: 35 }, // Alamat
        { wch: 15 }, // No HP
        { wch: 15 }, // Kelas
        { wch: 12 }, // Status
        { wch: 15 }  // Validasi
      ];
      XLSX.utils.book_append_sheet(wb, wsSiswa, 'Data Siswa');

      // Sheet 2: Data Orang Tua (if any)
      if (exportDataOrangTua.length > 0) {
        const wsOrangTua = XLSX.utils.json_to_sheet(exportDataOrangTua);
        wsOrangTua['!cols'] = [
          { wch: 25 }, // Nama Orang Tua
          { wch: 20 }, // Username
          { wch: 20 }, // Password
          { wch: 15 }, // Jenis Kelamin
          { wch: 15 }, // Hubungan
          { wch: 25 }, // Nama Siswa
          { wch: 12 }  // NIS Siswa
        ];
        XLSX.utils.book_append_sheet(wb, wsOrangTua, 'Data Orang Tua');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Data_Siswa_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data: ' + error.message);
    }
  };

  const handleEdit = (siswaItem) => {
    // TODO: Implement edit
    alert('Untuk mengedit data siswa lengkap, gunakan menu Kelas → Kelola Siswa');
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;
    // TODO: Implement delete
    alert('Fitur hapus akan segera tersedia.');
  };

  const handleChangeStatus = (siswaItem, status) => {
    setSelectedSiswa(siswaItem);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedSiswa || !newStatus) return;

    setIsUpdatingStatus(true);
    try {
      console.log('📤 Sending status update request:', {
        siswaId: selectedSiswa.id,
        siswaName: selectedSiswa.user.name,
        newStatus,
      });

      const response = await fetch(`/api/admin/siswa/${selectedSiswa.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusSiswa: newStatus }),
      });

      const result = await response.json();
      console.log('📥 Response received:', { status: response.status, result });

      if (response.ok) {
        // Refresh data
        await refetchSiswa();

        // Close modal and show success message
        setShowStatusModal(false);
        alert(`✅ ${result.message}`);
      } else {
        // Show detailed error message
        const errorMsg = result.details
          ? `${result.error}\n\n${JSON.stringify(result.details, null, 2)}`
          : result.error || 'Gagal mengubah status';
        console.error('❌ API Error:', result);
        alert(`❌ Gagal mengubah status:\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Network/Parse Error:', error);
      alert(`❌ Terjadi kesalahan saat mengubah status siswa:\n${error.message}`);
    } finally {
      setIsUpdatingStatus(false);
      setSelectedSiswa(null);
      setNewStatus('');
    }
  };

  // Filter data
  const filteredSiswa = siswa.filter(s => {
    const matchSearch = s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nis && s.nis.includes(searchTerm)) ||
      (s.nisn && s.nisn.includes(searchTerm));

    const matchKelas = filterKelas === 'all' ||
      (s.kelasId && s.kelasId.toString() === filterKelas);

    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && s.status === 'approved') ||
      (filterStatus === 'unvalidated' && s.status !== 'approved');

    const matchStatusSiswa = filterStatusSiswa === 'all' ||
      s.statusSiswa === filterStatusSiswa;

    return matchSearch && matchKelas && matchStatus && matchStatusSiswa;
  });

  // Calculate total hafalan for each siswa
  const getSiswaHafalan = (siswaItem) => {
    if (!siswaItem.hafalanSiswa || siswaItem.hafalanSiswa.length === 0) return 0;

    // Count unique juz from hafalan
    const uniqueJuz = new Set(
      siswaItem.hafalanSiswa
        .filter(h => h.status === 'APPROVED')
        .map(h => h.juz)
    );
    return uniqueJuz.size;
  };

  // Statistics
  const stats = {
    total: siswa.length,
    active: siswa.filter(s => s.status === 'approved').length,
    unvalidated: siswa.filter(s => s.status !== 'approved').length,
    statusCounts: {
      AKTIF: siswa.filter(s => s.statusSiswa === 'AKTIF').length,
      LULUS: siswa.filter(s => s.statusSiswa === 'LULUS').length,
      PINDAH: siswa.filter(s => s.statusSiswa === 'PINDAH').length,
      KELUAR: siswa.filter(s => s.statusSiswa === 'KELUAR').length,
    },
  };

  // No full page loading, use skeletons instead


  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Hero Header with Green Gradient */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 py-8 rounded-3xl shadow-lg px-6 mt-4">
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Manajemen Siswa</h1>
                    <p className="text-white/90 text-sm mt-1">Kelola data siswa tahfidz dengan mudah dan efisien</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:flex md:flex-row md:items-center md:justify-end gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm md:text-xs lg:text-sm shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <UserPlus size={18} />
                  <span>Tambah Siswa</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all whitespace-nowrap"
                >
                  <Download size={18} />
                  <span>Template</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all whitespace-nowrap"
                >
                  <Upload size={18} />
                  <span>Import</span>
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm md:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all whitespace-nowrap"
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
          {fetchError ? (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-rose-200/60 p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {fetchError}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                Muat Ulang Halaman
              </button>
            </div>
          ) : (
            <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              ) : (
                <>
                  <StatCard
                    icon={Users}
                    title="Total Siswa"
                    value={stats.total}
                    subtitle="Total siswa terdaftar"
                    theme="cyan"
                  />
                  <StatCard
                    icon={UserCheck}
                    title="Siswa Aktif"
                    value={stats.active}
                    subtitle="Siswa tervalidasi dan aktif"
                    theme="sky"
                  />
                  <StatCard
                    icon={AlertCircle}
                    title="Belum Divalidasi"
                    value={stats.unvalidated}
                    subtitle="Menunggu validasi"
                    theme="orange"
                  />
                  <StatCard
                    icon={GraduationCap}
                    title="Siswa Lulus"
                    value={stats.statusCounts.LULUS}
                    subtitle="Siswa yang telah lulus"
                    theme="emerald"
                  />
                  <StatCard
                    icon={ArrowUpRight}
                    title="Siswa Pindah"
                    value={stats.statusCounts.PINDAH}
                    subtitle="Siswa yang pindah sekolah"
                    theme="fuchsia"
                  />
                  <StatCard
                    icon={XCircle}
                    title="Siswa Keluar"
                    value={stats.statusCounts.KELUAR}
                    subtitle="Siswa yang keluar/non-aktif"
                    theme="rose"
                  />
                </>
              )}
            </div>


            {/* Search & Filter Section - Glass Effect */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Cari Siswa
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Cari nama, NIS, NISN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/50 hover:bg-white/70"
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingIndicator size="small" text="" inline />
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter Kelas */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Kelas
                  </label>
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua Kelas</option>
                    {(Array.isArray(kelas) ? kelas : []).map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Status Validasi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Validasi
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua</option>
                    <option value="active">Tervalidasi</option>
                    <option value="unvalidated">Belum Divalidasi</option>
                  </select>
                </div>

                {/* Filter Status Siswa */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Status Siswa
                  </label>
                  <select
                    value={filterStatusSiswa}
                    onChange={(e) => setFilterStatusSiswa(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua ({siswa.length})</option>
                    <option value="AKTIF">✅ Aktif ({stats.statusCounts.AKTIF})</option>
                    <option value="LULUS">🎓 Lulus ({stats.statusCounts.LULUS})</option>
                    <option value="PINDAH">↗️ Pindah ({stats.statusCounts.PINDAH})</option>
                    <option value="KELUAR">❌ Keluar ({stats.statusCounts.KELUAR})</option>
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">NIS</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Tanggal Lahir</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Kelas</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Validasi</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Status Siswa</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Bergabung</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={8} />
                      ))
                    ) : (!Array.isArray(filteredSiswa) || filteredSiswa.length === 0) ? (

                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <EmptyState
                            title="Tidak ada data siswa"
                            description="Tidak ditemukan data siswa yang sesuai dengan filter atau pencarian saat ini."
                            icon={Users}
                            className="bg-transparent border-none shadow-none py-0"
                          />
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(filteredSiswa) ? filteredSiswa : []).map((siswaItem) => {
                        const statusBadge = getStatusBadgeConfig(siswaItem.statusSiswa || 'AKTIF');

                        return (
                          <tr key={siswaItem.id} className="border-b border-emerald-100/40 hover:bg-emerald-50/30 transition-colors">
                            {/* Nama Lengkap */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                  {siswaItem.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{siswaItem.user.name}</p>
                                  {siswaItem.nisn && (
                                    <p className="text-xs text-gray-500">NISN: {siswaItem.nisn}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* NIS */}
                            <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{siswaItem.nis}</td>

                            {/* Tanggal Lahir */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatDateOnly(siswaItem.tanggalLahir) || '-'}
                            </td>

                            {/* Kelas */}
                            <td className="px-6 py-4">
                              {siswaItem.kelas ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100/50 text-emerald-700">
                                  <GraduationCap size={13} />
                                  {siswaItem.kelas.nama}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">Belum ada kelas</span>
                              )}
                            </td>

                            {/* Validasi Status */}
                            <td className="px-6 py-4">
                              <span className={`inline-block px-4 py-1.5 text-xs font-semibold rounded-full ${
                                siswaItem.status === 'approved'
                                  ? 'bg-emerald-100/70 text-emerald-700'
                                  : 'bg-amber-100/70 text-amber-700'
                              }`}>
                                {siswaItem.status === 'approved' ? 'Tervalidasi' : 'Pending'}
                              </span>
                            </td>

                            {/* Status Siswa Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                                {statusBadge.emoji} {statusBadge.label}
                              </span>
                            </td>

                            {/* Tanggal Bergabung */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatTanggal(siswaItem.user?.createdAt)}
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-4 text-center">
                              <RowActionMenu
                                statusSiswa={siswaItem.statusSiswa || 'AKTIF'}
                                kelasNama={siswaItem.kelas?.nama}
                                kelasId={siswaItem.kelas?.id}
                                onAktifkan={() => handleChangeStatus(siswaItem, 'AKTIF')}
                                onLulus={() => handleChangeStatus(siswaItem, 'LULUS')}
                                onPindah={() => handleChangeStatus(siswaItem, 'PINDAH')}
                                onKeluar={() => handleChangeStatus(siswaItem, 'KELUAR')}
                              />
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
          )}
      </div>

      {/* Student Create Modal */}
      <StudentCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refetchSiswa}
      />

      {/* Smart Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <SmartImport
            onSuccess={() => {
              setShowImportModal(false);
              refetchSiswa();
            }}
            onClose={() => setShowImportModal(false)}
          />
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && selectedSiswa && (
        <div
          onClick={() => !isUpdatingStatus && setShowStatusModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-emerald-100"
          >
            {/* Header */}
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Konfirmasi Perubahan Status
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Anda akan mengubah status siswa berikut:
                </p>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-xl p-5 mb-6">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedSiswa.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedSiswa.user.name}</p>
                  <p className="text-xs text-gray-600">NIS: {selectedSiswa.nis}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Status Saat Ini</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeConfig(selectedSiswa.statusSiswa || 'AKTIF').bgColor} ${getStatusBadgeConfig(selectedSiswa.statusSiswa || 'AKTIF').textColor} ${getStatusBadgeConfig(selectedSiswa.statusSiswa || 'AKTIF').borderColor}`}>
                    {getStatusBadgeConfig(selectedSiswa.statusSiswa || 'AKTIF').emoji} {getStatusBadgeConfig(selectedSiswa.statusSiswa || 'AKTIF').label}
                  </span>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="flex-1 text-right">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Status Baru</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeConfig(newStatus).bgColor} ${getStatusBadgeConfig(newStatus).textColor} ${getStatusBadgeConfig(newStatus).borderColor}`}>
                    {getStatusBadgeConfig(newStatus).emoji} {getStatusBadgeConfig(newStatus).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {newStatus !== 'AKTIF' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>⚠️ Perhatian:</strong> Mengubah status menjadi <strong>{getStatusBadgeConfig(newStatus).label}</strong> akan menonaktifkan akun siswa ini. Siswa tidak akan bisa login sampai status diubah kembali ke Aktif.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdatingStatus}
                className="px-6 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={isUpdatingStatus}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdatingStatus ? (
                  <LoadingIndicator size="small" text="Mengubah..." inline className="text-white" />
                ) : (
                  'Ya, Ubah Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Keyframe Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Stats Card Hover */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        /* Button Hover Effects */
        .import-btn:hover {
          background: #f0fdf4 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.15) !important;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 147, 111, 0.3) !important;
        }

        /* Input Focus */
        .search-input:focus,
        .filter-select:focus {
          border-color: #059669 !important;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2) !important;
        }

        /* Action Button Hover */
        .action-btn-status:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          filter: brightness(0.95);
        }

        /* Form Button Hover */
        .cancel-btn:hover {
          background: #f3f4f6 !important;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
