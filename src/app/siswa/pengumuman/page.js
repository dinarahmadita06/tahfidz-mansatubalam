'use client';

import { useState, useEffect } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
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
import AnnouncementCard from '@/components/shared/AnnouncementCard';
import AnnouncementDetailModal from '@/components/shared/AnnouncementDetailModal';

// EmptyState Component (identik dengan Guru)
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
        Admin akan segera mengirimkan informasi penting untuk Anda
      </p>
    </div>
  );
}

export default function SiswaPengumumanPage() {
  const [pengumuman, setPengumuman] = useState([]);
  const [filteredPengumuman, setFilteredPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  useEffect(() => {
    filterPengumuman();
  }, [searchQuery, pengumuman]);

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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator text="Memuat pengumuman..." />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau - Style identik dengan Guru (Responsive) */}
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

        {/* Filter Section - identik dengan Guru */}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-12 text-center">
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
            {/* Grid Layout - identik dengan Guru (2 columns pada desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPengumuman.map((announcement) => (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement} 
                  onClick={() => setSelectedAnnouncement(announcement)}
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

      {/* Modal Detail */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </>
  );
}
