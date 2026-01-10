'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuruDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/guru');
  }, [router]);

  return null;
}
