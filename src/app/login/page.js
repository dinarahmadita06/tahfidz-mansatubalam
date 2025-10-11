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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4 shadow-lg">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tahfidz Management
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Manajemen Hafalan Al-Quran
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center font-medium mb-3">
              Quick Login (Klik untuk auto-fill):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('ADMIN')}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
              >
                🔧 Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('GURU')}
                className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition"
              >
                👨‍🏫 Guru
              </button>
              <button
                type="button"
                onClick={() => quickLogin('SISWA')}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition"
              >
                🎓 Siswa
              </button>
              <button
                type="button"
                onClick={() => quickLogin('ORANG_TUA')}
                className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition"
              >
                👨‍👩‍👧 Orang Tua
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                💡 <strong>Tip:</strong> Klik tombol role di atas untuk otomatis mengisi email & password
              </p>
            </div>
          </div>
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
