'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /admin to /admin/dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
      <LoadingIndicator text="Redirecting..." />
    </div>
  );
}
