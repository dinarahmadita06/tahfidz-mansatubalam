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
  Sparkles,
  Filter,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

const CATEGORIES = [
  'Semua',
  'Tajwid',
  'Tahsin',
  'Doa Harian',
  'Panduan Hafalan',
];

// Konfigurasi warna per kategori
const CATEGORY_COLORS = {
  'Tajwid': {
    gradient: 'from-emerald-400 via-green-400 to-teal-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    button: 'bg-emerald-500 hover:bg-emerald-600',
  },
  'Tahsin': {
    gradient: 'from-blue-400 via-sky-400 to-cyan-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  'Doa Harian': {
    gradient: 'from-amber-300 via-yellow-300 to-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600',
  },
  'Panduan Hafalan': {
    gradient: 'from-purple-400 via-violet-400 to-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    button: 'bg-purple-500 hover:bg-purple-600',
  },
};

export default function BukuDigitalSiswaPage() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Load books from localStorage
  useEffect(() => {
    const savedBooks = localStorage.getItem('tahfidz_books');
    if (savedBooks) {
      try {
        const parsedBooks = JSON.parse(savedBooks);
        setBooks(parsedBooks);
      } catch (e) {
        console.error('Error loading books:', e);
      }
    } else {
      // Sample data for demo
      const sampleBooks = [
        {
          id: 'book_1',
          title: 'Panduan Tajwid Lengkap',
          description: 'Penjelasan lengkap tentang makharijul huruf dan hukum bacaan Al-Qur\'an',
          category: 'Tajwid',
          fileUrl: '',
          uploadDate: '2025-10-20',
        },
        {
          id: 'book_2',
          title: 'Cara Tahsin Al-Qur\'an',
          description: 'Metode praktis memperbaiki bacaan Al-Qur\'an dengan benar',
          category: 'Tahsin',
          fileUrl: '',
          uploadDate: '2025-10-18',
        },
        {
          id: 'book_3',
          title: 'Kumpulan Doa Harian',
          description: 'Doa-doa harian yang dianjurkan dari Al-Qur\'an dan Hadits',
          category: 'Doa Harian',
          fileUrl: '',
          uploadDate: '2025-10-15',
        },
        {
          id: 'book_4',
          title: 'Strategi Menghafal Al-Qur\'an',
          description: 'Tips dan trik menghafal Al-Qur\'an dengan mudah dan efektif',
          category: 'Panduan Hafalan',
          fileUrl: '',
          uploadDate: '2025-10-12',
        },
        {
          id: 'book_5',
          title: 'Hukum Nun Mati dan Tanwin',
          description: 'Penjelasan detail tentang Idzhar, Idgham, Iqlab, dan Ikhfa',
          category: 'Tajwid',
          fileUrl: '',
          uploadDate: '2025-10-10',
        },
        {
          id: 'book_6',
          title: 'Muraja\'ah Hafalan',
          description: 'Panduan mengulang hafalan agar tidak mudah lupa',
          category: 'Panduan Hafalan',
          fileUrl: '',
          uploadDate: '2025-10-08',
        },
      ];
      setBooks(sampleBooks);
    }
  }, []);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleView = (book) => {
    setSelectedBook(book);
    setShowViewerModal(true);
  };

  const handleDownload = (book) => {
    if (book.fileUrl) {
      const link = document.createElement('a');
      link.href = book.fileUrl;
      link.download = book.fileName || book.title + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Mengunduh file...');
    } else {
      toast.error('File tidak tersedia untuk diunduh');
    }
  };

  const getCategoryStyle = (category) => {
    return CATEGORY_COLORS[category] || {
      gradient: 'from-gray-300 via-gray-400 to-gray-400',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      button: 'bg-gray-500 hover:bg-gray-600',
    };
  };

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl blur opacity-40 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg">
              <Book className="text-white" size={32} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-700 via-blue-600 to-sky-600 bg-clip-text text-transparent">
              Buku Digital
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-sky-500 via-amber-400 to-transparent rounded-full mt-2"></div>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Akses materi pembelajaran Tahfidz kapan saja
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari buku atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white shadow-sm hover:shadow-md"
          />
        </div>

        {/* Filter Category */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none appearance-none bg-white cursor-pointer shadow-sm hover:shadow-md transition-all font-medium"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white via-sky-50 to-amber-50 rounded-3xl p-16 text-center border-2 border-dashed border-sky-200 shadow-xl"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full blur-2xl opacity-30"></div>
              <div className="relative p-6 bg-gradient-to-br from-white to-sky-50 rounded-full shadow-lg">
                <BookOpen className="text-sky-600" size={64} />
              </div>
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">
            {searchQuery || selectedCategory !== 'Semua'
              ? 'Tidak ada buku yang sesuai'
              : 'Belum ada buku digital'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'Semua'
              ? 'Coba gunakan kata kunci atau filter yang berbeda'
              : 'Belum ada buku digital. Yuk, mulai belajar hari ini!'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book, index) => {
              const categoryStyle = getCategoryStyle(book.category);
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Book Thumbnail with Category Gradient */}
                  <div className={`h-52 bg-gradient-to-br ${categoryStyle.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Book className="text-white/40 relative z-10" size={96} />
                    </motion.div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 ${categoryStyle.bg} ${categoryStyle.text} text-xs font-bold rounded-full shadow-md backdrop-blur-sm`}>
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                      {book.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-5 min-h-[40px]">
                      {book.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(book)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${categoryStyle.button} text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg`}
                      >
                        <Eye size={16} />
                        Lihat
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(book)}
                        className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                      >
                        <Download size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

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
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Viewer Header with Category Color */}
              <div className={`bg-gradient-to-r ${getCategoryStyle(selectedBook.category).gradient} px-6 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Book className="text-white" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {selectedBook.title}
                    </h2>
                    <p className="text-white/80 text-sm">{selectedBook.category}</p>
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
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                          <FileText className="text-amber-600 flex-shrink-0" size={20} />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-amber-900 mb-1">Informasi Buku:</p>
                            <p className="text-sm text-amber-800 mb-2">{selectedBook.description}</p>
                            <p className="text-xs text-amber-700">Kategori: {selectedBook.category}</p>
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

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </SiswaLayout>
  );
}
