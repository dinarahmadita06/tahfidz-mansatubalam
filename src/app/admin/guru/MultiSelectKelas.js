'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export function MultiSelectKelas({ 
  kelas = [], 
  selectedKelas = [], 
  onSelectionChange, 
  loading = false,
  error = null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter kelas based on search
  const filteredKelas = kelas.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle checkbox toggle
  const handleToggleKelas = (kelasId) => {
    const isSelected = selectedKelas.includes(kelasId);
    let newSelection;

    if (isSelected) {
      newSelection = selectedKelas.filter(id => id !== kelasId);
    } else {
      newSelection = [...selectedKelas, kelasId];
    }

    onSelectionChange(newSelection);
  };

  // Handle chip remove
  const handleRemoveChip = (kelasId) => {
    const newSelection = selectedKelas.filter(id => id !== kelasId);
    onSelectionChange(newSelection);
  };

  // Get selected kelas objects for display
  const selectedKelasObjects = kelas.filter(k => selectedKelas.includes(k.id));

  // Handle error state
  if (error) {
    return (
      <div className="w-full px-4 py-3 border border-red-300 rounded-xl bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-sm flex items-center">
        <LoadingIndicator size="small" text="Memuat kelas..." inline />
      </div>
    );
  }

  // Handle no kelas available
  if (kelas.length === 0) {
    return (
      <div className="w-full px-4 py-3 border border-yellow-300 rounded-xl bg-yellow-50 text-yellow-700 text-sm">
        Tidak ada kelas AKTIF tersedia
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Field with Selected Chips */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-xl bg-white cursor-pointer transition-all flex items-center gap-2 flex-wrap min-h-[48px] ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-300 hover:border-emerald-400'
        }`}
      >
        {/* Selected Chips */}
        {selectedKelasObjects.length > 0 ? (
          <>
            {selectedKelasObjects.map(k => (
              <div
                key={k.id}
                className="flex items-center gap-1.5 bg-emerald-100/70 border border-emerald-300 rounded-full px-3 py-1.5 text-xs font-medium text-emerald-700"
              >
                <span>{k.nama}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveChip(k.id);
                  }}
                  className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} className="text-emerald-600" />
                </button>
              </div>
            ))}
          </>
        ) : (
          <span className="text-slate-400 text-sm">Pilih kelas yang diampu...</span>
        )}

        {/* Chevron Icon */}
        <div className="ml-auto flex-shrink-0">
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Kelas List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredKelas.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Tidak ada kelas yang cocok
              </div>
            ) : (
              filteredKelas.map(k => (
                <label
                  key={k.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedKelas.includes(k.id)}
                    onChange={() => handleToggleKelas(k.id)}
                    className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{k.nama}</div>
                    {k.tahunAjaran && (
                      <div className="text-xs text-slate-500">{k.tahunAjaran.nama}</div>
                    )}
                  </div>
                  {k._count?.siswa !== undefined && (
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {k._count.siswa} siswa
                    </div>
                  )}
                </label>
              ))
            )}
          </div>

          {/* Selection Summary */}
          {selectedKelasObjects.length > 0 && (
            <div className="p-3 bg-emerald-50/50 border-t border-slate-200 text-xs text-emerald-700 font-medium">
              ✓ {selectedKelasObjects.length} kelas dipilih
            </div>
          )}
        </div>
      )}
    </div>
  );
}
