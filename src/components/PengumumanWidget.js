'use client';

import { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

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

  const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Megaphone size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Megaphone size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>

      {/* Content */}
      {pengumuman.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Tidak ada pengumuman</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pengumuman.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors border border-gray-100 hover:border-emerald-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {item.judul}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {truncateText(item.isi, 80)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      {pengumuman.length > 0 && (
        <Link
          href="/admin/pengumuman"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Lihat Semua Pengumuman
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
