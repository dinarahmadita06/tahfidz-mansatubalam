'use client';

import { memo } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
      <Sidebar userName={session?.user?.name} onLogout={handleLogout} />

      {/* Main Content with margin for sidebar */}
      <div className="lg:ml-[240px] xl:ml-[260px] transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex justify-end">
              {/* Logout button removed - moved to sidebar */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full px-4 sm:px-6 lg:px-10 py-4 lg:py-6">
          <div className="w-full">
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
