'use client';

import { useState, useEffect } from 'react';
import { Users, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';

/**
 * ChildSwitcher Component
 * Allows parent to switch between multiple children
 */
export default function ChildSwitcher({ children, selectedChild, onSelectChild }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !children || children.length <= 1) {
    return null;
  }

  const handleSelect = (child) => {
    onSelectChild(child);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all shadow-sm"
      >
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {selectedChild?.user?.image ? (
            <Image
              src={selectedChild.user.image}
              alt={selectedChild.user.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-lg">
              {selectedChild?.user?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">
            {selectedChild?.user?.name || 'Pilih Anak'}
          </div>
          <div className="text-xs text-gray-500">
            {selectedChild?.kelas?.nama || 'Tidak ada kelas'} • NIS: {selectedChild?.nis}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Pilih Anak ({children.length})</span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {children.map((child) => {
                const isSelected = selectedChild?.id === child.id;
                const isActive = child.statusSiswa === 'AKTIF';

                return (
                  <button
                    key={child.id}
                    onClick={() => handleSelect(child)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                      isSelected ? 'bg-emerald-100' : ''
                    } ${!isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                      {child.user?.image ? (
                        <Image
                          src={child.user.image}
                          alt={child.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl">
                          {child.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {child.user?.name}
                        </span>
                        {!isActive && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            Alumni
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {child.kelas?.nama || 'Tidak ada kelas'} • NIS: {child.nis}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Pilih anak untuk melihat data SIMTAQ-nya
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
