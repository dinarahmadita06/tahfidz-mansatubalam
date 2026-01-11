'use client';

import dynamic from 'next/dynamic';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const QuranReaderPage = dynamic(() => import('@/components/quran/QuranReaderPage'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingIndicator text="Memuat Al-Qur'an..." />
    </div>
  ),
  ssr: false
});

export default function ReferensiQuranPage() {
  return <QuranReaderPage role="siswa" noLayout={true} />;
}
