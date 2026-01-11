'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Book,
  BookOpen,
  Search,
  Download,
  Eye,
  Play,
  FileText,
  FileCheck,
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';
import toast, { Toaster } from 'react-hot-toast';
import DigitalMaterialCard from '@/components/shared/DigitalMaterialCard';
import { getMaterialVariant } from '@/lib/utils/materialHelpers';

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

function StatCard({ label, value, icon: Icon, color = 'emerald' }) {
  const configs = {
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/70',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100/60',
      iconText: 'text-emerald-600',
      glow: 'shadow-emerald-500/10'
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
  const config = configs[color] || configs.emerald;

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
    <>
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
                <p className="text-green-50 text-base md:text-lg">Kumpulan materi & panduan Tahfidz yang dapat diakses oleh siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - PDF & YouTube */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="File PDF"
            value={loading ? '...' : totalPDF}
            icon={FileCheck}
            color="emerald"
          />
          <StatCard
            label="YouTube"
            value={loading ? '...' : totalYouTube}
            icon={Play}
            color="rose"
          />
        </div>

        {/* Filter Bar - Search + Kategori */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
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
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingIndicator text="Memuat materi digital..." />
        )}
        
        {/* Materi Grid / Empty State */}
        {!loading && filteredBooks.length === 0 ? (
          <EmptyState
            title={searchQuery || selectedCategory !== 'Semua' ? 'Tidak ada materi yang sesuai' : 'Belum ada materi digital'}
            description={searchQuery || selectedCategory !== 'Semua' 
              ? 'Coba gunakan kata kunci atau filter yang berbeda' 
              : 'Materi buku digital belum tersedia untuk kelas Anda.'}
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((materi) => (
              <DigitalMaterialCard
                key={materi.id}
                materi={materi}
                onOpen={handleView}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
