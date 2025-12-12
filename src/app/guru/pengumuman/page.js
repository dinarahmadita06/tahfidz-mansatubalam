'use client';

import { useState, useEffect } from 'react';
import { Calendar, Megaphone, BookOpen, Bell, Award } from 'lucide-react';
import LayoutGuruSimple from '@/components/guru/LayoutGuruSimple';

const categoryIcons = {
  UMUM: { icon: Bell, color: 'bg-blue-100 text-blue-600' },
  AKADEMIK: { icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
  KEGIATAN: { icon: Award, color: 'bg-amber-100 text-amber-600' },
  PENTING: { icon: Award, color: 'bg-red-100 text-red-600' },
};

export default function GuruPengumumanPage() {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllPengumuman();
  }, []);

  const fetchAllPengumuman = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/pengumuman?limit=100');
      
      if (!res.ok) {
        throw new Error('Gagal memuat pengumuman');
      }
      
      const data = await res.json();
      setPengumuman(data.pengumuman || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal memuat riwayat pengumuman');
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

  const getCategoryIcon = (kategori) => {
    return categoryIcons[kategori] || categoryIcons.UMUM;
  };

  const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <LayoutGuruSimple>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300 opacity-90"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
          
          <div className="relative px-8 py-12 sm:px-12 sm:py-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <Megaphone size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  Pengumuman
                </h1>
                <p className="text-white/90 text-lg mt-2">Informasi dan kabar terbaru untuk guru</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl animate-pulse"
                style={{ backgroundColor: '#F0FDF4' }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl overflow-hidden shadow-md border-2 border-red-200 bg-red-50 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Bell size={32} className="text-red-600" />
              </div>
              <p className="text-red-700 text-lg font-semibold">Terjadi Kesalahan</p>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
          </div>
        ) : pengumuman.length === 0 ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-green-100 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                <Megaphone size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pengumuman</h3>
              <p className="text-gray-600 text-lg">Nantikan kabar terbaru di sini! 📢</p>
              <p className="text-gray-500 text-sm mt-3">Admin akan segera mengirimkan informasi penting untuk guru</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pengumuman.map((item) => {
                const categoryData = getCategoryIcon(item.kategori);
                const CategoryIcon = categoryData.icon;

                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/80"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.8) 100%)',
                    }}
                  >
                    {/* Color Top Border */}
                    <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300"></div>

                    <div className="p-6 sm:p-8">
                      {/* Header dengan Icon dan Badge */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-3 rounded-xl ${categoryData.color} flex-shrink-0`}>
                            <CategoryIcon size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-green-700 transition-colors">
                              {item.judul}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Kategori Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          {item.kategori}
                        </span>
                      </div>

                      {/* Konten */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3">
                        {truncateText(item.isi, 120)}
                      </p>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent mb-4"></div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                          <Calendar size={16} className="text-amber-600" />
                          <span className="font-medium">{formatDate(item.createdAt)}</span>
                        </div>
                        {item.tanggalSelesai && (
                          <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-lg">
                            <Calendar size={16} className="text-sky-600" />
                            <span className="text-xs">Hingga {formatDate(item.tanggalSelesai)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 text-center">
              <p className="text-gray-700 text-sm">
                📚 Total <span className="font-bold text-green-700">{pengumuman.length}</span> pengumuman
              </p>
            </div>
          </div>
        )}
      </div>
    </LayoutGuruSimple>
  );
}
