'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import { BookOpen, Search, Download, Eye, Loader } from 'lucide-react';
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

  // Filter books based on search and category
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Handle both old localStorage format and new API format
      const title = book.title || book.judul || '';
      const description = book.description || book.deskripsi || '';
      const category = book.category || book.kategori || '';

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

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
                <h1 className="text-3xl md:text-4xl font-bold">Buku Digital</h1>
                <p className="text-green-50 text-base md:text-lg">Materi & panduan pembelajaran Tahfidz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Dropdown */}
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
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat buku digital...</p>
            </div>
          </div>
        )}

        {/* Books Grid / Empty State */}
        {!loading && filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <BookOpen className="text-emerald-600" size={48} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak ada buku yang sesuai'
                : 'Belum ada buku digital'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Coba gunakan kata kunci atau filter yang berbeda'
                : 'Belum ada materi buku digital yang tersedia'}
            </p>
          </div>
        ) : (
          !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Book Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <BookOpen className="text-white/40" size={64} />
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded mb-2">
                      {book.category || book.kategori || 'Umum'}
                    </span>

                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-2">
                      {book.title || book.judul || 'Untitled'}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
                      {book.description || book.deskripsi || 'No description'}
                    </p>

                    {/* Upload Date */}
                    <p className="text-xs text-gray-500 mb-4">
                      {new Date(book.uploadDate || book.createdAt).toLocaleDateString('id-ID')}
                    </p>

                    {/* Action Buttons - Read Only for Siswa */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(book)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        <Eye size={16} />
                        {book.fileUrl && (book.fileUrl.startsWith('https://youtu.be/') || book.fileUrl.startsWith('https://www.youtube.com/')) ? 'Buka' : 'Lihat'}
                      </button>

                      <button
                        onClick={() => handleDownload(book)}
                        className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        title="Unduh PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </SiswaLayout>
  );
}
