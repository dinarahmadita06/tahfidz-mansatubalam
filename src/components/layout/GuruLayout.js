'use client';

import { memo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import PageTransition from '@/components/PageTransition';

function GuruLayout({ children }) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      // Log logout activity
      await fetch('/api/auth/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGOUT' })
      }).catch(err => console.error('Logout activity log failed:', err));
    } finally {
      // Proceed with signOut regardless of logging success
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={session?.user?.name} />

      {/* Main Content with margin for sidebar */}
      <div className="lg:ml-[240px] xl:ml-[260px] transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
                <span className="hidden sm:inline text-sm lg:text-base">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 xl:py-6">
          <div className="max-w-[1200px] xl:max-w-[1400px] mx-auto w-full">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}

export default memo(GuruLayout);
