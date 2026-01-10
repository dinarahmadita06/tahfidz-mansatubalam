import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

export function SectionSkeleton({ title }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-50 rounded-xl w-full"></div>
        <div className="h-16 bg-gray-50 rounded-xl w-full"></div>
        <div className="h-16 bg-gray-50 rounded-xl w-full"></div>
      </div>
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100"></div>
        <div className="space-y-2">
          <div className="h-4 bg-amber-100 rounded w-32"></div>
          <div className="h-3 bg-amber-100 rounded w-24"></div>
        </div>
      </div>
      <div className="h-24 bg-white/60 rounded-xl w-full"></div>
    </div>
  );
}
