import { Suspense } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { Volume2 } from 'lucide-react';
import { TahsinGridSection } from '@/components/guru/tahsin/TahsinSections';
import { TahsinGridSkeleton } from '@/components/guru/tahsin/TahsinSkeletons';

// TahsinHeader Component
function TahsinHeader() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
              Pencatatan Tahsin
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
              Pencatatan progres bacaan dan latihan tajwid siswa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TahsinIndexPage() {
  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 space-y-6 w-full">
        {/* Header */}
        <TahsinHeader />

        {/* Grid Card Kelas */}
        <Suspense fallback={<TahsinGridSkeleton />}>
          <TahsinGridSection />
        </Suspense>
      </div>
    </GuruLayout>
  );
}
