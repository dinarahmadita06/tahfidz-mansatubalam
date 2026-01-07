'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

/**
 * SIMTAQ Standard Error State Component
 * Standardizes UI for API failures, fetch errors, and offline conditions.
 */
const ErrorState = ({
  title = "Gagal memuat data",
  description = "Terjadi masalah saat mengambil data. Silakan coba lagi.",
  errorMessage,
  retryLabel = "Muat Ulang",
  onRetry,
  secondaryLabel,
  onSecondary,
  className = ''
}) => {
  return (
    <div className={`w-full flex items-center justify-center py-8 lg:py-12 ${className}`}>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-rose-200/60 p-6 sm:p-8 shadow-[0_12px_30px_-18px_rgba(244,63,94,0.25)] flex flex-col items-center text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
        
        {/* Icon Bubble */}
        <div className="w-14 h-14 rounded-full bg-rose-100/70 text-rose-600 flex items-center justify-center mb-4 ring-4 ring-rose-50/50 shadow-inner">
          <AlertCircle size={28} strokeWidth={2.5} />
        </div>

        {/* Text Content */}
        <h3 className="text-slate-800 font-bold text-lg tracking-tight">
          {title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mt-2">
          {description}
        </p>

        {/* Technical Error Message (Optional) */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 w-full">
            <p className="text-[10px] font-mono text-rose-700/70 break-all leading-tight">
              Error: {errorMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {(onRetry || onSecondary) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {secondaryLabel && onSecondary && (
              <button
                onClick={onSecondary}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                {secondaryLabel}
              </button>
            )}
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
              >
                <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                {retryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
