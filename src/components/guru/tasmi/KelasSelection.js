'use client';

import { useState } from 'react';
import { Users, AlertCircle, Clock, CheckCircle, BookOpen } from 'lucide-react';

/**
 * KelasSelectionCard - Card untuk memilih kelas dengan indikator pengajuan Tasmi'
 */
export function KelasSelectionCard({ kelas, onSelect, isActive }) {
  const {
    kelasId,
    kelasNama,
    jumlahSiswa,
    totalPengajuan,
    menungguJadwal,
    perluDinilai,
    selesai,
    butuhAksi
  } = kelas;

  const isEmpty = totalPengajuan === 0;

  return (
    <button
      onClick={() => onSelect(kelas)}
      className={`
        relative w-full p-6 rounded-xl border-2 transition-all duration-200
        text-left hover:shadow-lg
        ${isActive 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : butuhAksi
            ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
            : isEmpty
              ? 'border-gray-200 bg-white hover:border-gray-300'
              : 'border-green-200 bg-green-50 hover:border-green-300'
        }
      `}
    >
      {/* Badge Butuh Aksi */}
      {butuhAksi && !isActive && (
        <span className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold bg-orange-500 text-white rounded-full">
          Butuh Aksi
        </span>
      )}

      {/* Nama Kelas */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Kelas {kelasNama}
        </h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Users size={14} />
          {jumlahSiswa} siswa
        </p>
      </div>

      {/* Counters */}
      {isEmpty ? (
        <div className="py-4 text-center">
          <p className="text-gray-500 italic">Belum ada pengajuan Tasmi&apos;</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Total Pengajuan */}
          <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              Total Pengajuan
            </span>
            <span className="font-bold text-blue-600">{totalPengajuan}</span>
          </div>

          {/* Menunggu Jadwal */}
          {menungguJadwal > 0 && (
            <div className="flex items-center justify-between p-2 bg-orange-100 rounded-lg">
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-orange-600" />
                Menunggu Jadwal
              </span>
              <span className="font-bold text-orange-600">{menungguJadwal}</span>
            </div>
          )}

          {/* Perlu Dinilai */}
          {perluDinilai > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-100 rounded-lg">
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                Perlu Dinilai
              </span>
              <span className="font-bold text-red-600">{perluDinilai}</span>
            </div>
          )}

          {/* Selesai */}
          {selesai > 0 && (
            <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Selesai
              </span>
              <span className="font-bold text-green-600">{selesai}</span>
            </div>
          )}
        </div>
      )}

      {/* Tombol Aksi */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
          {isActive ? '✓ Kelas Aktif' : 'Lihat Kelas →'}
        </span>
      </div>
    </button>
  );
}

/**
 * KelasSelectionSection - Grid of kelas cards with quick filters
 */
export function KelasSelectionSection({ summary, activeKelasId, onSelectKelas }) {
  const [filter, setFilter] = useState('all');

  const filteredSummary = summary.filter(k => {
    if (filter === 'butuh-aksi') return k.butuhAksi;
    if (filter === 'ada-pengajuan') return k.totalPengajuan > 0;
    return true; // 'all'
  });

  const counters = {
    all: summary.length,
    butuhAksi: summary.filter(k => k.butuhAksi).length,
    adaPengajuan: summary.filter(k => k.totalPengajuan > 0).length
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pilih Kelas
        </h2>
        <p className="text-gray-600">
          Pilih kelas untuk melihat daftar pengajuan Tasmi&apos;
        </p>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua Kelas ({counters.all})
        </button>
        
        {counters.butuhAksi > 0 && (
          <button
            onClick={() => setFilter('butuh-aksi')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'butuh-aksi'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Butuh Aksi ({counters.butuhAksi})
          </button>
        )}

        {counters.adaPengajuan > 0 && (
          <button
            onClick={() => setFilter('ada-pengajuan')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ada-pengajuan'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Ada Pengajuan ({counters.adaPengajuan})
          </button>
        )}
      </div>

      {/* Kelas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSummary.map((kelas) => (
          <KelasSelectionCard
            key={kelas.kelasId}
            kelas={kelas}
            onSelect={onSelectKelas}
            isActive={kelas.kelasId === activeKelasId}
          />
        ))}
      </div>

      {filteredSummary.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada kelas dengan filter ini</p>
        </div>
      )}
    </div>
  );
}
