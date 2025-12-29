'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import TargetStatisticsSection from './TargetStatisticsSection';

// Verify correct version is loaded
console.log('🎯 Dashboard Client Loaded - Build:', new Date().toISOString());
import {
  BookOpen,
  Users,
  Award,
  UserCog,
  CheckCircle2,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Sparkles,
  Megaphone,
  ChevronRight,
  Bell,
  Star,
  Lightbulb,
} from 'lucide-react';

// Segment config removed to prevent build error

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-emerald-100/60 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
      </div>
      <div className="h-3 w-28 bg-gray-200 rounded"></div>
    </div>
  );
}

// Modern Stat Card - Align with Tasmi Guru Style (Pastel Solid, Border-2, Icon Badge Right)
function StatCard({ icon: Icon, title, value, subtitle, theme = 'emerald' }) {
  const themeConfig = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-2 border-emerald-200',
      titleColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      subtitleColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-2 border-amber-200',
      titleColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      subtitleColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-50',
      border: 'border-2 border-purple-200',
      titleColor: 'text-purple-600',
      valueColor: 'text-purple-700',
      subtitleColor: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-2 border-blue-200',
      titleColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      subtitleColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-cyan-50',
      border: 'border-2 border-sky-200',
      titleColor: 'text-sky-600',
      valueColor: 'text-sky-700',
      subtitleColor: 'text-sky-700',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${config.valueColor} text-3xl font-bold`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`${config.subtitleColor} text-xs font-medium mt-2`}>{subtitle}</p>
          )}
        </div>
        <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
          <Icon size={28} className={config.iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// Motivational Quote Card - Blue Transparent + Glow (SIMTAQ Baseline)
function MotivationCard() {
  return (
    <div className="w-full rounded-2xl bg-blue-50/70 backdrop-blur-sm border border-blue-200 shadow-[0_0_0_1px_rgba(14,165,233,0.25),0_12px_40px_rgba(14,165,233,0.12)] p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
          <Lightbulb size={24} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-700 font-medium text-base italic leading-relaxed mb-2 break-words">
            &quot;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&quot;
          </p>
          <p className="text-sm text-slate-600 font-semibold">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// Local Announcement Section - Amber Pastel (SIMTAQ Baseline)
function AnnouncementSection() {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const res = await fetch('/api/pengumuman?limit=3');
        if (res.ok) {
          const data = await res.json();
          setPengumuman(data.pengumuman || []);
        }
      } catch (error) {
        console.error('Failed to fetch pengumuman', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const CATEGORY_ICONS = {
    UMUM: Bell,
    AKADEMIK: BookOpen,
    KEGIATAN: Star,
    PENTING: Award,
  };

  return (
    <div className="bg-amber-50/70 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_12px_40px_rgba(245,158,11,0.12)] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg">
            <Megaphone size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-900">Pengumuman Terbaru</h2>
            <p className="text-xs text-amber-700 font-medium">Informasi penting untuk Anda</p>
          </div>
        </div>
        <Link
          href="/admin/pengumuman"
          className="hidden sm:inline-flex px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <>
            <div className="h-20 bg-white/50 rounded-2xl animate-pulse"></div>
            <div className="h-20 bg-white/50 rounded-2xl animate-pulse"></div>
          </>
        ) : pengumuman.length === 0 ? (
          <div className="text-center py-8 text-amber-800/60 font-medium">Belum ada pengumuman</div>
        ) : (
          pengumuman.map((item) => {
            const Icon = CATEGORY_ICONS[item.kategori] || CATEGORY_ICONS.UMUM;
            return (
              <div key={item.id} className="bg-white/70 border border-amber-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500 shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{item.judul}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{item.isi}</p>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                      <Calendar size={10} />
                      <span>{formatDate(item.createdAt)}</span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">{item.kategori}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Mobile only button */}
       <Link
          href="/admin/pengumuman"
          className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
        >
          Lihat Semua
          <ChevronRight size={20} />
        </Link>
    </div>
  );
}

// Hero Header Card - Green Gradient (SIMTAQ Baseline)
function DashboardHeader({ userName }) {
  // Initialize with static default values to match SSR
  const [greeting, setGreeting] = useState('Selamat Datang');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Logic that depends on browser/time runs only on client
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Administrator';
    return fullName.split(' ')[0];
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
            <BookOpen className="text-white" size={32} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white break-words" suppressHydrationWarning>
              {greeting}, {getFirstName(userName)}! 👋
            </h1>
            <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal" suppressHydrationWarning>
              {currentDate || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ percentage, label, total, achieved, color = 'emerald' }) {
  const colors = {
    emerald: {
      bar: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-600',
    },
    teal: {
      bar: 'from-teal-500 to-cyan-500',
      text: 'text-teal-600',
    }
  };
  
  const theme = colors[color] || colors.emerald;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
           <h4 className="font-bold text-gray-800 text-lg">{percentage}%</h4>
           <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        </div>
        <div className={`text-xs font-bold ${theme.text} bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100`}>
          {achieved} / {total}
        </div>
      </div>
      
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState({
    stats: {
      totalSiswa: 0,
      siswaAktif: 0,
      totalGuru: 0,
      totalHafalan: 0,
      totalJuz: 0,
      rataRataNilai: 0,
      rataRataKehadiran: 0,
    },
  });
  const [chartData, setChartData] = useState({
    siswaStats: { mencapai: 0, belum: 0 },
    kelasStats: { mencapai: 0, total: 0, persentase: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch('/api/admin/siswa?status=pending&limit=1');
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.pagination?.totalCount || 0);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const fetchChartData = async () => {
    try {
      const [siswaRes, kelasRes] = await Promise.all([
        fetch('/api/admin/siswa?perPage=1000', { cache: 'no-store' }),
        fetch('/api/admin/kelas?perPage=1000', { cache: 'no-store' }),
      ]);

      if (!siswaRes.ok || !kelasRes.ok) throw new Error('Gagal mengambil data chart');

      const siswaData = await siswaRes.json();
      const kelasData = await kelasRes.json();

      const siswaList = siswaData.siswa || [];
      const kelasList = kelasData.kelas || [];

      // Calculate siswa stats
      const siswaMencapai = siswaList.filter((s) => (s.totalJuz || 0) >= 3).length;
      const siswaBelum = siswaList.length - siswaMencapai;

      // Calculate kelas stats
      const kelasAktif = kelasList.filter((k) => k.isActive);
      const kelasMencapai = kelasAktif.filter((kelas) => {
        const siswaKelas = siswaList.filter((s) => s.kelasId === kelas.id);
        if (siswaKelas.length === 0) return false;
        const siswaMencapaiTarget = siswaKelas.filter((s) => (s.totalJuz || 0) >= 3).length;
        return (siswaMencapaiTarget / siswaKelas.length) >= 0.5;
      }).length;

      const kelasPersentase = kelasAktif.length > 0
        ? Math.round((kelasMencapai / kelasAktif.length) * 100)
        : 0;

      setChartData({
        siswaStats: { mencapai: siswaMencapai, belum: siswaBelum },
        kelasStats: { mencapai: kelasMencapai, total: kelasAktif.length, persentase: kelasPersentase },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' }); // Disable cache
      if (!res.ok) throw new Error('Gagal mengambil data dashboard');
      const result = await res.json();
      setData(result);
      await fetchChartData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchDashboardData();
    fetchPendingCount();
  }, []);

  if (!isClient) {
    return null; // or a loading spinner strictly for client mount
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* 1. Hero Header */}
          <DashboardHeader userName={session?.user?.name} />

          {/* 1.5 Pending Validation Alert */}
          {pendingCount > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-red-100 rounded-xl p-3 flex-shrink-0">
                    <Bell size={24} className="text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-red-700">Siswa Menunggu Validasi</h3>
                    <p className="text-sm text-red-600 mt-0.5">Ada {pendingCount} siswa baru yang belum divalidasi. Segera tinjau data mereka.</p>
                  </div>
                </div>
                <Link
                  href="/admin/validasi-siswa"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
                >
                  Lihat Sekarang
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {/* 2. Motivation Card - FULL WIDTH */}
          <MotivationCard />

          {/* 3. Announcement Card - FULL WIDTH */}
          <AnnouncementSection />

          {/* 4. Stat Cards - Pastel Transparent + Glow */}
          {!error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                <>
                  <StatCard
                    icon={Users}
                    title="Total Siswa"
                    value={data.stats.totalSiswa || 0}
                    subtitle={`${data.stats.siswaAktif || 0} aktif`}
                    theme="emerald"
                  />
                  <StatCard
                    icon={UserCog}
                    title="Total Guru"
                    value={data.stats.totalGuru || 0}
                    subtitle="Guru aktif"
                    theme="amber"
                  />
                  <StatCard
                    icon={BookOpen}
                    title="Total Hafalan"
                    value={`${data.stats.totalJuz || 0} Juz`}
                    subtitle="Akumulasi"
                    theme="purple"
                  />
                  <StatCard
                    icon={Award}
                    title="Rata² Nilai"
                    value={data.stats.rataRataNilai || 0}
                    subtitle="Kualitas hafalan"
                    theme="blue"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    title="Rata² Kehadiran"
                    value={`${data.stats.rataRataKehadiran || 0}%`}
                    subtitle="Tingkat kehadiran"
                    theme="sky"
                  />
                </>
              )}
            </div>
          )}

          {/* 5. Target Statistics Section (New) */}
          <TargetStatisticsSection />

        </div>
      </div>
    </AdminLayout>
  );
}
