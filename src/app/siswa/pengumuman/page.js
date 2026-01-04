'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Search,
  Calendar,
  Clock,
  X,
  Bell,
  BookOpen,
  Award,
  Star,
} from 'lucide-react';
import SiswaLayout from '@/components/layout/SiswaLayout';

// Category config
const CATEGORY_CONFIG = {
  UMUM: { icon: Bell, color: 'bg-blue-100 text-blue-600' },
  AKADEMIK: { icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
  KEGIATAN: { icon: Star, color: 'bg-amber-100 text-amber-600' },
  PENTING: { icon: Award, color: 'bg-red-100 text-red-600' },
};

export default function SiswaPengumumanPage() {
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

  const truncateText = (text, length = 120) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const isNew = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays < 3;
  };

  const getCategoryIcon = (kategori) => {
    return CATEGORY_CONFIG[kategori] || CATEGORY_CONFIG.UMUM;
  };

  return (
    <SiswaLayout>
      {/* Background Gradient - SIMTAQ Style */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 py-6 space-y-6">
          {/* Header - SIMTAQ Green Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Megaphone size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Pengumuman</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Informasi dan kabar terbaru dari sekolah
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
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-white/70 backdrop-blur rounded-2xl border border-white/20 animate-pulse"
                />
              ))}
            </div>
          ) : filteredPengumuman.length === 0 ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-12 text-center">
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
              {/* Card List */}
              <div className="space-y-4">
                {filteredPengumuman.map((item) => {
                  const categoryData = getCategoryIcon(item.kategori);
                  const CategoryIcon = categoryData.icon;

                  return (
                    <div
                      key={item.id}
                      className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPengumuman(item)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${categoryData.color} flex-shrink-0`}>
                          <CategoryIcon size={24} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                              {item.judul}
                            </h3>
                            {isNew(item.createdAt) && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                                Baru
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {truncateText(item.isi, 150)}
                          </p>

                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={16} />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                              {item.kategori}
                            </span>
                          </div>

                          <button className="mt-3 text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1">
                            Lihat Detail →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      {selectedPengumuman && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedPengumuman.judul}
                </h2>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>{formatDate(selectedPengumuman.createdAt)}</span>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    {selectedPengumuman.kategori}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPengumuman(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="prose prose-emerald max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPengumuman.isi}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </SiswaLayout>
  );
}
