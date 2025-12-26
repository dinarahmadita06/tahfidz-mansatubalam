'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TargetHafalanRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - target info now integrated there
    router.replace('/orangtua');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/40 via-amber-50/20 to-cream-50/30">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan ke Dashboard...</p>
      </div>
    </div>
  );
}
