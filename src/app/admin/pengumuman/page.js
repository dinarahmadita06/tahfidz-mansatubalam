'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import {
  Home,
  ChevronRight,
  Megaphone,
  Plus,
  X,
  Calendar,
  Loader,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
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
};

export default function PengumumanPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pengumumanList, setPengumumanList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state - simplified
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    tanggalBerlaku: ''
  });

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pengumuman');
      if (res.ok) {
        const data = await res.json();
        setPengumumanList(data.pengumuman || []);
      }
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
      setError('Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validasi
      if (!formData.judul || !formData.isi) {
        setError('Judul dan isi harus diisi');
        setSubmitting(false);
        return;
      }

      const url = editingId ? `/api/admin/pengumuman?id=${editingId}` : '/api/admin/pengumuman';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        const message = editingId ? 'Pengumuman berhasil diperbarui!' : 'Pengumuman berhasil dibuat!';
        setSuccess(message);
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
          resetForm();
          fetchPengumuman();
        }, 2000);
      } else {
        setError(data.error || 'Gagal menyimpan pengumuman');
      }
    } catch (error) {
      console.error('Error saving pengumuman:', error);
      setError('Terjadi kesalahan saat menyimpan pengumuman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      judul: item.judul,
      isi: item.isi,
      tanggalBerlaku: item.tanggalSelesai ? new Date(item.tanggalSelesai).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    try {
      const res = await fetch(`/api/admin/pengumuman?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Pengumuman berhasil dihapus');
        setTimeout(() => setSuccess(''), 3000);
        fetchPengumuman();
      } else {
        setError('Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error deleting pengumuman:', error);
      setError('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      isi: '',
      tanggalBerlaku: ''
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Helper function untuk format tanggal
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper function untuk ringkasan teks
  const truncateText = (text, length = 120) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#F6FBEF] via-[#FBFDF6] to-white">
        <div className="px-6 lg:px-10 py-8 space-y-6">
          {/* Header Card - SIMTAQ Baseline */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 rounded-2xl shadow-lg shadow-emerald-200/40 p-8 ring-1 ring-emerald-200/30">
            {/* Soft overlay highlight */}
            <div className="absolute inset-0 bg-white/5 opacity-70 pointer-events-none"></div>
            
            {/* Decorative blur circles */}
            <div className="absolute top-0 -right-16 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-16 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              {/* Mobile Layout - Grid */}
              <div className="sm:hidden grid grid-cols-[48px_1fr] gap-3 items-start w-full">
                {/* Icon Container - Mobile */}
                <div className="h-12 w-12 rounded-2xl bg-white/15 border border-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Megaphone size={28} className="text-white" />
                </div>
                
                {/* Header Content - Mobile */}
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white mb-1 leading-tight break-words">Pengumuman</h1>
                  <p className="text-white/90 text-xs break-words">Kelola pengumuman untuk semua pengguna aplikasi</p>
                </div>
              </div>
              
              {/* Desktop Layout - Flex */}
              <div className="hidden sm:flex items-center gap-6 flex-1">
                {/* Icon Container - Desktop */}
                <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Megaphone size={32} className="text-white" />
                </div>
                
                {/* Header Content - Desktop */}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Pengumuman</h1>
                  <p className="text-white/90 text-base">Kelola pengumuman untuk semua pengguna aplikasi</p>
                </div>
              </div>
              
              {/* Action Button - Mobile Full Width */}
              <button
                onClick={openCreateModal}
                className="sm:hidden w-full flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-white/20 bg-white/15 border border-white/20 whitespace-nowrap mt-2"
              >
                <Plus size={18} />
                <span>Buat</span>
              </button>
              
              {/* Action Button - Desktop */}
              <button
                onClick={openCreateModal}
                className="hidden sm:flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 whitespace-nowrap flex-shrink-0"
              >
                <Plus size={18} />
                <span>Buat Pengumuman</span>
              </button>
            </div>
          </div>

          {/* Success/Error Message */}
          {success && (
            <div className="bg-emerald-50/70 backdrop-blur border border-emerald-200/60 text-emerald-700 px-4 py-4 rounded-xl flex items-center gap-3">
              <CheckCircle size={20} />
              <span className="font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-rose-50/70 backdrop-blur border border-rose-200/60 text-rose-700 px-4 py-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* List Pengumuman */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm">
              <Loader className="animate-spin text-emerald-600" size={48} />
            </div>
          ) : pengumumanList.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm">
              <Megaphone className="mx-auto text-emerald-200 mb-4" size={64} />
              <p className="text-slate-900 text-lg font-semibold">Belum ada pengumuman</p>
              <p className="text-slate-600 text-sm mt-1">Klik tombol "Buat Pengumuman" untuk menambahkan pengumuman baru</p>
            </div>
          ) : (
            <div className="space-y-5">
              {pengumumanList.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white/70 backdrop-blur rounded-2xl border border-emerald-100/60 shadow-sm p-6 hover:-translate-y-[2px] hover:shadow-md transition-all duration-300 border-l-4 border-l-emerald-300/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Judul */}
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.judul}</h3>

                      {/* Ringkasan Isi */}
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        {truncateText(item.isi, 150)}
                      </p>

                      {/* Meta Info - Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Calendar size={13} />
                          {formatDate(item.createdAt)}
                        </span>
                        {item.tanggalSelesai && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            <Calendar size={13} />
                            Berlaku hingga: {formatDate(item.tanggalSelesai)}
                          </span>
                        )}
                        {item.lampiran && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <FileText size={13} />
                            Ada lampiran
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto pt-20 sm:pt-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div className="bg-white rounded-3xl p-6 w-full sm:max-w-2xl max-w-sm my-auto" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
                  {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Perbarui informasi pengumuman' : 'Buat pengumuman baru untuk semua pengguna'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Error/Success dalam Modal */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Judul Pengumuman */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="Masukkan judul pengumuman..."
                  required
                />
              </div>

              {/* Isi Pengumuman */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Isi Pengumuman
                </label>
                <textarea
                  rows={8}
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 resize-none"
                  placeholder="Masukkan isi pengumuman..."
                  required
                />
              </div>

              {/* Tanggal Berlaku */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Tanggal Berakhir <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalBerlaku}
                  onChange={(e) => setFormData({ ...formData, tanggalBerlaku: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-2">Pengumuman akan otomatis tidak ditampilkan setelah tanggal ini</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                  style={{ backgroundColor: colors.gray[100] }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    editingId ? 'Perbarui' : 'Publikasikan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        body {
          overscroll-behavior: contain;
        }
      `}</style>
    </AdminLayout>
  );
}
