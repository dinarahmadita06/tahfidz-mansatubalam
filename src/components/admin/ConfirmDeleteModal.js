'use client';

/**
 * Confirm Delete Modal Component
 * Confirmation modal for deleting a parent account
 */
export default function ConfirmDeleteModal({ orangTuaItem, onConfirm, onClose, isLoading }) {
  const childrenCount = orangTuaItem._count?.siswa || 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">🗑️</span>
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Hapus Akun
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 text-sm mb-6 pb-6 border-b border-gray-200">
          {orangTuaItem.user.name}
        </p>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">
            <strong>⚠️ Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Semua data akun orang tua akan dihapus permanen dari sistem.
          </p>
        </div>

        {/* Linked Children Info */}
        {childrenCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-700">
              <strong>ℹ️ Catatan:</strong> Akun ini masih terhubung dengan {childrenCount} siswa. Koneksi dengan siswa akan diputus saat akun dihapus.
            </p>
          </div>
        )}

        {/* Confirmation Text */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Ketik nama berikut untuk mengkonfirmasi:
          </p>
          <p className="text-lg font-bold text-gray-900 font-mono bg-white p-2 rounded border border-gray-300">
            {orangTuaItem.user.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={() => {
              const confirmed = prompt(`Ketik "${orangTuaItem.user.name}" untuk mengkonfirmasi penghapusan:`);
              if (confirmed === orangTuaItem.user.name) {
                onConfirm(orangTuaItem);
              } else if (confirmed !== null) {
                alert('Konfirmasi tidak sesuai. Penghapusan dibatalkan.');
              }
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menghapus...' : 'Ya, Hapus Akun'}
          </button>
        </div>
      </div>
    </div>
  );
}
