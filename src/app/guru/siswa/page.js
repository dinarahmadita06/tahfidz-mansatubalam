import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaClient from '@/components/guru/siswa/SiswaClient';
import { SiswaStatsSection } from '@/components/guru/siswa/SiswaStatsSection';
import { SiswaTableSection } from '@/components/guru/siswa/SiswaTableSection';
import { SiswaStatsSkeleton, SiswaTableSkeleton } from '@/components/guru/siswa/SiswaSkeletons';

export default async function KelolaSiswaPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || '';
  const kelasId = params.kelasId || '';

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full py-6 space-y-6">
          <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-2xl" />}>
            <SiswaPageContent search={search} kelasId={kelasId} />
          </Suspense>
        </div>
      </div>
    </GuruLayout>
  );
}

async function SiswaPageContent({ search, kelasId }) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'GURU') {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch initial data for the client component (list of classes)
  const kelasDiampu = await prisma.kelas.findMany({
    where: { 
      guruKelas: { 
        some: { 
          guru: { userId: userId },
          isActive: true 
        } 
      } 
    },
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' }
  });

  return (
    <>
      {/* Header & Filter - Client Component */}
      <SiswaClient initialKelas={kelasDiampu} />

      {/* Statistics Section - Suspense */}
      <Suspense fallback={<SiswaStatsSkeleton />}>
        <SiswaStatsSection userId={userId} />
      </Suspense>

      {/* Table Section - Suspense */}
      <Suspense 
        key={`${search}-${kelasId}`} // Key ensures suspense re-triggers on param change
        fallback={<SiswaTableSkeleton />}
      >
        <SiswaTableSection 
          userId={userId} 
          searchTerm={search} 
          selectedKelas={kelasId} 
        />
      </Suspense>
    </>
  );
}
