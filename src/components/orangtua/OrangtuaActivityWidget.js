'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/helpers/activityLoggerV2';

const CARD_BASE = 'bg-white rounded-2xl shadow-sm border border-slate-200/60';

export default function OrangtuaActivityWidget() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orangtua/activity/recent');
        
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

  const getActivityIcon = (action) => {
    // Return an icon based on action type
    return '📋';
  };

  return (
    <div className={`${CARD_BASE} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="text-blue-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Aktivitas Terkini</h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-3">
            <Clock className="text-gray-400" size={24} />
          </div>
          <p className="text-sm text-gray-600">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-lg transition-colors border border-gray-100"
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

          <Link
            href="/orangtua/aktivitas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors mt-3"
          >
            Lihat semua aktivitas <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
