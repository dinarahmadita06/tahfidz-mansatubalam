'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { Volume2, Search, Users, BookOpen, Calendar } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// TahsinHeader Component
function TahsinHeader() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
              Pencatatan Tahsin
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
              Pencatatan progres bacaan dan latihan tajwid siswa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// TahsinFilterBar Component
function TahsinFilterBar({ searchQuery, onSearchChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full max-w-xl">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari kelas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

// TahsinClassCard Component
function TahsinClassCard({ kelas }) {
  return (
    <Link
      href={`/guru/tahsin/${kelas.id}`}
      className="block bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/70 shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200 p-6 cursor-pointer group"
    >
      {/* Icon Tahsin */}
      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-700 transition-colors">
        <Volume2 size={24} className="text-white" />
      </div>

      {/* Nama Kelas */}
      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 break-words">
        {kelas.nama}
      </h3>

      {/* Info Row */}
      <div className="flex items-center gap-2 text-gray-600 mb-3">
        <Users size={16} className="text-emerald-600" />
        <span className="text-sm font-medium">
          {kelas._count?.siswa || 0} Siswa
        </span>
      </div>

      {/* Badge Tahun Ajaran */}
      {kelas.tahunAjaran && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Calendar size={12} />
          {kelas.tahunAjaran.nama}
        </div>
      )}
    </Link>
  );
}

export default function TahsinIndexPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchKelas();
    }
  }, [session]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/guru/kelas');
      if (response.ok) {
        const data = await response.json();
        setKelasList(data.kelas || []);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter kelas berdasarkan search query
  const filteredKelas = kelasList.filter(kelas =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3 sm:px-4 lg:px-5 py-6 space-y-6 w-full">
        {/* Header */}
        <TahsinHeader />

        {/* Filter Bar */}
        <TahsinFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Info Box */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-emerald-800">
            💡 Pilih kelas di bawah untuk mulai mencatat progres bacaan & tajwid siswa.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingIndicator text="Memuat data kelas..." />
        )}

        {/* Grid Card Kelas */}
        {!loading && (
          <div>
            {filteredKelas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-emerald-50 rounded-full">
                    <BookOpen size={48} className="text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Kelas'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Tidak ada kelas yang ditemukan dengan pencarian tersebut'
                    : 'Belum ada kelas tersedia untuk pencatatan tahsin'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKelas.map((kelas) => (
                  <TahsinClassCard key={kelas.id} kelas={kelas} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
