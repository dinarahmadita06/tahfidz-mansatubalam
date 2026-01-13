'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Info, AlertTriangle } from 'lucide-react';
import { getPushSubscriptionState, subscribeToPush, unsubscribeFromPush } from '@/lib/push-client';
import toast from 'react-hot-toast';

export default function PushNotificationManager() {
  const [status, setStatus] = useState('loading'); // loading, subscribed, unsubscribed, denied, unsupported
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check for iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    
    // Check if added to home screen
    const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

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

  if (status === 'unsupported') {
    if (isIOS && !isStandalone) {
      return (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 lg:p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Push Notifikasi di iOS</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Untuk mengaktifkan notifikasi di iPhone/iPad, silakan tambahkan aplikasi ini ke <b>Layar Utama (Home Screen)</b> terlebih dahulu melalui menu <b>Bagikan (Share)</b> di browser Safari.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
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

      {status === 'subscribed' && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
          <Info className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
          <div className="text-[10px] lg:text-xs text-emerald-800 leading-relaxed">
            <p className="font-bold mb-1 text-emerald-900 text-xs">Tips Notifikasi Muncul Pop-up:</p>
            Jika notifikasi hanya muncul di tray, aktifkan <b>Pop on screen / High priority</b> di pengaturan HP:
            <ul className="mt-1 list-disc list-inside space-y-0.5 opacity-90">
              <li>Tap & tahan notifikasi/icon Chrome</li>
              <li>Pilih Info Aplikasi → Notifikasi</li>
              <li>Set kategori ke <b>Alerting/High</b></li>
              <li>Aktifkan <b>Pop on screen</b></li>
            </ul>
          </div>
        </div>
      )}

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
          <div className="text-[10px] lg:text-xs text-amber-800 leading-relaxed">
            Aktifkan notifikasi untuk mendapatkan info pengumuman terbaru secara real-time.
          </div>
        </div>
      )}
    </div>
  );
}
