'use client';

import React, { useState, useEffect, useMemo } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Book,
  Upload,
  Search,
  Eye,
  Download,
  Trash2,
  X,
  FileText,
  BookOpen,
  AlertCircle,
  FileCheck,
  Play,
  Video,
  Link,
  Music,
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { toast, Toaster } from 'react-hot-toast';
import DigitalMaterialCard from '@/components/shared/DigitalMaterialCard';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  getMaterialIcon, 
  getMaterialVariant 
} from '@/lib/utils/materialHelpers';

const CATEGORIES = [
  'Semua',
  'Tajwid',
  'Tafsir',
  'Hadits',
  'Fiqih',
  'Akhlak',
  'Tahsin',
  'Umum',
];

const JENIS_MATERI = {
  PDF: 'PDF',
  YOUTUBE: 'YOUTUBE',
};

function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const configs = {
    blue: {
      bg: 'bg-blue-50/60',
      border: 'border-blue-200/70',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100/60',
      iconText: 'text-blue-600',
      glow: 'shadow-blue-500/10'
    },
    rose: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200/70',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100/60',
      iconText: 'text-rose-600',
      glow: 'shadow-rose-500/10'
    }
  };
  const config = configs[color] || configs.blue;

  return (
    <div className={`${config.bg} ${config.border} ${config.glow} p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.text} text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80`}>{label}</p>
          <p className={`${config.text} text-2xl font-bold`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${config.iconBg} ${config.iconText} rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border ${config.border}`}>
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
              return <IconComp size={24} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

export default function BukuDigitalPage() {
  const [materiList, setMateriList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guruKelas, setGuruKelas] = useState([]); // ✅ Classes the guru teaches

  // Form states
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Tajwid',
    jenisMateri: 'PDF',
    file: null,
    youtubeUrl: '',
    classId: '', // ✅ Required for class-based access control
  });

  useEffect(() => {
    fetchMateri();
    fetchGuruKelas(); // ✅ Fetch classes this guru teaches
  }, []);

  // ✅ Fetch classes that this guru teaches
  const fetchGuruKelas = async () => {
    try {
      const response = await fetch('/api/guru/kelas');
      if (response.ok) {
        const data = await response.json();
        setGuruKelas(data.kelas || []);
        // Auto-select first class if available
        if (data.kelas && data.kelas.length > 0 && !formData.classId) {
          setFormData(prev => ({ ...prev, classId: data.kelas[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching guru kelas:', error);
    }
  };

  const fetchMateri = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/guru/buku-digital');
      if (response.ok) {
        const data = await response.json();
        setMateriList(data.data || []);
      } else {
        throw new Error('Gagal memuat materi digital');
      }
    } catch (error) {
      console.error('Error fetching materi:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter materi based on search and category
  const filteredMateri = useMemo(() => {
    return materiList.filter((materi) => {
      const judul = materi.judul || '';
      const deskripsi = materi.deskripsi || '';
      const kategori = materi.kategori || '';
      
      const matchesSearch = judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || kategori === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [materiList, searchQuery, selectedCategory]);

  // Calculate statistics
  const totalMateri = filteredMateri.length;
  const totalPDF = filteredMateri.filter(m => m.jenisMateri === 'PDF').length;
  const totalYouTube = filteredMateri.filter(m => m.jenisMateri === 'YOUTUBE').length;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // Increase to 50MB as per API
        toast.error('Ukuran file maksimal 50MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        toast.error('Hanya file PDF yang diperbolehkan');
        return;
      }

      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        file: file,
        fileUrl: fileUrl,
        youtubeUrl: '', // Clear youtubeUrl when file is selected
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.judul.trim()) {
      toast.error('Judul materi harus diisi');
      return;
    }

    if (!formData.deskripsi.trim()) {
      toast.error('Deskripsi harus diisi');
      return;
    }

    if (formData.jenisMateri === 'PDF' && !formData.file) {
      toast.error('File PDF wajib diupload');
      return;
    }

    if (formData.jenisMateri === 'YOUTUBE' && !formData.youtubeUrl.trim()) {
      toast.error('URL YouTube wajib diisi');
      return;
    }

    if (!formData.classId.trim()) {
      toast.error('Pilih kelas untuk materi ini');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('judul', formData.judul);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('kategori', formData.kategori);
      formDataToSend.append('jenisMateri', formData.jenisMateri);
      formDataToSend.append('classId', formData.classId); // ✅ Required for access control
      
      if (formData.jenisMateri === 'PDF' && formData.file) {
        formDataToSend.append('file', formData.file);
      } else if (formData.jenisMateri === 'YOUTUBE') {
        formDataToSend.append('youtubeUrl', formData.youtubeUrl);
      }

      const response = await fetch('/api/guru/buku-digital', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh the materi list
        fetchMateri();
        setShowUploadModal(false);
        setFormData({
          judul: '',
          deskripsi: '',
          kategori: 'Tajwid',
          jenisMateri: 'PDF',
          file: null,
          youtubeUrl: '',
          classId: guruKelas.length > 0 ? guruKelas[0].id : '', // Reset to first class
        });
        toast.success('Materi digital berhasil ditambahkan!');
      } else {
        toast.error(result.message || 'Gagal menambahkan materi digital');
      }
    } catch (error) {
      console.error('Error adding materi:', error);
      toast.error('Terjadi kesalahan saat menambahkan materi');
    }
  };

  const handleDelete = async (materiId) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      try {
        const response = await fetch(`/api/guru/buku-digital/${materiId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
          setMateriList(materiList.filter((materi) => materi.id !== materiId));
          toast.success('Materi berhasil dihapus');
        } else {
          toast.error(result.message || 'Gagal menghapus materi');
        }
      } catch (error) {
        console.error('Error deleting materi:', error);
        toast.error('Terjadi kesalahan saat menghapus');
      }
    }
  };

  const handleView = (materi) => {
    if (materi.jenisMateri === 'YOUTUBE' && materi.youtubeUrl) {
      // Open YouTube URL directly
      window.open(materi.youtubeUrl, '_blank');
      toast.success('Membuka YouTube...');
      return;
    }
    
    // Open PDF directly in new tab
    if (materi.fileUrl) {
      window.open(materi.fileUrl, '_blank');
      toast.success('Membuka file...');
    } else {
      toast.error('File tidak tersedia');
    }
  };

  const handleDownload = (materi) => {
    if (materi.jenisMateri === 'YOUTUBE' && materi.youtubeUrl) {
      // Open YouTube URL directly
      window.open(materi.youtubeUrl, '_blank');
      toast.success('Membuka YouTube...');
      return;
    }
    
    if (materi.fileUrl) {
      // Open the file URL directly
      window.open(materi.fileUrl, '_blank');
      toast.success('Membuka file...');
    } else {
      toast.error('File tidak tersedia');
    }
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau - Style Tasmi */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Book size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">Buku Digital</h1>
                </div>
                <p className="text-green-50 text-base md:text-lg">Kumpulan materi & panduan Tahfidz yang dapat diakses oleh guru dan siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - 2 Kolom (PDF & YouTube) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="File PDF"
            value={loading ? '...' : totalPDF}
            icon={FileCheck}
            color="blue"
          />
          <StatCard
            label="YouTube"
            value={loading ? '...' : totalYouTube}
            icon={Play}
            color="rose"
          />
        </div>

        {/* Filter Bar - Search + Kategori + Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari materi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Kategori Dropdown */}
            <div className="md:col-span-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Button */}
            <div className="md:col-span-1">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <Upload size={20} />
                Upload Materi Baru
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingIndicator text="Memuat materi digital..." />
        )}
        
        {/* Materi Grid / Empty State */}
        {!loading && error ? (
          <ErrorState
            errorMessage={error}
            onRetry={fetchMateri}
          />
        ) : !loading && filteredMateri.length === 0 ? (
          <EmptyState
            title={searchQuery || selectedCategory !== 'Semua' ? 'Tidak ada materi yang sesuai' : 'Belum ada materi digital'}
            description={searchQuery || selectedCategory !== 'Semua' 
              ? 'Coba gunakan kata kunci atau filter yang berbeda' 
              : 'Silakan upload materi Tahfidz pertama Anda untuk berbagi dengan siswa.'}
            icon={<BookOpen size={28} />}
            actionLabel={!searchQuery && selectedCategory === 'Semua' ? 'Upload Materi Pertama' : null}
            onAction={!searchQuery && selectedCategory === 'Semua' ? () => setShowUploadModal(true) : null}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMateri.map((materi) => (
              <DigitalMaterialCard
                key={materi.id}
                materi={materi}
                onOpen={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
                canDelete={true}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Upload className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Upload Materi Baru</h2>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Contoh: Panduan Tajwid Lengkap"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {CATEGORIES.filter(c => c !== 'Semua').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ✅ Class Selector - Required for access control */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Kelas <span className="text-red-500">*</span>
                  </label>
                  {guruKelas.length === 0 ? (
                    <div className="w-full px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
                      Anda belum ditugaskan ke kelas manapun
                    </div>
                  ) : (
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {guruKelas.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>
                          {kelas.nama}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Singkat <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Penjelasan singkat tentang materi buku..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Jenis Materi Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Materi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jenisMateri}
                    onChange={(e) => {
                      const newJenisMateri = e.target.value;
                      setFormData({
                        ...formData,
                        jenisMateri: newJenisMateri,
                        // Clear conflicting fields when switching types
                        youtubeUrl: newJenisMateri === 'YOUTUBE' ? formData.youtubeUrl : '',
                        file: newJenisMateri === 'PDF' ? formData.file : null,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="PDF">PDF</option>
                    <option value="YOUTUBE">YouTube</option>
                  </select>
                </div>

                {/* Conditional rendering based on jenisMateri */}
                {formData.jenisMateri === 'YOUTUBE' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL YouTube <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value, file: null })}
                      placeholder="Contoh: https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload File PDF (max 50MB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {formData.file && (
                      <p className="mt-2 text-sm text-gray-600 flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                        <FileText size={16} className="text-emerald-600" />
                        {formData.file.name}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Simpan Materi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Viewer Modal */}
        {showViewerModal && selectedMateri && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewerModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Viewer Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Book className="text-white" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {selectedMateri.judul}
                    </h2>
                    <p className="text-white/80 text-sm">{selectedMateri.jenisMateri}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(selectedMateri)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    title="Unduh PDF"
                  >
                    <Download className="text-white" size={22} />
                  </button>
                  <button
                    onClick={() => setShowViewerModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>
              </div>

              {/* Viewer Body */}
              <div className="flex-1 overflow-hidden bg-gray-50">
                {selectedMateri.fileUrl ? (
                  selectedMateri.jenisMateri === 'PDF' ? (
                    /* PDF Preview dengan iframe */
                    <iframe
                      src={selectedMateri.fileUrl}
                      className="w-full h-full border-0"
                      title={selectedMateri.judul}
                    />
                  ) : selectedMateri.jenisMateri === 'YOUTUBE' && selectedMateri.youtubeUrl ? (
                    /* YouTube Preview */
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(selectedMateri.youtubeUrl)}`}
                      className="w-full h-full border-0"
                      title={selectedMateri.judul}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    /* Fallback untuk jenis materi lain */
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="bg-white rounded-lg p-8 text-center max-w-md">
                        <div className="mb-4 flex justify-center">
                          <div className="p-4 bg-emerald-100 rounded-full">
                            <BookOpen className="text-emerald-600" size={48} />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Buka File</h3>
                        <p className="text-gray-600 mb-6">Klik tombol unduh di atas untuk membuka file.</p>
                        <p className="text-sm text-gray-500 mb-6">Nama: {selectedMateri.fileName || selectedMateri.judul || 'Document'}</p>
                        <button
                          onClick={() => handleDownload(selectedMateri)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-all"
                        >
                          <Download size={20} />
                          Unduh File
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-gray-200 rounded-full">
                          <AlertCircle className="text-gray-500" size={48} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg mb-6">File preview tidak tersedia</p>
                      <button
                        onClick={() => handleDownload(selectedMateri)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-all"
                      >
                        <Download size={20} />
                        Unduh File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
