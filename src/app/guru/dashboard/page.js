'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import PengumumanWidget from '@/components/PengumumanWidget';
import ActivityList from '@/components/guru/ActivityList';
import {
  BookOpen,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FileText,
  Megaphone,
  ChevronRight,
} from 'lucide-react';

// Style constants
const CARD_BASE = 'rounded-2xl bg-white border border-slate-200 shadow-sm';
const CARD_HOVER = 'hover:shadow-md hover:-translate-y-0.5 transition-all';

// ===== COMPONENTS =====

// 1. MotivationCard Component
function MotivationCard() {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Sparkles size={22} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold italic leading-relaxed mb-2">
            "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
          </p>
          <p className="text-xs font-medium text-blue-700">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// 2. AnnouncementSection Component
function AnnouncementSection({ announcements, loading }) {
  if (loading) {
    return (
      <div className={`${CARD_BASE} p-5 sm:p-6`}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className={`${CARD_BASE} p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Megaphone size={18} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-600">Tidak ada pengumuman baru</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-md p-5 sm:p-6 ring-2 ring-emerald-100">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">Pengumuman</h3>
            <p className="text-xs text-emerald-700">Informasi terbaru untuk Anda</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
          Baru
        </span>
      </div>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-xl p-4 border border-emerald-200">
            <h4 className="font-semibold text-slate-900 mb-1">{announcement.judul}</h4>
            <p className="text-sm text-slate-600 line-clamp-2">{announcement.isi}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. StatsCards Component
function StatsCards({ stats }) {
  const cards = [
    {
      icon: BookOpen,
      title: 'KELAS DIAMPU',
      value: stats.kelasAjaran || 0,
      subtitle: 'Kelas yang Anda ampu',
      variant: 'green',
    },
    {
      icon: Users,
      title: 'JUMLAH SISWA',
      value: stats.jumlahSiswa || 0,
      subtitle: 'Siswa di kelas binaan',
      variant: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'PROGRESS RATA-RATA',
      value: `${stats.progressRataRata || 0}%`,
      subtitle: stats.kelasAjaran > 0
        ? `Rata-rata dari ${stats.kelasAjaran} kelas`
        : 'Target belum ditetapkan',
      variant: 'violet',
    },
  ];

  const variants = {
    green: {
      wrapper: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'text-emerald-600',
      value: 'text-emerald-700',
    },
    blue: {
      wrapper: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'text-blue-600',
      value: 'text-blue-700',
    },
    violet: {
      wrapper: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      title: 'text-violet-600',
      value: 'text-violet-700',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const style = variants[card.variant];

        return (
          <div
            key={index}
            className={`${style.wrapper} rounded-xl border-2 p-6 shadow-sm ${CARD_HOVER}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${style.title} text-sm font-semibold mb-1 uppercase`}>
                  {card.title}
                </p>
                <h3 className={`${style.value} text-4xl font-bold`}>
                  {card.value}
                </h3>
                {card.subtitle && (
                  <p className="text-slate-500 text-sm mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`${style.iconBg} p-4 rounded-full`}>
                <Icon size={32} className={style.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. ClassManagementSection Component
function ClassManagementSection({ kelasList, loading }) {
  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-5 sm:p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <BookOpen size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Kelola Kelas</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-xl p-4 h-20"></div>
          ))}
        </div>
      ) : kelasList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Belum ada kelas yang diampu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kelasList.map((kelas) => (
            <Link
              key={kelas.id}
              href={`/guru/penilaian-hafalan/${kelas.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <BookOpen size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{kelas.nama}</h4>
                    <p className="text-sm text-slate-600">
                      {kelas._count?.siswa || 0} siswa
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-semibold">Lihat Kelas</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. RecentActivity Component
function RecentActivity({ activities, loading }) {
  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-5 sm:p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <FileText size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat aktivitas...</p>
        </div>
      ) : (
        <ActivityList activities={activities} />
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function DashboardGuru() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    kelasAjaran: 0,
    jumlahSiswa: 0,
    progressRataRata: 0,
  });
  const [kelasList, setKelasList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchActivities();
    fetchAnnouncements();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch kelas yang diampu guru
      const kelasRes = await fetch('/api/guru/kelas');
      const kelasData = await kelasRes.json();
      const kelasList = Array.isArray(kelasData.kelas) ? kelasData.kelas : [];
      setKelasList(kelasList);

      // Fetch siswa dari kelas binaan
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();
      const siswaArray = Array.isArray(siswaData) ? siswaData : [];

      // Hitung progress rata-rata dari kelas yang diampu
      let totalProgress = 0;
      if (siswaArray.length > 0) {
        const hafalanRes = await fetch('/api/hafalan');
        const hafalanData = await hafalanRes.json();
        const hafalanArray = Array.isArray(hafalanData) ? hafalanData : [];

        for (const siswa of siswaArray) {
          const siswaHafalan = hafalanArray.filter(h => h.siswaId === siswa.id);
          const uniqueJuz = [...new Set(siswaHafalan.map(h => h.juz))];
          const progress = (uniqueJuz.length / 30) * 100;
          totalProgress += progress;
        }
      }

      const avgProgress = siswaArray.length > 0 ? totalProgress / siswaArray.length : 0;

      setStats({
        kelasAjaran: kelasList.length,
        jumlahSiswa: siswaArray.length,
        progressRataRata: avgProgress.toFixed(1),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await fetch('/api/guru/activity?limit=8');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/pengumuman');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
    fetchActivities();
    fetchAnnouncements();
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat dashboard...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  const getFirstName = (fullName) => {
    if (!fullName) return 'Guru';
    return fullName.split(' ')[0];
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const greeting = (() => {
    const hour = today.getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Dashboard Guru Tahfidz
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                {greeting}, {getFirstName(session?.user?.name)} • {formattedDate}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Motivation Card */}
        <MotivationCard />

        {/* Announcement Section - Paling Pertama & Menonjol */}
        <AnnouncementSection announcements={announcements} loading={false} />

        {/* Stats Cards - Hapus Total Juz, Progress dengan subtitle jelas */}
        <StatsCards stats={stats} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Kelola Kelas - Ganti dari Jadwal Setoran */}
          <ClassManagementSection kelasList={kelasList} loading={loading} />

          {/* Aktivitas Terbaru - Tetap di posisi ini */}
          <RecentActivity activities={activities} loading={activitiesLoading} />
        </div>

      </div>
    </GuruLayout>
  );
}
