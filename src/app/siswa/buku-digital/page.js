'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  Book,
  BookOpen,
  Search,
  Download,
  Eye,
  Play,
  FileText,
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import toast, { Toaster } from 'react-hot-toast';

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

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm text-white flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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
function MaterialCard({ materi, onOpen, onDownload }) {
  const colors = getMaterialColors(materi.jenisMateri);
  const isYouTube = materi.jenisMateri === 'YOUTUBE';
  const isPDF = materi.jenisMateri === 'PDF';
  
  const handleOpen = () => {
    onOpen(materi);
  };
  
  const handleDownloadClick = () => {
    onDownload(materi);
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
        </div>
      </div>
    </div>
  );
}

export default function SiswaBukuDigitalPage() {
  const { data: session } = useSession();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchBooks();
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/siswa/buku-digital');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.data || []);
      } else {
        toast.error('Gagal memuat buku digital');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Terjadi kesalahan saat memuat buku');
    } finally {
      setLoading(false);
    }
  };

  // Filter materials based on search and category
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const title = book.judul || book.title || '';
      const description = book.deskripsi || book.description || '';
      const category = book.kategori || book.category || '';

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  // Calculate statistics
  const totalPDF = filteredBooks.filter(m => m.jenisMateri === 'PDF').length;
  const totalYouTube = filteredBooks.filter(m => m.jenisMateri === 'YOUTUBE').length;

  const handleDownload = (book) => {
    const fileUrl = book.fileUrl || book.fileUrl;
    if (fileUrl) {
      // Check if it's a YouTube URL
      if (fileUrl.startsWith('https://youtu.be/') || fileUrl.startsWith('https://www.youtube.com/')) {
        // Open YouTube URL directly
        window.open(fileUrl, '_blank');
        toast.success('Membuka YouTube...');
        return;
      }
      
      // For PDF files, use the proxy
      const proxyUrl = `/api/guru/buku-digital/proxy?url=${encodeURIComponent(fileUrl)}`;
      window.open(proxyUrl, '_blank');
      toast.success('Membuka PDF...');
    } else {
      toast.error('File tidak tersedia');
    }
  };

  const handleView = (book) => {
    const fileUrl = book.fileUrl || book.fileUrl;
    if (fileUrl) {
      // Check if it's a YouTube URL
      if (fileUrl.startsWith('https://youtu.be/') || fileUrl.startsWith('https://www.youtube.com/')) {
        // Open YouTube URL directly
        window.open(fileUrl, '_blank');
        toast.success('Membuka YouTube...');
        return;
      }
      
      // For PDF files, use the proxy
      const proxyUrl = `/api/guru/buku-digital/proxy?url=${encodeURIComponent(fileUrl)}`;
      window.open(proxyUrl, '_blank');
    } else {
      toast.error('File tidak tersedia');
    }
  };

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau - Style Tasmi */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <BookOpen size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">Buku Digital</h1>
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Materi
                  </span>
                </div>
                <p className="text-green-50 text-base md:text-lg">Kumpulan materi & panduan Tahfidz yang dapat diakses oleh siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - PDF & YouTube */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="FILE PDF"
            value={loading ? '...' : totalPDF}
            icon={<FileText size={24} />}
            color="bg-emerald-500"
          />
          <StatCard
            label="YOUTUBE"
            value={loading ? '...' : totalYouTube}
            icon={<Play size={24} />}
            color="bg-pink-500"
          />
        </div>

        {/* Filter Bar - Search + Kategori */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
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

            {/* Kategori Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingIndicator text="Memuat materi digital..." />
        )}
        
        {/* Materi Grid / Empty State */}
        {!loading && filteredBooks.length === 0 ? (
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
                : 'Materi buku digital belum tersedia'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((materi) => (
              <MaterialCard
                key={materi.id}
                materi={materi}
                onOpen={handleView}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}
