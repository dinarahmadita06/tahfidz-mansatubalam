export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import DashboardHeader from '@/components/guru/dashboard/DashboardHeader';
import { 
  MotivationCard, 
  StatsSection, 
  AnnouncementSection, 
  ClassManagementSection, 
  RecentActivitySection 
} from '@/components/guru/dashboard/DashboardSections';
import { 
  StatsSkeleton, 
  AnnouncementSkeleton, 
  SectionSkeleton 
} from '@/components/guru/dashboard/DashboardSkeletons';

/**
 * GuruPage - Root route for /guru
 * Optimisasi TTFB: Jangan await auth() di level top-level komponen ini.
 * Biarkan shell GuruLayout dikirim segera ke browser.
 */
export default function GuruPage() {
  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full space-y-6">
          {/* Wrapper for Auth-dependent content */}
          <Suspense fallback={<DashboardMainSkeleton />}>
            <DashboardContent />
          </Suspense>
        </div>
      </div>
    </GuruLayout>
  );
}

/**
 * DashboardContent - Async component to handle auth and sections
 * This component will stream in after the layout is sent.
 */
async function DashboardContent() {
  console.time('GuruPage-auth');
  const session = await auth();
  console.timeEnd('GuruPage-auth');

  // Security check
  if (!session || session.user?.role !== 'GURU') {
    redirect('/login');
  }

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

  const userId = session.user.id;

  return (
    <>
      {/* Header - Now inside Suspense boundary */}
      <DashboardHeader 
        name={session.user.name} 
        greeting={greeting} 
        date={formattedDate} 
      />

      {/* Motivation Card - Moved below header */}
      <MotivationCard />

      {/* Announcement Section - Internal Suspense for nested streaming */}
      <Suspense fallback={<AnnouncementSkeleton />}>
        <AnnouncementSection />
      </Suspense>

      {/* Stats Cards - Internal Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection userId={userId} />
      </Suspense>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Suspense fallback={<SectionSkeleton title="Kelola Kelas" />}>
          <ClassManagementSection userId={userId} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Aktivitas Terbaru" />}>
          <RecentActivitySection userId={userId} />
        </Suspense>
      </div>
    </>
  );
}

/**
 * DashboardMainSkeleton - Combined skeleton for initial view
 */
function DashboardMainSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="h-32 rounded-2xl bg-gray-200 animate-pulse w-full"></div>
      <AnnouncementSkeleton />
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SectionSkeleton title="Kelola Kelas" />
        <SectionSkeleton title="Aktivitas Terbaru" />
      </div>
    </div>
  );
}
