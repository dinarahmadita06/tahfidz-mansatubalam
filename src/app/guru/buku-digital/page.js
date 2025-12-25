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
  BookOpen,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const CATEGORIES = [
  'Semua',
  'Tajwid',
  'Tahsin',
  'Doa Harian',
  'Panduan Hafalan',
  'Umum',
];

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

  // Calculate statistics
  const totalBooks = books.length;
  const totalPDF = books.filter(b => b.file || b.fileUrl.startsWith('blob:')).length;

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

    if (!formData.file) {
      toast.error('File PDF wajib diupload');
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

    toast.success('Buku digital berhasil ditambahkan!');
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

        {/* Statistics Cards - 2 Kolom (PDF-Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Total Materi */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-semibold mb-1">TOTAL MATERI</p>
                <h3 className="text-4xl font-bold text-emerald-700">{totalBooks}</h3>
              </div>
              <div className="bg-emerald-100 p-4 rounded-full">
                <BookOpen size={32} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 2: PDF */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">FILE PDF</p>
                <h3 className="text-4xl font-bold text-blue-700">{totalPDF}</h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FileCheck size={32} className="text-blue-600" />
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
                  placeholder="Cari buku..."
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
                Upload Buku Baru
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid / Empty State */}
        {filteredBooks.length === 0 ? (
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
                Upload Buku Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Book Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Book className="text-white/40" size={64} />
                </div>

                {/* Book Info */}
                <div className="p-4">
                  {/* Category Badge */}
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded mb-2">
                    {book.category}
                  </span>

                  <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-2">
                    {book.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
                    {book.description}
                  </p>

                  {/* Upload Date */}
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(book.uploadDate).toLocaleDateString('id-ID')}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(book)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      <Eye size={16} />
                      Lihat
                    </button>

                    <button
                      onClick={() => handleDownload(book)}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
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
                  <h2 className="text-xl font-bold text-white">Upload Buku Baru</h2>
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
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Panduan Tajwid Lengkap"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File PDF (max 10MB) <span className="text-red-500">*</span>
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
                    Simpan Buku
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Viewer Modal */}
        {showViewerModal && selectedBook && (
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
                      {selectedBook.title}
                    </h2>
                    <p className="text-white/80 text-sm">{selectedBook.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(selectedBook)}
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
                {selectedBook.fileUrl ? (
                  <iframe
                    src={selectedBook.fileUrl}
                    className="w-full h-full rounded-lg shadow-lg bg-white"
                    title={selectedBook.title}
                  />
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
                        onClick={() => handleDownload(selectedBook)}
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
