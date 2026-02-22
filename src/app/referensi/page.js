'use client';

import QuranReaderPage from '@/components/quran/QuranReaderPage';
import { useSession } from 'next-auth/react';

export default function ReferensiQuran() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return <QuranReaderPage role="guru" userId={userId} />;
}
