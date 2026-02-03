'use client';

import { memo } from 'react';
import { useSession } from 'next-auth/react';
import SiswaSidebarClient from './SiswaSidebarClient';
import PushNotificationManager from '@/components/shared/PushNotificationManager';
import { useActivityTracking } from '@/hooks/useActivityTracking';

function SiswaLayoutClient({ children }) {
  const { data: session } = useSession();
  useActivityTracking('SISWA');

  return (
    <div className="min-h-screen bg-white">
      <SiswaSidebarClient userName={session?.user?.name || "Siswa"} />

      {/* Main Content Area */}
      <div className="lg:ml-[40px] xl:ml-[60px] transition-all duration-300 pb-safe">
        {/* Header removed - notification icon already in parent layout */}
        
        <main className="flex-1 min-w-0">
          <div className="w-full pt-2 pb-4 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default memo(SiswaLayoutClient);
