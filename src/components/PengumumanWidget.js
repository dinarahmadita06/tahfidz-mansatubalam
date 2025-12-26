'use client';

import { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, Calendar, X, Bell, BookOpen, Award, Star } from 'lucide-react';
import Link from 'next/link';

// Category icons
const CATEGORY_ICONS = {
  UMUM: Bell,
  AKADEMIK: BookOpen,
  KEGIATAN: Star,
  PENTING: Award,
};

export default function PengumumanWidget({ title = "Pengumuman Terbaru", limit = 3 }) {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch latest announcements, sorted by newest first
      const res = await fetch(`/api/pengumuman?limit=${limit}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPengumuman(data.pengumuman || []);
    } catch (err) {
      console.error('Error fetching pengumuman:', err);
      setError(`Gagal memuat pengumuman: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text, length = 80) => {
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
    return CATEGORY_ICONS[kategori] || CATEGORY_ICONS.UMUM;
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Megaphone size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Megaphone size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Megaphone size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <Link
          href="/siswa/pengumuman"
          className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Lihat Semua
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Content */}
      {pengumuman.length === 0 ? (
        <div className="text-center py-8 px-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
          <div className="inline-flex p-3 bg-emerald-100 rounded-full mb-3">
            <Megaphone size={24} className="text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium">Belum ada pengumuman</p>
          <p className="text-gray-500 text-xs mt-1">Nantikan kabar terbaru dari admin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pengumuman.map((item) => {
            const CategoryIcon = getCategoryIcon(item.kategori);

            return (
              <Link
                key={item.id}
                href="/siswa/pengumuman"
                className="block p-4 bg-white rounded-lg hover:bg-emerald-50/50 transition-all border border-gray-100 hover:border-emerald-200 hover:shadow-md group"
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <CategoryIcon size={16} className="text-emerald-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {item.judul}
                      </h4>
                      {isNew(item.createdAt) && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                          Baru
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                      {truncateText(item.isi, 100)}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{formatDate(item.createdAt)}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        {item.kategori}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer - View All Link (Mobile) */}
      {pengumuman.length > 0 && (
        <Link
          href="/siswa/pengumuman"
          className="mt-4 block w-full py-2.5 text-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Lihat Semua Pengumuman →
        </Link>
      )}
    </div>
  );
}
