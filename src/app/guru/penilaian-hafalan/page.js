import { Suspense } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { BookOpen, AlertCircle } from 'lucide-react';
import { BinaanSection, SemuaSection } from '@/components/guru/penilaian/PenilaianSections';
import { PenilaianSectionSkeleton } from '@/components/guru/penilaian/PenilaianSkeletons';

// HeaderSection Component
function HeaderSection() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Penilaian Hafalan
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-1">
            Pilih kelas untuk melihat dan menilai hafalan siswa
          </p>
        </div>
      </div>
    </div>
  );
}

// SectionTitle Component
function SectionTitle({ children, description, badge }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-slate-800">
          {children}
        </h2>
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

// SectionWrapper Component
function SectionWrapper({ children, highlight = false }) {
  if (!highlight) return <div>{children}</div>;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
      {children}
    </div>
  );
}

// TipsAlert Component
function TipsAlert({ children }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-emerald-800 text-sm flex items-start gap-3">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}

// Main Component
export default function PenilaianHafalanIndexPage() {
  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 space-y-6 w-full">
        {/* Header */}
        <HeaderSection />

        {/* Section 1: Kelas Binaan */}
        <SectionWrapper highlight={true}>
          <SectionTitle
            description="Kelas yang telah ditetapkan oleh Admin untuk Anda"
            badge="Kelas utama yang Anda bimbing"
          >
            Kelas Binaan Saya
          </SectionTitle>

          <Suspense fallback={<PenilaianSectionSkeleton />}>
            <BinaanSection />
          </Suspense>
        </SectionWrapper>

        {/* Divider */}
        <div className="border-t border-emerald-100 my-6"></div>

        {/* Section 2: Semua Kelas (Collapsible handled by client component inside) */}
        <Suspense fallback={<PenilaianSectionSkeleton />}>
          <SemuaSection />
        </Suspense>

        {/* Tips */}
        <TipsAlert>
          <strong>Tips:</strong> Kelas binaan adalah kelas yang telah ditetapkan oleh Admin untuk Anda.
        </TipsAlert>
      </div>
    </GuruLayout>
  );
}
