import { auth } from '@/lib/auth';
import SiswaSidebarClient from './SiswaSidebarClient';
import PushNotificationManager from '@/components/shared/PushNotificationManager';

export default async function SiswaLayout({ children }) {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-white">
      <SiswaSidebarClient userName={session?.user?.name || "Siswa"} />

      {/* Main Content Area */}
      <div className="lg:ml-[240px] xl:ml-[260px] transition-all duration-300 pb-safe">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-emerald-100/50">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex justify-end items-center gap-4 h-8 lg:h-9">
              <PushNotificationManager type="header" />
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-10 pt-4 pb-8 min-h-[calc(100vh-4rem)]">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
