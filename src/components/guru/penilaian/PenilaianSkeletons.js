import React from 'react';

export function ClassCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-slate-200 mx-auto mb-3" />
      <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto mb-3" />
      <div className="h-10 bg-slate-100 rounded-xl w-32 mx-auto" />
    </div>
  );
}

export function PenilaianSectionSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-12 bg-slate-200 rounded-2xl w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <ClassCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
