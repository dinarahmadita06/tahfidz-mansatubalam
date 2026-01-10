import { Suspense } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { Megaphone } from 'lucide-react';
import { ListSection } from '@/components/guru/pengumuman/PengumumanSections';
import { PengumumanGridSkeleton } from '@/components/guru/pengumuman/PengumumanSkeletons';

// PengumumanHeader Component
function PengumumanHeader() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Megaphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
              Pengumuman
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
              Pantau informasi dan kabar terbaru dari sekolah
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuruPengumumanPage() {
  return (
    <GuruLayout>
      <div className="space-y-6 py-6">
        {/* Header */}
        <PengumumanHeader />

        {/* List Section - Streams in */}
        <Suspense fallback={<PengumumanGridSkeleton />}>
          <ListSection />
        </Suspense>
      </div>
    </GuruLayout>
  );
}
