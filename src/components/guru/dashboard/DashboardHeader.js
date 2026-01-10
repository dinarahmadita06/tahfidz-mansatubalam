'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { useRouter } from 'next/navigation';

export default function DashboardHeader({ name, greeting, date }) {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    // Simulate a small delay for better UX feedback
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg px-6 py-5 lg:py-6 sm:px-8 sm:py-7 lg:px-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
            Dashboard Guru Tahfidz
          </h1>
          <p className="text-white/90 text-xs lg:text-sm mt-0.5">
            {greeting}, {name} • {date}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold text-xs lg:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          {refreshing ? (
            <LoadingIndicator size="small" text="Memuat..." inline className="text-white" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
