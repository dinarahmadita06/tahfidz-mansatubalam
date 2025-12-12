'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import ParentingMotivationalCard from '@/components/ParentingMotivationalCard';
import {
  BarChart3,
  User,
  ChevronDown,
  CheckCircle,
  Info,
  Download,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Grafik Garis Sederhana
function SimpleLineChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.nilai));
  const minValue = Math.min(...data.map(d => d.nilai));
  const range = maxValue - minValue || 10;

  return (
    <div className="relative h-64 flex items-end justify-between gap-4 px-4 pt-4 pb-8">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-4">
        {[100, 90, 80, 70, 60].map((val) => (
          <div key={val} className="relative w-full border-t border-gray-200">
            <span className="absolute -left-8 -top-2 text-xs text-gray-500">{val}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      {data.map((item, index) => {
        const height = ((item.nilai - minValue + 10) / (range + 20)) * 100;
        const isGood = item.nilai >= 90;
        const isOk = item.nilai >= 70 && item.nilai < 90;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 relative z-10">
            <div
              className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative group cursor-pointer"
              style={{ height: '100%' }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`absolute bottom-0 w-full rounded-t-lg ${
                  isGood
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    : isOk
                    ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                    : 'bg-gradient-to-t from-rose-500 to-rose-400'
                }`}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.nilai}
                </div>
              </motion.div>
            </div>
            <span className="text-xs text-gray-600 font-medium text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Modal Detail Catatan
function CatatanModal({ isOpen, onClose, penilaian }) {
  if (!isOpen || !penilaian) return null;

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
              <h3 className="text-xl font-bold text-gray-900">Detail Penilaian</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="text-gray-500" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold text-gray-900">{penilaian.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Guru</p>
                  <p className="font-semibold text-gray-900">{penilaian.guru}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Surah / Ayat</p>
                <p className="font-semibold text-gray-900">{penilaian.surah}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                  <p className="text-2xl font-bold text-emerald-600">{penilaian.tajwid}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                  <p className="text-2xl font-bold text-amber-600">{penilaian.kelancaran}</p>
                </div>
                <div className="bg-sky-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Adab</p>
                  <p className="text-2xl font-bold text-sky-600">{penilaian.adab}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Catatan Guru:</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-900 leading-relaxed">{penilaian.catatan}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PenilaianPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedPenilaian, setSelectedPenilaian] = useState(null);
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

  // Data dummy penilaian
  const penilaianData = [
    {
      id: 1,
      tanggal: '27 Okt 2025',
      surah: 'Al-Baqarah 1-10',
      tajwid: 90,
      kelancaran: 88,
      adab: 95,
      catatan: 'Sudah lancar, perhatikan mad panjang pada ayat 5 dan 8. Tajwid sudah bagus.',
      guru: 'Ustadz Yusuf',
    },
    {
      id: 2,
      tanggal: '21 Okt 2025',
      surah: 'Al-Fatihah',
      tajwid: 95,
      kelancaran: 94,
      adab: 97,
      catatan: 'Sangat baik, tajwid konsisten. Adab saat membaca juga terjaga dengan baik.',
      guru: 'Ustadz Ahmad',
    },
    {
      id: 3,
      tanggal: '15 Okt 2025',
      surah: 'An-Nas',
      tajwid: 88,
      kelancaran: 90,
      adab: 92,
      catatan: 'Bagus, teruskan latihan untuk kelancaran. Fokus pada tajwid huruf-huruf tertentu.',
      guru: 'Ustadzah Aisyah',
    },
    {
      id: 4,
      tanggal: '10 Okt 2025',
      surah: 'Al-Falaq',
      tajwid: 85,
      kelancaran: 87,
      adab: 90,
      catatan: 'Perlu latihan lebih untuk tajwid qalqalah. Kelancaran sudah cukup baik.',
      guru: 'Ustadz Yusuf',
    },
  ];

  // Hitung rata-rata
  const rataRataTajwid = Math.round(
    penilaianData.reduce((sum, p) => sum + p.tajwid, 0) / penilaianData.length
  );
  const rataRataKelancaran = Math.round(
    penilaianData.reduce((sum, p) => sum + p.kelancaran, 0) / penilaianData.length
  );
  const rataRataAdab = Math.round(
    penilaianData.reduce((sum, p) => sum + p.adab, 0) / penilaianData.length
  );

  // Data untuk grafik
  const chartData = penilaianData
    .slice()
    .reverse()
    .map((p) => ({
      label: p.tanggal.split(' ')[0] + ' ' + p.tanggal.split(' ')[1],
      nilai: Math.round((p.tajwid + p.kelancaran + p.adab) / 3),
    }));

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

  const handleOpenModal = (penilaian) => {
    setSelectedPenilaian(penilaian);
    setIsModalOpen(true);
  };

  const getColorByAverage = (avg) => {
    if (avg >= 90) return 'border-emerald-500';
    if (avg >= 70) return 'border-amber-500';
    return 'border-rose-500';
  };

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
              {/* Header Content */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                {/* Left: Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="text-white flex-shrink-0" size={28} />
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      Penilaian Hafalan
                    </h1>
                  </div>
                  <p className="text-emerald-50 text-base md:text-lg">
                    Lihat hasil penilaian hafalan dari guru tahfidz untuk anak Anda.
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

              {/* Child Selector Dropdown */}
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
          <ParentingMotivationalCard theme="amber" />
        </motion.div>

        {/* Ringkasan Nilai Umum - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Rata-rata Tajwid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">🎙️</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Rata-rata Tajwid</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-emerald-600">{rataRataTajwid}</p>
              <p className="text-sm text-gray-600 mt-1">dari 100</p>
            </div>
          </motion.div>

          {/* Card 2: Rata-rata Kelancaran */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">💬</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Rata-rata Kelancaran</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-amber-600">{rataRataKelancaran}</p>
              <p className="text-sm text-gray-600 mt-1">dari 100</p>
            </div>
          </motion.div>

          {/* Card 3: Rata-rata Adab */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">🌿</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Rata-rata Adab</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-sky-600">{rataRataAdab}</p>
              <p className="text-sm text-gray-600 mt-1">dari 100</p>
            </div>
          </motion.div>
        </div>

        {/* Grafik Perkembangan Nilai */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-800">Grafik Perkembangan Nilai</h2>
              <p className="text-sm text-gray-600">Rata-rata nilai 4 minggu terakhir</p>
            </div>
          </div>

          <SimpleLineChart data={chartData} />

          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-800">
              <strong>Perkembangan:</strong> Nilai anak menunjukkan peningkatan stabil selama 4
              minggu terakhir.
            </p>
          </div>
        </motion.div>

        {/* Daftar Penilaian Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BarChart3 className="text-amber-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-800">Daftar Penilaian Detail</h2>
                <p className="text-sm text-gray-600">Riwayat penilaian hafalan</p>
              </div>
            </div>

            {/* Download Button */}
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              <Download size={18} />
              <span className="font-semibold text-sm">Unduh Nilai</span>
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Tanggal
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Surah / Ayat
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-800">
                    Tajwid
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-800">
                    Kelancaran
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-800">
                    Adab
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-800">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {penilaianData.map((item, index) => {
                  const avgScore = Math.round((item.tajwid + item.kelancaran + item.adab) / 3);
                  const borderColor = getColorByAverage(avgScore);

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-emerald-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 border-l-4 ${borderColor} pl-3`}>
                          <span className="font-medium text-gray-900">{item.tanggal}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{item.surah}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-emerald-600">{item.tajwid}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-amber-600">{item.kelancaran}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-sky-600">{item.adab}</span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <Info size={18} />
                          <span className="text-sm font-medium">Lihat</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {penilaianData.map((item, index) => {
              const avgScore = Math.round((item.tajwid + item.kelancaran + item.adab) / 3);
              const borderColor = getColorByAverage(avgScore);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${borderColor}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.surah}</h3>
                      <p className="text-sm text-gray-600">{item.tanggal}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                      <p className="text-xl font-bold text-emerald-600">{item.tajwid}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                      <p className="text-xl font-bold text-amber-600">{item.kelancaran}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Adab</p>
                      <p className="text-xl font-bold text-sky-600">{item.adab}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(item)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Info size={16} />
                    <span className="text-sm font-medium">Lihat Catatan Guru</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Modal Catatan */}
        <CatatanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          penilaian={selectedPenilaian}
        />
      </div>
    </OrangtuaLayout>
  );
}
