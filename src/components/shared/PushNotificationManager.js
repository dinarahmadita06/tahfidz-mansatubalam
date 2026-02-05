'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Info, AlertTriangle, X } from 'lucide-react';
import { getPushSubscriptionState, subscribeToPush, unsubscribeFromPush } from '@/lib/push-client';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

/**
 * PushNotificationManager
 * Handles push notification subscription and display.
 * Supports 'default' (card) and 'header' (bell icon) types.
 */
export default function PushNotificationManager({ type = 'default' }) {
  const [status, setStatus] = useState('loading'); // loading, subscribed, unsubscribed, denied, unsupported
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    
    // Check if added to home screen
    const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    checkStatus();
  }, []);

  // One-time onboarding nudge toast
  useEffect(() => {
    if (mounted && (status === 'unsubscribed' || status === 'denied')) {
      const hasSeenNudge = localStorage.getItem('hasSeenPushNudge');
      if (!hasSeenNudge) {
        const timer = setTimeout(() => {
          toast((t) => (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight">Aktifkan notifikasi biar gak ketinggalan pengumuman.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    localStorage.setItem('hasSeenPushNudge', 'true');
                  }}
                  className="px-2.5 py-1.5 text-gray-400 text-[10px] font-bold hover:text-gray-600 transition-colors"
                >
                  Nanti
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    setShowMainModal(true);
                    localStorage.setItem('hasSeenPushNudge', 'true');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                >
                  Aktifkan
                </button>
              </div>
            </div>
          ), { 
            duration: 10000, 
            position: 'top-center',
            style: {
              borderRadius: '1.25rem',
              background: '#fff',
              color: '#333',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
              padding: '12px 16px',
              maxWidth: '400px'
            }
          });
        }, 3000); // 3s after dashboard load
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, status]);

  const checkStatus = async () => {
    try {
      const state = await getPushSubscriptionState();
      setStatus(state);
    } catch (error) {
      console.error('Error checking push status:', error);
      setStatus('unsupported');
    }
  };

  const handleToggle = async () => {
    if (isProcessing) return;
    
    if (typeof window !== 'undefined') {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Browser ini tidak mendukung notifikasi');
        setStatus('unsupported');
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (status === 'subscribed') {
        await unsubscribeFromPush();
        setStatus('unsubscribed');
        toast.success('Notifikasi dinonaktifkan');
      } else {
        if (Notification.permission === 'denied') {
          setStatus('denied');
          toast.error('Izin notifikasi diblokir browser');
          setIsProcessing(false);
          return;
        }

        await subscribeToPush();
        setStatus('subscribed');
        toast.success('Notifikasi diaktifkan!');

        // Show guide toast if first time
        const hasSeenGuide = localStorage.getItem('hasSeenPushPopupGuide');
        if (!hasSeenGuide) {
          toast((t) => (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Push aktif. Lihat panduan pop-up?</p>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setShowGuide(true);
                  localStorage.setItem('hasSeenPushPopupGuide', 'true');
                }}
                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Lihat
              </button>
            </div>
          ), { duration: 6000, position: 'bottom-center' });
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengatur notifikasi';
      if (Notification.permission === 'denied') {
        setStatus('denied');
        toast.error('Izin notifikasi ditolak');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const GuideModal = () => (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={() => setShowGuide(false)}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))'
      }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: 'calc(90vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
          overflowY: 'auto',
          wordBreak: 'break-word'
        }}
      >
        <button 
          onClick={() => setShowGuide(false)}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Panduan Notifikasi</h3>
            <p className="text-xs text-gray-500">Optimalkan tampilan notifikasi di HP</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <p className="text-sm text-emerald-900 leading-relaxed break-words">
              Agar notifikasi muncul sebagai <b>Pop-up (Heads-up)</b> dan tidak hanya di tray, ikuti langkah berikut:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Tap & tahan icon Chrome / Aplikasi SIMTAQ",
                "Pilih 'Info Aplikasi' → 'Notifikasi'",
                "Cari kategori notifikasi dan set ke 'Alerting/High'",
                "Aktifkan opsi 'Pop on screen' atau 'Tampilkan sebagai banner'"
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-emerald-800">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 break-words">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setShowGuide(false)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200/50"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );

  const MainModal = () => (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => setShowMainModal(false)}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))'
      }}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: 'calc(90vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom, 0px)))',
          wordBreak: 'break-word'
        }}
      >
        <button 
          onClick={() => setShowMainModal(false)}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            status === 'subscribed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {status === 'subscribed' ? <Bell size={28} /> : <BellOff size={28} />}
          </div>
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Pengaturan Notifikasi</h3>
            <p className="text-sm text-gray-500">
              {status === 'subscribed' 
                ? 'Notifikasi aktif di perangkat ini' 
                : status === 'denied' 
                  ? 'Izin notifikasi diblokir browser' 
                  : 'Aktifkan untuk info pengumuman real-time'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-bold text-gray-900 text-sm lg:text-base">Push Notifikasi</p>
                <p className="text-[10px] lg:text-xs text-gray-500">Update pengumuman & kegiatan</p>
              </div>
              <button
                onClick={handleToggle}
                disabled={isProcessing}
                className={`px-5 py-2 lg:px-6 lg:py-2.5 rounded-2xl text-xs lg:text-sm font-bold transition-all shadow-sm ${
                  status === 'subscribed'
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Memproses...' : status === 'subscribed' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>

            {status === 'subscribed' && (
              <button 
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors py-2"
              >
                <Info size={16} />
                Lihat Panduan Pop-up
              </button>
            )}
          </div>

          {status === 'denied' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-800 leading-relaxed break-words">
                Izin notifikasi diblokir. Silakan aktifkan melalui pengaturan situs di browser Anda untuk menerima pemberitahuan.
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={() => setShowMainModal(false)}
              className="text-gray-500 font-semibold text-sm hover:text-gray-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (status === 'unsupported') {
    if (isIOS && !isStandalone) {
      return (
        <div 
          className="bg-amber-50 rounded-2xl border border-amber-200 mb-6"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
            paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 1.25rem)',
            paddingRight: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
            minHeight: 'auto',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-amber-900 leading-snug">Push Notifikasi di iOS</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed break-words">
                Untuk mengaktifkan notifikasi di iPhone/iPad, silakan tambahkan aplikasi ini ke <b>Layar Utama (Home Screen)</b> terlebih dahulu melalui menu <b>Bagikan (Share)</b> di browser Safari.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (type === 'header') {
    return (
      <div className="relative flex items-center">
        <button
          onClick={() => setShowMainModal(true)}
          className={`relative p-2 rounded-xl transition-all duration-300 group ${
            status === 'subscribed' 
              ? 'text-slate-500 hover:bg-slate-100' 
              : 'text-slate-400 hover:bg-slate-100'
          }`}
          title={status === 'subscribed' ? 'Notifikasi: Aktif' : 'Aktifkan notifikasi'}
        >
          <Bell size={20} className={status === 'subscribed' ? 'fill-slate-500/10' : ''} />
          
          {/* Status Badge - Contrast Orange */}
          {status !== 'subscribed' && status !== 'loading' && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse shadow-sm shadow-orange-200"></span>
          )}

          {/* Tooltip Label - Actionable */}
          {status !== 'subscribed' && status !== 'loading' && (
            <span className="absolute top-full mt-2 right-0 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 pointer-events-none shadow-xl z-50">
              Aktifkan notifikasi agar pengumuman langsung muncul
            </span>
          )}
        </button>

        {/* Modal Portals */}
        {showMainModal && mounted && createPortal(<MainModal />, document.body)}
        {showGuide && mounted && createPortal(<GuideModal />, document.body)}
      </div>
    );
  }

  if (type === 'nudge') {
    if (status === 'subscribed' || status === 'loading' || status === 'unsupported') return null;
    return (
      <>
        <button
          onClick={() => setShowMainModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold hover:bg-amber-200 transition-all border border-amber-200/50 shadow-sm animate-in fade-in zoom-in duration-300"
        >
          <Bell size={12} className="animate-bounce" />
          Aktifkan
        </button>
        {showMainModal && mounted && createPortal(<MainModal />, document.body)}
        {showGuide && mounted && createPortal(<GuideModal />, document.body)}
      </>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/60 p-4 lg:p-5 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            status === 'subscribed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {status === 'subscribed' ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h3 className="text-sm lg:text-base font-bold text-gray-900">Push Notifikasi</h3>
            <p className="text-[10px] lg:text-xs text-gray-500">
              {status === 'subscribed' 
                ? 'Status: Aktif' 
                : status === 'denied' 
                  ? 'Status: Diblokir' 
                  : 'Status: Nonaktif'}
            </p>
            {status === 'subscribed' && (
              <button 
                onClick={() => setShowGuide(true)}
                className="mt-1 flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-[10px] lg:text-xs transition-colors"
              >
                <Info size={12} />
                Panduan pop-up
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isProcessing || status === 'loading'}
          className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all shadow-sm ${
            status === 'subscribed'
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? 'Memproses...' : status === 'subscribed' ? 'Nonaktifkan' : 'Aktifkan Notifikasi'}
        </button>
      </div>

      {status === 'denied' && (
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
          <div className="text-[10px] lg:text-xs text-amber-800 leading-relaxed break-words flex-1">
            Izin notifikasi diblokir oleh browser. Silakan aktifkan melalui pengaturan situs di browser Anda untuk menerima pemberitahuan.
          </div>
        </div>
      )}

      {status === 'unsubscribed' && (
        <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-start gap-2.5">
          <Info className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
          <div className="text-[10px] lg:text-xs text-amber-800 leading-relaxed break-words flex-1">
            Aktifkan notifikasi untuk mendapatkan info pengumuman terbaru secara real-time.
          </div>
        </div>
      )}

      {/* Guide Modal Portal */}
      {showGuide && mounted && createPortal(<GuideModal />, document.body)}
    </div>
  );
}
