'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function RecoveryCodeSection() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const isSetup = session?.user?.isRecoveryCodeSetup;

  const handleRegenerate = () => {
    setShowRegenerateModal(true);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isSetup 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-amber-50 text-amber-600'
          }`}>
            {isSetup ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Recovery Code</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kode darurat untuk mereset password jika Anda lupa. Simpan di tempat yang aman.
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 mb-4 ${
          isSetup
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {isSetup ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600" />
            )}
            <span className={`font-bold text-sm ${
              isSetup ? 'text-emerald-900' : 'text-amber-900'
            }`}>
              {isSetup ? 'Recovery Code Sudah Dibuat' : 'Recovery Code Belum Disimpan'}
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${
            isSetup ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {isSetup 
              ? 'Kode Anda telah tersimpan. Pastikan Anda masih memiliki akses ke kode tersebut.'
              : 'Segera buat Recovery Code untuk mengamankan akun Anda. Kode ini diperlukan jika Anda lupa password.'
            }
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Recovery Code hanya ditampilkan sekali saat pembuatan pertama</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Gunakan fitur regenerate jika Anda kehilangan kode</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Simpan kode di tempat aman seperti password manager atau catatan offline</span>
          </div>
        </div>

        {isSetup && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Regenerate Recovery Code
            </button>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Regenerate akan membuat kode lama tidak valid. Pastikan Anda menyimpan kode baru dengan aman.
            </p>
          </div>
        )}
      </div>

      {/* Regenerate Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Regenerate Recovery Code?</h3>
                <p className="text-sm text-gray-600">Kode lama akan tidak valid</p>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 leading-relaxed">
                Setelah regenerate, Recovery Code lama Anda <b>tidak bisa digunakan lagi</b>. 
                Anda akan mendapatkan kode baru yang harus disimpan dengan aman.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    // Reset isRecoveryCodeSetup to trigger modal again
                    const res = await fetch('/api/user/regenerate-recovery', { 
                      method: 'POST' 
                    });
                    
                    if (res.ok) {
                      await update({
                        ...session,
                        user: {
                          ...session.user,
                          isRecoveryCodeSetup: false
                        }
                      });
                      
                      setShowRegenerateModal(false);
                      alert('Recovery Code akan diregenerasi. Modal akan muncul dengan kode baru.');
                      window.location.reload();
                    } else {
                      throw new Error('Failed to regenerate');
                    }
                  } catch (error) {
                    alert('Gagal regenerate Recovery Code. Silakan coba lagi.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Ya, Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
