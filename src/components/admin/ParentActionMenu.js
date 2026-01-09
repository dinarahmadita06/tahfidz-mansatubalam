'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

/**
 * Parent Action Menu Component (Kebab Menu / Dropdown)
 * Displays as ⋮ button with dropdown menu for parent account actions
 */
export default function ParentActionMenu({
  orangTuaItem,
  onViewDetail,
  onResetPassword,
  onLinkStudent,
  onUnlinkStudent,
  onToggleStatus,
  onDelete,
  onRefresh
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted (for Portal SSR safety)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const childrenCount = orangTuaItem._count?.siswa || 0;
  const isActive = orangTuaItem.user.isActive;

  // Calculate dropdown position with auto-placement logic
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 280; // Approximate dropdown height
    const dropdownWidth = 224; // w-56 = 14rem = 224px
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const threshold = 20; // Padding from edge

    let top = buttonRect.bottom + 4; // Below button with small gap
    let left = buttonRect.right - dropdownWidth; // Align to right

    // Auto-placement: If dropdown goes below viewport, move up
    if (top + dropdownHeight > viewportHeight - threshold) {
      top = buttonRect.top - dropdownHeight - 4;
    }

    // Auto-placement: If dropdown goes beyond right edge, move left
    if (left + dropdownWidth > viewportWidth - threshold) {
      left = viewportWidth - dropdownWidth - threshold;
    }

    // Ensure left doesn't go negative
    if (left < threshold) {
      left = threshold;
    }

    return { top, left };
  };

  // Update position when dropdown opens or window resizes
  useEffect(() => {
    if (isOpen) {
      setDropdownPos(calculateDropdownPosition());
      const handleResize = () => setDropdownPos(calculateDropdownPosition());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleMenuClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Kebab Button - In-place */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => setDropdownPos(calculateDropdownPosition()), 0);
          }
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
        aria-label="Menu aksi"
      >
        <MoreVertical size={18} className="text-gray-600" />
      </button>

      {/* Dropdown Menu - Portal (Escaped from table overflow) */}
      {isOpen && isMounted && createPortal(
        <div
          ref={menuRef}
          className="fixed w-56 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
          }}
        >
          <div className="py-1">
            {/* Menu Item: Lihat Detail */}
            <button
              onClick={() => handleMenuClick(() => onViewDetail(orangTuaItem))}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span>👁️</span>
              <span>Lihat Detail</span>
            </button>
            
            {/* Menu Item: Reset Password */}
            <button
              onClick={() => handleMenuClick(() => onResetPassword(orangTuaItem))}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span>🔐</span>
              <span>Reset Password</span>
            </button>
            
            {/* Menu Item: Hubungkan ke Siswa */}
            <button
              onClick={() => handleMenuClick(() => onLinkStudent(orangTuaItem))}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span>🔗</span>
              <span>{childrenCount > 0 ? 'Tambah Anak Terhubung' : 'Hubungkan ke Anak'}</span>
            </button>
            
            {/* Menu Item: Putuskan Hubungan Anak */}
            <button
              onClick={() => handleMenuClick(() => onUnlinkStudent(orangTuaItem))}
              disabled={childrenCount === 0}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                childrenCount === 0
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-orange-700 hover:bg-orange-50'
              }`}
              title={childrenCount === 0 ? 'Tidak ada anak yang terhubung' : ''}
            >
              <span>🔐</span>
              <span>Putuskan Hubungan Anak</span>
              {childrenCount > 0 && <span className="ml-auto text-xs text-gray-500">({childrenCount})</span>}
            </button>
            
            {/* Menu Item: Toggle Status Akun */}
            <button
              onClick={() => handleMenuClick(() => onToggleStatus(orangTuaItem))}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span>{isActive ? '⛔' : '✅'}</span>
              <span>{isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}</span>
            </button>
            
            {/* Menu Item: Hapus Akun */}
            <button
              onClick={() => handleMenuClick(() => onDelete(orangTuaItem))}
              disabled={childrenCount > 0}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                childrenCount > 0
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-red-700 hover:bg-red-50'
              }`}
              title={childrenCount > 0 ? `Tidak bisa hapus, akun masih terhubung dengan ${childrenCount} siswa` : ''}
            >
              <span>🗑️</span>
              <span>Hapus Akun</span>
              {childrenCount > 0 && <span className="ml-auto text-xs text-gray-500">({childrenCount} siswa)</span>}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
