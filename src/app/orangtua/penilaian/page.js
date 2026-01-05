'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect from old /orangtua/penilaian to new /orangtua/perkembangan-anak
export default function PenilaianRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/orangtua/perkembangan-anak');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan ke Perkembangan Anak...</p>
      </div>
    </div>
  );
}
