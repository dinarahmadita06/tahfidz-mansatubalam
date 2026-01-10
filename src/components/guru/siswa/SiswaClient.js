'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import StudentCreateModal from '@/components/admin/StudentCreateModal';

export default function SiswaClient({ initialKelas = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedKelas, setSelectedKelas] = useState(searchParams.get('kelasId') || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Debounced search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set('search', searchTerm);
      else params.delete('search');
      
      if (selectedKelas) params.set('kelasId', selectedKelas);
      else params.delete('kelasId');
      
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedKelas, pathname, router, searchParams]);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <>
      {/* Header Info */}
      <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg border border-white/10">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Kelola Siswa
              </h1>
              <p className="text-green-50 text-sm sm:text-base mt-1">
                Monitoring siswa kelas binaan dan tracking progress hafalan
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus size={20} />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Cari Nama Siswa atau NIS
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Filter Kelas
            </label>
            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm appearance-none bg-white"
              >
                <option value="">Semua Kelas</option>
                {initialKelas.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Users size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
        userRole="GURU"
      />
    </>
  );
}
