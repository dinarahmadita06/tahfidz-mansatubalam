'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function TargetHafalanRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - target info now integrated there
    router.replace('/orangtua');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/40 via-amber-50/20 to-cream-50/30">
      <LoadingIndicator text="Mengalihkan..." />
    </div>
  );
}
