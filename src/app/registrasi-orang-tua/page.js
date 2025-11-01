'use client';

import { useState } from 'react';
import { BookOpen, User, Phone, Lock, Eye, EyeOff, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistrasiOrangTuaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Verifikasi Anak, 2: Data Orang Tua
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Verifikasi Anak
  const [nis, setNis] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');

  // Step 2: Data Orang Tua
  const [namaLengkap, setNamaLengkap] = useState('');
  const [noHP, setNoHP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleVerifikasiAnak = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, tanggalLahir }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        setError(data.error || 'NIS atau tanggal lahir tidak cocok');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrasi = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi password
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    // Validasi nomor HP
    if (!noHP.startsWith('08')) {
      setError('Nomor HP harus diawali dengan 08');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-orangtua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nis,
          tanggalLahir,
          namaLengkap,
          noHP,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registrasi berhasil! Silakan login dengan nomor HP Anda.');
        router.push('/login');
      } else {
        setError(data.error || 'Gagal melakukan registrasi');
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
            Registrasi Orang Tua
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Informasi Manajemen Tahfidz Qur'an
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'} font-semibold text-sm`}>
              1
            </div>
            <div className={`w-12 h-1 ${step === 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'} font-semibold text-sm`}>
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Verifikasi Anak</h2>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Masukkan data anak Anda untuk verifikasi
              </p>

              <form onSubmit={handleVerifikasiAnak} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* NIS Input */}
                <div>
                  <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-2">
                    NIS Anak
                  </label>
                  <div className="relative">
                    <CreditCard size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type="text"
                      id="nis"
                      value={nis}
                      onChange={(e) => setNis(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                      placeholder="Masukkan NIS anak"
                    />
                  </div>
                </div>

                {/* Tanggal Lahir Input */}
                <div>
                  <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir Anak
                  </label>
                  <div className="relative">
                    <Calendar size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type="date"
                      id="tanggalLahir"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memverifikasi...
                    </div>
                  ) : (
                    'Lanjutkan'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Data Orang Tua</h2>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Lengkapi data Anda untuk membuat akun
              </p>

              <form onSubmit={handleRegistrasi} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type="text"
                      id="namaLengkap"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                {/* Nomor HP */}
                <div>
                  <label htmlFor="noHP" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor HP
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type="tel"
                      id="noHP"
                      value={noHP}
                      onChange={(e) => setNoHP(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nomor HP ini akan menjadi username Anda
                  </p>
                </div>

                {/* Password */}
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimal 8 karakter, kombinasi huruf dan angka
                  </p>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mendaftar...
                    </div>
                  ) : (
                    'Daftar'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              <ArrowLeft size={16} />
              Sudah punya akun? Login di sini
            </Link>
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
