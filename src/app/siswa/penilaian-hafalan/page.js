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
  Sparkles,
  ChevronDown,
  Filter,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================
// SUB-COMPONENTS (REUSABLE)
// ============================================================

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
        <p className="text-gray-600 font-medium">Memuat data penilaian...</p>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border-2 border-red-200">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 mt-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <BookOpen className="text-gray-400" size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Penilaian Hafalan</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Nilai akan muncul setelah Anda menyetorkan hafalan kepada guru. Semangat menghafal Al-Qur'an!
      </p>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, title, value, color = 'emerald', delay = 0 }) {
  const colorConfig = {
    emerald: {
      bg: 'bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
    },
    sky: {
      bg: 'bg-sky-100',
      border: 'border-sky-200',
      text: 'text-sky-700',
    },
    purple: {
      bg: 'bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
    },
    amber: {
      bg: 'bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
    },
    violet: {
      bg: 'bg-violet-100',
      border: 'border-violet-200',
      text: 'text-violet-700',
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`${config.bg} rounded-2xl p-5 border-2 ${config.border} shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} className={config.text} />
        <span className={`text-xs font-bold ${config.text} uppercase tracking-wider`}>{title}</span>
      </div>
      <p className={`text-3xl sm:text-4xl font-bold ${config.text}`}>{value}</p>
    </motion.div>
  );
}

// Mini Bar Chart Component
function MiniBarChart({ data, color = 'emerald' }) {
  if (!data || data.length === 0) return null;

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
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full ${colorClasses[color]} rounded-t-lg relative group cursor-pointer`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
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

// Penilaian Card Component
function PenilaianCard({ penilaian, index }) {
  const getAspekColor = (aspek) => {
    const colors = {
      tajwid: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      },
      kelancaran: {
        bg: 'bg-sky-100',
        text: 'text-sky-700',
        border: 'border-sky-200',
      },
      makhraj: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
      },
      implementasi: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
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

  const gradeColor = getNilaiColor(penilaian.nilaiTotal);

  return (
    <motion.div
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
              <span>{new Date(penilaian.tanggal).toLocaleDateString('id-ID')}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-normal">Dinilai oleh {penilaian.guru}</span>
          </div>
        </div>
        {/* Badge Nilai */}
        <div className={`flex-shrink-0 ml-4 px-5 py-2 ${gradeColor.bg} ${gradeColor.text} rounded-full shadow-md`}>
          <p className="text-2xl font-bold">{penilaian.nilaiTotal}</p>
        </div>
      </div>

      {/* Nilai per Aspek */}
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

      {/* Catatan Guru */}
      {penilaian.catatan && (
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
      )}
    </motion.div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function PenilaianHafalanPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filterBulan, setFilterBulan] = useState('semua');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/siswa/penilaian-hafalan');

        if (!res.ok) {
          throw new Error('Gagal memuat data penilaian');
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching penilaian:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <SiswaLayout>
        <LoadingState />
      </SiswaLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <SiswaLayout>
        <ErrorState message={error} />
      </SiswaLayout>
    );
  }

  // Extract data
  const { statistics, penilaianData = [], chartData = [] } = data || {};
  const hasPenilaian = Array.isArray(penilaianData) && penilaianData.length > 0;

  // Build unique months from penilaianData for filter
  const bulanOptions = ['semua'];
  if (hasPenilaian) {
    const uniqueMonths = Array.from(
      new Set(
        penilaianData.map(item => {
          const date = new Date(item.tanggal);
          return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        })
      )
    );
    bulanOptions.push(...uniqueMonths);
  }

  // Filter penilaian by month
  const filteredData = filterBulan === 'semua'
    ? penilaianData
    : penilaianData.filter(item => {
        const date = new Date(item.tanggal);
        const itemMonth = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        return itemMonth === filterBulan;
      });

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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              icon={Award}
              title="Rata-rata"
              value={statistics?.rataRataNilai || 0}
              color="violet"
              delay={0.1}
            />
            <StatsCard
              icon={Star}
              title="Tajwid"
              value={statistics?.rataRataTajwid || 0}
              color="emerald"
              delay={0.2}
            />
            <StatsCard
              icon={TrendingUp}
              title="Kelancaran"
              value={statistics?.rataRataKelancaran || 0}
              color="sky"
              delay={0.3}
            />
            <StatsCard
              icon={BookOpen}
              title="Makhraj"
              value={statistics?.rataRataMakhraj || 0}
              color="purple"
              delay={0.4}
            />
            <StatsCard
              icon={Sparkles}
              title="Implementasi"
              value={statistics?.rataRataImplementasi || 0}
              color="amber"
              delay={0.5}
            />
          </div>

          {/* Chart Section - Only show if there's data */}
          {hasPenilaian && chartData.length > 0 && (
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
                  <h2 className="text-lg font-bold text-gray-900">Perkembangan Nilai Per Semester</h2>
                  <p className="text-xs text-gray-600">Grafik rata-rata nilai berdasarkan bulan setoran</p>
                </div>
              </div>

              <MiniBarChart data={chartData} color="emerald" />
            </motion.div>
          )}

          {/* Filter - Only show if there's data */}
          {hasPenilaian && (
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
                  <div className="absolute z-10 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl">
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
          )}

          {/* Daftar Penilaian or Empty State */}
          {hasPenilaian ? (
            <div className="space-y-4">
              {filteredData.map((penilaian, index) => (
                <PenilaianCard key={penilaian.id} penilaian={penilaian} index={index} />
              ))}

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
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </SiswaLayout>
  );
}
