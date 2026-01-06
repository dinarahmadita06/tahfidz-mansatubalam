'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function PenilaianHafalanRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect from old /orangtua/penilaian-hafalan to new /orangtua/perkembangan-anak
    router.replace('/orangtua/perkembangan-anak');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingIndicator text="Mengalihkan..." />
    </div>
  );
}
