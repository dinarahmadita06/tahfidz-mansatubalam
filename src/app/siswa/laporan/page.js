'use client';

import { useState } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
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

  const [selectedPeriod, setSelectedPeriod] = useState('bulanan');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date filter states
  const currentDate = getCurrentDate();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [selectedWeek, setSelectedWeek] = useState(0); // 0-3 (week of month)

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

  // Helper: Generate week options for selected month
  const getWeekOptions = () => {
    const weeks = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const weeksCount = Math.ceil(daysInMonth / 7);

    for (let i = 0; i < weeksCount; i++) {
      const startDay = i * 7 + 1;
      const endDay = Math.min((i + 1) * 7, daysInMonth);
      weeks.push({
        value: i,
        label: `Minggu ${i + 1} (${startDay}-${endDay})`,
      });
    }
    return weeks;
  };

  // Reset to current date when period changes
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const now = getCurrentDate();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setSelectedWeek(0);
  };

  // Sample data (dalam praktik real, ini akan di-fetch dari API berdasarkan periode)
  const juzDistribution = [
    { label: 'Juz 30', value: 15, color: '#10b981' },
    { label: 'Juz 29', value: 12, color: '#f59e0b' },
    { label: 'Juz 28', value: 8, color: '#8b5cf6' },
    { label: 'Juz 27', value: 5, color: '#06b6d4' },
  ];

  const aspectScores = [
    { label: 'Tajwid', value: 92, color: 'bg-emerald-500' },
    { label: 'Kelancaran', value: 88, color: 'bg-amber-500' },
    { label: 'Makhraj', value: 85, color: 'bg-purple-500' },
    { label: 'Implementasi', value: 95, color: 'bg-sky-500' },
  ];

  // Stats data berdasarkan periode (akan berubah sesuai filter)
  const periodStats = {
    mingguan: {
      totalSetoran: 6,
      rataRataNilai: 88,
      targetTercapai: 75,
      konsistensi: 5,
    },
    bulanan: {
      totalSetoran: 24,
      rataRataNilai: 90,
      targetTercapai: 85,
      konsistensi: 22,
    },
    tahunan: {
      totalSetoran: 288,
      rataRataNilai: 89,
      targetTercapai: 80,
      konsistensi: 260,
    },
  };

  const currentStats = periodStats[selectedPeriod];

  // Sample detail data (akan di-fetch dari API)
  const detailData = [
    { tanggal: '26 Des 2025', juz: 'Juz 30 - An-Nas', nilai: 95, catatan: 'Sangat baik, tajwid sempurna' },
    { tanggal: '25 Des 2025', juz: 'Juz 30 - Al-Falaq', nilai: 92, catatan: 'Baik, perlu perbaiki makhraj' },
    { tanggal: '24 Des 2025', juz: 'Juz 30 - Al-Ikhlas', nilai: 90, catatan: 'Baik' },
    { tanggal: '23 Des 2025', juz: 'Juz 29 - Al-Mulk', nilai: 88, catatan: 'Cukup baik' },
    { tanggal: '22 Des 2025', juz: 'Juz 29 - At-Tahrim', nilai: 85, catatan: 'Perlu latihan lebih' },
    { tanggal: '21 Des 2025', juz: 'Juz 29 - At-Talaq', nilai: 92, catatan: 'Baik sekali' },
    { tanggal: '20 Des 2025', juz: 'Juz 29 - At-Taghabun', nilai: 90, catatan: 'Baik' },
    { tanggal: '19 Des 2025', juz: 'Juz 28 - Al-Mujadilah', nilai: 87, catatan: 'Cukup baik' },
    { tanggal: '18 Des 2025', juz: 'Juz 28 - Al-Hadid', nilai: 93, catatan: 'Sangat baik' },
    { tanggal: '17 Des 2025', juz: 'Juz 28 - Ar-Rahman', nilai: 91, catatan: 'Baik' },
  ];

  const totalPages = Math.ceil(detailData.length / itemsPerPage);
  const paginatedData = detailData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPeriodLabel = () => {
    const monthNames = getMonthOptions();

    if (selectedPeriod === 'mingguan') {
      const weekInfo = getWeekOptions()[selectedWeek];
      return `${weekInfo.label}, ${monthNames[selectedMonth].label} ${selectedYear}`;
    } else if (selectedPeriod === 'bulanan') {
      return `${monthNames[selectedMonth].label} ${selectedYear}`;
    } else {
      return `Tahun ${selectedYear}`;
    }
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

          {/* Period Filter Tabs */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-4 space-y-4">
            {/* Period Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 mr-2">Periode:</span>
              <div className="flex gap-2 flex-wrap">
                {['mingguan', 'bulanan', 'tahunan'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Date Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Mingguan: Month + Year + Week Selector */}
              {selectedPeriod === 'mingguan' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Bulan:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(Number(e.target.value));
                        setSelectedWeek(0);
                      }}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getMonthOptions().map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Tahun:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Minggu:</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getWeekOptions().map((week) => (
                        <option key={week.value} value={week.value}>
                          {week.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Bulanan: Month + Year Selector */}
              {selectedPeriod === 'bulanan' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Bulan:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getMonthOptions().map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Tahun:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {getYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Tahunan: Year Selector Only */}
              {selectedPeriod === 'tahunan' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Tahun:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  <p className="text-2xl font-bold text-emerald-900">{currentStats.totalSetoran}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{getPeriodLabel()}</p>
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
                  <p className="text-2xl font-bold text-amber-900">{currentStats.rataRataNilai}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{getPeriodLabel()}</p>
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
                  <p className="text-2xl font-bold text-purple-900">{currentStats.targetTercapai}%</p>
                  <p className="text-xs text-purple-600 mt-0.5">{getPeriodLabel()}</p>
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
                  <p className="text-2xl font-bold text-sky-900">{currentStats.konsistensi}</p>
                  <p className="text-xs text-sky-600 mt-0.5">
                    {selectedPeriod === 'mingguan' ? 'hari' : selectedPeriod === 'bulanan' ? 'hari' : 'hari'}
                  </p>
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

                <div className="space-y-2">
                  {juzDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.value} hal</span>
                    </div>
                  ))}
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

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                    <p className="text-xs text-emerald-700 font-semibold mb-1">Nilai Tertinggi</p>
                    <p className="text-lg font-bold text-emerald-900">Implementasi</p>
                    <p className="text-sm text-emerald-600">95%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                    <p className="text-xs text-purple-700 font-semibold mb-1">Perlu Ditingkatkan</p>
                    <p className="text-lg font-bold text-purple-900">Makhraj</p>
                    <p className="text-sm text-purple-600">85%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Table - Riwayat Setoran */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
              <h2 className="text-lg font-bold text-white">Riwayat Setoran Detail</h2>
              <p className="text-sm text-green-50 mt-1">Daftar setoran hafalan {getPeriodLabel().toLowerCase()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Juz / Surah
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Catatan Guru
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.juz}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.nilai >= 90 ? 'bg-emerald-100 text-emerald-700' :
                          item.nilai >= 80 ? 'bg-amber-100 text-amber-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {item.nilai}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.catatan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Halaman <span className="font-semibold">{currentPage}</span> dari{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
