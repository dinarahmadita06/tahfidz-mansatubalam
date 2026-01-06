'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Loader,
  Play,
  Video,
  Link,
  Music,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

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

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Get thumbnail URL for YouTube videos
function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Get icon based on material type
function getMaterialIcon(jenisMateri, className = 'w-12 h-12') {
  switch (jenisMateri) {
    case 'YOUTUBE':
      return <Play className={className} />;
    default: // PDF
      return <FileText className={className} />;
  }
}

// Get color classes based on material type
function getMaterialColors(jenisMateri) {
  switch (jenisMateri) {
    case 'YOUTUBE':
      return {
        badge: 'bg-pink-100 text-pink-700 border-pink-200',
        icon: 'text-pink-600',
        card: 'bg-white/70 backdrop-blur-sm border-2 border-pink-200',
        button: 'bg-pink-500 hover:bg-pink-600',
        buttonSecondary: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
      };
    default: // PDF
      return {
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: 'text-emerald-600',
        card: 'bg-white/70 backdrop-blur-sm border-2 border-emerald-200',
        button: 'bg-emerald-500 hover:bg-emerald-600',
        buttonSecondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
      };
  }
}

// Material Card Component
function MaterialCard({ materi, onOpen, onDownload, onDelete }) {
  const colors = getMaterialColors(materi.jenisMateri);
  const isYouTube = materi.jenisMateri === 'YOUTUBE';
  const isPDF = materi.jenisMateri === 'PDF';
  
  const handleOpen = () => {
    onOpen(materi);
  };
  
  const handleDownloadClick = () => {
    onDownload(materi);
  };
  
  const handleDelete = () => {
    onDelete(materi.id);
  };
  
  return (
    <div className={`rounded-2xl shadow-sm ${colors.card} overflow-hidden hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-200`}>
      {/* Material Type Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 ${colors.badge} text-xs font-medium rounded-full uppercase`}>
          {materi.jenisMateri}
        </span>
      </div>
      
      {/* Thumbnail/Icon Area */}
      <div className="h-40 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {isYouTube ? (
          <div className="relative w-full h-full">
            {materi.youtubeUrl ? (
              <>
                <img 
                  src={getYouTubeThumbnail(extractYouTubeId(materi.youtubeUrl))}
                  alt={materi.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.style.display = 'none';
                    const fallbackDiv = e.target.parentElement.querySelector('.fallback-icon');
                    if (fallbackDiv) fallbackDiv.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 hidden">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
            {getMaterialIcon(materi.jenisMateri, 'w-16 h-16 text-white/40')}
          </div>
        )}
      </div>

      {/* Material Info */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-2">
          {materi.judul || 'Untitled'}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
          {materi.deskripsi || materi.deskripsi || 'No description'}
        </p>

        {/* Upload Date */}
        <p className="text-xs text-gray-500 mb-4">
          {new Date(materi.createdAt || materi.uploadDate || materi.createdAt).toLocaleDateString('id-ID')}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleOpen}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all ${colors.button}`}
          >
            <Eye size={16} />
            {isYouTube ? 'Buka Video' : 'Lihat'}
          </button>

          {isPDF && (
            <button
              onClick={handleDownloadClick}
              className={`flex items-center justify-center px-3 py-2 ${colors.buttonSecondary} rounded-lg transition-all`}
            >
              <Download size={16} />
            </button>
          )}

          <button
            onClick={handleDelete}
            className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
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
  const [guruKelas, setGuruKelas] = useState([]); // ✅ Classes the guru teaches

  // Form states
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Tajwid',
    jenisMateri: 'PDF',
    fileUrl: '',
    youtubeUrl: '',
    file: null,
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
      const response = await fetch('/api/guru/materi-tahsin');
      if (response.ok) {
        const data = await response.json();
        setMateriList(data.materi || []);
      } else {
        toast.error('Gagal memuat materi digital');
      }
    } catch (error) {
      console.error('Error fetching materi:', error);
      toast.error('Terjadi kesalahan saat memuat materi');
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
      formDataToSend.append('classId', formData.classId); // ✅ Required for access control
      
      if (formData.jenisMateri === 'PDF' && formData.file) {
        formDataToSend.append('file', formData.file);
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
          fileUrl: '',
          youtubeUrl: '',
          file: null,
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
        const response = await fetch(`/api/guru/materi-tahsin/${materiId}`, {
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
    
    setSelectedMateri(materi);
    setShowViewerModal(true);
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
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Materi
                  </span>
                </div>
                <p className="text-green-50 text-base md:text-lg">Kumpulan materi & panduan Tahfidz yang dapat diakses oleh guru dan siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - 2 Kolom (PDF & YouTube) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: PDF */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-semibold mb-1">FILE PDF</p>
                <h3 className="text-4xl font-bold text-emerald-700">{loading ? '...' : totalPDF}</h3>
              </div>
              <div className="bg-emerald-100 p-4 rounded-full">
                <FileCheck size={32} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 2: YouTube */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 text-sm font-semibold mb-1">YOUTUBE</p>
                <h3 className="text-4xl font-bold text-pink-700">{loading ? '...' : totalYouTube}</h3>
              </div>
              <div className="bg-pink-100 p-4 rounded-full">
                <Play size={32} className="text-pink-600" />
              </div>
            </div>
          </div>
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
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat materi digital...</p>
            </div>
          </div>
        )}
        
        {/* Materi Grid / Empty State */}
        {!loading && filteredMateri.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <BookOpen className="text-emerald-600" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak ada materi yang sesuai'
                : 'Belum ada materi digital'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Coba gunakan kata kunci atau filter yang berbeda'
                : 'Upload materi Tahfidz pertama Anda'}
            </p>
            {!searchQuery && selectedCategory === 'Semua' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <Upload size={20} />
                Upload Materi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMateri.map((materi) => (
              <MaterialCard
                key={materi.id}
                materi={materi}
                onOpen={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
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
                        file: newJenisMateri !== 'YOUTUBE' ? formData.file : null,
                        fileUrl: newJenisMateri !== 'YOUTUBE' ? formData.fileUrl : '',
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
              <div className="flex-1 overflow-auto bg-gray-50 p-6">
                {selectedMateri.fileUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Display loading message - user should click download to view */}
                    <div className="bg-white rounded-lg p-8 text-center max-w-md">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-emerald-100 rounded-full">
                          <BookOpen className="text-emerald-600" size={48} />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Buka PDF di Tab Baru</h3>
                      <p className="text-gray-600 mb-6">Klik tombol unduh di bawah atau di header untuk membuka PDF di tab baru browser Anda.</p>
                      <p className="text-sm text-gray-500 mb-6">Nama: {selectedMateri.fileName || selectedMateri.judul || 'Document'}</p>
                      <button
                        onClick={() => handleDownload(selectedMateri)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-all"
                      >
                        <Download size={20} />
                        Buka PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
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
