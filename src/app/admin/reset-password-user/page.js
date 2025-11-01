'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Key, Search, User, Mail, Shield, AlertCircle } from 'lucide-react';

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
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      GURU: 'bg-blue-100 text-blue-800 border-blue-200',
      SISWA: 'bg-green-100 text-green-800 border-green-200',
      ORANG_TUA: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <AdminLayout>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.8 38.2 100 38.2 69.1 61.8 80.9 100 50 76.4 19.1 100 30.9 61.8 0 38.2 38.2 38.2 Z' fill='%23059669' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}></div>

      <div className="relative space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-sage-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
              <Key className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sage-800 to-emerald-700 bg-clip-text text-transparent">
                Reset Password User
              </h1>
              <p className="text-sage-600 mt-1">
                Reset password untuk Guru, Siswa, dan Orang Tua
              </p>
            </div>
          </div>
        </div>

        {/* Alert Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>Info:</strong> Gunakan fitur ini untuk mereset password user yang lupa password mereka.
                Password baru akan langsung diterapkan dan user bisa login dengan password baru tersebut.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-sage-100">
          <h2 className="text-xl font-bold text-sage-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Cari User
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Type */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Cari Berdasarkan
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-4 py-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="nis">NIS (Siswa)</option>
                  <option value="nip">NIP (Guru)</option>
                  <option value="noTelepon">No. Telepon</option>
                </select>
              </div>

              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Masukkan Data
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  placeholder={`Contoh: ${searchType === 'email' ? 'guru@tahfidz.sch.id' : searchType === 'nis' ? '123456' : searchType === 'nip' ? '987654' : '081234567890'}`}
                />
              </div>
            </div>

            {error && !searchResult && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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

        {/* Search Result & Reset Password Form */}
        {searchResult && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-sage-100">
            <h2 className="text-xl font-bold text-sage-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Data User
            </h2>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-sage-50 to-emerald-50 rounded-xl p-6 mb-6 border border-sage-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sage-600 mb-1">Nama Lengkap</p>
                  <p className="font-semibold text-sage-900">{searchResult.name}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600 mb-1">Email</p>
                  <p className="font-semibold text-sage-900">{searchResult.email}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600 mb-1">Role</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(searchResult.role)}`}>
                    {searchResult.role}
                  </span>
                </div>
                {searchResult.guru && (
                  <div>
                    <p className="text-sm text-sage-600 mb-1">NIP</p>
                    <p className="font-semibold text-sage-900">{searchResult.guru.nip}</p>
                  </div>
                )}
                {searchResult.siswa && (
                  <div>
                    <p className="text-sm text-sage-600 mb-1">NIS</p>
                    <p className="font-semibold text-sage-900">{searchResult.siswa.nis}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Password Form */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                  placeholder="Minimal 8 karakter"
                />
                <p className="text-xs text-sage-500 mt-1">
                  Password ini akan langsung aktif dan user bisa login dengan password baru
                </p>
              </div>

              {error && searchResult && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mereset Password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Reset Password
                  </div>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
