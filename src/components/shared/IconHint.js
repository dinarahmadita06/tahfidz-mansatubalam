'use client';

import { useState, useEffect } from 'react';

/**
 * IconHint Component - Provides accessibility hints for icons
 * 
 * Desktop: Shows tooltip on hover/focus
 * Mobile: Shows permanent text label below icon
 * 
 * @param {string} label - The accessibility label text (e.g., "Pilih Anak", "Lihat Target")
 * @param {ReactNode} children - The icon element to wrap
 * @param {string} [placement='bottom'] - Tooltip placement (desktop only): 'top', 'bottom', 'left', 'right'
 * @param {boolean} [showLabel=true] - Whether to show text label on mobile
 */
export default function IconHint({ label, children, placement = 'bottom', showLabel = true }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Detect if device has coarse pointer (touch) instead of fine pointer (mouse)
  useEffect(() => {
    const checkPointer = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(isCoarse);
    };

    checkPointer();
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener('change', checkPointer);
    
    return () => mediaQuery.removeEventListener('change', checkPointer);
  }, []);

  // Tooltip placement classes for desktop
  const tooltipPlacementClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[placement];

  // Tooltip arrow positioning
  const arrowClass = {
    top: 'top-full border-t-gray-900',
    bottom: 'bottom-full border-b-gray-900',
    left: 'left-full border-l-gray-900',
    right: 'right-full border-r-gray-900',
  }[placement];

  // If mobile and showLabel is true, render with label below
  if (isMobile && showLabel) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="flex items-center justify-center cursor-pointer"
          aria-label={label}
          role="img"
        >
          {children}
        </div>
        <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight">
          {label}
        </span>
      </div>
    );
  }

  // Desktop: render with tooltip on hover/focus
  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      aria-label={label}
    >
      {children}

      {/* Tooltip - Desktop only */}
      {showTooltip && !isMobile && (
        <div
          className={`absolute ${tooltipPlacementClass} z-[9999] whitespace-nowrap px-2.5 py-1.5 bg-gray-900 text-white text-xs sm:text-sm rounded-md shadow-lg pointer-events-none animate-in fade-in duration-200`}
        >
          {label}
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClass}`}
          />
        </div>
      )}
    </div>
  );
}
