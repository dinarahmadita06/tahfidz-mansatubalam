'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MonthlyPeriodFilter Component
 * 
 * Displays month/year selector with prev/next navigation
 * Used in penilaian-hafalan pages (both siswa and orangtua)
 * 
 * Props:
 * - selectedMonth: number (0-11)
 * - selectedYear: number (e.g., 2026)
 * - onMonthYearChange: (month, year) => void
 * - minYear: number (optional, default: 2020)
 * - maxYear: number (optional, default: current year)
 */

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function MonthlyPeriodFilter({
  selectedMonth,
  selectedYear,
  onMonthYearChange,
  minYear = 2020,
  maxYear = new Date().getFullYear()
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle previous month
  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    // Disable if going below min year
    if (newYear >= minYear) {
      onMonthYearChange(newMonth, newYear);
    }
  };

  // Handle next month
  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    // Disable if going above max year
    if (newYear <= maxYear) {
      onMonthYearChange(newMonth, newYear);
    }
  };

  // Check if prev button should be disabled
  const isPrevDisabled = () => {
    if (selectedYear < minYear) return true;
    if (selectedYear === minYear && selectedMonth === 0) return true;
    return false;
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    if (selectedYear > maxYear) return true;
    if (selectedYear === maxYear && selectedMonth === 11) return true;
    return false;
  };

  // Generate year options
  const yearOptions = [];
  for (let year = minYear; year <= maxYear; year++) {
    yearOptions.push(year);
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Title & Subtitle */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
              Periode Penilaian
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Pilih bulan untuk melihat riwayat penilaian hafalan
            </p>
          </div>

          {/* Right: Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Prev Button */}
            <button
              onClick={handlePrevMonth}
              disabled={isPrevDisabled()}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isPrevDisabled()
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer'
              }`}
              title="Bulan sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => onMonthYearChange(parseInt(e.target.value), selectedYear)}
              className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium hover:border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {MONTH_NAMES.map((month, idx) => (
                <option key={idx} value={idx}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => onMonthYearChange(selectedMonth, parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium hover:border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Next Button */}
            <button
              onClick={handleNextMonth}
              disabled={isNextDisabled()}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isNextDisabled()
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer'
              }`}
              title="Bulan berikutnya"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Info Text Section */}
        <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
          <span className="font-medium">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </span>
        </div>
      </div>
    </div>
  );
}
