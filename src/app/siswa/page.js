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
  Sparkles,
  ChevronRight,
  BookMarked,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

// ===== CONSTANTS =====
const PRIMARY_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-400 to-yellow-300';
const CARD_BORDER = 'border border-emerald-100';

// ===== REUSABLE COMPONENTS =====

// StatsCard - Card statistik dengan pastel lembut + icon besar
const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'emerald', delay = 0 }) => {
  const colorConfig = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500',
      textValue: 'text-gray-900',
      textSub: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
      textValue: 'text-gray-900',
      textSub: 'text-amber-600',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
      border: 'border-sky-100',
      iconBg: 'bg-sky-500',
      textValue: 'text-gray-900',
      textSub: 'text-sky-600',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-500',
      textValue: 'text-gray-900',
      textSub: 'text-purple-600',
    },
  };

  const styles = colorConfig[color];

  return (
    <div className={`${styles.bg} rounded-2xl p-5 shadow-sm border ${styles.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 ${styles.iconBg} rounded-2xl shadow-md`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${styles.textValue}`}>{value}</p>
      {subtitle && <p className={`text-sm ${styles.textSub} font-medium mt-2`}>{subtitle}</p>}
    </div>
  );
};

// SectionHeader - Header untuk section card dengan icon
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

// DashboardCard - Card wrapper dengan styling konsisten
const DashboardCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${CARD_BORDER} ${className}`}>
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

  // Ambil nama depan dari nama user (mengambil kata pertama)
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

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Update current time
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

  const hafalanProgress = Math.round((stats.hafalanSelesai / stats.totalHafalan) * 100);

  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Welcome Banner - Gradient Hijau ke Kuning */}
        <div className={`${PRIMARY_GRADIENT} rounded-2xl shadow-md p-6 sm:p-8 text-white mb-6`}>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-yellow-200 flex-shrink-0" size={28} />
            <h1 className="text-2xl sm:text-3xl font-bold" suppressHydrationWarning>
              {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
            </h1>
          </div>
          <p className="text-green-50 text-sm sm:text-base mb-4" suppressHydrationWarning>
            {isHydrated ? currentTime : ''}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full">
              <BookMarked className="text-white flex-shrink-0" size={18} />
              <span className="text-white font-medium text-sm">
                {stats.hafalanSelesai} Hafalan Selesai
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full">
              <Target className="text-white flex-shrink-0" size={18} />
              <span className="text-white font-medium text-sm">
                Target: {stats.totalHafalan} Hafalan
              </span>
            </div>
          </div>
        </div>

        {/* Motivasi - Biru Transparan */}
        <div className="bg-sky-50/60 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="text-sky-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-base sm:text-lg italic leading-relaxed text-sky-900 mb-2 font-medium">
                "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
              </p>
              <p className="text-sm text-sky-700 font-semibold">
                — HR. Bukhari
              </p>
            </div>
          </div>
        </div>

        {/* Pengumuman Widget */}
        <div className="mb-6">
          <PengumumanWidget limit={3} />
        </div>

        {/* Statistics Cards - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <DashboardCard className="lg:col-span-2">
            <SectionHeader
              icon={TrendingUp}
              title="Progress Hafalan per Juz"
              subtitle="Pantau perkembangan hafalanmu"
              iconColor="emerald"
            />

            <div className="space-y-4">
              {achievementData.map((item, index) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
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
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              Lihat Laporan Lengkap <ChevronRight size={20} />
            </Link>
          </DashboardCard>

          {/* Recent Activities */}
          <DashboardCard>
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
          </DashboardCard>
        </div>
      </div>
    </SiswaLayout>
  );
}
