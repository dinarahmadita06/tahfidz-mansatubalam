'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import PengumumanWidget from '@/components/PengumumanWidget';
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
} from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-xl p-5 animate-pulse border-2 border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-3 w-20 bg-gray-300 rounded mb-3"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
      <div className="h-3 w-28 bg-gray-300 rounded"></div>
    </div>
  );
}

// Modern Stat Card - Following Guru Dashboard Style with Pastel Glow
function StatCard({ icon: Icon, title, value, subtitle, variant = 'green' }) {
  const variants = {
    green: {
      wrapper: 'bg-emerald-50/70 backdrop-blur-sm border-emerald-200/60 shadow-md shadow-emerald-200/25',
      iconBg: 'bg-white/70 shadow-sm',
      iconColor: 'text-emerald-600',
      title: 'text-emerald-600',
      value: 'text-emerald-700',
    },
    blue: {
      wrapper: 'bg-blue-50/70 backdrop-blur-sm border-blue-200/60 shadow-md shadow-blue-200/25',
      iconBg: 'bg-white/70 shadow-sm',
      iconColor: 'text-blue-600',
      title: 'text-blue-600',
      value: 'text-blue-700',
    },
    violet: {
      wrapper: 'bg-violet-50/70 backdrop-blur-sm border-violet-200/60 shadow-md shadow-violet-200/25',
      iconBg: 'bg-white/70 shadow-sm',
      iconColor: 'text-violet-600',
      title: 'text-violet-600',
      value: 'text-violet-700',
    },
    amber: {
      wrapper: 'bg-amber-50/70 backdrop-blur-sm border-amber-200/60 shadow-md shadow-amber-200/25',
      iconBg: 'bg-white/70 shadow-sm',
      iconColor: 'text-amber-600',
      title: 'text-amber-600',
      value: 'text-amber-700',
    },
    sky: {
      wrapper: 'bg-sky-50/70 backdrop-blur-sm border-sky-200/60 shadow-md shadow-sky-200/25',
      iconBg: 'bg-white/70 shadow-sm',
      iconColor: 'text-sky-600',
      title: 'text-sky-600',
      value: 'text-sky-700',
    },
  };

  const style = variants[variant] || variants.green;

  return (
    <div
      className={`${style.wrapper} rounded-2xl border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${style.title} text-xs font-semibold mb-1 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${style.value} text-3xl font-bold`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${style.iconBg} p-3 rounded-xl`}>
          <Icon size={28} className={style.iconColor} />
        </div>
      </div>
    </div>
  );
}

// Motivational Quote Card - BLUE TRANSPARENT (Following Guru Dashboard)
function MotivationCard() {
  return (
    <div className="rounded-2xl bg-blue-50/60 backdrop-blur-sm border border-blue-200/60 shadow-[0_0_0_2px_rgba(59,130,246,0.12)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shrink-0 border border-blue-200/40">
          <Sparkles size={22} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold italic leading-relaxed mb-2 text-blue-900">
            "Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya."
          </p>
          <p className="text-xs font-medium text-blue-700">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// Announcement Section - ORANGE
function AnnouncementSection() {
  return (
    <div className="bg-orange-50/70 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-lg shadow-orange-200/30 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-orange-500 rounded-xl shadow-lg">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-orange-900">Pengumuman Terbaru</h2>
            <p className="text-xs text-orange-700 font-medium mt-0.5">Informasi penting untuk Anda</p>
          </div>
        </div>
        <Link
          href="/admin/pengumuman"
          className="hidden sm:inline-flex px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
        >
          Lihat Semua
        </Link>
      </div>

      <PengumumanWidget limit={3} />

      {/* Mobile CTA - Full Width Button (Orange) */}
      <Link
        href="/admin/pengumuman"
        className="sm:hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
      >
        Lihat Semua Pengumuman
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}

// Hero Header Card - Fixed Hydration
function DashboardHeader({ userName }) {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Set greeting based on hour
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Admin';
    return fullName.split(' ')[0];
  };

  return (
    <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 md:p-8 shadow-lg shadow-emerald-500/15 border border-white/20 overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <Trophy size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Dashboard Tahfidz
              </h1>
              <p className="text-emerald-50 text-sm font-medium mt-0.5">
                Sistem Manajemen Tahfidz Al-Qur&apos;an
              </p>
            </div>
          </div>
          <p className="text-white/90 text-base font-medium" suppressHydrationWarning>
            {isClient && greeting ? `${greeting}, ` : ''}<span className="font-bold">{getFirstName(userName)}</span>
          </p>
        </div>

        {/* Date Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-1">
            <Calendar size={14} />
            <span>Hari Ini</span>
          </div>
          <p className="text-white font-semibold text-sm" suppressHydrationWarning>
            {isClient && currentDate ? currentDate : '...'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ percentage, label, total, achieved }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold text-emerald-600">{percentage}%</span>
      </div>
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-xs font-bold text-white px-2">
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600">
        <span className="font-bold text-emerald-600">{achieved}</span> dari{' '}
        <span className="font-semibold">{total}</span> {label.toLowerCase()}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  // Debug: Confirm this is the active page
  console.log("ADMIN DASHBOARD PAGE ACTIVE ✅");

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Gagal mengambil data dashboard');

      const result = await res.json();
      setData(result);

      // Fetch chart data
      await fetchChartData();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const [siswaRes, kelasRes] = await Promise.all([
        fetch('/api/admin/siswa?perPage=1000'),
        fetch('/api/admin/kelas?perPage=1000'),
      ]);

      if (!siswaRes.ok || !kelasRes.ok) {
        throw new Error('Gagal mengambil data chart');
      }

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
      console.error('Error fetching chart data:', error);
      setChartData({
        siswaStats: { mencapai: 0, belum: 0 },
        kelasStats: { mencapai: 0, total: 0, persentase: 0 },
      });
    }
  };

  return (
    <AdminLayout>
      {/* Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Main Container - Wider Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Hero Header */}
          <DashboardHeader userName={session?.user?.name} />

          {/* Motivation Card (Blue) + Pengumuman (Orange) - Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MotivationCard />
            <AnnouncementSection />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200 shadow-lg">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-5xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    Gagal Memuat Data
                  </h3>
                  <p className="text-sm text-red-700 mb-4">{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!error && (
            <>
              {/* Stat Cards - Following Guru Dashboard Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <StatCard
                      icon={Users}
                      title="Total Siswa"
                      value={data.stats.totalSiswa || 0}
                      subtitle={`${data.stats.siswaAktif || 0} siswa aktif`}
                      variant="green"
                    />
                    <StatCard
                      icon={UserCog}
                      title="Total Guru"
                      value={data.stats.totalGuru || 0}
                      subtitle="Guru aktif mengajar"
                      variant="amber"
                    />
                    <StatCard
                      icon={BookOpen}
                      title="Total Hafalan"
                      value={`${data.stats.totalJuz || 0} Juz`}
                      subtitle="Keseluruhan siswa"
                      variant="violet"
                    />
                    <StatCard
                      icon={Award}
                      title="Rata² Nilai"
                      value={data.stats.rataRataNilai || 0}
                      subtitle="Nilai keseluruhan"
                      variant="blue"
                    />
                    <StatCard
                      icon={CheckCircle2}
                      title="Rata² Kehadiran"
                      value={`${data.stats.rataRataKehadiran || 0}%`}
                      subtitle="Kehadiran siswa"
                      variant="sky"
                    />
                  </>
                )}
              </div>

              {/* Charts Section - Better Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Siswa Progress */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                      <Target size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Siswa Mencapai Target
                    </h3>
                  </div>

                  {chartData.siswaStats.mencapai + chartData.siswaStats.belum === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-gray-500 font-medium">
                        Belum ada data siswa
                      </p>
                    </div>
                  ) : (
                    <ProgressBar
                      percentage={Math.round(
                        (chartData.siswaStats.mencapai /
                          (chartData.siswaStats.mencapai + chartData.siswaStats.belum)) *
                          100
                      )}
                      label="Siswa Mencapai Target (≥3 Juz)"
                      total={chartData.siswaStats.mencapai + chartData.siswaStats.belum}
                      achieved={chartData.siswaStats.mencapai}
                    />
                  )}

                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-emerald-600">Target:</span>{' '}
                      Siswa dianggap mencapai target jika telah menghafal ≥ 3 juz
                    </p>
                  </div>
                </div>

                {/* Kelas Progress */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Kelas Mencapai Target
                    </h3>
                  </div>

                  {chartData.kelasStats.total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4">🏫</div>
                      <p className="text-gray-500 font-medium">
                        Belum ada data kelas
                      </p>
                    </div>
                  ) : (
                    <ProgressBar
                      percentage={chartData.kelasStats.persentase}
                      label="Kelas Mencapai Target"
                      total={chartData.kelasStats.total}
                      achieved={chartData.kelasStats.mencapai}
                    />
                  )}

                  <div className="mt-6 p-4 bg-teal-50 rounded-xl border-l-4 border-teal-500">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-teal-600">Target:</span>{' '}
                      Kelas mencapai target jika ≥ 50% siswanya telah menghafal ≥ 3 juz
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
