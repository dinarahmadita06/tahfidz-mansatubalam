'use client';

import { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { generatePasswordMixed, generateParentPassword } from '@/lib/passwordUtils';
import toast from 'react-hot-toast';

/**
 * Reset Password Modal Component
 * Generates and displays a new password for parent account
 */
export default function ResetPasswordModal({ orangTuaItem, onConfirm, onClose, isLoading }) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const firstSiswa = orangTuaItem.orangTuaSiswa?.[0]?.siswa;
    if (firstSiswa && firstSiswa.nisn) {
      if (!firstSiswa.tanggalLahir) {
        toast.error('Tanggal lahir tidak tersedia, password wali di-reset ke NISN', {
          duration: 4000,
          icon: '⚠️',
        });
      }
      setNewPassword(generateParentPassword(firstSiswa.nisn, firstSiswa.tanggalLahir));
    } else {
      // Fallback for parents without linked students
      setNewPassword(generatePasswordMixed());
    }
  }, [orangTuaItem]);

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(orangTuaItem, newPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateNew = () => {
    setNewPassword(generatePasswordMixed());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-xs text-gray-500 mt-1">{orangTuaItem.user.name}</p>
        </div>

        {/* Password Display */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Password Baru
          </label>
          <div className="relative flex items-center gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono font-bold text-lg text-center text-gray-900 select-all"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPassword ? (
                <EyeOff size={18} className="text-gray-600" />
              ) : (
                <Eye size={18} className="text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: {orangTuaItem.orangTuaSiswa?.[0]?.siswa?.nisn 
              ? (orangTuaItem.orangTuaSiswa?.[0]?.siswa?.tanggalLahir ? 'NISN-TahunLahir' : 'NISN') 
              : 'Random (8 karakter)'}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyPassword}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-200 transition-all mb-3"
        >
          <Copy size={16} />
          <span>{copied ? '✓ Tersalin' : 'Salin Password'}</span>
        </button>

        {/* Generate New Button */}
        <button
          onClick={handleGenerateNew}
          className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all mb-6"
        >
          Generate Password Baru
        </button>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Perhatian:</strong> Pastikan password baru ini dicatat atau dibagikan ke orang tua. Password akan diganti setelah tombol Konfirmasi diklik.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Menyimpan...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
