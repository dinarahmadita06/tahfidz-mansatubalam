'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Key, Search, User, Mail, Shield, AlertCircle, CheckCircle, Lock, Info, Clock, UserCheck } from 'lucide-react';
import LoadingIndicator from "@/components/shared/LoadingIndicator";

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header Section - Elegant */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl mb-5">
              <Key className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontSize: '24px' }}>
              Reset Password User
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Atur ulang password untuk akun pengguna melalui kontrol admin
            </p>
          </div>

          {/* Info Card - Tips & Panduan */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2 text-lg">Panduan Penggunaan</h3>
                <p className="text-sm text-blue-800 leading-relaxed mb-3">
                  Gunakan fitur ini untuk mereset password user yang lupa passwordnya. Admin dapat mencari berdasarkan <strong>email, NIS, NIP, atau nomor telepon</strong>.
                </p>
                <div className="flex items-start gap-2 text-sm text-blue-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Password baru akan langsung aktif setelah direset</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Alert - Smooth with left accent */}
          {success && (
            <div
              className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-5 flex items-start gap-3 shadow-sm animate-[slideIn_0.3s_ease-out]"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-900 mb-1">Berhasil!</p>
                <p className="text-sm text-emerald-800">{success}</p>
              </div>
            </div>
          )}

          {/* Search Card - Modern & Clean */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Cari User</h2>
                <p className="text-sm text-gray-500">Temukan pengguna yang akan direset passwordnya</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Search Type Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Cari Berdasarkan
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition-all duration-200 outline-none font-medium"
                  >
                    <option value="email">📧 Email</option>
                    <option value="nis">🎓 NIS (Siswa)</option>
                    <option value="nip">👨‍🏫 NIP (Guru)</option>
                    <option value="noTelepon">📱 No. Telepon</option>
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
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 transition-all duration-200 outline-none"
                    placeholder={`Contoh: ${searchType === 'email' ? 'guru@tahfidz.sch.id' : searchType === 'nis' ? '2024001' : searchType === 'nip' ? '987654' : '081234567890'}`}
                  />
                </div>
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
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <LoadingIndicator inline text="Mencari..." size="small" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>Cari User</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* User Result & Reset Password Card */}
          {searchResult && (
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Data User Ditemukan</h2>
                  <p className="text-sm text-gray-500">Informasi pengguna yang akan direset passwordnya</p>
                </div>
              </div>

              {/* User Info Card - Detailed */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nama & Role */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Nama Lengkap</p>
                        <p className="text-xl font-bold text-gray-900">{searchResult.name}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold border shadow-sm ${getRoleBadgeColor(searchResult.role)}`}>
                        {searchResult.role}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {searchResult.email}
                    </p>
                  </div>

                  {/* NIP/NIS */}
                  {searchResult.guru && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">NIP</p>
                      <p className="font-semibold text-gray-800">{searchResult.guru.nip || '-'}</p>
                    </div>
                  )}

                  {searchResult.siswa && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">NIS</p>
                      <p className="font-semibold text-gray-800">{searchResult.siswa.nis || '-'}</p>
                    </div>
                  )}

                  {/* Tanggal Bergabung */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {formatDate(searchResult.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm font-medium text-gray-500">Form Reset Password</span>
                </div>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-purple-500 focus:ring-3 focus:ring-purple-100 transition-all duration-200 outline-none"
                    placeholder="Minimal 8 karakter"
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Password akan langsung aktif dan user dapat login dengan password baru ini</p>
                  </div>
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
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <LoadingIndicator inline text="Mereset Password..." size="small" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>Reset Password Sekarang</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}
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

        @media (max-width: 768px) {
          .reset-password-container {
            padding: 16px 16px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
