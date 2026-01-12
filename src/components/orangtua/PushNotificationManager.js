'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Info, AlertTriangle } from 'lucide-react';
import { getPushSubscriptionState, subscribeToPush, unsubscribeFromPush } from '@/lib/push-client';
import toast from 'react-hot-toast';

export default function PushNotificationManager() {
  const [status, setStatus] = useState('loading'); // loading, subscribed, unsubscribed, denied, unsupported
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
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
    </div>
  );
}
