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
  return (
    <SWRConfig
      value={{
        fetcher,
        // Revalidate otomatis saat window focus
        revalidateOnFocus: true,
        // Revalidate otomatis saat reconnect
        revalidateOnReconnect: true,
        // Dedupe requests dalam 2 detik
        dedupingInterval: 2000,
        // Refresh setiap 30 detik untuk data real-time
        refreshInterval: 30000,
        // Fokus throttle untuk menghindari request berlebihan
        focusThrottleInterval: 5000,
        // Error retry dengan exponential backoff
        errorRetryCount: 3,
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
