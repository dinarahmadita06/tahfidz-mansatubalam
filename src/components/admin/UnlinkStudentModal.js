'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Unlink Student Modal Component
 * Displays list of connected children with option to unlink any of them
 */
export default function UnlinkStudentModal({ orangTuaItem, onConfirm, onClose, isLoading }) {
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const connectedChildren = (orangTuaItem.orangTuaSiswa || []).map(rel => rel.siswa).filter(Boolean);

  const handleConfirm = async () => {
    if (!selectedSiswaId) {
      alert('Silakan pilih siswa yang ingin diputus hubungannya');
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
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Putuskan Hubungan Anak</h2>
            <p className="text-xs text-gray-500 mt-1">{orangTuaItem.user.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">
            <strong>⚠️ Perhatian:</strong> Memutus hubungan akan membuat anak tidak lagi terhubung dengan orang tua ini.
          </p>
        </div>

        {/* Children List */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Pilih Anak yang Akan Diputus
          </label>

          {connectedChildren.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">Tidak ada anak yang terhubung</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {connectedChildren.map(siswa => (
                <label
                  key={siswa.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="siswa"
                    value={siswa.id}
                    checked={selectedSiswaId === siswa.id}
                    onChange={(e) => setSelectedSiswaId(e.target.value)}
                    className="w-4 h-4 text-red-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{siswa.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {siswa.nisn} • {siswa.kelas?.nama || 'Kelas tidak ada'} • 
                      <span className={`ml-1 font-semibold ${
                        siswa.statusSiswa === 'AKTIF' ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {siswa.statusSiswa === 'AKTIF' ? '✅ Aktif' : '❌ ' + siswa.statusSiswa}
                      </span>
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {selectedSiswaId && connectedChildren.find(s => s.id === selectedSiswaId) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-900">
              <strong>ℹ️ Catatan:</strong> {connectedChildren.find(s => s.id === selectedSiswaId).user.name} akan tidak lagi memiliki akses parent profile ini.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading || connectedChildren.length === 0}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading || connectedChildren.length === 0 || !selectedSiswaId}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Memutus...' : 'Putuskan'}
          </button>
        </div>
      </div>
    </div>
  );
}
