'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PenilaianHafalanRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect from old /orangtua/penilaian-hafalan to new /orangtua/perkembangan-anak
    router.replace('/orangtua/perkembangan-anak');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan ke Perkembangan Anak...</p>
      </div>
    </div>
  );
}
