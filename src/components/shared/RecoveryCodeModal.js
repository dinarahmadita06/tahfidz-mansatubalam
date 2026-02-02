'use client';

import { useState, useEffect } from 'react';
import { Copy, Download, X, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecoveryCodeModal({ 
  isOpen, 
  onClose, 
  recoveryCode,
  onConfirm 
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCopied(false);
      setIsConfirmed(false);
    }
  }, [isOpen]);

  const copyRecoveryCode = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setIsCopied(true);
      toast.success('Berhasil disalin ke clipboard!', {
        duration: 2000,
        position: 'top-right'
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Gagal menyalin kode');
    }
  };

  const downloadRecoveryCard = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/user/generate-recovery-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recoveryCode }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `SIMTAQ-Recovery-Code-${date}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Kartu recovery berhasil diunduh!');
      } else {
        toast.error('Gagal mengunduh kartu recovery');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunduh');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with green gradient */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Amankan Akun Anda</h2>
                <p className="text-emerald-100 text-sm mt-1">
                  SIMTAQ kini menggunakan Recovery Code untuk lupa password
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <span className="font-semibold">Penting:</span> Recovery code hanya tampil sekali dan harus disimpan dengan aman. Tanpa kode ini, Anda tidak bisa mereset password jika lupa.
            </p>
          </div>

          {/* Recovery Code Display */}
          <div className="mb-6">
            <p className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Recovery Code (9 Digit)
            </p>
            <div className="relative bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
              {/* Grid layout: spacer - code - icon */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {/* Left spacer */}
                <div></div>
                
                {/* Center: Recovery Code */}
                <div className="font-mono text-2xl sm:text-3xl font-bold text-gray-900 tracking-wider text-center">
                  {recoveryCode}
                </div>
                
                {/* Right: Copy button */}
                <div className="flex justify-end">
                  <button
                    onClick={copyRecoveryCode}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Salin ke clipboard"
                  >
                    <Copy className={`w-5 h-5 ${isCopied ? 'text-green-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadRecoveryCard}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors mb-6 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Mengunduh...' : 'Download Kartu Recovery'}
          </button>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="recoveryConfirmation"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="recoveryConfirmation" className="text-sm text-gray-700">
              Saya sudah menyimpan Recovery Code ini dan memahami bahwa tanpa kode ini saya tidak bisa mereset password.
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Saya Sudah Simpan, Lanjut ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}