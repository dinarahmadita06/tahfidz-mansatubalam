'use client';

import { signIn } from 'next-auth/react';
import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, BookOpen, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load remembered username
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('remembered_identifier');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 [LOGIN] Attempting login with identifier:', identifier);

      const result = await signIn('credentials', {
        identifier,
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      console.log('📝 [LOGIN] SignIn result:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      });

      if (result?.error) {
        console.error('❌ [LOGIN] Login failed:', result.error);

        if (result.error === 'CredentialsSignin') {
          setError('Email atau password salah. Silakan coba lagi.');
        } else if (result.error === 'Configuration') {
          setError('Terjadi kesalahan konfigurasi server.');
        } else {
          // Show the actual error message from authorize() if available
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      // Handle "Remember Me" locally
      if (rememberMe) {
        localStorage.setItem('remembered_identifier', identifier);
      } else {
        localStorage.removeItem('remembered_identifier');
      }

      // Login successful
      console.log('✅ [LOGIN] Login successful! Status:', result?.status);
      console.log('🔄 [LOGIN] Fetching session...');

      // Wait a bit for the session to be created
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch session to get user role
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      console.log('👤 [LOGIN] Session fetched:', {
        hasUser: !!session?.user,
        role: session?.user?.role,
        email: session?.user?.email
      });

      if (!session?.user) {
        console.error('❌ [LOGIN] No session found after login!');
        setError('Login berhasil tapi session tidak ditemukan. Silakan refresh halaman.');
        setLoading(false);
        return;
      }

      // Log login activity
      try {
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'LOGIN' })
        });
      } catch (err) {
        console.error('⚠️ [LOGIN] Failed to log activity:', err);
      }

      // Redirect based on role
      const dashboardMap = {
        ADMIN: '/admin',
        GURU: '/guru',
        SISWA: '/siswa',
        ORANG_TUA: '/orangtua',
      };

      const redirectPath = dashboardMap[session.user.role] || '/siswa';
      console.log('🔀 [LOGIN] Redirecting to:', redirectPath, 'for role:', session.user.role);

      // Force a full page navigation to ensure middleware processes the token
      window.location.href = redirectPath;
    } catch (err) {
      console.error('💥 [LOGIN] Login exception:', err);
      setError('Terjadi kesalahan saat login: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
        <LoadingIndicator text="Loading..." />
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
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
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full mb-3 shadow-md">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-1">
              SIMTAQ
            </h1>
            <p className="text-gray-600 text-base">
              Sistem Informasi Manajemen Tahfidz Qur'an
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-5">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Username/Email/HP Input */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Username 
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                  <input
                    type="text"
                    id="identifier"
                    name="username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-300 focus:border-transparent transition-all"
                    placeholder="contoh: 202512, 120A dll"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-300 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500 group-hover:border-emerald-400"></div>
                    <CheckCircle2 size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">Ingat saya</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
              >
                {loading ? (
                  <LoadingIndicator text="Loading..." size="small" inline />
                ) : (
                  'Login'
                )}
              </button>

              {/* Lupa Password Link */}
              <div className="text-center">
                <Link
                  href="/lupa-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
                >
                  🔗 Lupa Password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Registrasi Orang Tua Section */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Orang Tua Belum Punya Akun?
              </p>
              <Link
                href="/registrasi-orang-tua"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-semibold inline-flex items-center gap-1"
              >
                🔗 Daftar di sini
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-5">
            <p className="text-gray-600 text-sm">
              © 2025 SIMTAQ
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}