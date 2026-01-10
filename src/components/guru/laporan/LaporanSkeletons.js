import React from 'react';

export function LaporanFilterSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded w-full" />
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <div className="h-12 bg-emerald-100 rounded-lg w-48" />
        <div className="h-12 bg-gray-100 rounded-lg w-48" />
      </div>
    </div>
  );
}

export function LaporanContentSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-50 rounded-lg w-full" />
        ))}
      </div>
    </div>
  );
}
