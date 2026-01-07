'use client';

import { SWRConfig } from 'swr';

// Fetcher function untuk SWR
const fetcher = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export default function SWRProvider({ children }) {
  // Global state untuk tracking waktu focus terakhir
  // Menggunakan global variable karena SWRProvider sering di-render ulang
  if (typeof window !== 'undefined' && !window._simtaqLastFocusAt) {
    window._simtaqLastFocusAt = Date.now();
  }

  return (
    <SWRConfig
      value={{
        fetcher,
        // Revalidate otomatis saat window focus - dengan aturan smart
        revalidateOnFocus: (data, key, config) => {
          if (typeof window === 'undefined') return false;
          
          const now = Date.now();
          const lastFocus = window._simtaqLastFocusAt || now;
          window._simtaqLastFocusAt = now;

          // Jika user meninggalkan tab < 60 detik, jangan revalidate
          const timeSinceLastFocus = (now - lastFocus) / 1000;
          
          if (timeSinceLastFocus < 60) {
            return false;
          }

          // Jika >= 60 detik, boleh revalidate (silent refresh)
          return true;
        },
        // Revalidate otomatis saat reconnect
        revalidateOnReconnect: false, // Di-disable sesuai request agar tidak mengganggu
        // Dedupe requests dalam 5 detik (ditingkatkan dari 2s)
        dedupingInterval: 5000,
        // Refresh interval di-disable (jangan auto refresh setiap 30 detik tanpa aktivitas)
        refreshInterval: 0,
        // Fokus throttle untuk menghindari request berlebihan
        focusThrottleInterval: 60000, // Minimal 60 detik antar focus revalidation
        // Error retry dengan exponential backoff
        errorRetryCount: 2,
        errorRetryInterval: 5000,
        // Keep data saat error
        shouldRetryOnError: true,
        // Cache provider (default in-memory)
        provider: () => new Map(),
        // Loading timeout
        loadingTimeout: 3000,
        // Optimistic UI updates
        compare: (a, b) => {
          // Custom comparison untuk menghindari unnecessary re-render
          return JSON.stringify(a) === JSON.stringify(b);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
