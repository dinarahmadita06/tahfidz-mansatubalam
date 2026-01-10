'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import SiswaLayout from '@/components/layout/SiswaLayout';
import AktivitasTerkiniWidget from '@/components/siswa/AktivitasTerkiniWidget';
import StudentDashboardContent from '@/components/dashboard/StudentDashboardContent';
import { PageSkeleton } from '@/components/shared/Skeleton';
import {
  BookMarked,
  Target,
} from 'lucide-react';
import Link from 'next/link';

const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';

// ===== HELPER FUNCTIONS =====
const getFirstName = (fullName) => {
  if (!fullName) return 'Siswa';
  return fullName.split(' ')[0];
};

// ===== MAIN COMPONENT =====
export default function DashboardSiswa() {
  const { data: session } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);

  // Greeting and time setup (client-only to avoid hydration mismatch)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const greeting = useMemo(() => {
    if (!isHydrated) return '';
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, [isHydrated]);

  const currentTime = useMemo(() => {
    if (!isHydrated) return '';
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [isHydrated]);

  // Use React Query for dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['siswa-dashboard-summary'],
    queryFn: async () => {
      const res = await fetch('/api/siswa/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const siswaId = data?.siswaId;
  const stats = {
    hafalanSelesai: data?.stats?.hafalanSelesai || 0,
    totalHafalan: data?.stats?.totalHafalan || 0,
    rataRataNilai: data?.stats?.rataRataNilai || 0,
    catatanGuru: data?.stats?.catatanGuru || 0,
  };

  if (isLoading) {
    return (
      <SiswaLayout>
        <PageSkeleton />
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <div className="w-full space-y-6">
        {/* Banner Header - Hijau SIMTAQ Style */}
        <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-4 lg:p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 lg:p-4 rounded-2xl flex-shrink-0">
                <BookMarked className="text-white" size={28} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold break-words leading-tight" suppressHydrationWarning>
                  {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                </h1>
                <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal opacity-90" suppressHydrationWarning>
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
          </div>
        </div>

        {/* Dashboard Content - Including Activity Widget in 2-column grid */}
        {siswaId && (
          <StudentDashboardContent 
            targetSiswaId={siswaId} 
            roleContext="SISWA"
            activityWidget={<AktivitasTerkiniWidget />}
          />
        )}
      </div>
    </SiswaLayout>
  );
}