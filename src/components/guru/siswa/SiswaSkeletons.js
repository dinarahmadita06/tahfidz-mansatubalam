import React from 'react';
import { PageSkeleton } from '@/components/shared/Skeleton';

export function SiswaStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm h-32"></div>
      ))}
    </div>
  );
}

export function SiswaTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 animate-pulse">
      <div className="p-6 border-b border-slate-100 h-20 bg-slate-50/50"></div>
      <div className="p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-b border-slate-50"></div>
        ))}
      </div>
    </div>
  );
}
