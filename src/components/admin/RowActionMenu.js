'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Award, ArrowUpRight, XCircle, CheckCircle } from 'lucide-react';

/**
 * RowActionMenu - Reusable dropdown action menu component
 * Displays a three-dots button that opens a dropdown with action items
 * 
 * Props:
 * - statusSiswa: current student status (AKTIF, LULUS, PINDAH, KELUAR)
 * - onAktifkan: callback for activating student
 * - onLulus: callback for graduating student
 * - onPindah: callback for transferring student
 * - onKeluar: callback for removing student
 */
export default function RowActionMenu({
  statusSiswa = 'AKTIF',
  onAktifkan,
  onLulus,
  onPindah,
  onKeluar,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    // Close on ESC key
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle menu item click
  const handleMenuClick = (callback) => {
    callback();
    setIsOpen(false);
  };

  // Show different menu items based on status
  const isAktif = statusSiswa === 'AKTIF';

  return (
    <div className="relative inline-block">
      {/* Three Dots Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
        title="Aksi"
        aria-label="Menu aksi"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>
  
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-emerald-100/60 rounded-xl shadow-lg py-2 z-40"
          role="menu"
        >
          {statusSiswa !== 'AKTIF' && onAktifkan && (
            <button
              onClick={() => handleMenuClick(onAktifkan)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
              role="menuitem"
            >
              <CheckCircle size={16} />
              <span>Aktifkan</span>
            </button>
          )}
  
          {isAktif && (
            <>
              {onLulus && (
                <button
                  onClick={() => handleMenuClick(onLulus)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <Award size={16} />
                  <span>Lulus</span>
                </button>
              )}
  
              {onPindah && (
                <button
                  onClick={() => handleMenuClick(onPindah)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <ArrowUpRight size={16} />
                  <span>Pindah</span>
                </button>
              )}
  
              {onKeluar && (
                <button
                  onClick={() => handleMenuClick(onKeluar)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                  role="menuitem"
                >
                  <XCircle size={16} />
                  <span>Keluar</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
