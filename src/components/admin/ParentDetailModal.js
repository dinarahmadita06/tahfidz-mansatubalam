'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Parent Detail Modal Component
 * Displays detailed information about a parent account
 */
export default function ParentDetailModal({ orangTuaItem, siswaList, onClose }) {
  if (!orangTuaItem) return null;

  const childrenCount = orangTuaItem._count?.siswa || 0;

  // Filter siswa yang terhubung dengan orang tua ini
  const connectedSiswa = siswaList?.filter(siswa =>
    orangTuaItem.orangTuaSiswa?.some(rel => rel.siswaId === siswa.id)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Orang Tua</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {orangTuaItem.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{orangTuaItem.user.name}</p>
              <p className="text-xs text-gray-500">{orangTuaItem.user.email}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1">No. HP</p>
              <p className="text-sm font-semibold text-gray-900">{orangTuaItem.noHP || '-'}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1">Status Akun</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                orangTuaItem.user.isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {orangTuaItem.user.isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          {orangTuaItem.pekerjaan && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1">Pekerjaan</p>
              <p className="text-sm font-semibold text-gray-900">{orangTuaItem.pekerjaan}</p>
            </div>
          )}

          {orangTuaItem.alamat && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-1">Alamat</p>
              <p className="text-sm font-semibold text-gray-900">{orangTuaItem.alamat}</p>
            </div>
          )}

          {/* Tanggal Pendaftaran */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-1">Tanggal Pendaftaran</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(orangTuaItem.user.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Anak Terhubung Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">👶</span>
              Anak Terhubung ({childrenCount})
            </h3>
            
            {childrenCount === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Belum ada anak terhubung
              </div>
            ) : (
              <div className="space-y-2">
                {connectedSiswa.map(siswa => (
                  <div key={siswa.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{siswa.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {siswa.kelas?.namaKelas || 'Kelas tidak ada'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        siswa.statusSiswa === 'AKTIF'
                          ? 'bg-emerald-100 text-emerald-700'
                          : siswa.statusSiswa === 'LULUS'
                          ? 'bg-blue-100 text-blue-700'
                          : siswa.statusSiswa === 'PINDAH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {siswa.statusSiswa}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
