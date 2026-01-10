'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Volume2, Search, Users, BookOpen, Calendar } from 'lucide-react';

// LevelFilter Component
function LevelFilter({ selected, onSelect }) {
  const levels = ['Semua', 'X', 'XI', 'XII'];
  
  return (
    <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200 w-fit shrink-0">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            selected === level
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

// TahsinFilterBar Component
function TahsinFilterBar({ searchQuery, onSearchChange, selectedLevel, onLevelChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
      <LevelFilter selected={selectedLevel} onSelect={onLevelChange} />
      
      <div className="relative w-full max-w-sm">
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
      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-700 transition-colors">
        <Volume2 size={24} className="text-white" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 break-words">
        {kelas.nama}
      </h3>

      <div className="flex items-center gap-2 text-gray-600 mb-3">
        <Users size={16} className="text-emerald-600" />
        <span className="text-sm font-medium">
          {kelas._count?.siswa || 0} Siswa
        </span>
      </div>

      {kelas.tahunAjaran && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Calendar size={12} />
          {kelas.tahunAjaran.nama}
        </div>
      )}
    </Link>
  );
}

export default function TahsinClient({ initialClasses }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Semua');

  const filteredKelas = useMemo(() => {
    return initialClasses.filter(kelas => {
      // 1. Search Filter
      const matchesSearch = kelas.nama.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Level Filter
      let matchesLevel = true;
      if (selectedLevel !== 'Semua') {
        const name = kelas.nama.trim();
        if (selectedLevel === 'X') {
          matchesLevel = name.startsWith('X ') || name === 'X';
        } else if (selectedLevel === 'XI') {
          matchesLevel = name.startsWith('XI ') || name === 'XI';
        } else if (selectedLevel === 'XII') {
          matchesLevel = name.startsWith('XII ') || name === 'XII';
        }
      }
      
      return matchesSearch && matchesLevel;
    });
  }, [initialClasses, searchQuery, selectedLevel]);

  return (
    <div className="space-y-6">
      <TahsinFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
      />

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
        <p className="text-sm text-emerald-800">
          💡 Pilih kelas di bawah untuk mulai mencatat progres bacaan & tajwid siswa.
        </p>
      </div>

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
    </div>
  );
}
