'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';
import GuruLayout from '@/components/layout/GuruLayout';
import AnnouncementSlider from '@/components/AnnouncementSlider';
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
  ChevronLeft,
} from 'lucide-react';

// Style constants
const CARD_BASE = 'rounded-2xl bg-white border border-slate-200 shadow-sm';
const CARD_HOVER = 'hover:shadow-md hover:-translate-y-0.5 transition-all';

// ===== HELPER FUNCTIONS =====

/**
 * Safely parse API response that can be either:
 * - Direct array: [...]
 * - Object with data field: { success: true, data: [...] }
 * - Object with specific field: { kelas: [...] }
 * Always returns an array.
 */
function parseApiResponse(response, fieldName = null) {
  if (!response) return [];

  // If response is already an array
  if (Array.isArray(response)) return response;

  // If response has a specific field (e.g., { kelas: [...] })
  if (fieldName && response[fieldName]) {
    return Array.isArray(response[fieldName]) ? response[fieldName] : [];
  }

  // If response has data field (e.g., { success: true, data: [...] })
  if (response.data) {
    return Array.isArray(response.data) ? response.data : [];
  }

  // If response has success field but data is array directly (legacy)
  if (response.success && Array.isArray(response)) {
    return response;
  }

  // Default to empty array
  return [];
}

/**
 * Fetch hafalan data with safe parsing
 */
async function fetchHafalanData() {
  try {
    const res = await fetch('/api/hafalan');
    if (!res.ok) return [];

    const json = await res.json().catch(() => null);
    return parseApiResponse(json);
  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return [];
  }
}

// ===== COMPONENTS =====

// StatCard Component
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// 1. MotivationCard Component
function MotivationCard() {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm p-4 lg:p-5">
      <div className="flex items-start gap-3 lg:gap-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] lg:text-sm font-semibold italic leading-relaxed mb-1 lg:mb-2">
            "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
          </p>
          <p className="text-[11px] lg:text-xs font-medium text-blue-700 opacity-80">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// 3. StatsCards Component
function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        label="Kelas Diampu"
        value={stats.kelasAjaran || 0}
        icon={<BookOpen size={24} />}
        color="bg-emerald-500"
      />
      <StatCard
        label="Jumlah Siswa"
        value={stats.jumlahSiswa || 0}
        icon={<Users size={24} />}
        color="bg-blue-500"
      />
      <StatCard
        label="Progress Rata-rata"
        value={`${stats.progressRataRata || 0}%`}
        icon={<TrendingUp size={24} />}
        color="bg-violet-500"
      />
    </div>
  );
}

// 4. ClassManagementSection Component
function ClassManagementSection({ kelasList, loading }) {
  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-4 lg:p-5`}>
      <div className="flex items-center gap-3 mb-3 lg:mb-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <BookOpen className="text-white w-5 h-5 lg:w-[22px] lg:h-[22px]" />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-slate-800">Kelola Kelas</h3>
      </div>

      {loading ? (
        <div className="py-10 lg:py-12">
          <LoadingIndicator text="Memuat daftar kelas..." />
        </div>
      ) : kelasList.length === 0 ? (
        <EmptyState
          title="Belum ada kelas yang diampu"
          description="Anda belum memiliki daftar kelas binaan saat ini."
          icon={BookOpen}
          className="py-6"
        />
      ) : (
        <div className="space-y-2.5 lg:space-y-3">
          {kelasList.map((kelas) => (
            <Link
              key={kelas.id}
              href={`/guru/penilaian-hafalan/${kelas.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 lg:p-4 rounded-xl border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <BookOpen className="text-emerald-600 w-[18px] h-[18px] lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm lg:text-base leading-tight">{kelas.nama}</h4>
                    <p className="text-[11px] lg:text-sm text-slate-600 mt-0.5 opacity-80">
                      {kelas._count?.siswa || 0} siswa
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-xs lg:text-sm font-bold uppercase tracking-wider">Lihat</span>
                  <ChevronRight className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
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
    <div className={`${CARD_BASE} ${CARD_HOVER} p-4 lg:p-5`}>
      <div className="flex items-center gap-3 mb-3 lg:mb-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <FileText className="text-white w-5 h-5 lg:w-[22px] lg:h-[22px]" />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
      </div>

      {loading ? (
        <LoadingIndicator text="Memuat aktivitas..." />
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
      const kelasList = parseApiResponse(kelasData, 'kelas');
      setKelasList(kelasList);

      // Fetch siswa dari kelas binaan
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();
      const siswaArray = parseApiResponse(siswaData);

      // Hitung progress rata-rata dari kelas yang diampu
      let totalProgress = 0;
      if (siswaArray.length > 0) {
        const hafalanArray = await fetchHafalanData();

        for (const siswa of siswaArray) {
          const siswaHafalan = hafalanArray.filter(h => h?.siswaId === siswa.id);
          const uniqueJuz = [...new Set(siswaHafalan.map(h => h.juz).filter(Boolean))];
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
      // ✅ Force fresh data - no caching
      const response = await fetch('/api/guru/aktivitas-list?limit=5', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.data || []);
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
      // API returns { pengumuman: [...] } structure
      const announcementsList = parseApiResponse(data, 'pengumuman');
      setAnnouncements(announcementsList);
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
        <LoadingIndicator text="Memuat dashboard..." fullPage />
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 space-y-4 lg:space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg px-6 py-5 lg:py-6 sm:px-8 sm:py-7 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
                Dashboard Guru Tahfidz
              </h1>
              <p className="text-white/90 text-xs lg:text-sm mt-0.5">
                {greeting}, {getFirstName(session?.user?.name)} • {formattedDate}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold text-xs lg:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              {refreshing ? (
                <LoadingIndicator size="small" text="Memuat..." inline className="text-white" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                  <span>Refresh Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Motivation Card */}
        <MotivationCard />

        {/* Announcement Section - Paling Pertama & Menonjol */}
        <AnnouncementSlider announcements={announcements} loading={false} variant="guru" />

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
