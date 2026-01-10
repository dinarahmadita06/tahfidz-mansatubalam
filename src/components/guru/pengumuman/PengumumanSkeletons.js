import React from 'react';

export function AnnouncementCardSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 animate-pulse h-48">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-emerald-50 rounded w-1/4" />
          <div className="h-5 bg-emerald-100 rounded w-3/4" />
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-emerald-50 rounded w-full" />
        <div className="h-4 bg-emerald-50 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between border-t border-emerald-50 pt-4">
        <div className="h-3 bg-emerald-50 rounded w-1/3" />
        <div className="h-5 bg-emerald-50 rounded w-5" />
      </div>
    </div>
  );
}

export function PengumumanGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <AnnouncementCardSkeleton key={i} />
      ))}
    </div>
  );
}
