'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookMarked, Target } from 'lucide-react';
import dynamic from 'next/dynamic';
import StudentDashboardContent from '@/components/dashboard/StudentDashboardContent';
import { PageSkeleton } from '@/components/shared/Skeleton';

// Lazy load widget to reduce initial bundle
const AktivitasTerkiniWidget = dynamic(() => import('@/components/siswa/AktivitasTerkiniWidget'), {
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />,
  ssr: false
});

const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';

const getFirstName = (fullName) => {
  if (!fullName) return 'Siswa';
  return fullName.split(' ')[0];
};

export default function SiswaDashboardClient({ initialData, session }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('SiswaDashboardClient initialData:', {
      hasInitialData: !!initialData,
      siswaId: initialData?.siswaId,
      hasStats: !!initialData?.stats,
      hasQuote: !!initialData?.quote,
      hasPengumuman: !!initialData?.pengumuman,
      hasJuzProgress: !!initialData?.juzProgress,
      quote: initialData?.quote?.substring(0, 50)
    });
  }, [initialData]);

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

  const stats = {
    hafalanSelesai: initialData?.stats?.hafalanSelesai || 0,
    totalHafalan: initialData?.stats?.totalHafalan || 0,
  };

  return (
    <div className="w-full space-y-6">
      {/* Banner Header */}
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
      </div>

      {/* Dashboard Content */}
      <StudentDashboardContent 
        targetSiswaId={initialData?.siswaId} 
        roleContext="SISWA"
        initialData={initialData}
        activityWidget={<AktivitasTerkiniWidget initialData={initialData?.activities} />}
      />
    </div>
  );
}
