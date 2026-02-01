'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import AnnouncementSlider from '@/components/AnnouncementSlider';
import { getDashboardJuzProgress } from '@/lib/utils/quranProgress';

// ===== CONSTANTS =====
const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';
const DEFAULT_QUOTE = "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.";

// ===== REUSABLE COMPONENTS =====

const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'emerald', href = null }) => {
  const colorConfig = {
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-500',
      iconRing: 'ring-2 ring-emerald-200',
      iconColor: 'text-white',
      textSub: 'text-emerald-600',
      glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_40px_rgba(16,185,129,0.12)]',
      hoverGlow: 'hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_16px_48px_rgba(16,185,129,0.18)]',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-500',
      iconRing: 'ring-2 ring-amber-200',
      iconColor: 'text-white',
      textSub: 'text-amber-600',
      glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_12px_40px_rgba(245,158,11,0.12)]',
      hoverGlow: 'hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_16px_48px_rgba(245,158,11,0.18)]',
    },
    sky: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200/60',
      iconBg: 'bg-sky-500',
      iconRing: 'ring-2 ring-sky-200',
      iconColor: 'text-white',
      textSub: 'text-sky-600',
      glow: 'shadow-[0_0_0_1px_rgba(14,165,233,0.25),0_12px_40px_rgba(14,165,233,0.12)]',
      hoverGlow: 'hover:shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_16px_48px_rgba(14,165,233,0.18)]',
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200/60',
      iconBg: 'bg-purple-500',
      iconRing: 'ring-2 ring-purple-200',
      iconColor: 'text-white',
      textSub: 'text-purple-600',
      glow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_12px_40px_rgba(168,85,247,0.12)]',
      hoverGlow: 'hover:shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_16px_48px_rgba(168,85,247,0.18)]',
    },
  };

  const styles = colorConfig[color];

  const cardContent = (
    <div className={`${styles.bg} backdrop-blur-sm rounded-2xl p-3.5 lg:p-4 border ${styles.border} ${styles.glow} ${styles.hoverGlow} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between mb-2.5 lg:mb-3">
        <div className={`p-2.5 lg:p-3 ${styles.iconBg} ${styles.iconRing} rounded-xl lg:rounded-2xl shadow-md`}>
          <Icon className={styles.iconColor} size={20} />
        </div>
      </div>
      <h3 className="text-[10px] lg:text-xs font-bold text-gray-500 mb-0.5 lg:mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {subtitle && (
        <p className={`text-[11px] lg:text-sm ${styles.textSub} font-semibold mt-1.5 lg:mt-2 min-w-0 break-words opacity-90`}>
          {typeof subtitle === 'string' ? subtitle : subtitle}
        </p>
      )}
    </div>
  );

  return href ? <Link href={href}>{cardContent}</Link> : cardContent;
};

const SectionHeader = ({ icon: Icon, title, subtitle, iconColor = 'emerald' }) => {
  const iconBgColors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-5">
      <div className={`p-2 lg:p-3 ${iconBgColors[iconColor]} rounded-xl`}>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
      </div>
      <div>
        <h2 className="text-base lg:text-lg font-bold text-gray-900 leading-tight">{title}</h2>
        <p className="text-[10px] lg:text-xs text-gray-600 opacity-80">{subtitle}</p>
      </div>
    </div>
  );
};

const Card = ({ children, className = '' }) => {
  return (
    <div className={`${CARD_BASE} p-4 lg:p-5 ${className}`}>
      {children}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
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
            return <IconComp className="text-gray-400" size={32} />;
          }
          
          return null;
        })()}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

// ===== MAIN COMPONENT =====

/**
 * StudentDashboardContent - Shared component for both student and parent dashboards
 * 
 * @param {string} targetSiswaId - ID of the student to display data for
 * @param {string} roleContext - 'SISWA' or 'ORANG_TUA' (for styling/context purposes)
 * @param {function} onActivityLog - Optional callback to log activities
 */
export default function StudentDashboardContent({ 
  targetSiswaId, 
  roleContext = 'SISWA',
  onActivityLog = null,
  activityWidget = null,
  initialData = null
}) {
  const [stats, setStats] = useState(initialData?.stats || {
    hafalanSelesai: 0,
    totalHafalan: 0,
    rataRataNilai: 0,
    kehadiran: 0,
    totalHari: 0,
    catatanGuru: 0,
  });
  const [pengumuman, setPengumuman] = useState(initialData?.pengumuman || []);
  const [pengumumanLoading, setPengumumanLoading] = useState(false);
  const [juzProgress, setJuzProgress] = useState(initialData?.juzProgress || []);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(initialData?.tahunAjaranAktif || null);
  const [targetJuzSekolah, setTargetJuzSekolah] = useState(initialData?.targetJuzSekolah || null);
  const [totalJuzSelesai, setTotalJuzSelesai] = useState(initialData?.totalJuzSelesai || 0);
  const [progressPercent, setProgressPercent] = useState(initialData?.progressPercent ?? null);
  const [quote, setQuote] = useState(initialData?.quote || DEFAULT_QUOTE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data if not provided
  useEffect(() => {
    if (!initialData && targetSiswaId) {
      fetchDashboardData();
      fetchPengumuman();
    } else if (initialData) {
      // If initialData is provided, still fetch fresh pengumuman
      fetchPengumuman();
    }
  }, [targetSiswaId, initialData]);

  const fetchPengumuman = async () => {
    try {
      setPengumumanLoading(true);
      console.log('Fetching pengumuman...');
      const res = await fetch('/api/pengumuman?limit=3');
      if (res.ok) {
        const data = await res.json();
        console.log('Pengumuman fetched:', data.pengumuman?.length || 0);
        setPengumuman(data.pengumuman || []);
      } else {
        console.error('Pengumuman fetch failed:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch pengumuman', error);
    } finally {
      setPengumumanLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard/siswa/${targetSiswaId}/summary`);

      if (!response.ok) {
        throw new Error('Gagal memuat data dashboard');
      }

      const data = await response.json();

      setStats({
        hafalanSelesai: data.stats?.hafalanSelesai || 0,
        totalHafalan: data.stats?.totalHafalan || 0,
        rataRataNilai: data.stats?.rataRataNilai || 0,
        kehadiran: data.stats?.kehadiran || 0,
        totalHari: data.stats?.totalHari || 0,
        catatanGuru: data.stats?.catatanGuru || 0,
      });

      setJuzProgress(data.juzProgress || []);
      setTahunAjaranAktif(data.tahunAjaranAktif);
      
      const targetValue = parseInt(data.targetJuzSekolah);
      setTargetJuzSekolah(!isNaN(targetValue) && targetValue > 0 ? targetValue : null);
      
      setTotalJuzSelesai(data.totalJuzSelesai || 0);
      setProgressPercent(data.progressPercent);
      setQuote(data.quote || "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.");

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and limit juz progress for dashboard view
  const displayJuzs = getDashboardJuzProgress(juzProgress);

  // Determine report links based on role context
  const laporan_href = roleContext === 'SISWA' ? '/siswa/laporan' : '/orangtua/laporan-hafalan';
  const nilai_href = roleContext === 'SISWA' ? '/siswa/penilaian-hafalan' : '/orangtua/perkembangan-anak';
  
  // Determine safe quote with fallback
  const safeQuote = typeof quote === 'object' ? (quote?.text || quote?.content || DEFAULT_QUOTE) : (quote || DEFAULT_QUOTE);
  
  // Debug log for troubleshooting
  if (typeof window !== 'undefined') {
    console.log('Dashboard Debug:', { 
      loading, 
      pengumumanLoading,
      hasQuote: !!safeQuote, 
      hasPengumuman: pengumuman.length,
      hasJuzProgress: displayJuzs.length,
      quote: safeQuote?.substring(0, 50)
    });
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="text-red-600 w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-900">Gagal Memuat Data</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Motivasi - Biru Transparan */}
      {loading ? (
        <div className="bg-blue-50/70 animate-pulse rounded-2xl border border-blue-200 p-4 lg:p-5 h-[100px]" />
      ) : (
        <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-200 p-4 lg:p-5 mt-2">
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="flex-shrink-0 w-9 h-9 lg:w-11 lg:h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="text-blue-600 w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-base italic leading-relaxed text-slate-700 mb-1.5 lg:mb-2 font-medium break-words">
                &quot;{safeQuote}&quot;
              </p>
              <p className="text-[11px] lg:text-sm text-slate-600 font-semibold">
                — HR. Bukhari
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pengumuman - Using Reusable AnnouncementSlider */}
      <AnnouncementSlider 
        announcements={pengumuman} 
        loading={pengumumanLoading} 
        variant={roleContext === 'SISWA' ? 'siswa' : 'orangtua'} 
      />

      {/* Statistics Cards - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={BookOpen}
          title="Hafalan Selesai"
          value={stats.hafalanSelesai}
          subtitle={stats.totalHafalan > 0 ? `dari ${stats.totalHafalan} target` : 'Belum ada target'}
          color="emerald"
        />
        <StatsCard
          icon={Star}
          title="Rata-rata Nilai"
          value={stats.rataRataNilai}
          subtitle="dari 100"
          color="amber"
        />
        <StatsCard
          icon={CalendarCheck}
          title="Kehadiran"
          value={stats.kehadiran}
          subtitle={stats.totalHari > 0 ? `dari ${stats.totalHari} hari` : 'Belum ada data'}
          color="sky"
        />
        <StatsCard
          icon={MessageSquare}
          title="Catatan Guru"
          value={stats.catatanGuru}
          subtitle={
            <span className="inline-flex items-center gap-1 hover:underline">
              Lihat semua <ChevronRight size={16} />
            </span>
          }
          color="purple"
          href={nilai_href}
        />
      </div>

      {/* Main Content Grid - Progress Hafalan per Juz + Aktivitas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-8">
        <SectionHeader
          icon={TrendingUp}
          title="Progress Hafalan per Juz"
          subtitle="Pantau perkembangan hafalan"
          iconColor="emerald"
        />

        {/* Highlight Target & Progress Sekolah */}
        {!loading && (
          <div className="mb-4 lg:mb-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl px-4 py-3.5 lg:px-5 lg:py-4 border border-amber-200/60 shadow-sm shadow-amber-100/50 space-y-2 lg:space-y-3 relative">
            {/* Subtle decorative background pattern */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-[11px] lg:text-sm relative z-10">
              <span className="text-slate-700 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="break-words">Target Hafalan Sekolah {tahunAjaranAktif?.nama ? `(${tahunAjaranAktif.nama})` : 'Tahun Ini'}</span>
              </span>
              <span className="font-extrabold text-slate-900 bg-white/60 px-2.5 py-0.5 rounded-lg border border-amber-100 whitespace-nowrap ml-auto sm:ml-0">
                {targetJuzSekolah && !isNaN(targetJuzSekolah) ? `${targetJuzSekolah} Juz` : 'Belum ditentukan'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-[11px] lg:text-sm relative z-10">
              <span className="text-slate-700 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                <span>Progress Capaian</span>
              </span>
              <span className="font-extrabold text-amber-700 text-left sm:text-right bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200/50 whitespace-nowrap break-all sm:break-normal ml-auto sm:ml-0">
                {totalJuzSelesai === 0 ? (
                  'Belum mulai setoran'
                ) : targetJuzSekolah ? (
                  `${totalJuzSelesai} / ${targetJuzSekolah} Juz (${progressPercent}%)`
                ) : (
                  `${totalJuzSelesai} Juz selesai`
                )}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {displayJuzs.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum ada progres hafalan"
                description="Mulai setoran hafalan untuk melihat progress per juz"
              />
            ) : (
              <div className="space-y-4">
                {displayJuzs.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {roleContext === 'SISWA' ? (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  href="/siswa/laporan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:shadow-lg hover:opacity-95 text-white text-sm lg:text-base font-semibold rounded-xl transition-all duration-300 shadow-md"
                >
                  Lihat Laporan Lengkap <ChevronRight className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
                </Link>
                <p className="text-[11px] lg:text-xs text-gray-500 italic">
                  * Lihat semua juz di menu laporan
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-[11px] lg:text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">💡 Catatan:</span> Data progress bar berasal dari setoran hafalan anak yang telah divalidasi guru, menunjukkan jumlah juz selesai dibandingkan dengan target sekolah.
                </p>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Render Activity Widget if provided */}
      {activityWidget && (
        <div className="xl:col-span-4 self-start">
          {activityWidget}
        </div>
      )}
      </div>
    </div>
  );
}
