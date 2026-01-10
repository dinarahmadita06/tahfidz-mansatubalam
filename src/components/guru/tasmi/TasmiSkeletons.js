import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-12" />
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}

export function TasmiTableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200 bg-slate-100 h-14" />
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-10 bg-slate-100 rounded flex-1" />
            <div className="h-10 bg-slate-100 rounded flex-[2]" />
            <div className="h-10 bg-slate-100 rounded flex-1" />
            <div className="h-10 bg-slate-100 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasmiStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
