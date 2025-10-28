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
        adab: 95,
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
        adab: 90,
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
        adab: 92,
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
        adab: 88,
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

  const rataRataAdab = Math.round(
    penilaianData.reduce((sum, item) => sum + item.nilaiAspek.adab, 0) / penilaianData.length
  );

  const getAspekColor = (aspek) => {
    const colors = {
      tajwid: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-500' },
      kelancaran: { bg: 'bg-sky-100', text: 'text-sky-700', badge: 'bg-sky-500' },
      makhraj: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-500' },
      adab: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-500' },
    };
    return colors[aspek];
  };

  const getNilaiGrade = (nilai) => {
    if (nilai >= 90) return { grade: 'A', color: 'emerald', bg: 'bg-emerald-500' };
    if (nilai >= 80) return { grade: 'B', color: 'sky', bg: 'bg-sky-500' };
    if (nilai >= 70) return { grade: 'C', color: 'amber', bg: 'bg-amber-500' };
    return { grade: 'D', color: 'red', bg: 'bg-red-500' };
  };

  const filteredData = filterBulan === 'semua'
    ? penilaianData
    : penilaianData.filter(item => item.bulan === filterBulan);

  const bulanOptions = ['semua', ...Array.from(new Set(penilaianData.map(item => item.bulan)))];

  return (
    <SiswaLayout>
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Star className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Penilaian Hafalan</h1>
                <div className="h-1 w-32 bg-white/30 rounded-full mt-2"></div>
              </div>
            </div>
            <p className="text-emerald-50 text-lg flex items-center gap-2">
              <Sparkles size={18} />
              Pantau nilai dan feedback dari guru
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Rata-rata Keseluruhan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <Award size={24} />
            <span className="text-sm font-medium opacity-90">Rata-rata</span>
          </div>
          <p className="text-5xl font-bold">{rataRataNilai}</p>
          <p className="text-sm opacity-80 mt-1">dari {penilaianData.length} penilaian</p>
        </motion.div>

        {/* Tajwid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${getAspekColor('tajwid').bg} rounded-2xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${getAspekColor('tajwid').text}`}>Tajwid</span>
            <div className={`px-2 py-1 ${getAspekColor('tajwid').badge} text-white text-xs font-bold rounded-lg`}>
              {getNilaiGrade(rataRataTajwid).grade}
            </div>
          </div>
          <p className={`text-4xl font-bold ${getAspekColor('tajwid').text}`}>{rataRataTajwid}</p>
        </motion.div>

        {/* Kelancaran */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`${getAspekColor('kelancaran').bg} rounded-2xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${getAspekColor('kelancaran').text}`}>Kelancaran</span>
            <div className={`px-2 py-1 ${getAspekColor('kelancaran').badge} text-white text-xs font-bold rounded-lg`}>
              {getNilaiGrade(rataRataKelancaran).grade}
            </div>
          </div>
          <p className={`text-4xl font-bold ${getAspekColor('kelancaran').text}`}>{rataRataKelancaran}</p>
        </motion.div>

        {/* Makhraj */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`${getAspekColor('makhraj').bg} rounded-2xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${getAspekColor('makhraj').text}`}>Makhraj</span>
            <div className={`px-2 py-1 ${getAspekColor('makhraj').badge} text-white text-xs font-bold rounded-lg`}>
              {getNilaiGrade(rataRataMakhraj).grade}
            </div>
          </div>
          <p className={`text-4xl font-bold ${getAspekColor('makhraj').text}`}>{rataRataMakhraj}</p>
        </motion.div>

        {/* Adab */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`${getAspekColor('adab').bg} rounded-2xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${getAspekColor('adab').text}`}>Adab</span>
            <div className={`px-2 py-1 ${getAspekColor('adab').badge} text-white text-xs font-bold rounded-lg`}>
              {getNilaiGrade(rataRataAdab).grade}
            </div>
          </div>
          <p className={`text-4xl font-bold ${getAspekColor('adab').text}`}>{rataRataAdab}</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Perkembangan Nilai Bulanan</h2>
            <p className="text-sm text-gray-600">Grafik rata-rata nilai 4 bulan terakhir</p>
          </div>
        </div>

        <MiniBarChart data={chartData} color="emerald" />
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-400 transition-all"
            >
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {filterBulan === 'semua' ? 'Semua Bulan' : filterBulan}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showFilterDropdown && (
              <div className="absolute z-10 mt-2 w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
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
        </div>
      </motion.div>

      {/* Tabel Penilaian */}
      <div className="space-y-4">
        {filteredData.map((penilaian, index) => {
          const gradeInfo = getNilaiGrade(penilaian.nilaiTotal);

          return (
            <motion.div
              key={penilaian.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {penilaian.surah}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">Ayat {penilaian.ayat}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{penilaian.tanggal}</span>
                    </div>
                    <span>•</span>
                    <span>Dinilai oleh {penilaian.guru}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-2 ${gradeInfo.bg} text-white rounded-xl`}>
                    <p className="text-3xl font-bold">{penilaian.nilaiTotal}</p>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                    Grade {gradeInfo.grade}
                  </div>
                </div>
              </div>

              {/* Nilai per Aspek */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {Object.entries(penilaian.nilaiAspek).map(([aspek, nilai]) => {
                  const color = getAspekColor(aspek);
                  return (
                    <div key={aspek} className={`${color.bg} rounded-xl p-4`}>
                      <p className={`text-xs font-semibold ${color.text} uppercase mb-1`}>
                        {aspek}
                      </p>
                      <div className="flex items-end gap-2">
                        <p className={`text-3xl font-bold ${color.text}`}>{nilai}</p>
                        <span className={`text-sm ${color.text} mb-1 opacity-70`}>
                          {getNilaiGrade(nilai).grade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Guru */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg flex-shrink-0">
                    <MessageSquare className="text-white" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900 mb-1">Catatan dari Guru:</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
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
