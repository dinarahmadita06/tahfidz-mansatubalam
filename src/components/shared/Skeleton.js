'use client';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-emerald-100/50 ${className}`}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-emerald-100/40">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-8 w-1/2 max-w-[200px]" />
          <Skeleton className="h-4 w-3/4 max-w-[300px]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Content Area */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-emerald-100/40">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 lg:p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
