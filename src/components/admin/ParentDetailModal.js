'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { getParentStatusContext } from '@/lib/helpers/parentStatusHelper';

/**
 * Parent Detail Modal Component
 * Displays detailed information about a parent account
 */
export default function ParentDetailModal({ orangTuaItem, siswaList, onClose }) {
  if (!orangTuaItem) return null;

  const childrenCount = orangTuaItem._count?.siswa || 0;

  // Get connected children directly from orangTuaSiswa relationship
  const connectedChildren = (orangTuaItem.orangTuaSiswa || []).map(rel => rel.siswa).filter(Boolean);

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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
              {orangTuaItem.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-tight">{orangTuaItem.user.name}</p>
              {(() => {
                const statusContext = getParentStatusContext(orangTuaItem);
                const statusDisplay = statusContext.statusDisplay;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm mt-1.5 ${statusDisplay.bg} ${statusDisplay.text} ${statusDisplay.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dot}`}></span>
                    {statusDisplay.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Tanggal Pendaftaran */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Tanggal Pendaftaran</p>
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
                {connectedChildren.map(siswa => (
                  <div key={siswa.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm hover:bg-emerald-100/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{siswa.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">NIS:</span> {siswa.nis || '-'} • <span className="font-medium">Kelas:</span> {siswa.kelas?.nama || '-'}
                        </p>
                      </div>
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
