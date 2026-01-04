'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BarChart3,
  BookOpen,
  Target,
  Award,
  Flame,
  Loader,
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

  // Generate SVG path segments
  const segments = [];
  let currentAngle = -90;
  const outerRadius = 70;
  const innerRadius = 45;
  const centerX = 100;
  const centerY = 100;

  data.forEach((item, itemIndex) => {
    let sliceAngle = (item.value / total) * 360;
    
    // If this is the only item and it's 100%, reduce it slightly to show the donut shape
    if (data.length === 1 && sliceAngle > 359) {
      sliceAngle = 359;
    }
    
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;
    
    // Outer arc points
    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    
    // Inner arc points
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);
    
    const largeArc = sliceAngle > 180 ? 1 : 0;
    
    const pathData = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    
    segments.push({
      path: pathData,
      color: item.color
    });
    
    currentAngle += sliceAngle;
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" className="absolute inset-0" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
          </filter>
        </defs>
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            filter="url(#shadow)"
            stroke="white"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>

      {/* Center text */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-600">Setoran</p>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [juzDistribution, setJuzDistribution] = useState([]);
  const [aspectScores, setAspectScores] = useState([
    { label: 'Tajwid', value: 0, color: 'bg-emerald-500' },
    { label: 'Kelancaran', value: 0, color: 'bg-amber-500' },
    { label: 'Makhraj', value: 0, color: 'bg-purple-500' },
    { label: 'Implementasi', value: 0, color: 'bg-sky-500' },
  ]);
  const [periodStats, setPeriodStats] = useState({
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
  });

  // Fetch data when period/year/month changes
  useEffect(() => {
    fetchLaporanData();
  }, [selectedPeriod, selectedYear, selectedMonth]);

  const fetchLaporanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod,
        year: selectedYear,
        month: selectedMonth
      });

      const res = await fetch(`/api/siswa/laporan-hafalan?${params}`);
      
      if (!res.ok) {
        throw new Error('Gagal memuat laporan hafalan');
      }

      const data = await res.json();

      console.log('[SISWA LAPORAN PAGE] Received data:', data);
      console.log('[SISWA LAPORAN PAGE] Juz Distribution:', data.juzDistribution);
      console.log('[SISWA LAPORAN PAGE] Chart data length:', data.juzDistribution?.length || 0);

      // Update state dengan data dari API
      setJuzDistribution(data.juzDistribution || []);
      setAspectScores(data.aspectScores || [
        { label: 'Tajwid', value: 0, color: 'bg-emerald-500' },
        { label: 'Kelancaran', value: 0, color: 'bg-amber-500' },
        { label: 'Makhraj', value: 0, color: 'bg-purple-500' },
        { label: 'Implementasi', value: 0, color: 'bg-sky-500' },
      ]);
      setPeriodStats(data.stats || periodStats);
    } catch (err) {
      console.error('Error fetching laporan:', err);
      setError(err.message);
      // Reset data on error
      setJuzDistribution([]);
      setAspectScores([
        { label: 'Tajwid', value: 0, color: 'bg-emerald-500' },
        { label: 'Kelancaran', value: 0, color: 'bg-amber-500' },
        { label: 'Makhraj', value: 0, color: 'bg-purple-500' },
        { label: 'Implementasi', value: 0, color: 'bg-sky-500' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentStats = periodStats[selectedPeriod] || {
    totalSetoran: 0,
    rataRataNilai: 0,
    targetTercapai: 0,
    konsistensi: 0,
  };

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

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-2xl p-4 text-red-700 flex items-start gap-3">
              <div className="text-lg">⚠️</div>
              <div>
                <p className="font-semibold">Gagal memuat laporan</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Period Filter - Compact */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Tab Kecil - Kiri */}
              <div className="flex items-center gap-2">
                {['bulanan', 'tahunan'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
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
                      disabled={loading}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
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
                      disabled={loading}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
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
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader size={48} className="text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Memuat laporan hafalan...</p>
              </div>
            </div>
          ) : (
            <>
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
                    <p className="text-sm text-green-50 mt-1">Setoran per juz</p>
                  </div>

                  <div className="p-6">
                    {juzDistribution.length > 0 ? (
                      <>
                        {/* Donut Chart */}
                        <div className="flex justify-center mb-8">
                          <DonutChart data={juzDistribution} size={200} />
                        </div>

                        {/* Legend - Juz Distribution */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Sebaran Setoran per Juz</p>
                          <div className="grid grid-cols-2 gap-3">
                            {juzDistribution.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50 border border-gray-200/50"
                              >
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {item.label} <span className="font-bold text-emerald-600">— {item.value} setoran</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <BookOpen size={48} className="text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 text-center">Belum ada data juz</p>
                      </div>
                    )}
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
            </>
          )}
        </div>
      </div>
    </SiswaLayout>
  );
}
