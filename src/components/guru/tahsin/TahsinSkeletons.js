import React from 'react';

export function TahsinCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4" />
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-slate-100 rounded w-1/4 mb-3" />
      <div className="h-6 bg-slate-100 rounded-full w-1/2" />
    </div>
  );
}

export function TahsinGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <TahsinCardSkeleton key={i} />
      ))}
    </div>
  );
}
