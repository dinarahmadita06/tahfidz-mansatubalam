'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

/**
 * Link Student Modal Component
 * Allows linking unconnected students to a parent account
 */
export default function LinkStudentModal({ orangTuaItem, siswaList, onConfirm, onClose, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter siswa yang belum terhubung dengan orang tua ini
  const availableSiswa = useMemo(() => {
    return siswaList?.filter(siswa => {
      const isAlreadyLinked = orangTuaItem.orangTuaSiswa?.some(rel => rel.siswaId === siswa.id);
      const matchesSearch = siswa.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           siswa.nis.includes(searchTerm);
      return !isAlreadyLinked && matchesSearch;
    }) || [];
  }, [siswaList, orangTuaItem, searchTerm]);

  const handleConfirm = async () => {
    if (!selectedSiswaId) {
      alert('Silakan pilih siswa');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(orangTuaItem, selectedSiswaId);
      setSelectedSiswaId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🔗</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Hubungkan ke Siswa</h2>
          <p className="text-xs text-gray-500 mt-1">{orangTuaItem.user.name}</p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Cari Siswa
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Siswa List */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Pilih Siswa
          </label>
          
          {availableSiswa.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">
                {searchTerm ? 'Tidak ada siswa yang sesuai' : 'Semua siswa sudah terhubung'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableSiswa.map(siswa => (
                <label key={siswa.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="siswa"
                    value={siswa.id}
                    checked={selectedSiswaId === siswa.id}
                    onChange={(e) => setSelectedSiswaId(e.target.value)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{siswa.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {siswa.nis} • {siswa.kelas?.nama || 'Belum ditetapkan kelas'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading || availableSiswa.length === 0 || !selectedSiswaId}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Menghubungkan...' : 'Hubungkan'}
          </button>
        </div>
      </div>
    </div>
  );
}
