'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import SiswaLayout from '@/components/layout/SiswaLayout';
import MonthlyPeriodFilter from '@/components/penilaian/MonthlyPeriodFilter';
import { calculateMonthRange, getCurrentMonthYear, formatMonthYear } from '@/lib/utils/dateRangeHelpers';
import {
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  Calendar,
  BookOpen,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// ===== DATA FETCHER =====
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

const AttendanceBadge = ({ status }) => {
  const configs = {
    HADIR: { label: 'Hadir', emoji: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    IZIN: { label: 'Izin', emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    SAKIT: { label: 'Sakit', emoji: '🔵', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    ALFA: { label: 'Alfa', emoji: '🔴', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const config = configs[status];

  if (!config) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.bg} ${config.border} border rounded-md shadow-sm`}>
      <span className="text-[10px]">{config.emoji}</span>
      <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
    </div>
  );
};

function StatsCard({ icon: Icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorConfig = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`${config.bg} rounded-2xl p-5 border ${config.border} shadow-sm hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} className={config.text} />
        <span className={`text-xs font-bold ${config.text} uppercase tracking-wider`}>{title}</span>
      </div>
      <p className={`text-3xl font-bold ${config.text}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2 line-clamp-1">{subtitle}</p>}
    </motion.div>
  );
}

function MiniBarChart({ data, color = 'emerald' }) {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => d.value));
  const colorClasses = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', sky: 'bg-sky-500', purple: 'bg-purple-500' };

  return (
    <div className="flex items-end gap-2 h-24 mt-4">
      {data.map((item, index) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                className={`w-full ${colorClasses[color]} rounded-t-lg relative group cursor-pointer`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
                  {item.value}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PenilaianCard({ penilaian, index }) {
  const getAspekColor = (aspek) => {
    const colors = {
      tajwid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
      kelancaran: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
      makhraj: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
      implementasi: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    };
    return colors[aspek];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/60"
    >
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{penilaian.surah}</h3>
          <p className="text-sm text-gray-600">Ayat {penilaian.ayat}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(penilaian.tanggal).toLocaleDateString('id-ID')}</span>
            </div>
            <AttendanceBadge status={penilaian.attendanceStatus} />
            <span>•</span>
            <span>Oleh {penilaian.guru}</span>
          </div>
        </div>
        <div className="px-5 py-2 bg-emerald-500 text-white rounded-full shadow-md font-bold text-2xl">
          {penilaian.nilaiTotal}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {Object.entries(penilaian.nilaiAspek).map(([aspek, nilai]) => {
          const color = getAspekColor(aspek);
          return (
            <div key={aspek} className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
              <p className={`text-[10px] font-bold ${color.text} uppercase mb-1 tracking-wider`}>{aspek}</p>
              <p className={`text-xl font-bold ${color.text}`}>{nilai}</p>
            </div>
          );
        })}
      </div>

      {penilaian.catatan && (
        <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
          <div className="flex gap-3">
            <MessageSquare className="text-orange-700 mt-0.5" size={18} />
            <p className="text-sm text-orange-800 leading-relaxed">{penilaian.catatan}</p>
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
  const { data: session, status } = useSession();
  const router = useRouter();

  // Month/Year filter state
  const currentDate = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month);
  const [selectedYear, setSelectedYear] = useState(currentDate.year);

  // Fetch data
  const { data, error } = useSWR(
    status === 'authenticated' ? (() => {
      const { startDateStr, endDateStr } = calculateMonthRange(selectedMonth, selectedYear);
      return `/api/siswa/penilaian-hafalan?startDate=${startDateStr}&endDate=${endDateStr}`;
    })() : null,
    fetcher
  );

  if (status === 'loading') {
    return (
      <SiswaLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      </SiswaLayout>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const { statistics, penilaianData = [], chartData = [] } = data || {};
  const periodText = formatMonthYear(selectedMonth, selectedYear);

  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={`${CONTAINER} py-6 space-y-6`}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Star className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Penilaian Hafalan</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1 flex items-center gap-2">
                  <Sparkles size={18} /> Pantau perkembangan hafalan Al-Qur'anmu
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard 
              icon={CheckCircle} 
              title="Hadir" 
              value={statistics?.hadir || 0} 
              subtitle="Kehadiran bulan ini"
              color="emerald" 
              delay={0.1} 
            />
            <StatsCard 
              icon={AlertCircle} 
              title="Izin" 
              value={statistics?.izin || 0} 
              subtitle="Izin bulan ini"
              color="amber" 
              delay={0.2} 
            />
            <StatsCard 
              icon={Clock} 
              title="Sakit" 
              value={statistics?.sakit || 0} 
              subtitle="Sakit bulan ini"
              color="sky" 
              delay={0.3} 
            />
            <StatsCard 
              icon={X} 
              title="Alfa" 
              value={statistics?.alfa || 0} 
              subtitle="Alfa bulan ini"
              color="violet" 
              delay={0.4} 
            />
            <StatsCard 
              icon={Award} 
              title="Rata-rata" 
              value={statistics?.rataRataNilai || 0} 
              subtitle={
                statistics?.lastAssessment 
                  ? `${statistics.lastAssessment.surah} (${statistics.lastAssessment.nilai})`
                  : "Belum ada penilaian pada periode ini"
              }
              color="purple" 
              delay={0.5} 
            />
          </div>

          {/* Chart Section */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-600" size={24} />
                <h2 className="text-lg font-bold text-gray-900">Perkembangan Nilai</h2>
              </div>
              <MiniBarChart data={chartData} color="emerald" />
            </motion.div>
          )}

          {/* Filter */}
          <MonthlyPeriodFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthYearChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />

          <div className="text-sm text-gray-600 -mt-4 ml-0.5 font-medium">
            {penilaianData.length > 0 
              ? `Menampilkan ${penilaianData.length} penilaian pada ${periodText}`
              : `Tidak ada penilaian pada periode ${periodText}`
            }
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-red-50 p-8 rounded-2xl text-center border border-red-100">
              <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <p className="text-red-700">Gagal memuat data</p>
            </div>
          ) : !data ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
          ) : penilaianData.length > 0 ? (
            <div className="space-y-4">
              {penilaianData.map((penilaian, index) => (
                <PenilaianCard key={penilaian.id} penilaian={penilaian} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100 mt-6">
              <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">Belum Ada Penilaian</h3>
              <p className="text-gray-600 text-sm mt-1">Nilai akan muncul setelah Anda menyetorkan hafalan di periode ini.</p>
            </div>
          )}
        </div>
      </div>
    </SiswaLayout>
  );
}
