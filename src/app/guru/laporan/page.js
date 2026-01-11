export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Suspense } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { BarChart3 } from 'lucide-react';
import { FilterSection } from '@/components/guru/laporan/LaporanSections';
import { LaporanFilterSkeleton } from '@/components/guru/laporan/LaporanSkeletons';

export default function LaporanGuruPage() {
  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 space-y-6 w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-md p-8 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BarChart3 size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Laporan Hafalan & Kehadiran</h1>
              <p className="text-green-50 text-base md:text-lg mt-2">
                Generate dan unduh laporan hafalan siswa secara terperinci
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section - Streams in classes */}
        <Suspense fallback={<LaporanFilterSkeleton />}>
          <FilterSection />
        </Suspense>
      </div>
    </GuruLayout>
  );
}
