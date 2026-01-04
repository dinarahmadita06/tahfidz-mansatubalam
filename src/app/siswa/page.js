'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import AnnouncementSlider from '@/components/AnnouncementSlider';
import {
  BookOpen,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  BookMarked,
  Lightbulb,
  ChevronRight,
  FileText,
  CheckCircle,
  UserCheck,
  Megaphone,
  Calendar,
  Bell,
  Award,
} from 'lucide-react';
import Link from 'next/link';

// Pengumuman category icons
const CATEGORY_ICONS = {
  UMUM: Bell,
  AKADEMIK: BookOpen,
  KEGIATAN: Star,
  PENTING: Award,
};
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// ===== HELPER FUNCTIONS =====
// Extract first name from full name
const getFirstName = (fullName) => {
  if (!fullName) return 'Siswa';
  return fullName.split(' ')[0];
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ===== REUSABLE COMPONENTS - TASMI STYLE =====

// StatsCard - Pastel transparan + glow seperti Tasmi
const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'emerald' }) => {
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

  return (
    <div className={`${styles.bg} backdrop-blur-sm rounded-2xl p-5 border ${styles.border} ${styles.glow} ${styles.hoverGlow} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 ${styles.iconBg} ${styles.iconRing} rounded-2xl shadow-md`}>
          <Icon className={styles.iconColor} size={28} />
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className={`text-sm ${styles.textSub} font-semibold mt-2 min-w-0 break-words`}>{subtitle}</p>}
    </div>
  );
};

// SectionHeader - Header card dengan icon pastel
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

// Card - Card wrapper dengan styling Tasmi
const Card = ({ children, className = '' }) => {
  return (
    <div className={`${CARD_BASE} p-6 ${className}`}>
      {children}
    </div>
  );
};

// Empty State Component
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
export default function DashboardSiswa() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Data states with default values = 0
  const [stats, setStats] = useState({
    hafalanSelesai: 0,
    totalHafalan: 0,
    rataRataNilai: 0,
    kehadiran: 0,
    totalHari: 0,
    catatanGuru: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [pengumumanLoading, setPengumumanLoading] = useState(true);
  const [juzProgress, setJuzProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Truncate text helper
  const truncateText = (text, length = 80) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  // Check if pengumuman is new (< 3 days)
  const isNew = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays < 3;
  };

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

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/siswa/dashboard');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Set stats with default values = 0
        setStats({
          hafalanSelesai: data.stats?.hafalanSelesai || 0,
          totalHafalan: data.stats?.totalHafalan || 0,
          rataRataNilai: data.stats?.rataRataNilai || 0,
          kehadiran: data.stats?.kehadiran || 0,
          totalHari: data.stats?.totalHari || 0,
          catatanGuru: data.stats?.catatanGuru || 0,
        });

        // Set recent activities (already sorted and limited to 5 from API)
        setRecentActivities(data.recentActivities || []);

        // Set juz progress (already filtered for progress > 0 from API)
        setJuzProgress(data.juzProgress || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default values (0) on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Greeting and time setup
  useEffect(() => {
    setIsHydrated(true);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
  }, []);

  // Activity type config
  const getActivityConfig = (type) => {
    const configs = {
      tasmi: { icon: FileText, status: 'info', color: 'bg-blue-100 text-blue-700' },
      setor: { icon: BookOpen, status: 'approved', color: 'bg-emerald-100 text-emerald-700' },
      nilai: { icon: Star, status: 'info', color: 'bg-amber-100 text-amber-700' },
      catatan: { icon: MessageSquare, status: 'warning', color: 'bg-purple-100 text-purple-700' },
      presensi: { icon: CheckCircle, status: 'approved', color: 'bg-sky-100 text-sky-700' },
    };
    return configs[type] || configs.setor;
  };

  // Get category icon for pengumuman
  const getCategoryIcon = (kategori) => {
    return CATEGORY_ICONS[kategori] || CATEGORY_ICONS.UMUM;
  };

  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={`${CONTAINER} py-6 space-y-6`}>
          {/* Banner Header - Hijau SIMTAQ Style */}
          <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                  <BookMarked className="text-white" size={32} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words" suppressHydrationWarning>
                    {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal" suppressHydrationWarning>
                    {isHydrated ? currentTime : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center mt-5">
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <Target className="text-white flex-shrink-0" size={18} />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {stats.hafalanSelesai} / {stats.totalHafalan > 0 ? stats.totalHafalan : '-'} Hafalan
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <CalendarCheck className="text-white flex-shrink-0" size={18} />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  Kehadiran {stats.kehadiran}/{stats.totalHari > 0 ? stats.totalHari : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Motivasi - Biru Transparan (BUKAN HIJAU) */}
          <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-blue-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg italic leading-relaxed text-slate-700 mb-2 font-medium break-words">
                  "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
                </p>
                <p className="text-sm text-slate-600 font-semibold">
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>

          {/* Pengumuman - Using Reusable AnnouncementSlider */}
          <AnnouncementSlider announcements={pengumuman} loading={pengumumanLoading} variant="siswa" />

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
                <Link href="/siswa/penilaian-hafalan" className="inline-flex items-center gap-1 hover:underline">
                  Lihat semua <ChevronRight size={16} />
                </Link>
              }
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Hafalan per Juz */}
            <Card className="lg:col-span-2">
              <SectionHeader
                icon={TrendingUp}
                title="Progress Hafalan per Juz"
                subtitle="Pantau perkembangan hafalanmu"
                iconColor="emerald"
              />

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
                    href="/siswa/laporan"
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:shadow-lg hover:opacity-95 text-white font-semibold rounded-xl transition-all duration-300 shadow-md"
                  >
                    Lihat Laporan Lengkap <ChevronRight size={20} />
                  </Link>
                </>
              )}
            </Card>

            {/* Recent Activities */}
            <Card>
              <SectionHeader
                icon={Clock}
                title="Aktivitas Terkini"
                subtitle="Update terbaru"
                iconColor="amber"
              />

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Belum ada aktivitas"
                  description="Aktivitas Anda akan muncul di sini"
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => {
                      const config = getActivityConfig(activity.type);
                      const Icon = config.icon;

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className={`p-2.5 rounded-xl ${config.color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Lihat Semua Aktivitas
                  </button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
