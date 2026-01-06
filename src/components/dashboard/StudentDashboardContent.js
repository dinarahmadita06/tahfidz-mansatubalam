'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import AnnouncementSlider from '@/components/AnnouncementSlider';

// ===== CONSTANTS =====
const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';

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
    <div className={`${styles.bg} backdrop-blur-sm rounded-2xl p-5 border ${styles.border} ${styles.glow} ${styles.hoverGlow} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 ${styles.iconBg} ${styles.iconRing} rounded-2xl shadow-md`}>
          <Icon className={styles.iconColor} size={28} />
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && (
        <p className={`text-sm ${styles.textSub} font-semibold mt-2 min-w-0 break-words`}>
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
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-3.5 ${iconBgColors[iconColor]} rounded-xl`}>
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};

const Card = ({ children, className = '' }) => {
  return (
    <div className={`${CARD_BASE} p-6 ${className}`}>
      {children}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Icon className="text-gray-400" size={32} />
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
  activityWidget = null
}) {
  const [stats, setStats] = useState({
    hafalanSelesai: 0,
    totalHafalan: 0,
    rataRataNilai: 0,
    kehadiran: 0,
    totalHari: 0,
    catatanGuru: 0,
  });
  const [pengumuman, setPengumuman] = useState([]);
  const [pengumumanLoading, setPengumumanLoading] = useState(true);
  const [juzProgress, setJuzProgress] = useState([]);
  const [targetJuzSekolah, setTargetJuzSekolah] = useState(null);
  const [totalJuzSelesai, setTotalJuzSelesai] = useState(0);
  const [progressPercent, setProgressPercent] = useState(null);
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch pengumuman
  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        setPengumumanLoading(true);
        const res = await fetch('/api/pengumuman?limit=3');
        if (res.ok) {
          const data = await res.json();
          setPengumuman(data.pengumuman || []);
        }
      } catch (error) {
        console.error('Failed to fetch pengumuman', error);
      } finally {
        setPengumumanLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  // Fetch dashboard summary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/siswa/${targetSiswaId}/summary`);

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
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
        setTargetJuzSekolah(data.targetJuzSekolah);
        setTotalJuzSelesai(data.totalJuzSelesai || 0);
        setProgressPercent(data.progressPercent);
        setQuote(data.quote || "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.");

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (targetSiswaId) {
      fetchDashboardData();
    }
  }, [targetSiswaId]);

  // Determine report links based on role context
  const laporan_href = roleContext === 'SISWA' ? '/siswa/laporan' : '/orangtua/laporan-hafalan';
  const nilai_href = roleContext === 'SISWA' ? '/siswa/penilaian-hafalan' : '/orangtua/perkembangan-anak';
  
  return (
    <>
      {/* Motivasi - Biru Transparan */}
      <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Lightbulb className="text-blue-600" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg italic leading-relaxed text-slate-700 mb-2 font-medium break-words">
              "{quote}"
            </p>
            <p className="text-sm text-slate-600 font-semibold">
              — HR. Bukhari
            </p>
          </div>
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
        <SectionHeader
          icon={TrendingUp}
          title="Progress Hafalan per Juz"
          subtitle="Pantau perkembangan hafalan"
          iconColor="emerald"
        />

        {/* Highlight Target & Progress Sekolah */}
        {!loading && (
          <div className="mb-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 rounded-2xl px-5 py-4 border border-amber-200/60 shadow-sm shadow-amber-100/50 space-y-3 relative overflow-hidden">
            {/* Subtle decorative background pattern */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center text-sm relative z-10">
              <span className="text-slate-700 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Target Hafalan Sekolah Tahun Ini
              </span>
              <span className="font-extrabold text-slate-900 bg-white/60 px-2.5 py-0.5 rounded-lg border border-amber-100">
                {targetJuzSekolah ? `${targetJuzSekolah} Juz` : 'Belum ditentukan'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm relative z-10">
              <span className="text-slate-700 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Progress Capaian
              </span>
              <span className="font-extrabold text-amber-700 text-right bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200/50">
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
        ) : juzProgress.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada progress hafalan"
            description="Mulai setoran hafalan untuk melihat progress per juz"
          />
        ) : (
          <>
            <div className="space-y-4">
              {juzProgress.map((item) => (
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

            <Link
              href={laporan_href}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:shadow-lg hover:opacity-95 text-white font-semibold rounded-xl transition-all duration-300 shadow-md"
            >
              Lihat Laporan Lengkap <ChevronRight size={20} />
            </Link>
          </>
        )}
      </Card>
      
      {/* Render Activity Widget if provided (for ORANG_TUA) */}
      {activityWidget && (
        <div className="lg:col-span-1 self-start">
          {activityWidget}
        </div>
      )}
      </div>
    </>
  );
}
