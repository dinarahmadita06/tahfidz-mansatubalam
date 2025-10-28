'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  BookOpen,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    badge: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    shadow: 'hover:shadow-emerald-200',
    glow: 'hover:ring-2 hover:ring-emerald-300',
  },
  'Tahsin': {
    gradient: 'from-blue-400 via-sky-400 to-cyan-400',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600',
    shadow: 'hover:shadow-blue-200',
    glow: 'hover:ring-2 hover:ring-blue-300',
  },
  'Doa Harian': {
    gradient: 'from-amber-300 via-yellow-300 to-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600',
    shadow: 'hover:shadow-amber-200',
    glow: 'hover:ring-2 hover:ring-amber-300',
  },
  'Panduan Hafalan': {
    gradient: 'from-purple-400 via-violet-400 to-purple-500',
    badge: 'bg-purple-100 text-purple-700',
    button: 'bg-purple-500 hover:bg-purple-600',
    shadow: 'hover:shadow-purple-200',
    glow: 'hover:ring-2 hover:ring-purple-300',
  },
  'Umum': {
    gradient: 'from-gray-300 via-gray-400 to-gray-400',
    badge: 'bg-gray-100 text-gray-700',
    button: 'bg-gray-500 hover:bg-gray-600',
    shadow: 'hover:shadow-gray-200',
    glow: 'hover:ring-2 hover:ring-gray-300',
  },
};

export default function BukuDigitalPage() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tajwid',
    fileUrl: '',
    file: null,
  });

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem('tahfidz_books');
    if (savedBooks) {
      try {
        setBooks(JSON.parse(savedBooks));
      } catch (e) {
        console.error('Error loading books:', e);
      }
    }
  }, []);

  // Save books to localStorage whenever books change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('tahfidz_books', JSON.stringify(books));
    }
  }, [books]);

  // Filter books based on search and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
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
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Judul buku harus diisi');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Deskripsi harus diisi');
      return;
    }

    if (!formData.fileUrl.trim() && !formData.file) {
      toast.error('Pilih file PDF atau masukkan link materi');
      return;
    }

    const newBook = {
      id: `book_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      fileUrl: formData.fileUrl,
      fileName: formData.file?.name || '',
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Guru',
    };

    setBooks([...books, newBook]);
    setShowUploadModal(false);
    setFormData({
      title: '',
      description: '',
      category: 'Tajwid',
      fileUrl: '',
      file: null,
    });

    toast.success('Buku digital berhasil ditambahkan!', {
      icon: '✨',
      style: {
        borderRadius: '12px',
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const handleDelete = (bookId) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      setBooks(books.filter((book) => book.id !== bookId));
      toast.success('Buku berhasil dihapus');
    }
  };

  const handleView = (book) => {
    setSelectedBook(book);
    setShowViewerModal(true);
  };

  const handleDownload = (book) => {
    if (book.fileUrl.startsWith('blob:') || book.fileUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = book.fileUrl;
      link.download = book.fileName || book.title + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Mengunduh file...');
    } else {
      toast.error('File tidak dapat diunduh');
    }
  };

  const getCategoryStyle = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['Umum'];
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-purple-50">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-40 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Book className="text-white" size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Buku Digital
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 via-amber-400 to-transparent rounded-full mt-2"></div>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Kumpulan materi & panduan Tahfidz yang dapat diakses oleh guru dan siswa
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari buku atau materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
              />
            </div>

            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none appearance-none bg-white/80 backdrop-blur-sm cursor-pointer shadow-sm hover:shadow-md transition-all font-medium"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUploadModal(true)}
            className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Upload size={20} className="relative z-10" />
            <span className="relative z-10">Upload Buku Baru</span>
            <div className="absolute top-0 -right-4 w-24 h-full bg-white/20 transform skew-x-12 group-hover:right-full transition-all duration-500"></div>
          </motion.button>
        </motion.div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white via-emerald-50 to-amber-50 rounded-3xl p-16 text-center border-2 border-dashed border-emerald-200 shadow-xl backdrop-blur-sm"
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
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30"></div>
                <div className="relative p-6 bg-gradient-to-br from-white to-emerald-50 rounded-full shadow-lg">
                  <BookOpen className="text-emerald-600" size={64} />
                </div>
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak ada buku yang sesuai'
                : 'Belum ada buku digital'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'Semua'
                ? 'Coba gunakan kata kunci atau filter yang berbeda'
                : 'Yuk, tambahkan materi Tahfidz pertama kamu! 📚'}
            </p>
            {!searchQuery && selectedCategory === 'Semua' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Upload size={22} />
                Upload Buku Pertama
                <Sparkles size={18} />
              </motion.button>
            )}
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
                    className={`bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 ${categoryStyle.shadow} ${categoryStyle.glow}`}
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
                        <span className={`px-3 py-1.5 ${categoryStyle.badge} text-xs font-bold rounded-full shadow-md backdrop-blur-sm`}>
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

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(book.id)}
                          className="flex items-center justify-center px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Upload className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Upload Buku Baru</h2>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition"
                  >
                    <X className="text-white" size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Judul Buku <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Panduan Tajwid Lengkap"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                    >
                      {CATEGORIES.filter(c => c !== 'Semua').map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Singkat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Penjelasan singkat tentang materi buku..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload File PDF (max 10MB) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all"
                      />
                    </div>
                    {formData.file && (
                      <p className="mt-2 text-sm text-gray-600 flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                        <FileText size={16} className="text-emerald-600" />
                        {formData.file.name}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      Simpan Buku
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                        <p className="text-gray-600 text-lg mb-6">File preview tidak tersedia</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(selectedBook)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <Download size={20} />
                          Unduh File
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </GuruLayout>
  );
}
