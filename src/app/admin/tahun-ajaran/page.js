'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Plus, CheckCircle2, Edit, Trash2,
  BookOpen, Users, GraduationCap, Clock, XCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';

// Color Palette
const colors = {
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    warm: '#FFD78C',
    soft: '#FFE6A7',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    pastel: '#C4F1C1',
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
  },
  text: {
    primary: '#1F2937',
    secondary: '#374151',
    tertiary: '#6B7280',
  },
  pastels: {
    lemon: { bg: '#FFFDE7', border: '#FFF59D', text: '#F57F17' },
    sky: { bg: '#E0F7FA', border: '#80DEEA', text: '#0277BD' },
    mint: { bg: '#E0F2F1', border: '#80CBC4', text: '#00695C' },
  },
};

// Success Check Animation
function SuccessCheck({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      animation: 'successPulse 0.6s ease-out',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.emerald.pastel} 0%, ${colors.emerald[400]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
        animation: 'checkBounce 0.6s ease-out',
      }}>
        <CheckCircle2 size={48} color={colors.white} strokeWidth={3} />
      </div>
      <p style={{
        fontSize: '18px',
        fontWeight: 600,
        color: colors.emerald[600],
        fontFamily: '"Poppins", sans-serif',
        animation: 'fadeInUp 0.6s ease-out 0.3s both',
      }}>
        Periode Berhasil Diaktifkan!
      </p>
    </div>
  );
}

export default function AdminTahunAjaranPage() {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({ jumlahKelas: 0, jumlahSiswa: 0 });
  const [showTahunAjaranModal, setShowTahunAjaranModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [editingTahunAjaran, setEditingTahunAjaran] = useState(null);
  const [showUpdateTargetModal, setShowUpdateTargetModal] = useState(false);
  const [targetHafalanInput, setTargetHafalanInput] = useState('');
  const [tahunAjaranFormData, setTahunAjaranFormData] = useState({
    nama: '',
    semester: 1,
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  useEffect(() => {
    fetchTahunAjaran();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await fetch('/api/tahun-ajaran/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      // Fallback to empty summary on error
      setSummary({ jumlahKelas: null, jumlahSiswa: null });
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/tahun-ajaran');
      const data = await response.json();
      setTahunAjaran(data);
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTahunAjaranSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTahunAjaran ? `/api/admin/tahun-ajaran/${editingTahunAjaran.id}` : '/api/admin/tahun-ajaran';
      const method = editingTahunAjaran ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tahunAjaranFormData),
      });

      if (response.ok) {
        alert(editingTahunAjaran ? 'Tahun ajaran berhasil diupdate' : 'Tahun ajaran berhasil ditambahkan');
        setShowTahunAjaranModal(false);
        resetTahunAjaranForm();
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data tahun ajaran');
      }
    } catch (error) {
      console.error('Error saving tahun ajaran:', error);
      alert('Gagal menyimpan data tahun ajaran');
    }
  };

  const handleActivatePeriod = (tahunAjaranItem) => {
    setSelectedTahunAjaran(tahunAjaranItem);
    setShowActivateModal(true);
  };

  const confirmActivate = async () => {
    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${selectedTahunAjaran.id}/activate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setShowActivateModal(false);
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          fetchTahunAjaran();
          fetchSummary();
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengaktifkan periode');
      }
    } catch (error) {
      console.error('Error activating period:', error);
      alert('Gagal mengaktifkan periode');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Yakin ingin menonaktifkan tahun ajaran ini?')) return;
    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${id}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Tahun ajaran berhasil dinonaktifkan');
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menonaktifkan tahun ajaran');
      }
    } catch (error) {
      console.error('Error deactivating tahun ajaran:', error);
      alert('Gagal menonaktifkan tahun ajaran');
    }
  };

  const handleEdit = (tahunAjaranItem) => {
    setEditingTahunAjaran(tahunAjaranItem);
    setTahunAjaranFormData({
      nama: tahunAjaranItem.nama,
      semester: tahunAjaranItem.semester,
      tanggalMulai: tahunAjaranItem.tanggalMulai.split('T')[0],
      tanggalSelesai: tahunAjaranItem.tanggalSelesai.split('T')[0],
    });
    setShowTahunAjaranModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus tahun ajaran ini? Data terkait akan terpengaruh.')) return;
    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tahun ajaran berhasil dihapus');
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus tahun ajaran');
      }
    } catch (error) {
      console.error('Error deleting tahun ajaran:', error);
      alert('Gagal menghapus tahun ajaran');
    }
  };

  const resetTahunAjaranForm = () => {
    setTahunAjaranFormData({
      nama: '',
      semester: 1,
      tanggalMulai: '',
      tanggalSelesai: '',
    });
    setEditingTahunAjaran(null);
  };

  const handleUpdateTargetHafalan = async (e) => {
    e.preventDefault();

    if (!stats.activeTahunAjaranId) {
      alert('Tahun ajaran aktif tidak ditemukan');
      return;
    }

    const numTarget = parseInt(targetHafalanInput);
    if (isNaN(numTarget) || numTarget < 1 || numTarget > 30) {
      alert('Target hafalan harus antara 1-30 juz');
      return;
    }

    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${stats.activeTahunAjaranId}/target`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetHafalan: numTarget }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Target hafalan berhasil diperbarui.');
        setShowUpdateTargetModal(false);
        setTargetHafalanInput('');
        fetchTahunAjaran();
      } else {
        alert(data.error || 'Gagal memperbarui target hafalan');
      }
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Gagal memperbarui target hafalan: ' + error.message);
    }
  };

  // Statistics
  const activeTahunAjaran = tahunAjaran.find(ta => ta.isActive);
  const stats = {
    activePeriod: activeTahunAjaran ? `${activeTahunAjaran.nama} - Semester ${activeTahunAjaran.semester}` : 'Belum ada',
    activePeriodSubtitle: activeTahunAjaran ? `${new Date(activeTahunAjaran.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(activeTahunAjaran.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
    totalKelas: summary.jumlahKelas,
    totalSiswa: summary.jumlahSiswa,
    activeTargetHafalan: activeTahunAjaran?.targetHafalan || null,
    activeTahunAjaranId: activeTahunAjaran?.id || null,
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingIndicator text="Memuat data tahun ajaran..." className="py-20" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-4 sm:px-6 lg:px-8 py-8 rounded-3xl shadow-lg mx-4 sm:mx-6 lg:mx-8 mt-4 mb-8">
          <div className="absolute top-0 -right-16 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">Manajemen Tahun Ajaran</h1>
                  <p className="text-white/90 text-sm mt-1">Kelola periode pembelajaran dan siklus tahfidz tahunan</p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetTahunAjaranForm();
                  setShowTahunAjaranModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Tambah Tahun Ajaran</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="space-y-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: Active Period - Amber Theme */}
              <div className="md:col-span-6 col-span-12 bg-amber-50/70 backdrop-blur rounded-2xl p-6 border border-amber-200/60 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ring-1 ring-amber-200/40">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Calendar size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-800 tracking-wide uppercase">Tahun Ajaran Aktif</p>
                    <h3 className="text-lg font-bold text-amber-800 mt-2">{stats.activePeriod}</h3>
                  </div>
                </div>
                {stats.activePeriodSubtitle && (
                  <p className="text-xs text-amber-600/80 px-0.5 mb-4">{stats.activePeriodSubtitle}</p>
                )}
                
                {/* Target Hafalan Widget - Amber Themed */}
                {stats.activePeriod !== 'Belum ada' && (
                  <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200/50 ring-1 ring-amber-200/30 rounded-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-amber-800 tracking-wide uppercase">Target Tahun Ini</p>
                        <p className="text-2xl font-bold text-amber-700 mt-0.5">{stats.activeTargetHafalan || '-'} Juz</p>
                      </div>
                      <button
                        onClick={() => {
                          if (stats.activeTahunAjaranId) {
                            setTargetHafalanInput(stats.activeTargetHafalan?.toString() || '');
                            setShowUpdateTargetModal(true);
                          }
                        }}
                        className="h-9 px-4 bg-white rounded-lg text-xs font-semibold border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors duration-200 whitespace-nowrap"
                      >
                        Perbarui
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Total Classes - Blue Theme */}
              <div className="md:col-span-3 col-span-12 bg-blue-50/70 backdrop-blur rounded-2xl p-6 border border-blue-200/60 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ring-1 ring-blue-200/40">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={22} />
                  </div>
                  <p className="text-xs font-semibold text-blue-800 tracking-wide uppercase mt-1">Jumlah Kelas</p>
                </div>
                {summaryLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-blue-200/40 rounded-lg w-20 ml-16 mb-3"></div>
                    <div className="h-4 bg-blue-200/40 rounded-lg w-32"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-blue-700 ml-16 -mt-12">{summary.jumlahKelas ?? '−'}</h3>
                    <p className="text-xs text-blue-600/80 mt-3">Periode aktif</p>
                  </>
                )}
              </div>

              {/* Card 3: Total Students - Emerald Theme */}
              <div className="md:col-span-3 col-span-12 bg-emerald-50/70 backdrop-blur rounded-2xl p-6 border border-emerald-200/60 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ring-1 ring-emerald-200/40">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Users size={22} />
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 tracking-wide uppercase mt-1">Jumlah Siswa</p>
                </div>
                {summaryLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-emerald-200/40 rounded-lg w-20 ml-16 mb-3"></div>
                    <div className="h-4 bg-emerald-200/40 rounded-lg w-32"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-emerald-700 ml-16 -mt-12">{summary.jumlahSiswa ?? '−'}</h3>
                    <p className="text-xs text-emerald-600/80 mt-3">Semua periode</p>
                  </>
                )}
              </div>
            </div>

            {/* Table Section */}
            <div className="mt-6 bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm overflow-hidden">
              {/* Table Toolbar */}
              <div className="px-6 py-4 border-b border-emerald-100/50 bg-white/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap size={20} className="text-emerald-700" />
                    <h2 className="text-lg font-bold text-emerald-900">Daftar Periode Tahun Ajaran</h2>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Total: {tahunAjaran.length} periode
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-emerald-50/70 border-b border-emerald-100/50">
                      <th className="w-1 px-0"></th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wide">Tahun Ajaran</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wide">Periode</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wide">Tanggal Mulai</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wide">Tanggal Selesai</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-emerald-800 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tahunAjaran.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <EmptyState
                            title="Belum ada tahun ajaran"
                            description="Silakan tambahkan tahun ajaran baru untuk memulai sistem."
                            icon={Calendar}
                            className="bg-transparent border-none shadow-none py-0"
                          />
                        </td>
                      </tr>
                    ) : (
                      tahunAjaran.map((taItem, index) => (
                        <tr
                          key={taItem.id}
                          className={`border-b border-emerald-100/40 transition-colors duration-200 ${
                            taItem.isActive
                              ? 'border-l-4 border-l-emerald-300/70 hover:bg-emerald-50/50 bg-white/40'
                              : 'hover:bg-emerald-50/30 bg-white/20'
                          }`}
                          style={{ animation: `fadeInUp 0.4s ease-out ${0.4 + (index * 0.05)}s both` }}
                        >
                          {/* Accent Strip */}
                          <td className="w-1" style={{
                            background: taItem.isActive ? 'linear-gradient(to bottom, rgb(16, 185, 129), rgb(5, 150, 105))' : '#E5E7EB',
                          }}></td>

                          <td className="px-6 py-4 font-semibold text-gray-900">{taItem.nama}</td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50/70 text-sky-700 rounded-lg text-xs font-medium">
                              <Clock size={13} />
                              Semester {taItem.semester === 1 ? 'Ganjil' : 'Genap'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                              style={{
                                background: taItem.isActive ? '#DCFCE7' : '#F1F5F9',
                                borderColor: taItem.isActive ? '#BBF7D0' : '#E2E8F0',
                                color: taItem.isActive ? '#166534' : '#475569',
                              }}>
                              {taItem.isActive ? '● Aktif' : '○ Nonaktif'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(taItem.tanggalMulai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(taItem.tanggalSelesai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center flex-wrap">
                              {taItem.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(taItem.id)}
                                  className="h-8 w-8 rounded-lg bg-rose-100/80 text-rose-600 hover:bg-rose-200 transition-colors duration-200 flex items-center justify-center"
                                  title="Nonaktifkan"
                                >
                                  <XCircle size={15} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivatePeriod(taItem)}
                                  className="h-8 w-8 rounded-lg bg-emerald-100/80 text-emerald-600 hover:bg-emerald-200 transition-colors duration-200 flex items-center justify-center"
                                  title="Aktifkan"
                                >
                                  <CheckCircle2 size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(taItem)}
                                className="h-8 w-8 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-colors duration-200 flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(taItem.id)}
                                className="h-8 w-8 rounded-lg bg-rose-100/80 text-rose-600 hover:bg-rose-200 transition-colors duration-200 flex items-center justify-center"
                                title="Hapus"
                              >
                                <Trash2 size={15} />
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
      </div>

      {/* Modal Tambah/Edit Tahun Ajaran */}
      {showTahunAjaranModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-slate-200/60 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowTahunAjaranModal(false);
                  resetTahunAjaranForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTahunAjaranSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Tahun Ajaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2024/2025"
                  value={tahunAjaranFormData.nama}
                  onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, nama: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester *</label>
                <select
                  required
                  value={tahunAjaranFormData.semester}
                  onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, semester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                >
                  <option value={1}>Semester 1 (Ganjil)</option>
                  <option value={2}>Semester 2 (Genap)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={tahunAjaranFormData.tanggalMulai}
                    onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, tanggalMulai: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={tahunAjaranFormData.tanggalSelesai}
                    onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, tanggalSelesai: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTahunAjaranModal(false);
                    resetTahunAjaranForm();
                  }}
                  className="px-6 py-2.5 border border-slate-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  {editingTahunAjaran ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aktivasi Periode */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-emerald-200/60 animate-in fade-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Aktifkan Periode Ini?</h2>
              <p className="text-sm text-gray-600">Periode aktif sebelumnya akan dinonaktifkan</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg mb-6 border border-amber-200/60">
              <p className="text-sm font-semibold text-amber-900">
                {selectedTahunAjaran?.nama} - Semester {selectedTahunAjaran?.semester}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowActivateModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmActivate}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm"
              >
                Ya, Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Modal */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-12 max-w-sm w-full shadow-xl border border-emerald-200/60">
            <SuccessCheck onComplete={() => setShowSuccessAnimation(false)} />
          </div>
        </div>
      )}

      {/* Modal Perbarui Target Hafalan */}
      {showUpdateTargetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-slate-200/60 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Perbarui Target Hafalan Tahun Ajaran</h2>
              <button
                onClick={() => setShowUpdateTargetModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateTargetHafalan} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Target Hafalan (dalam Juz)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  value={targetHafalanInput}
                  onChange={(e) => setTargetHafalanInput(e.target.value)}
                  placeholder="Contoh: 3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-2">Target berlaku untuk seluruh kelas dalam tahun ajaran ini.</p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateTargetModal(false)}
                  className="px-6 py-2.5 border border-slate-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes successPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes checkBounce {
          0%, 100% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.2);
          }
          60% {
            transform: scale(0.95);
          }
        }
      `}</style>
    </AdminLayout>
  );
}
