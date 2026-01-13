'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, dobInput: dob, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setDefaultPassword(data.defaultPassword);
      } else {
        setError(data.error || 'Gagal mereset password. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Direset!</h1>
            <p className="text-gray-600">
              Password berhasil direset. Silakan login dengan password default.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-1">Password Default:</p>
            <p className="text-lg font-bold text-blue-900 break-all font-mono">{defaultPassword}</p>
            <p className="text-xs text-blue-700 mt-2">
              {role === 'ORANG_TUA' 
                ? 'Format: DDMMYYYY (contoh: 15012005 untuk 15 Januari 2005)'
                : 'Format: YYYY-MM-DD (contoh: 2005-01-15 untuk 15 Januari 2005)'
              }
            </p>
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
      {/* Islamic Geometric Pattern Background - Simplified */}
      <div className="absolute inset-0 opacity-3">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <path d="M30,15 L40,30 L30,45 L20,30 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-emerald-600"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Link href="/login" className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <h2 className="text-xl font-bold text-gray-900">Lupa Password</h2>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Masukkan username dan tanggal lahir untuk mereset password.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username (NIS / Kode Guru)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: 202512 atau 120A"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Date of Birth Input */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Anda
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'GURU', label: 'Guru' },
                  { value: 'SISWA', label: 'Siswa' },
                  { value: 'ORANG_TUA', label: 'Orang Tua' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                      role === option.value
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !dob || !role}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}