'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTimeAgo, getActivityIcon } from '@/lib/helpers/activityLoggerV2';
import EmptyState from '@/components/shared/EmptyState';
import IconHint from '@/components/shared/IconHint';

const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';

export default function OrangtuaActivityWidget() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setFilterTrigger] = useState(0);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orangtua/activity/recent?limit=20');
        
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activities', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh filter every 1 minute to remove old activities
  useEffect(() => {
    const interval = setInterval(() => {
      setFilterTrigger(prev => prev + 1);
    }, 60000); // Re-filter every 1 minute
    
    return () => clearInterval(interval);
  }, []);

  // Filter activities: only show items from last 24 hours
  const filtered24h = activities
    .filter((activity) => {
      const createdAt = new Date(activity.createdAt).getTime();
      const now = Date.now();
      return (now - createdAt) <= ONE_DAY_MS;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className={`${CARD_BASE} p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 lg:p-3 bg-blue-100 rounded-lg">
            <Clock className="text-blue-600" size={18} />
          </div>
          <h3 className="text-base lg:text-lg font-bold text-gray-900">Aktivitas Terkini</h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered24h.length === 0 ? (
        <EmptyState
          title="Belum ada aktivitas dalam 24 jam terakhir"
          description="Aktivitas Anda dalam 24 jam terakhir akan muncul di sini."
          icon={Clock}
          className="py-6"
        />
      ) : (
        <div className="space-y-3">
          {filtered24h.map((activity) => {
            const isDashboard = activity.title?.toLowerCase().includes('membuka dashboard');
            const targetUrl = activity.targetUrl || activity.metadata?.path || (activity.metadata ? JSON.parse(activity.metadata).path : null);
            const isNavigable = activity.isNavigable === true || (!!targetUrl && !isDashboard);

            const content = (
              <>
                <span className="flex-shrink-0 text-lg mt-0.5" aria-hidden="true">{getActivityIcon(activity.action)}</span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{activity.description}</p>
                  <time className="text-[10px] text-gray-400 mt-1 block" suppressHydrationWarning>
                    {formatTimeAgo(activity.createdAt)}
                  </time>
                </div>
                {isNavigable && (
                  <IconHint label="Buka" placement="left" showLabel={false}>
                    <ChevronRight size={16} className="text-emerald-500 self-center" aria-hidden="true" />
                  </IconHint>
                )}
              </>
            );

            if (isNavigable && targetUrl) {
              return (
                <button
                  key={activity.id}
                  onClick={() => router.push(targetUrl)}
                  className="w-full flex items-start gap-3 p-3 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-all border border-transparent shadow-sm group"
                  aria-label={`${activity.title} - ${activity.description}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-transparent"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
