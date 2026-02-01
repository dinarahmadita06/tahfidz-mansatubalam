'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Download, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function RecoverySetupTrigger() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // GUARD: Only show for authenticated users with valid session
    if (status !== 'authenticated' || !session?.user?.id) {
      setShowModal(false);
      return;
    }

    // GUARD: Don't show on public/login pages
    const publicPages = ['/', '/login', '/lupa-password', '/reset-password'];
    if (publicPages.includes(pathname)) {
      return;
    }

    // TRIGGER: Show modal if recovery code not setup yet
    if (session.user.isRecoveryCodeSetup === false && !showModal && !recoveryCode) {
      setShowModal(true);
      generateCode();
    }
  }, [session, status, showModal, recoveryCode, pathname]);

  // Cleanup: Reset body overflow when modal closes or component unmounts
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/setup-recovery', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRecoveryCode(data.recoveryCode);
      }
    } catch (err) {
      console.error('Failed to generate recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryCard = () => {
    const content = `KARTU RECOVERY SIMTAQ

Username: ${session?.user?.username || 'User'}
Name: ${session?.user?.name || ''}
Recovery Code: ${recoveryCode}

SIMPAN KODE INI DENGAN AMAN.
KODE INI ADALAH SATU-SATUNYA CARA UNTUK MERESET PASSWORD ANDA JIKA LUPA.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RecoveryCard_${session?.user?.username || 'SIMTAQ'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      // Send acknowledgement to backend
      const res = await fetch('/api/user/recovery-ack', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        throw new Error('Failed to acknowledge recovery code');
      }

      // Update local session state
      await update({
        ...session,
        user: {
          ...session.user,
          isRecoveryCodeSetup: true
        }
      });

      // Close modal after successful acknowledgement
      setShowModal(false);
    } catch (err) {
      console.error('Failed to confirm recovery setup:', err);
      alert('Gagal menyimpan konfirmasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Hard Gate Modal - No close button, must acknowledge */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Amankan Akun Anda</h2>
          <p className="text-emerald-50 text-xs mt-2 opacity-90">
            SIMTAQ kini menggunakan Recovery Code untuk lupa password.
          </p>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Ini adalah <b>satu-satunya</b> cara untuk mereset password Anda jika lupa. Simpan kode ini di tempat yang aman.
            </p>
          </div>

          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 mb-6 group relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-2">
                <Loader2 className="animate-spin text-emerald-600 mb-2" size={24} />
                <span className="text-xs text-gray-400 font-medium">Menyiapkan kode...</span>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Recovery Code (9 Digit)</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-2xl font-mono font-bold text-gray-900 tracking-[0.2em]">
                    {recoveryCode}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-400 hover:text-emerald-600"
                    title="Salin Kode"
                  >
                    {copied ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Copy size={20} />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadRecoveryCard}
              className="w-full border border-emerald-600 text-emerald-600 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
            >
              <Download size={18} />
              Download Kartu Recovery
            </button>

            <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer group active:scale-[0.99] transition-transform">
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-[11px] text-amber-800 font-medium leading-tight">
                Saya sudah menyimpan Recovery Code ini dan memahami bahwa tanpa kode ini saya tidak bisa mereset password.
              </span>
            </label>

            <button
              disabled={!confirmed || loading}
              onClick={handleConfirm}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale font-bold text-sm shadow-lg shadow-emerald-100 mt-2"
            >
              Saya Sudah Simpan, Lanjut ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
