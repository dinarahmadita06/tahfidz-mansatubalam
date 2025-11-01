'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const quickLogin = (role) => {
    const credentials = {
      ADMIN: { email: 'admin@tahfidz.sch.id', password: '123456' },
      GURU: { email: 'ahmad.fauzi@tahfidz.sch.id', password: '123456' },
      SISWA: { email: 'abdullah.rahman@siswa.tahfidz.sch.id', password: '123456' },
      ORANG_TUA: { email: 'ortu.24001@parent.tahfidz.sch.id', password: '123456' },
    };

    const cred = credentials[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with email:', email);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('📝 Login result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);

        // Provide more specific error messages
        if (result.error === 'CredentialsSignin') {
          setError('Username/Email/No HP atau password salah. Silakan coba lagi.');
        } else if (result.error === 'Configuration') {
          setError('Terjadi kesalahan konfigurasi. Silakan refresh halaman dan coba lagi.');
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        console.log('✅ Login successful, fetching session...');
        // Fetch session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        console.log('👤 Session data:', session);

        // Log login activity
        try {
          await fetch('/api/auth/log-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'LOGIN' })
          });
        } catch (err) {
          console.error('⚠️ Failed to log activity:', err);
        }

        // Redirect based on role
        const dashboardMap = {
          ADMIN: '/admin',
          GURU: '/guru',
          SISWA: '/siswa',
          ORANG_TUA: '/orangtua',
        };

        const redirectPath = dashboardMap[session?.user?.role] || '/';
        console.log('🔀 Redirecting to:', redirectPath, 'for role:', session?.user?.role);

        // Use router.push instead of window.location.href to avoid full page reload
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err) {
      console.error('💥 Login exception:', err);
      setError('Terjadi kesalahan saat login: ' + err.message);
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
            SIMTAQ
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Informasi Manajemen Tahfidz Qur'an
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username/Email/HP Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Username / Email / No HP
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                  placeholder="contoh: admin@example.com atau 081234567890"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">atau</span>
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

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">
              (Quick Login hanya untuk Testing/Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('ADMIN')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-colors border border-emerald-600"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('GURU')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-colors border border-emerald-600"
              >
                Guru
              </button>
              <button
                type="button"
                onClick={() => quickLogin('SISWA')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-colors border border-emerald-600"
              >
                Siswa
              </button>
              <button
                type="button"
                onClick={() => quickLogin('ORANG_TUA')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium transition-colors border border-emerald-600"
              >
                Orang Tua
              </button>
            </div>
          </div>
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
