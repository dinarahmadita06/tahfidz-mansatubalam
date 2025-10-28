'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BookUp,
  Upload,
  FileAudio,
  FileVideo,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Sparkles,
  Calendar,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

// Data 114 Surah Al-Qur'an
const SURAH_LIST = [
  { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7, type: 'Makkiyah' },
  { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286, type: 'Madaniyah' },
  { number: 3, name: 'Ali \'Imran', arabic: 'آل عمران', verses: 200, type: 'Madaniyah' },
  { number: 4, name: 'An-Nisa\'', arabic: 'النساء', verses: 176, type: 'Madaniyah' },
  { number: 5, name: 'Al-Ma\'idah', arabic: 'المائدة', verses: 120, type: 'Madaniyah' },
  { number: 6, name: 'Al-An\'am', arabic: 'الأنعام', verses: 165, type: 'Makkiyah' },
  { number: 7, name: 'Al-A\'raf', arabic: 'الأعراف', verses: 206, type: 'Makkiyah' },
  { number: 8, name: 'Al-Anfal', arabic: 'الأنفال', verses: 75, type: 'Madaniyah' },
  { number: 9, name: 'At-Taubah', arabic: 'التوبة', verses: 129, type: 'Madaniyah' },
  { number: 10, name: 'Yunus', arabic: 'يونس', verses: 109, type: 'Makkiyah' },
  // ... Add more surahs as needed (abbreviated for brevity)
  { number: 18, name: 'Al-Kahf', arabic: 'الكهف', verses: 110, type: 'Makkiyah' },
  { number: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83, type: 'Makkiyah' },
  { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78, type: 'Madaniyah' },
  { number: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30, type: 'Makkiyah' },
  { number: 78, name: 'An-Naba\'', arabic: 'النبإ', verses: 40, type: 'Makkiyah' },
  { number: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4, type: 'Makkiyah' },
  { number: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5, type: 'Makkiyah' },
  { number: 114, name: 'An-Nas', arabic: 'الناس', verses: 6, type: 'Makkiyah' },
];

export default function SetorHafalanPage() {
  const [formData, setFormData] = useState({
    surah: '',
    ayatMulai: '',
    ayatSelesai: '',
    catatan: '',
    file: null,
  });

  const [riwayatHafalan, setRiwayatHafalan] = useState([
    {
      id: 1,
      surah: 'Al-Baqarah',
      ayat: '1-5',
      tanggal: '2025-10-27',
      status: 'approved',
      nilai: 88,
      catatan: 'Bacaan tajwid sangat baik, pertahankan!',
      guru: 'Ustadz Yusuf',
      waktu: '2 jam yang lalu',
    },
    {
      id: 2,
      surah: 'Al-Fatihah',
      ayat: '1-7',
      tanggal: '2025-10-26',
      status: 'pending',
      nilai: null,
      catatan: null,
      guru: null,
      waktu: '1 hari yang lalu',
    },
    {
      id: 3,
      surah: 'An-Nas',
      ayat: '1-6',
      tanggal: '2025-10-25',
      status: 'revision',
      nilai: 75,
      catatan: 'Perbaiki makhraj huruf pada ayat 3-4',
      guru: 'Ustadz Ahmad',
      waktu: '2 hari yang lalu',
    },
    {
      id: 4,
      surah: 'Al-Ikhlas',
      ayat: '1-4',
      tanggal: '2025-10-24',
      status: 'rejected',
      nilai: 60,
      catatan: 'Kurang lancar, perlu latihan lebih banyak',
      guru: 'Ustadz Yusuf',
      waktu: '3 hari yang lalu',
    },
  ]);

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [searchSurah, setSearchSurah] = useState('');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('riwayat_hafalan_siswa');
    if (saved) {
      try {
        setRiwayatHafalan(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading riwayat:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (riwayatHafalan.length > 0) {
      localStorage.setItem('riwayat_hafalan_siswa', JSON.stringify(riwayatHafalan));
    }
  }, [riwayatHafalan]);

  const handleSurahSelect = (surah) => {
    setSelectedSurah(surah);
    setFormData({ ...formData, surah: surah.name });
    setSearchSurah('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 50MB');
        return;
      }

      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast.error('Format file harus audio (mp3, wav) atau video (mp4, webm)');
        return;
      }

      setFormData({ ...formData, file });
      setFileName(file.name);
      setFileType(file.type.startsWith('audio') ? 'audio' : 'video');
      toast.success('File berhasil dipilih!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.surah) {
      toast.error('Pilih surah terlebih dahulu');
      return;
    }
    if (!formData.ayatMulai || !formData.ayatSelesai) {
      toast.error('Masukkan rentang ayat');
      return;
    }
    if (parseInt(formData.ayatMulai) > parseInt(formData.ayatSelesai)) {
      toast.error('Ayat mulai tidak boleh lebih besar dari ayat selesai');
      return;
    }
    if (!formData.file) {
      toast.error('Upload file audio atau video hafalan');
      return;
    }

    // Create new hafalan entry
    const newHafalan = {
      id: Date.now(),
      surah: formData.surah,
      ayat: `${formData.ayatMulai}-${formData.ayatSelesai}`,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'pending',
      nilai: null,
      catatan: formData.catatan || null,
      guru: null,
      waktu: 'Baru saja',
    };

    setRiwayatHafalan([newHafalan, ...riwayatHafalan]);

    // Reset form
    setFormData({
      surah: '',
      ayatMulai: '',
      ayatSelesai: '',
      catatan: '',
      file: null,
    });
    setSelectedSurah(null);
    setFileName('');
    setFileType('');

    toast.success('Hafalan berhasil disetor! ✨', {
      icon: '📖',
      style: {
        borderRadius: '12px',
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Menunggu Verifikasi',
        icon: Clock,
        color: 'amber',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      },
      approved: {
        label: 'Hafal',
        icon: CheckCircle,
        color: 'emerald',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      },
      revision: {
        label: 'Perlu Perbaikan',
        icon: AlertCircle,
        color: 'orange',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      },
      rejected: {
        label: 'Belum Diterima',
        icon: XCircle,
        color: 'red',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredSurahs = SURAH_LIST.filter(surah =>
    surah.name.toLowerCase().includes(searchSurah.toLowerCase()) ||
    surah.number.toString().includes(searchSurah)
  );

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-40 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <BookUp className="text-white" size={32} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Setor Hafalan
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 via-amber-400 to-transparent rounded-full mt-2"></div>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Submit hafalan baru dan pantau perkembanganmu
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Form Setor (2/5) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Send className="text-emerald-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Form Setor Hafalan</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Surah Selection with Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Surah <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari surah (nama atau nomor)..."
                    value={searchSurah}
                    onChange={(e) => setSearchSurah(e.target.value)}
                    onFocus={() => setSearchSurah('')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                  />

                  {/* Selected Surah Display */}
                  {selectedSurah && !searchSurah && (
                    <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-emerald-900">
                          {selectedSurah.number}. {selectedSurah.name}
                        </p>
                        <p className="text-sm text-emerald-700">
                          {selectedSurah.arabic} • {selectedSurah.verses} ayat
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSurah(null);
                          setFormData({ ...formData, surah: '' });
                        }}
                        className="p-1 hover:bg-emerald-100 rounded-lg transition"
                      >
                        <X size={18} className="text-emerald-600" />
                      </button>
                    </div>
                  )}

                  {/* Dropdown Surah List */}
                  {searchSurah && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah) => (
                          <button
                            key={surah.number}
                            type="button"
                            onClick={() => handleSurahSelect(surah)}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {surah.number}. {surah.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {surah.arabic} • {surah.verses} ayat • {surah.type}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          Surah tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ayat Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSurah?.verses || 999}
                    value={formData.ayatMulai}
                    onChange={(e) => setFormData({ ...formData, ayatMulai: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ayat Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSurah?.verses || 999}
                    value={formData.ayatSelesai}
                    onChange={(e) => setFormData({ ...formData, ayatSelesai: e.target.value })}
                    placeholder={selectedSurah?.verses?.toString() || '7'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Audio/Video Hafalan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                  >
                    <Upload className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={28} />
                    <div className="text-center">
                      <p className="font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">
                        Klik untuk upload file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Audio (MP3, WAV) atau Video (MP4, WebM) • Max 50MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* File Preview */}
                {fileName && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                    {fileType === 'audio' ? (
                      <FileAudio className="text-emerald-600" size={24} />
                    ) : (
                      <FileVideo className="text-emerald-600" size={24} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-emerald-900 truncate">{fileName}</p>
                      <p className="text-xs text-emerald-700">
                        {fileType === 'audio' ? 'File Audio' : 'File Video'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, file: null });
                        setFileName('');
                        setFileType('');
                      }}
                      className="p-1 hover:bg-emerald-100 rounded-lg transition"
                    >
                      <X size={18} className="text-emerald-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Catatan Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Tambahkan catatan untuk guru..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Send size={20} />
                Setor Hafalan
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Right Column - Riwayat (3/5) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BookOpen className="text-emerald-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Riwayat Hafalan</h2>
                <p className="text-sm text-gray-600">Status verifikasi dari guru</p>
              </div>
            </div>

            {/* Riwayat List */}
            <div className="space-y-4">
              <AnimatePresence>
                {riwayatHafalan.map((hafalan, index) => {
                  const statusConfig = getStatusConfig(hafalan.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={hafalan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl p-5 shadow-md border-2 ${statusConfig.border} hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {hafalan.surah}
                          </h3>
                          <p className="text-sm text-gray-600">Ayat {hafalan.ayat}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 ${statusConfig.bg} ${statusConfig.text} rounded-full`}>
                          <StatusIcon size={16} />
                          <span className="text-xs font-bold">{statusConfig.label}</span>
                        </div>
                      </div>

                      {hafalan.nilai && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Nilai:</span>
                            <span className="text-2xl font-bold text-emerald-600">{hafalan.nilai}</span>
                          </div>
                        </div>
                      )}

                      {hafalan.catatan && (
                        <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-2">
                            <MessageSquare size={16} className="text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-900 mb-1">Catatan Guru:</p>
                              <p className="text-sm text-amber-800">{hafalan.catatan}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{hafalan.waktu}</span>
                        </div>
                        {hafalan.guru && (
                          <span className="font-medium">Dinilai oleh {hafalan.guru}</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {riwayatHafalan.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <BookOpen className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-600 font-medium">Belum ada riwayat hafalan</p>
                  <p className="text-sm text-gray-500 mt-1">Setor hafalan pertamamu sekarang!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
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
      `}</style>
    </SiswaLayout>
  );
}
