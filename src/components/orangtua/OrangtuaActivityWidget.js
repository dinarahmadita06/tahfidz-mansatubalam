'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo, getActivityIcon } from '@/lib/helpers/activityLoggerV2';
import EmptyState from '@/components/shared/EmptyState';

const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';

export default function OrangtuaActivityWidget() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orangtua/activity/recent?limit=5');
        
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
      ) : activities.length === 0 ? (
        <EmptyState
          title="Belum ada aktivitas"
          description="Aktivitas Anda akan muncul di sini."
          icon={Clock}
          className="py-6"
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2.5 bg-gray-50 hover:bg-amber-50/50 rounded-lg transition-colors border border-gray-100"
            >
              <span className="flex-shrink-0 text-lg mt-0.5">{getActivityIcon(activity.action)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{activity.description}</p>
              </div>
              <time className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                {formatTimeAgo(activity.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
