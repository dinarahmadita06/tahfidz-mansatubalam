'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Award, ArrowUpRight, XCircle, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * RowActionMenu - Reusable dropdown action menu component with Portal
 * Displays a three-dots button that opens a dropdown with action items
 * Uses Portal to render menu outside table container to prevent overflow clipping
 * 
 * Props:
 * - statusSiswa: current student status (AKTIF, LULUS, PINDAH, KELUAR)
 * - kelasNama: nama kelas siswa (optional)
 * - kelasId: ID kelas siswa (optional)
 * - onAktifkan: callback for activating student
 * - onLulus: callback for graduating student
 * - onPindah: callback for transferring student
 * - onKeluar: callback for removing student
 */
function RowActionMenu({
  statusSiswa = 'AKTIF',
  kelasNama,
  kelasId,
  onAktifkan,
  onLulus,
  onPindah,
  onKeluar,
}) {

  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Calculate menu position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 200; // Estimated menu height
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Auto-flip: open upward if not enough space below
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({
        top: openUpward ? buttonRect.top - menuHeight + window.scrollY : buttonRect.bottom + window.scrollY,
        left: buttonRect.right - 192, // 192px = w-48 menu width, align to right
        openUpward
      });
    }
  }, [isOpen]);

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
  
      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 bg-white/95 backdrop-blur-md border border-emerald-100/60 rounded-xl shadow-xl py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
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
  
          {/* Menu Ke Kelas */}
          {kelasNama && kelasId ? (
            <a
              href={`/admin/kelas#${kelasId}`}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-colors flex items-center gap-2 no-underline"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink size={16} />
              <span>Ke Kelas {kelasNama}</span>
            </a>
          ) : (
            <div
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2"
              role="menuitem"
              title="Siswa belum terdaftar di kelas"
            >
              <ExternalLink size={16} />
              <span>Belum terdaftar di kelas</span>
            </div>
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
        </div>,
        document.body
      )}
    </div>
  );
}

export default memo(RowActionMenu);

