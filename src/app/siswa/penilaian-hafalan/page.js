'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  Calendar,
  BookOpen,
  Target,
  Sparkles,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Komponen Mini Chart untuk Nilai Bulanan
function MiniBarChart({ data, color = 'emerald' }) {
  const maxValue = Math.max(...data.map(d => d.value));

  const colorClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full ${colorClasses[color]} rounded-t-lg relative group cursor-pointer`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.value}
                </div>
              </motion.div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PenilaianHafalanPage() {
  const [filterBulan, setFilterBulan] = useState('semua');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Data penilaian hafalan
  const penilaianData = [
    {
      id: 1,
      surah: 'Al-Baqarah',
      ayat: '1-5',
      tanggal: '2025-10-27',
      guru: 'Ustadz Yusuf',
      nilaiAspek: {
        tajwid: 90,
        kelancaran: 85,
        makhraj: 88,
        implementasi: 95,
      },
      nilaiTotal: 88,
      catatan: 'Masya Allah, bacaan tajwid sangat baik. Pertahankan kelancaran dan terus tingkatkan makhraj huruf hijaiyah. Semangat!',
      bulan: 'Oktober 2025',
    },
    {
      id: 2,
      surah: 'An-Nas',
      ayat: '1-6',
      tanggal: '2025-10-25',
      guru: 'Ustadz Ahmad',
      nilaiAspek: {
        tajwid: 85,
        kelancaran: 80,
        makhraj: 75,
        implementasi: 90,
      },
      nilaiTotal: 82,
      catatan: 'Bacaan sudah cukup baik. Perlu perbaikan pada makhraj huruf di ayat 3-4. Latihan lebih fokus pada huruf-huruf yang keluar dari tenggorokan.',
      bulan: 'Oktober 2025',
    },
    {
      id: 3,
      surah: 'Al-Ikhlas',
      ayat: '1-4',
      tanggal: '2025-10-23',
      guru: 'Ustadz Yusuf',
      nilaiAspek: {
        tajwid: 88,
        kelancaran: 90,
        makhraj: 85,
        implementasi: 92,
      },
      nilaiTotal: 89,
      catatan: 'Alhamdulillah, hafalan sangat lancar. Tajwid dan adab sudah bagus sekali. Tingkatkan lagi untuk hafalan berikutnya.',
      bulan: 'Oktober 2025',
    },
    {
      id: 4,
      surah: 'Al-Falaq',
      ayat: '1-5',
      tanggal: '2025-09-28',
      guru: 'Ustadz Ahmad',
      nilaiAspek: {
        tajwid: 82,
        kelancaran: 78,
        makhraj: 80,
        implementasi: 88,
      },
      nilaiTotal: 82,
      catatan: 'Bacaan cukup baik namun masih ada beberapa kesalahan kecil pada tajwid. Perlu latihan lebih rutin.',
      bulan: 'September 2025',
    },
  ];

  // Data chart rata-rata bulanan
  const chartData = [
    { label: 'Jul', value: 78 },
    { label: 'Agt', value: 82 },
    { label: 'Sep', value: 85 },
    { label: 'Okt', value: 88 },
  ];

  // Hitung statistik
  const rataRataNilai = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiTotal, 0) / penilaianData.length
  );

  const rataRataTajwid = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiAspek.tajwid, 0) / penilaianData.length
  );

  const rataRataKelancaran = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiAspek.kelancaran, 0) / penilaianData.length
  );

  const rataRataMakhraj = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiAspek.makhraj, 0) / penilaianData.length
  );

  const rataRataImplementasi = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiAspek.implementasi, 0) / penilaianData.length
  );

  const getAspekColor = (aspek) => {
    const colors = {
      tajwid: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        badge: 'bg-emerald-500',
        border: 'border-emerald-200',
        glow: 'shadow-sm',
      },
      kelancaran: {
        bg: 'bg-sky-100',
        text: 'text-sky-700',
        badge: 'bg-sky-500',
        border: 'border-sky-200',
        glow: 'shadow-sm',
      },
      makhraj: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        badge: 'bg-purple-500',
        border: 'border-purple-200',
        glow: 'shadow-sm',
      },
      implementasi: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        badge: 'bg-amber-500',
        border: 'border-amber-200',
        glow: 'shadow-sm',
      },
    };
    return colors[aspek];
  };

  const getNilaiColor = (nilai) => {
    if (nilai >= 90) return { bg: 'bg-emerald-500', text: 'text-white' };
    if (nilai >= 80) return { bg: 'bg-sky-500', text: 'text-white' };
    if (nilai >= 70) return { bg: 'bg-amber-500', text: 'text-white' };
    return { bg: 'bg-red-500', text: 'text-white' };
  };

  const filteredData = filterBulan === 'semua'
    ? penilaianData
    : penilaianData.filter(item => item.bulan === filterBulan);

  const bulanOptions = ['semua', ...Array.from(new Set(penilaianData.map(item => item.bulan)))];

  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Header - SIMTAQ Gradient */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Star className="text-white" size={32} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Penilaian Hafalan</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1 flex items-center gap-2 whitespace-normal">
                  <Sparkles size={18} className="flex-shrink-0" />
                  Pantau nilai dan feedback dari guru
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Pastel Solid (Clear Colors) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Rata-rata Keseluruhan - Violet Pastel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="col-span-2 sm:col-span-2 lg:col-span-1 bg-violet-100 border-2 border-violet-200 rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <Award size={20} className="text-violet-600" />
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Rata-rata</span>
              </div>
              <p className="text-4xl font-bold text-violet-700 mb-1">{rataRataNilai}</p>
              <p className="text-sm text-violet-600">{penilaianData.length} penilaian</p>
            </motion.div>

            {/* Tajwid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`${getAspekColor('tajwid').bg} rounded-2xl p-5 border-2 ${getAspekColor('tajwid').border} ${getAspekColor('tajwid').glow} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <span className={`text-xs font-bold ${getAspekColor('tajwid').text} uppercase tracking-wider block mb-2`}>Tajwid</span>
              <p className={`text-3xl font-bold ${getAspekColor('tajwid').text}`}>{rataRataTajwid}</p>
            </motion.div>

            {/* Kelancaran */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`${getAspekColor('kelancaran').bg} rounded-2xl p-5 border-2 ${getAspekColor('kelancaran').border} ${getAspekColor('kelancaran').glow} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <span className={`text-xs font-bold ${getAspekColor('kelancaran').text} uppercase tracking-wider block mb-2`}>Kelancaran</span>
              <p className={`text-3xl font-bold ${getAspekColor('kelancaran').text}`}>{rataRataKelancaran}</p>
            </motion.div>

            {/* Makhraj */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`${getAspekColor('makhraj').bg} rounded-2xl p-5 border-2 ${getAspekColor('makhraj').border} ${getAspekColor('makhraj').glow} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <span className={`text-xs font-bold ${getAspekColor('makhraj').text} uppercase tracking-wider block mb-2`}>Makhraj</span>
              <p className={`text-3xl font-bold ${getAspekColor('makhraj').text}`}>{rataRataMakhraj}</p>
            </motion.div>

            {/* Implementasi */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`${getAspekColor('implementasi').bg} rounded-2xl p-5 border-2 ${getAspekColor('implementasi').border} ${getAspekColor('implementasi').glow} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <span className={`text-xs font-bold ${getAspekColor('implementasi').text} uppercase tracking-wider block mb-2`}>Implementasi</span>
              <p className={`text-3xl font-bold ${getAspekColor('implementasi').text}`}>{rataRataImplementasi}</p>
            </motion.div>
          </div>

          {/* Chart Section - Dashboard Card Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Perkembangan Nilai Bulanan</h2>
                <p className="text-xs text-gray-600">Grafik rata-rata nilai 4 bulan terakhir</p>
              </div>
            </div>

            <MiniBarChart data={chartData} color="emerald" />
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition-all shadow-sm"
              >
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {filterBulan === 'semua' ? 'Semua Bulan' : filterBulan}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showFilterDropdown && (
                <div className="absolute z-10 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl">
                  {bulanOptions.map((bulan) => (
                    <button
                      key={bulan}
                      onClick={() => {
                        setFilterBulan(bulan);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 transition-colors ${
                        filterBulan === bulan ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700'
                      } first:rounded-t-xl last:rounded-b-xl`}
                    >
                      {bulan === 'semua' ? 'Semua Bulan' : bulan}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Menampilkan {filteredData.length} penilaian
            </p>
          </motion.div>

          {/* Daftar Penilaian - Dashboard Card Style */}
          <div className="space-y-4">
            {filteredData.map((penilaian, index) => {
              const gradeColor = getNilaiColor(penilaian.nilaiTotal);

              return (
                <motion.div
                  key={penilaian.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">
                        {penilaian.surah}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Ayat {penilaian.ayat}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{penilaian.tanggal}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-normal">Dinilai oleh {penilaian.guru}</span>
                      </div>
                    </div>
                    {/* Badge Nilai - Pill Style */}
                    <div className={`flex-shrink-0 ml-4 px-5 py-2 ${gradeColor.bg} ${gradeColor.text} rounded-full shadow-md`}>
                      <p className="text-2xl font-bold">{penilaian.nilaiTotal}</p>
                    </div>
                  </div>

                  {/* Nilai per Aspek - Pastel Solid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {Object.entries(penilaian.nilaiAspek).map(([aspek, nilai]) => {
                      const color = getAspekColor(aspek);
                      return (
                        <div key={aspek} className={`${color.bg} rounded-xl p-4 border-2 ${color.border}`}>
                          <p className={`text-xs font-bold ${color.text} uppercase mb-1 tracking-wider`}>
                            {aspek}
                          </p>
                          <p className={`text-2xl font-bold ${color.text}`}>{nilai}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Catatan Guru - Pastel Subtle */}
                  <div className="bg-orange-50/50 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-200 rounded-lg flex-shrink-0">
                        <MessageSquare className="text-orange-700" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-orange-900 mb-1">Catatan dari Guru:</p>
                        <p className="text-sm text-orange-800/90 leading-relaxed break-words">
                          {penilaian.catatan}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredData.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-600 font-medium">Tidak ada penilaian untuk filter ini</p>
                <p className="text-sm text-gray-500 mt-1">Coba pilih bulan yang berbeda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
