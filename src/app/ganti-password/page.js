'use client';

import { useState } from 'react';
import { BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function GantiPasswordPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi password
    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Password baru harus berbeda dengan password lama.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password berhasil diubah! Silakan login kembali.');

        // Redirect based on role
        const dashboardMap = {
          ADMIN: '/admin',
          GURU: '/guru',
          SISWA: '/dashboard',
          ORANG_TUA: '/orangtua',
        };

        const redirectPath = dashboardMap[session?.user?.role] || '/';
        router.push(redirectPath);
      } else {
        setError(data.error || 'Gagal mengubah password');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Islamic Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,20 L65,35 L50,50 L35,35 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,50 L65,65 L50,80 L35,65 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M20,50 L35,65 L50,50 L35,35 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,50 L65,35 L80,50 L65,65 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-emerald-600"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            Ganti Password
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Informasi Manajemen Tahfidz Qur'an
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 text-center">
              Untuk keamanan, Anda harus mengganti password default Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Old Password Input */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Password Lama
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all ${
                    !oldPassword && error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all ${
                    newPassword && newPassword.length < 8 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Password minimal 8 karakter.</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all ${
                    confirmPassword && confirmPassword !== newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Konfirmasi password tidak cocok.</p>
              )}
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1">
                  <Lock size={12} /> Persyaratan Password:
                </p>
                <ul className="text-[10px] text-emerald-700 space-y-0.5">
                  <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {newPassword.length >= 8 ? '✓' : '•'} Minimal 8 karakter
                  </li>
                  <li className={`flex items-center gap-1 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '•'} Konfirmasi cocok
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading || 
                !oldPassword || 
                newPassword.length < 8 || 
                newPassword !== confirmPassword
              }
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {loading ? (
                <LoadingIndicator text="Menyimpan..." size="small" inline />
              ) : (
                'Simpan'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            © 2025 SIMTAQ
          </p>
        </div>
      </div>
    </div>
  );
}
