'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, X } from 'lucide-react';

export default function PasswordChangeSuggestion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Guard: Only show for authenticated users with valid session
    if (status !== 'authenticated' || !session?.user?.id) {
      // Reset modal state if user is not authenticated
      setShowModal(false);
      return;
    }

    // Additional guard: don't show on public/login pages
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const publicPages = ['/', '/login', '/lupa-password'];
      if (publicPages.includes(pathname)) {
        return;
      }
    }

    // Check if already dismissed in this session
    const isDismissed = sessionStorage.getItem('password-suggestion-dismissed');
    
    if (!isDismissed) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, session]);

  const handleDismiss = () => {
    sessionStorage.setItem('password-suggestion-dismissed', 'true');
    setShowModal(false);
  };

  const handleGoToProfile = () => {
    sessionStorage.setItem('password-suggestion-dismissed', 'true');
    setShowModal(false);
    
    // Map redirect path based on role
    const profileMap = {
      ADMIN: '/admin/pengaturan',
      GURU: '/guru/profil',
      SISWA: '/siswa/profil',
      ORANG_TUA: '/orangtua/profil',
    };
    
    const targetPath = profileMap[session?.user?.role] || '/profil';
    router.push(targetPath);
  };

  // Cleanup: Reset body overflow when modal closes or component unmounts
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8 relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner ring-4 ring-emerald-50">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2"> Keamanan Akun </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Untuk keamanan akun Anda, silakan ganti password secara berkala.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleGoToProfile}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Ganti Sekarang
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-semibold text-sm transition-all"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
