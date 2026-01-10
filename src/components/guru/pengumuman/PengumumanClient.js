'use client';

import { useState, useMemo } from 'react';
import { Search, Megaphone, FileText, X, Calendar } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AnnouncementCard from '@/components/shared/AnnouncementCard';

// Detail Modal Component
function AnnouncementDetailModal({ announcement, isOpen, onClose }) {
  if (!isOpen || !announcement) return null;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold">{announcement.judul}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dates */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={18} className="text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Tanggal Dibuat</p>
                <p className="font-semibold text-gray-900">{formatDate(announcement.createdAt)}</p>
              </div>
            </div>
            {announcement.tanggalSelesai && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={18} className="text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Tanggal Akhir</p>
                  <p className="font-semibold text-gray-900">{formatDate(announcement.tanggalSelesai)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Deskripsi</p>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {announcement.isi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// EmptyState Component
function AnnouncementEmptyState({ isSearch }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-emerald-50 rounded-full">
          {isSearch ? <FileText className="text-gray-400" size={48} /> : <Megaphone className="text-emerald-600" size={48} />}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        {isSearch ? 'Tidak Ada Hasil' : 'Belum Ada Pengumuman'}
      </h3>
      <p className="text-gray-500">
        {isSearch 
          ? 'Tidak ditemukan pengumuman yang sesuai dengan pencarian Anda' 
          : 'Nantikan kabar terbaru di sini'}
      </p>
    </div>
  );
}

export default function PengumumanClient({ initialPengumuman }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPengumuman = useMemo(() => {
    if (!searchQuery.trim()) return initialPengumuman;
    
    const query = searchQuery.toLowerCase();
    return initialPengumuman.filter(p => 
      p.judul.toLowerCase().includes(query) || 
      p.isi.toLowerCase().includes(query)
    );
  }, [initialPengumuman, searchQuery]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 200);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <label className="block text-sm font-semibold text-emerald-900 mb-2">
          Cari Pengumuman
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-emerald-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik judul atau isi pengumuman..."
            className="w-full pl-10 pr-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Grid Layout or Empty State */}
      {filteredPengumuman.length === 0 ? (
        <AnnouncementEmptyState isSearch={initialPengumuman.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPengumuman.map((announcement) => (
            <AnnouncementCard 
              key={announcement.id} 
              announcement={announcement}
              onClick={() => handleCardClick(announcement)}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      {filteredPengumuman.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <p className="text-sm text-emerald-800">
            Menampilkan <span className="font-bold">{filteredPengumuman.length}</span> pengumuman
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AnnouncementDetailModal 
        announcement={selectedAnnouncement}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
