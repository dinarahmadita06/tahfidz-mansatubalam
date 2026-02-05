'use client';

import React, { useState, useEffect, useMemo } from 'react';

import {
  BarChart3,
  BookOpen,
  Target,
  Award,
  Flame,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ProgressSummary({ juzDistribution, totalJuzSelesai, targetJuzSekolah }) {
  const activeJuz = useMemo(() => {
    return [...juzDistribution]
      .filter(item => item.value > 0)
      .sort((a, b) => {
        // Opsi A: Sort by Juz number descending (30, 29... 1)
        const juzA = parseInt(a.label.replace('Juz ', '')) || 0;
        const juzB = parseInt(b.label.replace('Juz ', '')) || 0;
        return juzB - juzA;
      });
  }, [juzDistribution]);

  const topJuzByProgress = useMemo(() => {
    return [...juzDistribution].sort((a, b) => b.value - a.value)[0];
  }, [juzDistribution]);

  if (activeJuz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <BookOpen className="text-gray-300" size={32} />
        </div>
        <p className="text-gray-500 font-medium text-sm">Belum ada progres hafalan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ringkasan Header - Hanya Target Sekolah */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Target Hafalan Sekolah</p>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-emerald-600" />
              <span className="text-lg font-bold text-emerald-900">{targetJuzSekolah} Juz</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Status Hafalan</p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
              {activeJuz.length} Juz Dalam Progres
            </span>
            <p className="text-[9px] text-gray-500 mt-1 leading-tight">
              Jumlah juz yang sedang dipelajari dan memiliki progres hafalan
            </p>
          </div>
        </div>
      </div>

      {/* Indikator Kecil */}
      <div className="flex flex-wrap gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-gray-500">Juz Teratas:</span>
          <span className="text-xs font-bold text-gray-700">
            {topJuzByProgress ? `${topJuzByProgress.label} — ${topJuzByProgress.value}%` : '-'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-500">Jumlah Juz Berprogres:</span>
          <span className="text-xs font-bold text-gray-700">{activeJuz.length}</span>
        </div>
      </div>

      {/* Bar List - Semua Juz Berprogres */}
      <div className="space-y-3 pt-2">
        <div className="space-y-4">
          {activeJuz.map((item, index) => (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-gray-700">{item.label}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {item.value}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'emerald', subtitle }) {
  const getReportCardVariant = (type) => {
    const variants = {
      emerald: {
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200/70',
        ring: 'ring-1 ring-emerald-200/50',
        textTitle: 'text-emerald-700',
        textValue: 'text-emerald-800',
        textSubtitle: 'text-emerald-600',
        iconBg: 'bg-emerald-100/70',
        iconText: 'text-emerald-600',
        glow: 'shadow-lg shadow-emerald-500/10'
      },
      amber: {
        bg: 'bg-amber-50/70',
        border: 'border-amber-200/70',
        ring: 'ring-1 ring-amber-200/50',
        textTitle: 'text-amber-700',
        textValue: 'text-amber-800',
        textSubtitle: 'text-amber-600',
        iconBg: 'bg-amber-100/70',
        iconText: 'text-amber-600',
        glow: 'shadow-lg shadow-amber-500/10'
      },
      purple: {
        bg: 'bg-purple-50/70',
        border: 'border-purple-200/70',
        ring: 'ring-1 ring-purple-200/50',
        textTitle: 'text-purple-700',
        textValue: 'text-purple-800',
        textSubtitle: 'text-purple-600',
        iconBg: 'bg-purple-100/70',
        iconText: 'text-purple-600',
        glow: 'shadow-lg shadow-purple-500/10'
      },
      blue: {
        bg: 'bg-blue-50/70',
        border: 'border-blue-200/70',
        ring: 'ring-1 ring-blue-200/50',
        textTitle: 'text-blue-700',
        textValue: 'text-blue-800',
        textSubtitle: 'text-blue-600',
        iconBg: 'bg-blue-100/70',
        iconText: 'text-blue-600',
        glow: 'shadow-lg shadow-blue-500/10'
      }
    };
    return variants[type] || variants.emerald;
  };

  const variant = getReportCardVariant(color);

  return (
    <div className={`${variant.bg} ${variant.border} ${variant.ring} ${variant.glow} p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className={`${variant.textTitle} text-[10px] font-bold uppercase tracking-wider mb-1`}>{label}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className={`${variant.textValue} text-2xl font-bold`}>{value}</p>
            {subtitle && (
              <span className={`${variant.textSubtitle} text-[10px] font-semibold opacity-80 uppercase tracking-tight`}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 ${variant.iconBg} ${variant.iconText} rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border ${variant.border}`}>
          {(() => {
            if (!Icon) return null;
            if (React.isValidElement(Icon)) return Icon;
            
            const isComponent = 
              typeof Icon === 'function' || 
              (typeof Icon === 'object' && Icon !== null && (
                Icon.$$typeof === Symbol.for('react.forward_ref') || 
                Icon.$$typeof === Symbol.for('react.memo') ||
                Icon.render || 
                Icon.displayName
              ));

            if (isComponent) {
              const IconComp = Icon;
              return <IconComp size={24} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

// Bar Chart Component
function HorizontalBarChart({ data }) {
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
              style={{ width: `${item.value}%` }}
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
  const [showAll, setShowAll] = useState(true); // Default to show all data like Penilaian Hafalan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [juzDistribution, setJuzDistribution] = useState([]);
  const [totalJuzSelesai, setTotalJuzSelesai] = useState(0);
  const [targetJuzSekolah, setTargetJuzSekolah] = useState(2);
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

  // Fetch data when period/year/month or showAll changes
  useEffect(() => {
    fetchLaporanData();
  }, [selectedPeriod, selectedYear, selectedMonth, showAll]);

  const fetchLaporanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod,
        year: selectedYear,
        month: selectedMonth,
        showAll: showAll.toString()
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
      setTotalJuzSelesai(data.totalJuzSelesai || 0);
      setTargetJuzSekolah(data.targetJuzSekolah || 2);
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
    <div className="w-full space-y-6">

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
                    disabled={loading || showAll}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedPeriod === period && !showAll
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              {/* Toggle Tampilkan Semua */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  Tampilkan Semua Periode
                </span>
              </label>

              {/* Dropdown - Kanan */}
              {!showAll && (
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
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <LoadingIndicator text="Memuat laporan hafalan..." />
          ) : (
            <>
              {/* Stats Cards - Period Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Setoran"
                  value={currentStats.totalSetoran || 0}
                  icon={BookOpen}
                  color="emerald"
                  subtitle="setoran"
                />
                <StatCard
                  label="Rata-rata Nilai"
                  value={currentStats.rataRataNilai || 0}
                  icon={Award}
                  color="amber"
                  subtitle="dari 100"
                />
                <StatCard
                  label="Progress Capaian Total"
                  value={`${totalJuzSelesai.toFixed(2)} Juz Tercapai`}
                  icon={TrendingUp}
                  color="purple"
                  subtitle={
                    totalJuzSelesai >= targetJuzSekolah 
                      ? `Target ${targetJuzSekolah} Juz sudah tercapai ✓`
                      : `dari target ${targetJuzSekolah} Juz (${Math.round((totalJuzSelesai / targetJuzSekolah) * 100)}%)`
                  }
                />
                <StatCard
                  label="Konsistensi"
                  value={currentStats.konsistensi || 0}
                  icon={Flame}
                  color="blue"
                  subtitle="hari"
                />
              </div>

              {/* Charts Section - 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progres per Juz Section - Summary + Top 5 Bar List */}
                <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden min-w-0">
                  <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
                    <h2 className="text-lg font-bold text-white">Progres per Juz</h2>
                    <p className="text-sm text-green-50 mt-1">Ringkasan capaian dan target hafalan</p>
                  </div>

                  <div className="p-6">
                    <ProgressSummary 
                      juzDistribution={juzDistribution} 
                      totalJuzSelesai={totalJuzSelesai}
                      targetJuzSekolah={targetJuzSekolah}
                    />
                  </div>
                </div>

                {/* Bar Chart - Nilai per Aspek */}
                <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden min-w-0">
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
  );
}
