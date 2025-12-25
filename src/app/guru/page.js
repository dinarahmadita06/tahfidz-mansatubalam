'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuruPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/guru/dashboard');
  }, [router]);

  return null;
}
