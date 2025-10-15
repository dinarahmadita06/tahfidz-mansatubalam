'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const quickLogin = (role) => {
    const credentials = {
      ADMIN: { email: 'admin@tahfidz.sch.id', password: 'admin123' },
      GURU: { email: 'guru@tahfidz.sch.id', password: 'guru123' },
      SISWA: { email: 'siswa@example.com', password: 'siswa123' },
      ORANG_TUA: { email: 'orangtua@example.com', password: 'orangtua123' },
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
          setError('Email atau password salah. Silakan coba lagi.');
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
          SISWA: '/dashboard',
          ORANG_TUA: '/orangtua',
        };

        const redirectPath = dashboardMap[session?.user?.role] || '/';
        console.log('🔀 Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      }
    } catch (err) {
      console.error('💥 Login exception:', err);
      setError('Terjadi kesalahan saat login: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
            Tahfidz Management
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Manajemen Hafalan Al-Quran
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 border border-sage-100">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-sage-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition-colors bg-sage-50/30"
                  placeholder="nama@example.com"
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
                  className="w-full pl-12 pr-12 py-3 border border-sage-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition-colors bg-sage-50/30"
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
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
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
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-sage-100">
            <p className="text-sm text-gray-600 text-center font-medium mb-4">
              Quick Login (Klik untuk auto-fill):
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => quickLogin('ADMIN')}
                className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-blue-200"
              >
                🔧 Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('GURU')}
                className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-emerald-200"
              >
                👨‍🏫 Guru
              </button>
              <button
                type="button"
                onClick={() => quickLogin('SISWA')}
                className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-purple-200"
              >
                🎓 Siswa
              </button>
              <button
                type="button"
                onClick={() => quickLogin('ORANG_TUA')}
                className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-amber-200"
              >
                👨‍👩‍👧 Orang Tua
              </button>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-sage-50 to-cream-50 rounded-2xl border border-sage-100">
              <p className="text-xs text-gray-600 text-center">
                💡 <strong>Tip:</strong> Klik tombol role di atas untuk otomatis mengisi email & password
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm backdrop-blur-sm bg-white/50 rounded-full px-4 py-2 inline-block">
            © 2025 Tahfidz Management System
          </p>
        </div>
      </div>
    </div>
  );
}
