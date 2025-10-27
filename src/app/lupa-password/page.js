'use client';

import { useState } from 'react';
import { BookOpen, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LupaPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Gagal mengirim link reset password');
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
            Reset Password
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Manajemen Hafalan Al-Quran
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Link Terkirim!</h2>
              <p className="text-gray-600 mb-6">
                Link reset password telah dikirim ke Email (Admin/Guru) atau WhatsApp (Orang Tua/Siswa) Anda.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <ArrowLeft size={20} />
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Masukkan username, email, atau nomor HP Anda
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Identifier Input */}
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                    Username / Email / No HP
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type="text"
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                      placeholder="contoh: admin@example.com atau 081234567890"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </div>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </button>

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Link reset password akan dikirim ke Email (Admin/Guru) atau WhatsApp (Orang Tua/Siswa).
                </p>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            © 2025 Tahfidz Management System
          </p>
        </div>
      </div>
    </div>
  );
}
