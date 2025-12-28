'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import './build-marker'; // Force rebuild

// Import dashboard client dengan ssr: false untuk menghindari hydration error
const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat Dashboard...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
