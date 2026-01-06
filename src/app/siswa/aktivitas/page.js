/**
 * Siswa Activity Log Page - Full activity history
 */

'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { getActivityDisplay, isViewEvent, isSystemEvent, isActionEvent } from '@/lib/helpers/siswaActivityConstants';
import { Clock, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export default function AktivitasPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('semua'); // semua, views, actions, system
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/siswa/activity/recent?limit=100');

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('[AktivitasPage] Error fetching activities:', err);
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities based on filter type
  let filteredActivities = activities;

  if (filter === 'views') {
    filteredActivities = activities.filter(a => isViewEvent(a.action));
  } else if (filter === 'actions') {
    filteredActivities = activities.filter(a => isActionEvent(a.action));
  } else if (filter === 'system') {
    filteredActivities = activities.filter(a => isSystemEvent(a.action));
  }

  // Further filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredActivities = filteredActivities.filter(
      a => a.title.toLowerCase().includes(query) || 
           a.description.toLowerCase().includes(query)
    );
  }

  return (
    <SiswaLayout>
      <div className="w-full space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Clock size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Riwayat Aktivitas</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Semua aktivitas Anda di aplikasi SIMTAQ
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('semua')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'semua'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua ({activities.length})
              </button>
              <button
                onClick={() => setFilter('views')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'views'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Menu View ({activities.filter(a => isViewEvent(a.action)).length})
              </button>
              <button
                onClick={() => setFilter('actions')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'actions'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aksi ({activities.filter(a => isActionEvent(a.action)).length})
              </button>
              <button
                onClick={() => setFilter('system')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'system'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sistem ({activities.filter(a => isSystemEvent(a.action)).length})
              </button>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
              {loading ? (
                <div className="py-12">
                  <LoadingIndicator text="Memuat riwayat aktivitas..." />
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-red-600 mb-2">⚠️ Gagal memuat aktivitas</p>
                  <p className="text-xs text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={fetchAllActivities}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600 font-medium">Tidak ada aktivitas</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada aktivitas untuk kategori ini.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredActivities.map((activity) => {
                    const display = getActivityDisplay(activity.action);
                    const filterType = isViewEvent(activity.action)
                      ? 'Menu View'
                      : isActionEvent(activity.action)
                      ? 'Aksi'
                      : 'Sistem';

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0 pt-0.5">{display.icon}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                            </div>
                            <span className="flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
                              {filterType}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(activity.createdAt).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link
              href="/siswa"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
    </SiswaLayout>
  );
}
