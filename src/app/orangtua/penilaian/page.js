'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoadingIndicator from '@/components/shared/LoadingIndicator';

// Redirect from old /orangtua/penilaian to new /orangtua/perkembangan-anak
export default function PenilaianRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/orangtua/perkembangan-anak');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingIndicator text="Mengalihkan..." />
    </div>
  );
}
