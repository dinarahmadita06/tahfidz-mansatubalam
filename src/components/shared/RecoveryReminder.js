'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, X } from 'lucide-react';

export default function RecoveryReminder() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // GUARD: Only show for authenticated users
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }

    // Don't show on public pages or profile pages (user already there)
    const skipPages = ['/', '/login', '/lupa-password', '/admin/profile', '/admin/pengaturan', '/guru/profil', '/siswa/profil', '/orangtua/profil'];
    if (skipPages.includes(pathname)) {
      return;
    }

    // Check if recovery code setup but not yet finalized (edge case)
    if (session.user.isRecoveryCodeSetup === false) {
      // Don't show banner, the modal will handle it
      return;
    }

    // Check if banner was dismissed today
    const dismissedDate = sessionStorage.getItem('recovery-reminder-dismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      return; // Already dismissed today
    }

    // For demonstration: show banner if recovery setup is done but user might want to check status
    // In production, you might want to check additional flags from backend
    // For now, we won't show the banner to avoid spam
    // setShowBanner(true); // Uncomment if you want to show reminder
  }, [session, status, pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem('recovery-reminder-dismissed', new Date().toDateString());
    setShowBanner(false);
  };

  const handleGoToProfile = () => {
    handleDismiss();
    
    const profileMap = {
      ADMIN: '/admin/pengaturan',
      GURU: '/guru/profil',
      SISWA: '/siswa/profil',
      ORANG_TUA: '/orangtua/profil',
    };
    
    const targetPath = profileMap[session?.user?.role] || '/profil';
    router.push(targetPath);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <ShieldAlert size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-amber-900 text-sm mb-1">Recovery Code Anda</h3>
          <p className="text-amber-700 text-xs leading-relaxed mb-3">
            Pastikan Anda sudah menyimpan Recovery Code untuk keamanan akun.
          </p>
          <button
            onClick={handleGoToProfile}
            className="text-amber-600 hover:text-amber-700 text-xs font-bold underline"
          >
            Cek Status di Profil →
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
