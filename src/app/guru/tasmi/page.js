export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { Medal } from 'lucide-react';
import { StatsSection, TableSection } from '@/components/guru/tasmi/TasmiSections';
import { TasmiStatsSkeleton, TasmiTableSkeleton } from '@/components/guru/tasmi/TasmiSkeletons';

export default function GuruTasmiPage() {
  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header Gradient Hijau */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Medal size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">Tasmi&apos; Al-Qur&apos;an</h1>
                </div>
                <p className="text-green-50 text-lg">Kelola pendaftaran dan penilaian ujian bacaan Al-Qur&apos;an siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <Suspense fallback={<TasmiStatsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* Main Table & Filters */}
        <Suspense fallback={<TasmiTableSkeleton />}>
          <TableSection />
        </Suspense>
      </div>
    </GuruLayout>
  );
}
