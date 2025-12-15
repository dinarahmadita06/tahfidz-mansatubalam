'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Key, Search, User, Mail, Shield, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function ResetPasswordUserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('email'); // email, nis, nip, noTelepon
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearchResult(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/search-user?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok && data.user) {
        setSearchResult(data.user);
      } else {
        setError(data.error || 'User tidak ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/reset-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: searchResult.id,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Password untuk ${searchResult.name} berhasil direset!`);
        setNewPassword('');
        setSearchResult(null);
        setSearchQuery('');
      } else {
        setError(data.error || 'Gagal reset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat reset password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      GURU: 'bg-blue-100 text-blue-700 border-blue-200',
      SISWA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      ORANG_TUA: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen py-8 px-4">
        {/* Container utama dengan max-width compact & centered */}
        <div className="max-w-[480px] mx-auto space-y-6">

          {/* Header Section - Elegant */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
              <Key className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Reset Password User
            </h1>
            <p className="text-sm text-gray-600">
              Atur ulang password untuk akun pengguna melalui kontrol admin
            </p>
          </div>

          {/* Success Alert - Smooth with left accent */}
          {success && (
            <div
              className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-4 flex items-start gap-3 animate-[slideIn_0.3s_ease-out]"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 font-medium">{success}</p>
            </div>
          )}

          {/* Search Card - Modern & Clean */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              Cari User
            </h2>
            <p className="text-sm text-gray-500 mb-6">Cari pengguna berdasarkan email, NIS, NIP, atau nomor telepon</p>

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Type Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Cari Berdasarkan
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition-all duration-200 outline-none"
                >
                  <option value="email">Email</option>
                  <option value="nis">NIS (Siswa)</option>
                  <option value="nip">NIP (Guru)</option>
                  <option value="noTelepon">No. Telepon</option>
                </select>
              </div>

              {/* Search Query Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Masukkan Data
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition-all duration-200 outline-none"
                  placeholder={`Contoh: ${searchType === 'email' ? 'guru@tahfidz.sch.id' : searchType === 'nis' ? '2024001' : searchType === 'nip' ? '987654' : '081234567890'}`}
                />
              </div>

              {/* Error Alert - Smooth with left accent */}
              {error && !searchResult && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button - Premium Gradient */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mencari...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Cari User
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* User Result & Reset Password Card */}
          {searchResult && (
            <div className="bg-white rounded-2xl p-7 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-gray-100 animate-[fadeIn_0.4s_ease-out]">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Data User Ditemukan
              </h2>
              <p className="text-sm text-gray-500 mb-6">Informasi pengguna yang akan direset passwordnya</p>

              {/* User Info Card - Soft Background */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-100">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900">{searchResult.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(searchResult.role)}`}>
                      {searchResult.role}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-800 text-sm">{searchResult.email}</p>
                  </div>

                  {searchResult.guru && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">NIP</p>
                      <p className="font-medium text-gray-800 text-sm">{searchResult.guru.nip}</p>
                    </div>
                  )}

                  {searchResult.siswa && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">NIS</p>
                      <p className="font-medium text-gray-800 text-sm">{searchResult.siswa.nis}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password Baru
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition-all duration-200 outline-none"
                    placeholder="Minimal 8 karakter"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Password akan langsung aktif setelah direset
                  </p>
                </div>

                {/* Error Alert - Smooth with left accent */}
                {error && searchResult && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Reset Button - Premium Gradient */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 hover:shadow-[0_4px_16px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mereset Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Reset Password Sekarang
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </AdminLayout>
  );
}
