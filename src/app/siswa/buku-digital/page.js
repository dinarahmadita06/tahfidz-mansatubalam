'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  Book,
  Search,
  Eye,
  Download,
  X,
  BookOpen,
  Filter,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

const CATEGORIES = [
  'Semua',
  'TAJWID',
  'TAHSIN',
  'DOA_HARIAN',
  'PANDUAN_HAFALAN',
  'LAINNYA',
];

const CATEGORY_LABELS = {
  TAJWID: 'Tajwid',
  TAHSIN: 'Tahsin',
  DOA_HARIAN: 'Doa Harian',
  PANDUAN_HAFALAN: 'Panduan Hafalan',
  LAINNYA: 'Lainnya',
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

// Loading State
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
        <p className="text-gray-600 font-medium">Memuat buku digital...</p>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ hasFilter }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 shadow-sm"
    >
      <div className="flex justify-center mb-6">
        <div className="p-6 bg-gray-100 rounded-full">
          <BookOpen className="text-gray-400" size={64} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        {hasFilter ? 'Tidak ada buku yang sesuai' : 'Belum ada buku digital'}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {hasFilter
          ? 'Coba gunakan kata kunci atau filter yang berbeda'
          : 'Belum ada buku digital yang di-upload oleh guru pengampu Anda'}
      </p>
    </motion.div>
  );
}

// Book Card Component (Pastel Transparent Style)
function BookCard({ book, index, onView, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-slate-200/60 transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
    >
      {/* Book Thumbnail - Pastel Gradient */}
      <div className="h-52 bg-gradient-to-br from-emerald-50 via-sky-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <Book className="text-emerald-300 relative z-10" size={96} />

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-emerald-700 text-xs font-bold rounded-full shadow-sm border border-emerald-200/60">
            {CATEGORY_LABELS[book.category] || book.category}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
          {book.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
          {book.description}
        </p>

        <p className="text-xs text-gray-500 mb-4">
          Oleh: {book.guruName}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(book)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Eye size={16} />
            Lihat
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDownload(book)}
            className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
            title="Unduh"
          >
            <Download size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function BukuDigitalSiswaPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/siswa/buku-digital');

      if (!res.ok) {
        throw new Error('Gagal memuat data buku');
      }

      const data = await res.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Gagal memuat data buku');
    } finally {
      setLoading(false);
    }
  };

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleView = (book) => {
    setSelectedBook(book);
    setShowViewerModal(true);
  };

  const handleDownload = async (book) => {
    if (book.fileUrl) {
      try {
        const link = document.createElement('a');
        link.href = book.fileUrl;
        link.download = book.fileName || book.title + '.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Mengunduh file...');

        // Increment download count
        await fetch(`/api/siswa/buku-digital/${book.id}/download`, {
          method: 'POST',
        }).catch(() => {});
      } catch (error) {
        toast.error('Gagal mengunduh file');
      }
    } else {
      toast.error('File tidak tersedia untuk diunduh');
    }
  };

  const hasFilter = searchQuery !== '' || selectedCategory !== 'Semua';

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Header - SIMTAQ Green Gradient */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Book size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Buku Digital</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Akses materi pembelajaran Tahfidz dari guru pengampu
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari buku atau materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white shadow-sm"
              />
            </div>

            {/* Filter Category */}
            <div className="relative min-w-[200px]">
              <Filter
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer shadow-sm transition-all font-medium"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category === 'Semua' ? 'Semua Kategori' : CATEGORY_LABELS[category] || category}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Books Grid or Empty State */}
          {loading ? (
            <LoadingState />
          ) : filteredBooks.length === 0 ? (
            <EmptyState hasFilter={hasFilter} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredBooks.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    onView={handleView}
                    onDownload={handleDownload}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Viewer Modal */}
      <AnimatePresence>
        {showViewerModal && selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Viewer Header - SIMTAQ Green */}
              <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Book className="text-white" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {selectedBook.title}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {CATEGORY_LABELS[selectedBook.category] || selectedBook.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(selectedBook)}
                    className="p-2 hover:bg-white/20 rounded-xl transition"
                    title="Unduh PDF"
                  >
                    <Download className="text-white" size={22} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowViewerModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition"
                  >
                    <X className="text-white" size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Viewer Body */}
              <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                {selectedBook.fileUrl ? (
                  <iframe
                    src={selectedBook.fileUrl}
                    className="w-full h-full rounded-2xl shadow-2xl bg-white"
                    title={selectedBook.title}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-gray-200 rounded-full">
                          <AlertCircle className="text-gray-500" size={56} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg mb-2">File preview tidak tersedia</p>
                      <p className="text-sm text-gray-500 mb-6">File belum diunggah oleh guru</p>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                          <FileText className="text-emerald-600 flex-shrink-0" size={20} />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-emerald-900 mb-1">
                              Informasi Buku:
                            </p>
                            <p className="text-sm text-emerald-800 mb-2">
                              {selectedBook.description}
                            </p>
                            <p className="text-xs text-emerald-700">
                              Kategori: {CATEGORY_LABELS[selectedBook.category] || selectedBook.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiswaLayout>
  );
}
