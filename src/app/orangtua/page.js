'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
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
  ChevronDown,
  User,
} from 'lucide-react';

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CARD_GLASS = 'bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// ===== REUSABLE COMPONENTS =====

// StatsCard dengan glass effect
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

  // Safe value with fallback to 0
  const safeValue = value ?? 0;

  return (
    <div className={`${styles.bg} backdrop-blur-sm rounded-2xl p-5 border ${styles.border} ${styles.glow} ${styles.hoverGlow} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 ${styles.iconBg} ${styles.iconRing} rounded-2xl shadow-md`}>
          <Icon className={styles.iconColor} size={28} />
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{safeValue}</p>
      {subtitle && <p className={`text-sm ${styles.textSub} font-semibold mt-2 min-w-0 break-words`}>{subtitle}</p>}
    </div>
  );
};

// SectionHeader
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

// Card wrapper
const Card = ({ children, className = '' }) => {
  return (
    <div className={`${CARD_GLASS} p-6 ${className}`}>
      {children}
    </div>
  );
};

// Empty State
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

// Dropdown untuk memilih anak
const ChildSelector = ({ children, selectedChild, onSelectChild }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!children || children.length === 0) return null;

  const hasMultipleChildren = children.length > 1;

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => hasMultipleChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg transition-all duration-300 ${
          hasMultipleChildren ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
        }`}
      >
        <User size={20} className="text-emerald-600 flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm text-gray-600">Anak Aktif</p>
          <p className="font-semibold text-gray-900">{selectedChild?.name || 'Pilih Anak'}</p>
        </div>
        {hasMultipleChildren && (
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && hasMultipleChildren && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[999] max-h-[300px] overflow-y-auto">
            {children.map((child, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectChild(child);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                }`}
              >
                <User size={20} className="text-emerald-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-600">Kelas {child.kelas}</p>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Progress hafalan per juz
const JuzProgressSection = ({ juzProgress, loading }) => {
  return (
    <Card className="lg:col-span-2">
      <SectionHeader
        icon={TrendingUp}
        title="Progress Hafalan Anak"
        subtitle="Pantau perkembangan hafalan per juz"
        iconColor="emerald"
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !juzProgress || juzProgress.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada progress hafalan"
          description="Anak belum memulai setoran hafalan"
        />
      ) : (
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
      )}
    </Card>
  );
};

// Aktivitas terkini
const RecentActivities = ({ activities, loading }) => {
  const getActivityConfig = (type) => {
    const configs = {
      setor: { icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
      nilai: { icon: Star, color: 'bg-amber-100 text-amber-700' },
      catatan: { icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
      presensi: { icon: CalendarCheck, color: 'bg-sky-100 text-sky-700' },
    };
    return configs[type] || configs.setor;
  };

  return (
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
      ) : !activities || activities.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum ada aktivitas terbaru"
          description="Aktivitas anak akan muncul di sini"
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
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
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// ===== MAIN COMPONENT =====
export default function DashboardOrangTua() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real API
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B' },
  ];

  // Default stats - all zero when no data
  const stats = {
    hafalanSelesai: 0,
    totalHafalan: 0,
    rataRataNilai: 0,
    kehadiran: 0,
    totalHari: 0,
    catatanGuru: 0,
  };

  // Default juz progress - empty array when no data
  const juzProgress = [];

  // Default recent activities - empty array when no data
  const recentActivities = [];

  const getFirstName = (fullName) => {
    if (!fullName) return 'Orang Tua';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    setIsHydrated(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={`${CONTAINER} py-6 space-y-6`}>
          {/* Banner Header - Hijau SIMTAQ Style */}
          <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                  <BookMarked className="text-white" size={32} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words" suppressHydrationWarning>
                    {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1">
                    Pantau perkembangan hafalan putra/putri Anda
                  </p>
                </div>
              </div>

              {/* Child Selector Dropdown */}
              {selectedChild && (
                <ChildSelector
                  children={children}
                  selectedChild={selectedChild}
                  onSelectChild={setSelectedChild}
                />
              )}
            </div>
          </div>

          {/* Motivasi - Biru Transparan */}
          <div className="bg-blue-50/60 backdrop-blur rounded-2xl shadow-sm border border-blue-200/40 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-blue-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg italic leading-relaxed text-slate-700 mb-2 font-medium break-words">
                  "Didiklah anak-anakmu, karena mereka diciptakan untuk zaman yang berbeda dengan zamanmu."
                </p>
                <p className="text-sm text-slate-600 font-semibold">
                  — Ali bin Abi Thalib RA
                </p>
              </div>
            </div>
          </div>

          {/* Pengumuman */}
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-2xl border border-amber-200 ring-2 ring-amber-200/40 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] border-l-4 border-l-amber-400 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-3.5 bg-amber-500 rounded-xl shadow-lg ring-2 ring-amber-300/50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900">Pengumuman Terbaru</h2>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">Informasi penting untuk Anda</p>
                </div>
              </div>
            </div>
            <PengumumanWidget limit={3} />
          </div>

          {/* Statistics Cards - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={BookOpen}
              title="Hafalan Selesai"
              value={stats.hafalanSelesai ?? 0}
              subtitle={stats.totalHafalan > 0 ? `dari ${stats.totalHafalan} target` : 'Belum ada data'}
              color="emerald"
            />
            <StatsCard
              icon={Star}
              title="Rata-rata Nilai"
              value={stats.rataRataNilai ?? 0}
              subtitle="dari 100"
              color="amber"
            />
            <StatsCard
              icon={CalendarCheck}
              title="Kehadiran"
              value={stats.kehadiran ?? 0}
              subtitle={stats.totalHari > 0 ? `dari ${stats.totalHari} hari` : 'Belum ada data'}
              color="sky"
            />
            <StatsCard
              icon={MessageSquare}
              title="Catatan Guru"
              value={stats.catatanGuru ?? 0}
              subtitle="Lihat riwayat"
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <JuzProgressSection juzProgress={juzProgress} loading={loading} />
            <RecentActivities activities={recentActivities} loading={loading} />
          </div>
        </div>
      </div>
    </OrangtuaLayout>
  );
}
