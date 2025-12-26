'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function JumpToAyahModal({
  isOpen,
  onClose,
  surahName,
  totalAyahs,
  onJump
}) {
  const [ayahNumber, setAyahNumber] = useState('');
  const [error, setError] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAyahNumber('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const num = parseInt(ayahNumber, 10);

    // Validation
    if (!ayahNumber || isNaN(num)) {
      setError('Masukkan nomor ayat yang valid');
      return;
    }

    if (num < 1 || num > totalAyahs) {
      setError(`Nomor ayat harus antara 1-${totalAyahs}`);
      return;
    }

    // Valid - trigger jump
    onJump(num);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold pr-8">Pindah ke Ayat</h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-700 mb-4">
            Surah <span className="font-semibold text-emerald-600">{surahName}</span> memiliki{' '}
            <span className="font-semibold text-emerald-600">{totalAyahs}</span> ayat
          </p>

          <div className="mb-6">
            <input
              type="number"
              min="1"
              max={totalAyahs}
              value={ayahNumber}
              onChange={(e) => {
                setAyahNumber(e.target.value);
                setError('');
              }}
              placeholder={`Masukkan nomor ayat (1-${totalAyahs})`}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Pindah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
