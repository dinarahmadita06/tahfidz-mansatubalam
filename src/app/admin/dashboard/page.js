'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
} from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-2xl p-5 animate-pulse border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-3 w-20 bg-gray-300 rounded mb-3"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
      </div>
      <div className="h-3 w-28 bg-gray-300 rounded"></div>
    </div>
  );
}

// Modern Stat Card - Compact Pastel Style
function StatCard({ icon: Icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorStyles = {
    emerald: 'bg-emerald-50/80 border-emerald-200 shadow-emerald-100/50',
    emeraldIcon: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    emeraldText: 'text-emerald-700',
    amber: 'bg-amber-50/80 border-amber-200 shadow-amber-100/50',
    amberIcon: 'bg-gradient-to-br from-amber-400 to-amber-500',
    amberText: 'text-amber-700',
    purple: 'bg-purple-50/80 border-purple-200 shadow-purple-100/50',
    purpleIcon: 'bg-gradient-to-br from-purple-500 to-purple-600',
    purpleText: 'text-purple-700',
    blue: 'bg-sky-50/80 border-sky-200 shadow-sky-100/50',
    blueIcon: 'bg-gradient-to-br from-sky-500 to-sky-600',
    blueText: 'text-sky-700',
    teal: 'bg-teal-50/80 border-teal-200 shadow-teal-100/50',
    tealIcon: 'bg-gradient-to-br from-teal-500 to-teal-600',
    tealText: 'text-teal-700',
  };

  const cardClass = colorStyles[color] || colorStyles.emerald;
  const iconClass = colorStyles[`${color}Icon`] || colorStyles.emeraldIcon;
  const textClass = colorStyles[`${color}Text`] || colorStyles.emeraldText;

  return (
    <div
      className={`${cardClass} rounded-2xl p-5 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className={`text-3xl font-bold ${textClass} leading-none`}>
            {value}
          </p>
        </div>
        <div className={`${iconClass} rounded-xl p-3 shadow-lg`}>
          <Icon size={20} className="text-white" strokeWidth={2} />
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}

// Motivational Quote Card - Glass Effect
function MotivationCard() {
  return (
    <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg shadow-emerald-500/10 overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>

      {/* Left Accent Bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"></div>

      <div className="relative flex items-start gap-4 pl-4">
        {/* Icon Badge */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles size={24} className="text-white" strokeWidth={2} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 italic leading-relaxed mb-2">
            &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
          </p>
          <p className="text-xs font-semibold text-emerald-600">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// Hero Header Card
function DashboardHeader({ userName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Admin';
    return fullName.split(' ')[0];
  };

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 shadow-xl shadow-emerald-500/20 overflow-hidden">
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
          <p className="text-white/90 text-base font-medium">
            {getGreeting()}, <span className="font-bold">{getFirstName(userName)}</span>
          </p>
        </div>

        {/* Date Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-1">
            <Calendar size={14} />
            <span>Hari Ini</span>
          </div>
          <p className="text-white font-semibold text-sm">
            {getCurrentDate()}
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

          {/* Motivation Card + Pengumuman - Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MotivationCard />
            <div>
              <PengumumanWidget limit={3} />
            </div>
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
              {/* Stat Cards - Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                      color="emerald"
                      delay={0}
                    />
                    <StatCard
                      icon={UserCog}
                      title="Total Guru"
                      value={data.stats.totalGuru || 0}
                      subtitle="Guru aktif mengajar"
                      color="amber"
                      delay={0.05}
                    />
                    <StatCard
                      icon={BookOpen}
                      title="Total Hafalan"
                      value={`${data.stats.totalJuz || 0} Juz`}
                      subtitle="Keseluruhan siswa"
                      color="purple"
                      delay={0.1}
                    />
                    <StatCard
                      icon={Award}
                      title="Rata² Nilai"
                      value={data.stats.rataRataNilai || 0}
                      subtitle="Nilai keseluruhan"
                      color="blue"
                      delay={0.15}
                    />
                    <StatCard
                      icon={CheckCircle2}
                      title="Rata² Kehadiran"
                      value={`${data.stats.rataRataKehadiran || 0}%`}
                      subtitle="Kehadiran siswa"
                      color="teal"
                      delay={0.2}
                    />
                  </>
                )}
              </div>

              {/* Charts Section - Better Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Siswa Progress */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2.5">
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
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-2.5">
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

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AdminLayout>
  );
}
