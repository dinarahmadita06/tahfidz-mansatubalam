'use client';

import { useState } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BarChart3,
  BookOpen,
  Target,
  Award,
  Flame,
} from 'lucide-react';

// ============================================================
// CHART COMPONENTS
// ============================================================

// Donut Chart Component
function DonutChart({ data, size = 200 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <BookOpen size={48} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Belum ada data</p>
      </div>
    );
  }

  let currentAngle = -90;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;

          const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={index}
              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}

        {/* Inner circle */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-600">Total Juz</p>
      </div>
    </div>
  );
}

// Bar Chart Component
function HorizontalBarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (data.every(d => d.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Award size={48} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Belum ada penilaian</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">{item.label}</span>
            <span className="text-gray-600">{item.value}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function LaporanHafalanPage() {
  // Real-time timezone-aware current date
  const getCurrentDate = () => new Date();
  const currentDate = getCurrentDate();

  const [selectedPeriod, setSelectedPeriod] = useState('bulanan');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11

  // Helper: Generate year options (last 3 years + current year)
  const getYearOptions = () => {
    const years = [];
    const currentYear = currentDate.getFullYear();
    for (let i = 0; i < 4; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Helper: Generate month options
  const getMonthOptions = () => {
    return [
      { value: 0, label: 'Januari' },
      { value: 1, label: 'Februari' },
      { value: 2, label: 'Maret' },
      { value: 3, label: 'April' },
      { value: 4, label: 'Mei' },
      { value: 5, label: 'Juni' },
      { value: 6, label: 'Juli' },
      { value: 7, label: 'Agustus' },
      { value: 8, label: 'September' },
      { value: 9, label: 'Oktober' },
      { value: 10, label: 'November' },
      { value: 11, label: 'Desember' },
    ];
  };

  // Reset to current date when period changes
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const now = getCurrentDate();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  // Default data - EMPTY (akan di-fetch dari API berdasarkan periode)
  // Set semua data = empty/0 agar tidak tampil dummy data
  const juzDistribution = [];

  const aspectScores = [
    { label: 'Tajwid', value: 0, color: 'bg-emerald-500' },
    { label: 'Kelancaran', value: 0, color: 'bg-amber-500' },
    { label: 'Makhraj', value: 0, color: 'bg-purple-500' },
    { label: 'Implementasi', value: 0, color: 'bg-sky-500' },
  ];

  // Stats data berdasarkan periode - DEFAULT EMPTY
  const periodStats = {
    bulanan: {
      totalSetoran: 0,
      rataRataNilai: 0,
      targetTercapai: 0,
      konsistensi: 0,
    },
    tahunan: {
      totalSetoran: 0,
      rataRataNilai: 0,
      targetTercapai: 0,
      konsistensi: 0,
    },
  };

  const currentStats = periodStats[selectedPeriod] || {
    totalSetoran: 0,
    rataRataNilai: 0,
    targetTercapai: 0,
    konsistensi: 0,
  };

  return (
    <SiswaLayout>
      {/* Background Gradient - SIMTAQ Style */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 py-6 space-y-6">

          {/* Header - SIMTAQ Green Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <BarChart3 size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Laporan Hafalan</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Statistik dan analisis progress hafalan Al-Qur'an
                </p>
              </div>
            </div>
          </div>

          {/* Period Filter - Compact */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Tab Kecil - Kiri */}
              <div className="flex items-center gap-2">
                {['bulanan', 'tahunan'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              {/* Dropdown - Kanan */}
              <div className="flex items-center gap-2">
                {/* Bulanan: Bulan + Tahun */}
                {selectedPeriod === 'bulanan' && (
                  <>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getMonthOptions().map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {/* Tahunan: Tahun saja */}
                {selectedPeriod === 'tahunan' && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards - Period Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Setoran */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={24} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-emerald-700 font-medium">Total Setoran</p>
                  <p className="text-2xl font-bold text-emerald-900">{currentStats.totalSetoran || 0}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">setoran</p>
                </div>
              </div>
            </div>

            {/* Rata-rata Nilai */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award size={24} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-amber-700 font-medium">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-amber-900">{currentStats.rataRataNilai || 0}</p>
                  <p className="text-xs text-amber-600 mt-0.5">dari 100</p>
                </div>
              </div>
            </div>

            {/* Target Tercapai */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target size={24} className="text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-purple-700 font-medium">Target Tercapai</p>
                  <p className="text-2xl font-bold text-purple-900">{currentStats.targetTercapai || 0}%</p>
                  <p className="text-xs text-purple-600 mt-0.5">progress</p>
                </div>
              </div>
            </div>

            {/* Konsistensi */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame size={24} className="text-sky-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-sky-700 font-medium">Konsistensi</p>
                  <p className="text-2xl font-bold text-sky-900">{currentStats.konsistensi || 0}</p>
                  <p className="text-xs text-sky-600 mt-0.5">hari</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart - Distribusi Juz */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
                <h2 className="text-lg font-bold text-white">Distribusi Juz</h2>
                <p className="text-sm text-green-50 mt-1">Hafalan per juz</p>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <DonutChart data={juzDistribution} size={200} />
                </div>

                {/* Horizontal chips/tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {juzDistribution.length > 0 ? (
                    juzDistribution.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-full bg-white/70 border border-white/20 text-sm flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-gray-700">{item.label}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center">Belum ada data juz</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bar Chart - Nilai per Aspek */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
                <h2 className="text-lg font-bold text-white">Nilai per Aspek</h2>
                <p className="text-sm text-green-50 mt-1">Rata-rata berdasarkan aspek penilaian</p>
              </div>

              <div className="p-6">
                <HorizontalBarChart data={aspectScores} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
