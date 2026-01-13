'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Info, AlertTriangle, X } from 'lucide-react';
import { getPushSubscriptionState, subscribeToPush, unsubscribeFromPush } from '@/lib/push-client';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

export default function PushNotificationManager() {
  const [status, setStatus] = useState('loading'); // loading, subscribed, unsubscribed, denied, unsupported
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkStatus();
  }, []);

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
    
    // 1. Browser Support Check
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
        // 2. Permission Check Before Subscribing
        if (Notification.permission === 'denied') {
          setStatus('denied');
          toast.error('Izin notifikasi diblokir browser');
          setIsProcessing(false);
          return;
        }

        await subscribeToPush();
        setStatus('subscribed');
        toast.success('Notifikasi diaktifkan!');

        // 3. Show guide toast if first time
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGuide(false)}>
      <div 
        className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
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
            <p className="text-sm text-emerald-900 leading-relaxed">
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
                  {step}
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

  if (status === 'unsupported') return null;

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/60 p-4 lg:p-5">
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
          <div className="text-[10px] lg:text-xs text-amber-800 leading-relaxed">
            Izin notifikasi diblokir oleh browser. Silakan aktifkan melalui pengaturan situs di browser Anda untuk menerima pemberitahuan.
          </div>
        </div>
      )}

      {status === 'unsubscribed' && (
        <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-start gap-2.5">
          <Info className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
          <div className="text-[10px] lg:text-xs text-emerald-800 leading-relaxed">
            Aktifkan notifikasi untuk mendapatkan info pengumuman dan nilai setoran anak secara real-time.
          </div>
        </div>
      )}

      {/* Guide Modal Portal */}
      {showGuide && mounted && createPortal(<GuideModal />, document.body)}
    </div>
  );
}
