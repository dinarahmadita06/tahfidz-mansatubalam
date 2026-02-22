'use client';

import QuranReaderPage from '@/components/quran/QuranReaderPage';
import { useSession } from 'next-auth/react';

export default function ReferensiQuranPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return <QuranReaderPage role="siswa" userId={userId} />;
}
