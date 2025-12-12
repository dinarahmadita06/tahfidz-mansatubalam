'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Megaphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SiswaPengumumanPage() {
  const { data: session } = useSession();
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
      // Fetch all pengumuman (tidak filter unreadOnly untuk history)
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/siswa"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Riwayat Pengumuman</h1>
              <p className="text-gray-600 mt-1">Daftar semua pengumuman yang telah dikirimkan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : pengumuman.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Megaphone size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada pengumuman</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pengumuman.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Title and Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex-1">
                    {item.judul}
                  </h2>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full whitespace-nowrap">
                    {item.kategori}
                  </span>
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {item.isi}
                </p>

                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Dibuat: {formatDate(item.createdAt)}</span>
                  </div>
                  {item.tanggalSelesai && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Berakhir: {formatDate(item.tanggalSelesai)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
