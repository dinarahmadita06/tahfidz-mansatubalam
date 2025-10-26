'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import {
  Home,
  ChevronRight,
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  Archive
} from 'lucide-react';

export default function PengumumanPage() {
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    kategori: 'umum',
    tanggalPublikasi: '',
    status: 'aktif'
  });

  // Dummy data
  const [pengumumanList, setPengumumanList] = useState([
    {
      id: 1,
      judul: 'Wisuda Tahfidz Angkatan 2024',
      isi: 'Wisuda tahfidz akan dilaksanakan pada hari Sabtu, 15 Februari 2025 di Aula MAN 1 Bandar Lampung. Seluruh santri yang telah menyelesaikan 30 juz diharapkan hadir.',
      kategori: 'wisuda',
      tanggalPublikasi: '2025-01-20',
      status: 'aktif',
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      judul: 'Setoran Sabtu - Pekan Ini',
      isi: 'Setoran tahfidz hari Sabtu akan dimulai pukul 07.00 WIB. Mohon santri hadir tepat waktu dan membawa mushaf.',
      kategori: 'setoran',
      tanggalPublikasi: '2025-01-25',
      status: 'aktif',
      createdAt: '2025-01-22'
    },
    {
      id: 3,
      judul: 'Libur Semester Genap',
      isi: 'Libur semester genap akan dimulai tanggal 1 Maret 2025. Kegiatan tahfidz tetap berjalan sesuai jadwal.',
      kategori: 'umum',
      tanggalPublikasi: '2025-02-01',
      status: 'aktif',
      createdAt: '2025-01-18'
    },
    {
      id: 4,
      judul: 'Tahsin Intensif Bulan Ramadhan',
      isi: 'Program tahsin intensif akan diadakan selama bulan Ramadhan. Pendaftaran dibuka mulai 10 Februari 2025.',
      kategori: 'umum',
      tanggalPublikasi: '2025-02-10',
      status: 'arsip',
      createdAt: '2025-01-10'
    }
  ]);

  const kategoriConfig = {
    wisuda: {
      label: 'Wisuda Tahfidz',
      color: '#E5D4FF',
      textColor: '#6B21A8',
      icon: '🎓'
    },
    setoran: {
      label: 'Setoran Sabtu',
      color: '#D1FAE5',
      textColor: '#065F46',
      icon: '📖'
    },
    umum: {
      label: 'Umum',
      color: '#FFEFC1',
      textColor: '#92400E',
      icon: '📢'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPengumuman) {
      // Update
      setPengumumanList(pengumumanList.map(item =>
        item.id === selectedPengumuman.id
          ? { ...item, ...formData }
          : item
      ));
    } else {
      // Create new
      const newPengumuman = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPengumumanList([newPengumuman, ...pengumumanList]);
    }
    handleCloseModal();
  };

  const handleEdit = (pengumuman) => {
    setSelectedPengumuman(pengumuman);
    setFormData({
      judul: pengumuman.judul,
      isi: pengumuman.isi,
      kategori: pengumuman.kategori,
      tanggalPublikasi: pengumuman.tanggalPublikasi,
      status: pengumuman.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      setPengumumanList(pengumumanList.filter(item => item.id !== id));
    }
  };

  const handlePreview = (pengumuman) => {
    setSelectedPengumuman(pengumuman);
    setShowPreview(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPengumuman(null);
    setFormData({
      judul: '',
      isi: '',
      kategori: 'umum',
      tanggalPublikasi: '',
      status: 'aktif'
    });
  };

  const filteredPengumuman = pengumumanList.filter(item => {
    const matchSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.isi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchKategori && matchStatus;
  });

  return (
    <AdminLayout>
      <PageWrapper>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-emerald-100/50 shadow-sm">
            <Home size={16} className="text-emerald-600" strokeWidth={1.5} />
            <ChevronRight size={14} className="text-gray-400" strokeWidth={2} />
            <span className="font-semibold text-emerald-700">Pengumuman Tahfidz</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="page-header mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-5">
              <div
                className="p-4 rounded-2xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <Megaphone className="text-white" size={32} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#064E3B' }}>
                  📢 Pengumuman Tahfidz
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  Kelola seluruh pengumuman rutin dan acara tahfidz dalam satu tempat
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700">
                    {pengumumanList.filter(p => p.status === 'aktif').length} Pengumuman Aktif
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}
            >
              <Plus size={20} strokeWidth={2} />
              Tambah Pengumuman
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="page-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>

            {/* Filter Kategori */}
            <div className="md:col-span-3">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <option value="all">Semua Kategori</option>
                <option value="wisuda">🎓 Wisuda Tahfidz</option>
                <option value="setoran">📖 Setoran Sabtu</option>
                <option value="umum">📢 Umum</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="md:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <option value="all">Semua Status</option>
                <option value="aktif">✅ Aktif</option>
                <option value="arsip">📁 Arsip</option>
              </select>
            </div>

            {/* Reset */}
            <div className="md:col-span-1">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterKategori('all');
                  setFilterStatus('all');
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Pengumuman List */}
        <div className="space-y-4">
          {filteredPengumuman.length === 0 ? (
            <div className="page-card p-12 text-center">
              <Megaphone className="mx-auto mb-4 text-gray-300" size={64} strokeWidth={1.5} />
              <p className="text-gray-500 font-medium">Tidak ada pengumuman ditemukan</p>
            </div>
          ) : (
            filteredPengumuman.map((pengumuman) => (
              <div
                key={pengumuman.id}
                className="page-card p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{kategoriConfig[pengumuman.kategori].icon}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {pengumuman.judul}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {pengumuman.isi}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Kategori Badge */}
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: kategoriConfig[pengumuman.kategori].color,
                          color: kategoriConfig[pengumuman.kategori].textColor
                        }}
                      >
                        <Tag size={14} strokeWidth={2} />
                        {kategoriConfig[pengumuman.kategori].label}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          pengumuman.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pengumuman.status === 'aktif' ? (
                          <>
                            <CheckCircle size={14} strokeWidth={2} />
                            Aktif
                          </>
                        ) : (
                          <>
                            <Archive size={14} strokeWidth={2} />
                            Arsip
                          </>
                        )}
                      </span>

                      {/* Tanggal */}
                      <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} strokeWidth={1.5} />
                        Publikasi: {new Date(pengumuman.tanggalPublikasi).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(pengumuman)}
                      className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                      title="Pratinjau"
                    >
                      <Eye size={18} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleEdit(pengumuman)}
                      className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200"
                      title="Edit"
                    >
                      <Edit size={18} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(pengumuman.id)}
                      className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                      title="Hapus"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div
              className="rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <style jsx>{`
                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in {
                  animation: fadeIn 0.3s ease-in-out;
                }
              `}</style>

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    <FileText size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#064E3B' }}>
                    {selectedPengumuman ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    required
                    placeholder="Masukkan judul pengumuman"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                </div>

                {/* Isi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Isi Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.isi}
                    onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                    required
                    rows={6}
                    placeholder="Masukkan detail pengumuman"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <option value="umum">📢 Umum</option>
                      <option value="wisuda">🎓 Wisuda Tahfidz</option>
                      <option value="setoran">📖 Setoran Sabtu</option>
                    </select>
                  </div>

                  {/* Tanggal Publikasi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Publikasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalPublikasi}
                      onChange={(e) => setFormData({ ...formData, tanggalPublikasi: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="aktif"
                        checked={formData.status === 'aktif'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Aktif (Ditampilkan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="arsip"
                        checked={formData.status === 'arsip'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Arsip</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                      color: '#92400E',
                      border: '1px solid #F59E0B'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    {selectedPengumuman ? 'Simpan Perubahan' : 'Simpan Pengumuman'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedPengumuman && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div
              className="rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
                border: '2px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                    }}
                  >
                    <Eye size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Pratinjau Pengumuman</h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Preview Content */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderColor: kategoriConfig[selectedPengumuman.kategori].color
                }}
              >
                {/* Kategori Badge */}
                <div className="mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      background: kategoriConfig[selectedPengumuman.kategori].color,
                      color: kategoriConfig[selectedPengumuman.kategori].textColor
                    }}
                  >
                    <span className="text-lg">{kategoriConfig[selectedPengumuman.kategori].icon}</span>
                    {kategoriConfig[selectedPengumuman.kategori].label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedPengumuman.judul}
                </h3>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar size={16} strokeWidth={1.5} />
                  <span>
                    {new Date(selectedPengumuman.tanggalPublikasi).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedPengumuman.isi}
                  </p>
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">ℹ️ Info:</span> Ini adalah tampilan pratinjau pengumuman yang akan dilihat oleh guru, siswa, dan orang tua.
                </p>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </AdminLayout>
  );
}
