'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Upload, Search, Edit, Trash2, Users, UserCheck, AlertCircle, GraduationCap, BookOpen, CheckCircle, XCircle, ArrowUpRight, Award } from 'lucide-react';
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
function StatCard({ icon: Icon, title, value, subtitle, theme = 'indigo' }) {
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
          <Icon size={24} className={config.iconColor} />
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

export default function AdminSiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Initial fetch: both data in parallel
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [siswaRes, kelasRes] = await Promise.all([
          fetch('/api/admin/siswa', { credentials: 'include' }),
          fetch('/api/kelas', { credentials: 'include' })
        ]);

        if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
        if (!kelasRes.ok) throw new Error('Failed to fetch kelas');

        const siswaData = await siswaRes.json();
        const kelasData = await kelasRes.json();

        // Handle API response structure (data property or direct array)
        const parsedSiswa = siswaData.data || (Array.isArray(siswaData) ? siswaData : []);
        const parsedKelas = Array.isArray(kelasData) ? kelasData : (kelasData.data || []);

        setSiswa(parsedSiswa);
        setKelas(parsedKelas);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSiswa([]);
        setKelas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
  const refetchSiswa = async () => {
    try {
      const response = await fetch('/api/admin/siswa', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      const data = result.data || (Array.isArray(result) ? result : []);
      setSiswa(data);
    } catch (error) {
      console.error('Error refetching siswa:', error);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    // TODO: Implement import CSV
    alert('Fitur import CSV akan segera tersedia.');
    setShowImportModal(false);
  };

  const handleExportData = () => {
    try {
      // Prepare data for export
      const exportData = filteredSiswa.map(s => ({
        'NIS': s.nis || '-',
        'NISN': s.nisn || '-',
        'Nama Lengkap': s.user.name,
        'Email': s.user.email,
        'Jenis Kelamin': s.jenisKelamin || '-',
        'Tempat Lahir': s.tempatLahir || '-',
        'Tanggal Lahir': s.tanggalLahir ? new Date(s.tanggalLahir).toLocaleDateString('id-ID') : '-',
        'Alamat': s.alamat || '-',
        'No. HP': s.noTelepon || '-',
        'Kelas': s.kelas?.nama || '-',
        'Status': s.user.isActive ? 'Aktif' : 'Tidak Aktif',
        'Validasi': s.status === 'approved' ? 'Tervalidasi' : s.status === 'rejected' ? 'Ditolak' : 'Pending'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // NIS
        { wch: 15 }, // NISN
        { wch: 25 }, // Nama
        { wch: 30 }, // Email
        { wch: 15 }, // Jenis Kelamin
        { wch: 20 }, // Tempat Lahir
        { wch: 15 }, // Tanggal Lahir
        { wch: 35 }, // Alamat
        { wch: 15 }, // No HP
        { wch: 15 }, // Kelas
        { wch: 12 }, // Status
        { wch: 15 }  // Validasi
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');

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
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  if (loading) {
    return (
      <AdminLayout>
        <LoadingIndicator text="Memuat data siswa..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-x-hidden">
        {/* Hero Header with Green Gradient */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-4 sm:px-6 lg:px-8 py-8 rounded-3xl shadow-lg mx-4 sm:mx-6 lg:mx-8">
          {/* Decorative Blur Circles */}
          <div className="absolute top-0 -right-16 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-full max-w-none relative z-10">
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
              <div className="grid grid-cols-2 md:flex md:flex-nowrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-[10px] sm:text-xs lg:text-sm shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all"
                >
                  <UserPlus size={18} />
                  <span>Tambah Siswa</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-[10px] sm:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <Upload size={18} />
                  <span>Import</span>
                </button>
                <button
                  onClick={handleExportData}
                  className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-[10px] sm:text-xs lg:text-sm hover:bg-white/30 backdrop-blur-sm transition-all"
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
        <div className="relative z-10 w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      placeholder="Cari nama, email, NISN..."
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
                    {kelas.map(k => (
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Kelas</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Validasi</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Status Siswa</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Hafalan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Bergabung</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSiswa.length === 0 ? (
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
                      filteredSiswa.map((siswaItem) => {
                        const totalHafalan = getSiswaHafalan(siswaItem);
                        const isValidated = siswaItem.status === 'approved';
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

                            {/* Email */}
                            <td className="px-6 py-4 text-sm text-gray-700">{siswaItem.user.email}</td>

                            {/* Kelas */}
                            <td className="px-6 py-4">
                              {siswaItem.kelas ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100/50 text-emerald-700">
                                  <GraduationCap size={13} />
                                  {siswaItem.kelas.namaKelas}
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

                            {/* Total Hafalan */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-emerald-600" />
                                <span className="text-sm font-semibold text-gray-900">{totalHafalan} Juz</span>
                              </div>
                            </td>

                            {/* Tanggal Bergabung */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatTanggal(siswaItem.user?.createdAt)}
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-4 text-center">
                              <RowActionMenu
                                statusSiswa={siswaItem.statusSiswa || 'AKTIF'}
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
        </div>
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
                  <p className="text-xs text-gray-600">{selectedSiswa.user.email}</p>
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
