'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Megaphone,
  Search,
  Calendar,
  Bell,
  BookOpen,
  Award,
  Loader,
  FileText,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Category icons and colors
const CATEGORY_CONFIG = {
  UMUM: { icon: Bell, color: 'bg-blue-100 text-blue-600', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  AKADEMIK: { icon: BookOpen, color: 'bg-purple-100 text-purple-600', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  KEGIATAN: { icon: Award, color: 'bg-amber-100 text-amber-600', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENTING: { icon: Megaphone, color: 'bg-red-100 text-red-600', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
};

// AnnouncementCard Component
function AnnouncementCard({ announcement }) {
  const categoryData = CATEGORY_CONFIG[announcement.kategori] || CATEGORY_CONFIG.UMUM;
  const CategoryIcon = categoryData.icon;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Category color bar */}
      <div className={`h-1 ${announcement.kategori === 'PENTING' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

      <div className="p-6">
        {/* Header: Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg ${categoryData.color} flex-shrink-0`}>
            <CategoryIcon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
              {announcement.judul}
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${categoryData.badgeColor}`}
            >
              {announcement.kategori}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {truncateText(announcement.isi, 150)}
        </p>

        {/* Footer: Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} className="text-gray-400" />
          <span>{formatDate(announcement.createdAt)}</span>
          {announcement.tanggalSelesai && (
            <>
              <span className="text-gray-300">•</span>
              <span>Hingga {formatDate(announcement.tanggalSelesai)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// EmptyState Component
function AnnouncementEmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-emerald-50 rounded-full">
          <Megaphone className="text-emerald-600" size={48} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Pengumuman</h3>
      <p className="text-gray-500 mb-1">Nantikan kabar terbaru di sini</p>
      <p className="text-sm text-gray-400">
        Admin akan segera mengirimkan informasi penting untuk guru
      </p>
    </div>
  );
}

export default function GuruPengumumanPage() {
  const [pengumuman, setPengumuman] = useState([]);
  const [filteredPengumuman, setFilteredPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  useEffect(() => {
    fetchPengumuman();
  }, []);

  useEffect(() => {
    filterPengumuman();
  }, [searchQuery, filterCategory, pengumuman]);

  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pengumuman?limit=100', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Gagal memuat pengumuman');
      }

      const data = await res.json();

      // Empty array is valid, not an error
      const announcements = data.pengumuman || [];
      setPengumuman(announcements);
      setFilteredPengumuman(announcements);
    } catch (err) {
      console.error('Error fetching pengumuman:', err);
      toast.error('Gagal memuat pengumuman. Coba refresh halaman.');
      setPengumuman([]);
      setFilteredPengumuman([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPengumuman = () => {
    let filtered = pengumuman;

    // Filter by category
    if (filterCategory !== 'Semua') {
      filtered = filtered.filter((p) => p.kategori === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.isi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPengumuman(filtered);
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat pengumuman...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau - Style Tasmi (Responsive) */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Megaphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
                  Pengumuman
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
                  Pantau informasi dan kabar terbaru 
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Search Bar - Full Width */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cari Pengumuman
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengumuman..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Announcement List or Empty State */}
        {filteredPengumuman.length === 0 ? (
          pengumuman.length === 0 ? (
            <AnnouncementEmptyState />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-50 rounded-full">
                  <FileText className="text-gray-400" size={48} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Tidak Ada Hasil
              </h3>
              <p className="text-gray-500">
                Tidak ditemukan pengumuman yang sesuai dengan pencarian atau filter
              </p>
            </div>
          )
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPengumuman.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
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
    </GuruLayout>
  );
}
