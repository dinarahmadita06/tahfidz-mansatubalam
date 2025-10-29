'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import {
  BookOpen,
  Star,
  Clock,
  Download,
  Info,
  ChevronDown,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Progress Bar Horizontal untuk Juz
function JuzProgressBar({ juz, progress, totalAyat, completedAyat }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-800">Juz {juz}</span>
          <span className="text-xs text-gray-600">({completedAyat}/{totalAyat} ayat)</span>
        </div>
        <span className="text-sm font-semibold text-amber-600">{progress}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full"
        />
      </div>
    </motion.div>
  );
}

// Komponen Card Motivasi Dinamis
function MotivationalQuoteCard() {
  const quotes = [
    {
      text: "Barangsiapa membaca Al-Qur'an dan mengamalkannya, maka kedua orang tuanya akan dipakaikan mahkota cahaya.",
      source: "HR. Ahmad",
    },
    {
      text: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.",
      source: "HR. Bukhari",
    },
    {
      text: "Bacalah Al-Qur'an, sesungguhnya Al-Qur'an akan datang pada hari kiamat sebagai pemberi syafa'at.",
      source: "HR. Muslim",
    },
    {
      text: "Orang yang ahli membaca Al-Qur'an bersama para malaikat yang mulia lagi taat.",
      source: "HR. Bukhari & Muslim",
    },
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 60000); // 60 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-amber-100"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">🕋</div>
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-emerald-900 font-medium italic leading-relaxed mb-2">
                "{quotes[currentQuote].text}"
              </p>
              <p className="text-sm text-amber-700 font-semibold">
                — {quotes[currentQuote].source}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Komponen Modal Detail Catatan Guru
function CatatanGuruModal({ isOpen, onClose, catatan }) {
  if (!isOpen || !catatan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Catatan Guru</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="text-gray-500" size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Guru:</p>
                <p className="font-semibold text-gray-900">{catatan.guru}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal:</p>
                <p className="font-semibold text-gray-900">{catatan.tanggal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Catatan:</p>
                <p className="text-gray-900 leading-relaxed">{catatan.text}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HafalanAnakPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedCatatan, setSelectedCatatan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Data dummy anak
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A', avatar: '👦' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B', avatar: '👧' },
  ];

  // Data dummy hafalan
  const hafalanData = [
    {
      id: 1,
      surah: 'Al-Fatihah',
      juz: 1,
      ayat: '1-7',
      tanggalSetor: '15 Okt 2025',
      nilai: 95,
      status: 'lulus',
      catatanGuru: 'Tajwid sangat baik, bacaan lancar dan fasih.',
      guru: 'Ustadz Yusuf',
    },
    {
      id: 2,
      surah: 'Al-Baqarah',
      juz: 2,
      ayat: '1-10',
      tanggalSetor: '28 Okt 2025',
      nilai: 88,
      status: 'revisi',
      catatanGuru: 'Kurang jelas pada ayat 5, perlu perbaikan mad dan qalqalah.',
      guru: 'Ustadz Ahmad',
    },
    {
      id: 3,
      surah: 'Ali Imran',
      juz: 3,
      ayat: '1-20',
      tanggalSetor: '20 Okt 2025',
      nilai: 92,
      status: 'lulus',
      catatanGuru: 'Sangat baik, muroja\'ah juga lancar.',
      guru: 'Ustadzah Aisyah',
    },
    {
      id: 4,
      surah: 'An-Nisa',
      juz: 4,
      ayat: '1-15',
      tanggalSetor: '-',
      nilai: '-',
      status: 'belum',
      catatanGuru: '-',
      guru: '-',
    },
  ];

  // Data progress per Juz
  const juzProgress = [
    { juz: 1, progress: 100, totalAyat: 148, completedAyat: 148 },
    { juz: 2, progress: 75, totalAyat: 200, completedAyat: 150 },
    { juz: 3, progress: 50, totalAyat: 180, completedAyat: 90 },
    { juz: 4, progress: 25, totalAyat: 176, completedAyat: 44 },
    { juz: 5, progress: 0, totalAyat: 165, completedAyat: 0 },
  ];

  // Statistik
  const stats = {
    totalHafalanSelesai: 15,
    targetHafalan: 30,
    rataRataNilai: 88,
    statusTerakhir: {
      surah: 'Al-Baqarah',
      ayat: '1-10',
      tanggal: '28 Oktober 2025',
    },
  };

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleOpenCatatan = (hafalan) => {
    if (hafalan.status !== 'belum') {
      setSelectedCatatan({
        text: hafalan.catatanGuru,
        guru: hafalan.guru,
        tanggal: hafalan.tanggalSetor,
      });
      setIsModalOpen(true);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'lulus':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-500',
          label: 'Lulus',
        };
      case 'revisi':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-500',
          label: 'Revisi',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          label: 'Belum Setor',
        };
    }
  };

  const totalProgress = Math.round((stats.totalHafalanSelesai / stats.targetHafalan) * 100);

  return (
    <OrangtuaLayout>
      <div className="min-h-screen animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-300 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-visible">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              {/* Header Content - Flexible Layout */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                {/* Left: Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="text-white flex-shrink-0" size={28} />
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      Hafalan Anak
                    </h1>
                  </div>
                  <p className="text-emerald-50 text-base md:text-lg">
                    Lihat perkembangan hafalan dan capaian target anak Anda.
                  </p>
                </div>

                {/* Right: Info Anak Card */}
                {selectedChild && (
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:bg-white/25 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedChild.avatar}</span>
                        <div>
                          <p className="text-white font-bold text-lg">{selectedChild.name}</p>
                          <p className="text-emerald-100 text-sm">Kelas {selectedChild.kelas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Child Selector Dropdown (jika lebih dari 1 anak) */}
              {children.length > 1 && (
                <div className="relative mt-2">
                  <button
                    onClick={() => setShowChildSelector(!showChildSelector)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/90 hover:bg-white hover:ring-1 hover:ring-emerald-400/60 backdrop-blur-sm rounded-xl transition-all duration-200 ease-in-out shadow-md min-w-[180px] max-w-[320px] w-full lg:w-auto"
                  >
                    <User size={18} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-900 font-semibold text-sm flex-1 truncate">
                      {selectedChild ? selectedChild.name : 'Pilih Anak'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-emerald-600 flex-shrink-0 transition-transform duration-200 ${
                        showChildSelector ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showChildSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px] max-w-[400px] w-full md:w-auto border border-emerald-100"
                      >
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              setSelectedChild(child);
                              setShowChildSelector(false);
                            }}
                            className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                              selectedChild?.id === child.id ? 'bg-emerald-50' : 'bg-white'
                            }`}
                          >
                            <span className="text-3xl flex-shrink-0">{child.avatar}</span>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{child.name}</p>
                              <p className="text-sm text-gray-600">Kelas {child.kelas}</p>
                            </div>
                            {selectedChild?.id === child.id && (
                              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivational Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <MotivationalQuoteCard />
        </motion.div>

        {/* Ringkasan Hafalan - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Hafalan Selesai */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">📖</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Hafalan Selesai</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-emerald-600">{stats.totalHafalanSelesai}</p>
              <p className="text-sm text-gray-600 mt-1">Dari {stats.targetHafalan} target</p>
            </div>
          </motion.div>

          {/* Card 2: Rata-rata Nilai */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">⭐</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Rata-rata Nilai Hafalan</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-amber-600">{stats.rataRataNilai}</p>
              <p className="text-sm text-gray-600 mt-1">Dari 100</p>
            </div>
          </motion.div>

          {/* Card 3: Status Terakhir Setoran */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">⏰</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Status Terakhir Setoran</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-sky-700">
                {stats.statusTerakhir.surah} {stats.statusTerakhir.ayat}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Disetor pada {stats.statusTerakhir.tanggal}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Daftar Detail Hafalan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BookOpen className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-800">Daftar Detail Hafalan</h2>
                <p className="text-sm text-gray-600">Riwayat setoran hafalan anak</p>
              </div>
            </div>

            {/* Download Button */}
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              <Download size={18} />
              <span className="font-semibold text-sm">Unduh Laporan</span>
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Surah
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Juz
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Ayat
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Tanggal Setor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Nilai
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Catatan Guru
                  </th>
                </tr>
              </thead>
              <tbody>
                {hafalanData.map((hafalan, index) => {
                  const statusConfig = getStatusConfig(hafalan.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.tr
                      key={hafalan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        hafalan.status === 'belum' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 border-l-4 ${statusConfig.border} pl-3`}>
                          <span className="font-semibold text-gray-900">{hafalan.surah}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{hafalan.juz}</td>
                      <td className="py-4 px-4 text-gray-700">{hafalan.ayat}</td>
                      <td className="py-4 px-4 text-gray-700">{hafalan.tanggalSetor}</td>
                      <td className="py-4 px-4">
                        {hafalan.nilai !== '-' ? (
                          <span className="font-bold text-amber-600">{hafalan.nilai}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon size={18} className={statusConfig.color} />
                          <span className={`text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {hafalan.status !== 'belum' ? (
                          <button
                            onClick={() => handleOpenCatatan(hafalan)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <Info size={18} />
                            <span className="text-sm font-medium">Lihat</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {hafalanData.map((hafalan, index) => {
              const statusConfig = getStatusConfig(hafalan.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={hafalan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${statusConfig.border} ${
                    hafalan.status === 'belum' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{hafalan.surah}</h3>
                      <p className="text-sm text-gray-600">
                        Juz {hafalan.juz} • Ayat {hafalan.ayat}
                      </p>
                    </div>
                    {hafalan.nilai !== '-' && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">{hafalan.nilai}</p>
                        <p className="text-xs text-gray-600">Nilai</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={statusConfig.color} />
                      <span className={`text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{hafalan.tanggalSetor}</p>
                  </div>

                  {hafalan.status !== 'belum' && (
                    <button
                      onClick={() => handleOpenCatatan(hafalan)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Info size={16} />
                      <span className="text-sm font-medium">Lihat Catatan Guru</span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Hafalan per Juz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-800">Progress Hafalan per Juz</h2>
              <p className="text-sm text-gray-600">Target hafalan semester ini</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {juzProgress.map((juz) => (
              <JuzProgressBar
                key={juz.juz}
                juz={juz.juz}
                progress={juz.progress}
                totalAyat={juz.totalAyat}
                completedAyat={juz.completedAyat}
              />
            ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-800">
              <strong>Progress:</strong> Anak Anda telah menyelesaikan{' '}
              <strong>{totalProgress}%</strong> dari total target hafalan semester ini.
            </p>
          </div>
        </motion.div>

        {/* Modal Catatan Guru */}
        <CatatanGuruModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          catatan={selectedCatatan}
        />
      </div>
    </OrangtuaLayout>
  );
}
