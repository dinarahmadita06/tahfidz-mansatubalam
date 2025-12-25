'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import PengumumanWidget from '@/components/PengumumanWidget';
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
} from 'lucide-react';
import Link from 'next/link';

// ===== CONSTANTS - TASMI STYLE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';
const STATS_CARD_GLOW = 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_40px_rgba(16,185,129,0.12)]';

// ===== REUSABLE COMPONENTS - TASMI STYLE =====

// StatsCard - Glowing transparan seperti Tasmi
const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'emerald' }) => {
  const colorConfig = {
    emerald: {
      bg: 'bg-white/70',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-100',
      iconRing: 'ring-2 ring-emerald-200',
      iconColor: 'text-emerald-600',
      textSub: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-white/70',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-100',
      iconRing: 'ring-2 ring-amber-200',
      iconColor: 'text-amber-600',
      textSub: 'text-amber-600',
    },
    sky: {
      bg: 'bg-white/70',
      border: 'border-sky-200/60',
      iconBg: 'bg-sky-100',
      iconRing: 'ring-2 ring-sky-200',
      iconColor: 'text-sky-600',
      textSub: 'text-sky-600',
    },
    purple: {
      bg: 'bg-white/70',
      border: 'border-purple-200/60',
      iconBg: 'bg-purple-100',
      iconRing: 'ring-2 ring-purple-200',
      iconColor: 'text-purple-600',
      textSub: 'text-purple-600',
    },
  };

  const styles = colorConfig[color];

  return (
    <div className={`${styles.bg} backdrop-blur-sm rounded-2xl p-5 border ${styles.border} ${STATS_CARD_GLOW} hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_16px_48px_rgba(16,185,129,0.18)] transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 ${styles.iconBg} ${styles.iconRing} rounded-2xl`}>
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

// ===== MAIN COMPONENT =====
export default function DashboardSiswa() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Siswa';
    return fullName.split(' ')[0];
  };

  const stats = {
    hafalanSelesai: 15,
    totalHafalan: 30,
    rataRataNilai: 85,
    kehadiran: 92,
    totalHari: 30,
    catatanGuru: 3,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'setor',
      title: 'Setor Hafalan Al-Baqarah 1-5',
      status: 'approved',
      time: '2 jam yang lalu',
      icon: BookOpen,
    },
    {
      id: 2,
      type: 'nilai',
      title: 'Nilai Hafalan: 88/100',
      status: 'info',
      time: '5 jam yang lalu',
      icon: Star,
    },
    {
      id: 3,
      type: 'catatan',
      title: 'Catatan dari Ustadz Yusuf',
      status: 'warning',
      time: '1 hari yang lalu',
      icon: MessageSquare,
    },
  ];

  const achievementData = [
    { label: 'Juz 1', progress: 100 },
    { label: 'Juz 2', progress: 75 },
    { label: 'Juz 3', progress: 45 },
    { label: 'Juz 4', progress: 20 },
  ];

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
                  {stats.hafalanSelesai} / {stats.totalHafalan} Hafalan
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <CalendarCheck className="text-white flex-shrink-0" size={18} />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  Kehadiran {stats.kehadiran}/{stats.totalHari}
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

          {/* Pengumuman - HIGHLIGHT UTAMA (PALING NGEJRENG) */}
          <div className="relative bg-emerald-50/60 backdrop-blur-sm rounded-2xl shadow-md border-2 border-emerald-200 p-6">
            {/* Badge NEW */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
              ADA PENGUMUMAN
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-3.5 bg-emerald-500 rounded-xl shadow-lg ring-2 ring-emerald-300/50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">Pengumuman Terbaru</h2>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Informasi penting untuk Anda</p>
                </div>
              </div>
              <Link
                href="/siswa/pengumuman"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
              >
                Lihat Semua
              </Link>
            </div>
            <PengumumanWidget limit={3} />
          </div>

          {/* Statistics Cards - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={BookOpen}
              title="Hafalan Selesai"
              value={stats.hafalanSelesai}
              subtitle={`dari ${stats.totalHafalan} target`}
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
              subtitle={`dari ${stats.totalHari} hari`}
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

              <div className="space-y-4">
                {achievementData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/siswa/laporan"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Lihat Laporan Lengkap <ChevronRight size={20} />
              </Link>
            </Card>

            {/* Recent Activities */}
            <Card>
              <SectionHeader
                icon={Clock}
                title="Aktivitas Terkini"
                subtitle="Update terbaru"
                iconColor="amber"
              />

              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  const statusColors = {
                    approved: 'bg-emerald-100 text-emerald-700',
                    info: 'bg-sky-100 text-sky-700',
                    warning: 'bg-amber-100 text-amber-700',
                  };

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className={`p-2.5 rounded-xl ${statusColors[activity.status]}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                Lihat Semua Aktivitas
              </button>
            </Card>
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
