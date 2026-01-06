'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Global Loading Indicator for SIMTAQ
 * Standardizes the look and feel of loading states across the application.
 */
const LoadingIndicator = ({ 
  text = 'Memuat...', 
  size = 'medium', // small, medium, large
  fullPage = false,
  inline = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-10 h-10',
    large: 'w-14 h-14'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  const content = (
    <div className={`flex ${inline ? 'flex-row space-x-2' : 'flex-col space-y-4'} items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 
          className={`${spinnerSize} text-emerald-500 animate-spin`} 
          strokeWidth={2.5}
        />
      </div>
      {text && (
        <p className={`${inline ? 'text-current' : 'text-slate-600'} font-medium ${size === 'small' ? 'text-xs' : 'text-sm sm:text-base'} ${!inline && 'animate-pulse'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  if (inline) return content;

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingIndicator;
