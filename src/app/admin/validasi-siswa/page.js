'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, CheckCircle, XCircle, Users, Clock, UserCheck, Search, Filter, Plus } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Toast from '@/components/ui/Toast';
import LoadingIndicator from "@/components/shared/LoadingIndicator";

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
    return '-';
  }
}

// Stat Card Component - Pastel dengan color matching
function StatCard({ icon: Icon, title, value, subtitle, theme = 'mint' }) {
  const themeConfig = {
    mint: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-2 border-emerald-200',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-800',
      subtitleColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    orange: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-2 border-amber-200',
      titleColor: 'text-amber-700',
      valueColor: 'text-amber-800',
      subtitleColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
      border: 'border-2 border-sky-200',
      titleColor: 'text-sky-700',
      valueColor: 'text-sky-800',
      subtitleColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
  };

  const config = themeConfig[theme] || themeConfig.mint;

  return (
    <div className={`${config.bg} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${config.border}`}>
      <div className="flex items-center gap-4">
        <div className={`${config.iconBg} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={24} className={config.iconColor} />
        </div>
        <div className="flex-1">
          <p className={`${config.titleColor} text-xs font-bold mb-1 tracking-wide uppercase`}>
            {title}
          </p>
          <p className={`${config.valueColor} text-3xl font-bold leading-tight mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className={`${config.subtitleColor} text-xs font-medium`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Info Field Card Component
function InfoFieldCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">{ label }</p>
      <p className="text-sm font-semibold text-slate-900 break-words">{ value || '-' }</p>
    </div>
  );
}

// Detail Modal Component - Field lengkap dengan sections rapi
function DetailModal({ siswa, onClose, onApprove, onReject }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopyPassword = () => {
    // Password tidak bisa di-copy (security), tapi bisa show UI feedback
    alert('Password tidak dapat di-copy untuk keamanan akun');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {siswa.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900 truncate">{siswa.user.name}</p>
              <p className="text-sm text-slate-500 truncate">{siswa.user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl flex-shrink-0 transition-colors ml-4"
          >
            ✕
          </button>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          
          {/* SECTION 1: Identitas Siswa */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Identitas Siswa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoFieldCard label="Nama Lengkap" value={siswa.user.name} />
              <InfoFieldCard label="NIS" value={siswa.nis} />
              <InfoFieldCard label="NISN" value={siswa.nisn} />
              <InfoFieldCard label="Email" value={siswa.user.email} />
            </div>
          </div>

          {/* SECTION 2: Informasi Akun */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Informasi Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Password</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${showPassword ? 'text-slate-900 font-mono' : 'text-slate-500 italic'}`}>
                    {showPassword ? '••••••••' : '••••••••'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">*Password tidak dapat ditampilkan untuk keamanan</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Data Akademik */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Data Akademik</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoFieldCard label="Kelas" value={siswa.kelas?.nama} />
              <InfoFieldCard label="Jenis Kelamin" value={siswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'} />
              <InfoFieldCard label="Tanggal Lahir" value={formatTanggal(siswa.tanggalLahir)} />
              <InfoFieldCard label="Tempat Lahir" value={siswa.tempatLahir} />
            </div>
          </div>

          {/* SECTION 4: Tambahan (Optional) */}
          {(siswa.noTelepon || siswa.alamat) && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Tambahan</h3>
              <div className="space-y-4">
                {siswa.noTelepon && (
                  <InfoFieldCard label="Nomor HP" value={siswa.noTelepon} />
                )}
                {siswa.alamat && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Alamat</p>
                    <p className="text-sm font-semibold text-slate-900 break-words whitespace-pre-wrap">{siswa.alamat}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Tanggal Pendaftaran */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Tanggal Pendaftaran</p>
            <p className="text-sm font-semibold text-blue-900">{formatTanggal(siswa.createdAt)}</p>
          </div>

        </div>

        {/* FOOTER - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-2xl font-semibold text-sm transition-all"
          >
            Tolak
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Validasi
          </button>
        </div>
      </div>
    </div>
  );
}

// Approve Modal
function ApproveModal({ siswa, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Validasi Siswa</h2>
          <p className="text-xs text-gray-500 mt-1">{siswa?.user.name}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-emerald-700">
            <strong>Akun siswa akan divalidasi</strong> dan siswa dapat langsung menggunakan akun mereka untuk login ke sistem.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? <LoadingIndicator inline text="Memproses..." size="small" /> : 'Ya, Validasi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reject Modal
function RejectModal({ siswa, onConfirm, onCancel, reason, setReason, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-3">
            <XCircle className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tolak Siswa</h2>
          <p className="text-xs text-gray-500 mt-1">{siswa?.user.name}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-700">
            <strong>Akun siswa akan ditolak.</strong> Pastikan Anda memberikan alasan yang jelas.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Alasan Penolakan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan penolakan..."
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            rows="3"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !reason.trim()}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? <LoadingIndicator inline text="Memproses..." size="small" /> : 'Ya, Tolak'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ValidasiSiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterKelas, setFilterKelas] = useState('all');
  const [kelas, setKelas] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch siswa
  const fetchSiswa = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterKelas !== 'all') params.append('kelasId', filterKelas);
      if (searchTerm) params.append('search', searchTerm);

      const url = `/api/admin/siswa?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();
      setSiswa(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setToast({ type: 'error', message: 'Gagal memuat data siswa' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterKelas, searchTerm]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    fetchSiswa();
  }, [fetchSiswa]);

  const handleApprove = async () => {
    if (!selectedSiswa) return;
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          action: 'approve',
        }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: '✓ Siswa berhasil divalidasi' });
        setShowApproveModal(false);
        setShowDetailModal(false);
        fetchSiswa();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal validasi siswa' });
      }
    } catch (error) {
      console.error('Error approving siswa:', error);
      setToast({ type: 'error', message: 'Terjadi kesalahan' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSiswa || !rejectionReason.trim()) return;
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          action: 'reject',
          rejectionReason,
        }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: '✓ Siswa berhasil ditolak' });
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectionReason('');
        fetchSiswa();
      } else {
        const error = await response.json();
        setToast({ type: 'error', message: error.error || 'Gagal menolak siswa' });
      }
    } catch (error) {
      console.error('Error rejecting siswa:', error);
      setToast({ type: 'error', message: 'Terjadi kesalahan' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Stats - Hitung berdasarkan data terbaru
  const stats = {
    total: siswa.length,
    menunggu: siswa.filter(s => s.status === 'pending').length,
    divalidasi: siswa.filter(s => s.status === 'approved').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingIndicator text="Memuat data validasi..." className="py-20" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-x-hidden">
        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 py-8 rounded-3xl shadow-lg">
          <div className="absolute top-0 -right-16 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-full max-w-none relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Validasi Siswa</h1>
                    <p className="text-white/90 text-sm mt-1">Verifikasi dan kelola pendaftaran siswa baru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-none py-8">
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={Users}
                title="Total Pendaftar"
                value={stats.total}
                subtitle="Seluruh siswa terdaftar"
                theme="mint"
              />
              <StatCard
                icon={Clock}
                title="Menunggu Validasi"
                value={stats.menunggu}
                subtitle="Perlu tindakan admin"
                theme="orange"
              />
              <StatCard
                icon={UserCheck}
                title="Sudah Divalidasi"
                value={stats.divalidasi}
                subtitle="Akun aktif"
                theme="sky"
              />
            </div>

            {/* Filter Section */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Cari Siswa
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Nama, email, atau NIS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/50 hover:bg-white/70"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu Validasi</option>
                    <option value="approved">Sudah Divalidasi</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                {/* Kelas Filter */}
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
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/50 border-b border-emerald-100/40">
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Nama Siswa</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">NIS</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Kelas</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswa.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Users size={48} className="text-gray-300" />
                            <div>
                              <p className="text-gray-500 font-semibold">Tidak ada data</p>
                              <p className="text-gray-400 text-sm">Tidak ada siswa yang sesuai dengan filter</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      siswa.map((s) => (
                        <tr key={s.id} className="hover:bg-emerald-50/30 border-b border-emerald-100/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {s.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {s.user.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.user.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.nis}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.kelas?.nama || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              s.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {s.status === 'pending' ? 'Menunggu' : s.status === 'approved' ? 'Validasi' : 'Ditolak'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedSiswa(s);
                                setShowDetailModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-semibold"
                            >
                              <Eye size={16} />
                              Lihat
                            </button>
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
      </div>

      {/* Modals */}
      {showDetailModal && selectedSiswa && (
        <DetailModal
          siswa={selectedSiswa}
          onClose={() => setShowDetailModal(false)}
          onApprove={() => {
            setShowDetailModal(false);
            setShowApproveModal(true);
          }}
          onReject={() => {
            setShowDetailModal(false);
            setShowRejectModal(true);
          }}
        />
      )}

      {showApproveModal && selectedSiswa && (
        <ApproveModal
          siswa={selectedSiswa}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveModal(false)}
          isLoading={isActionLoading}
        />
      )}

      {showRejectModal && selectedSiswa && (
        <RejectModal
          siswa={selectedSiswa}
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
          reason={rejectionReason}
          setReason={setRejectionReason}
          isLoading={isActionLoading}
        />
      )}
    </AdminLayout>
  );
}
