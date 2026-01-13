'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Search,
  Calendar,
  X,
  Bell,
  BookOpen,
  Award,
  Star,
} from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import AnnouncementCard from '@/components/shared/AnnouncementCard';
import AnnouncementDetailModal from '@/components/shared/AnnouncementDetailModal';

export default function OrangtuaPengumumanPage() {
  const [pengumuman, setPengumuman] = useState([]);
  const [filteredPengumuman, setFilteredPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  useEffect(() => {
    filterAndSortPengumuman();
  }, [searchQuery, sortOrder, pengumuman]);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pengumuman?limit=100');

      if (!res.ok) {
        throw new Error('Gagal memuat pengumuman');
      }

      const data = await res.json();
      setPengumuman(data.pengumuman || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPengumuman = () => {
    let filtered = [...pengumuman];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.isi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'terbaru' ? dateB - dateA : dateA - dateB;
    });

    setFilteredPengumuman(filtered);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCardClick = (item) => {
    setSelectedPengumuman(item);
    
    // Log activity: Lihat Detail Pengumuman
    try {
      fetch('/api/orangtua/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ORTU_LIHAT_DETAIL_PENGUMUMAN',
          title: 'Melihat Detail Pengumuman',
          description: `Anda melihat detail pengumuman: ${item.judul}`,
          metadata: { pengumumanId: item.id, judul: item.judul }
        })
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  return (
    <OrangtuaLayout>
      {/* Background Gradient - SIMTAQ Style */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full max-w-none py-6 space-y-6">
          {/* Header - SIMTAQ Green Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Megaphone size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Pengumuman</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Informasi dan kabar terbaru untuk orang tua
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter - Compact */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-4">
            <div className="space-y-4">
              {/* Search - Full Width */}
              <div className="w-full">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pengumuman..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                {['terbaru', 'terlama'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortOrder(sort)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                      sortOrder === sort
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white/70 backdrop-blur rounded-2xl border border-white/20 animate-pulse"
                />
              ))}
            </div>
          ) : filteredPengumuman.length === 0 ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 lg:p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <Megaphone className="text-emerald-600" size={48} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Pengumuman'}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Tidak ditemukan pengumuman yang sesuai dengan pencarian'
                  : 'Belum ada pengumuman dari admin'}
              </p>
            </div>
          ) : (
            <>
              {/* Card List - Grid matches Student/Teacher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPengumuman.map((item) => (
                  <AnnouncementCard 
                    key={item.id} 
                    announcement={item} 
                    onClick={() => handleCardClick(item)}
                  />
                ))}
              </div>

              {/* Footer Info */}
              <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                <p className="text-sm text-gray-700">
                  Menampilkan{' '}
                  <span className="font-bold text-emerald-700">{filteredPengumuman.length}</span> dari{' '}
                  <span className="font-bold text-emerald-700">{pengumuman.length}</span> pengumuman
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      <AnnouncementDetailModal
        announcement={selectedPengumuman}
        isOpen={!!selectedPengumuman}
        onClose={() => setSelectedPengumuman(null)}
      />
    </OrangtuaLayout>
  );
}
