'use client';

import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';

/**
 * SIMTAQ Standard Empty State Component
 * Standardizes the look and feel of "no data" or "no results" conditions.
 */
const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`w-full flex items-center justify-center py-8 lg:py-12 ${className}`}>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-200/60 p-6 sm:p-8 shadow-[0_12px_30px_-18px_rgba(16,185,129,0.35)] flex flex-col items-center text-center max-w-md w-full">
        {/* Icon Bubble */}
        <div className="w-14 h-14 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-4 ring-4 ring-emerald-50/50">
          <Icon size={28} strokeWidth={2} />
        </div>

        {/* Text Content */}
        <h3 className="text-slate-800 font-semibold text-lg tracking-tight">
          {title}
        </h3>
        
        {description && (
          <p className="text-slate-500 text-sm leading-relaxed mt-2 italic">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {(actionLabel || secondaryLabel) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {secondaryLabel && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                {secondaryLabel}
              </button>
            )}
            
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                {actionLabel}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
