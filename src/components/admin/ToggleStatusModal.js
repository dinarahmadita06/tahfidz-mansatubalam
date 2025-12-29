'use client';

/**
 * Toggle Status Modal Component
 * Confirmation modal for toggling parent account status (Aktif/Nonaktif)
 */
export default function ToggleStatusModal({ orangTuaItem, onConfirm, onClose, isLoading }) {
  const isActive = orangTuaItem.user.isActive;
  const newStatus = !isActive;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">{newStatus ? '✅' : '⛔'}</span>
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          {newStatus ? 'Aktifkan' : 'Nonaktifkan'} Akun
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 text-sm mb-6 pb-6 border-b border-gray-200">
          {orangTuaItem.user.name}
        </p>

        {/* Details */}
        <div className={`p-4 rounded-xl mb-6 border ${
          newStatus
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${newStatus ? 'text-emerald-700' : 'text-red-700'}`}>
            {newStatus ? (
              <>
                <strong>Akun akan diaktifkan.</strong> Orang tua dapat login dan mengakses sistem.
              </>
            ) : (
              <>
                <strong>Akun akan dinonaktifkan.</strong> Orang tua tidak dapat login sampai akun diaktifkan kembali.
              </>
            )}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">{isActive ? '🟢' : '🔴'}</span>
            <div>
              <p className="font-semibold text-gray-900">Status Saat Ini</p>
              <p className="text-xs text-gray-500">{isActive ? 'Aktif' : 'Tidak Aktif'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-0">
            <span className="text-lg">→</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">{newStatus ? '🟢' : '🔴'}</span>
            <div>
              <p className="font-semibold text-gray-900">Status Baru</p>
              <p className="text-xs text-gray-500">{newStatus ? 'Aktif' : 'Tidak Aktif'}</p>
            </div>
          </div>
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
            onClick={() => onConfirm(orangTuaItem, newStatus)}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              newStatus
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Menyimpan...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
