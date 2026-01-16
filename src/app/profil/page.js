'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircle, Mail, Phone, MapPin, School, Lock, Save, Edit2, X } from 'lucide-react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import RecoveryCodeModal from '@/components/shared/RecoveryCodeModal';

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    alamat: '',
  });

  const [siswaInfo, setSiswaInfo] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Load profile data from session
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        alamat: session.user.alamat || '',
      });
      fetchSiswaInfo();
    }
  }, [status, session, router]);

  const fetchSiswaInfo = async () => {
    try {
      const res = await fetch('/api/siswa?userId=' + session.user.id);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSiswaInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching siswa info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setSuccess(true);
        setEditMode(false);
        await update();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert('Password berhasil diubah');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to change password'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecoveryCode = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengatur ulang recovery code? Kode lama akan hangus dan kode baru akan dibuat.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/setup-recovery', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setRecoveryCode(data.recoveryCode);
        setShowRecoveryModal(true);
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to regenerate recovery code'));
      }
    } catch (error) {
      console.error('Error regenerating recovery code:', error);
      alert('Terjadi kesalahan saat mengatur ulang recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryConfirm = () => {
    setShowRecoveryModal(false);
    setRecoveryCode('');
    // Optionally redirect to dashboard or show success message
    router.push('/dashboard');
  };

  const handleCloseRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryCode('');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <SiswaLayout>
      {/* Header */}
      <div className="mb-6" style={{ padding: '20px' }}>
        <div className="flex items-center justify-between md:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg flex items-center justify-center" style={{ width: '42px', height: '42px' }}>
              <UserCircle size={20} className="text-white md:block hidden" />
              <UserCircle size={18} className="text-white md:hidden" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 md:text-2xl" style={{ fontSize: '20px' }}>Profil Saya</h1>
              <p className="text-sm text-gray-600">Kelola informasi profil Anda</p>
            </div>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition md:px-4 md:py-2"
              style={{ padding: '10px 18px', minHeight: '44px', fontSize: '13px' }}
            >
              <Edit2 size={16} />
              Edit Profil
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✓ Profil berhasil diperbarui!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden mb-6 md:rounded-lg" style={{ borderRadius: '16px' }}>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 md:px-8" style={{ padding: '24px 20px' }}>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full flex items-center justify-center md:w-20 md:h-20" style={{ width: '64px', height: '64px' }}>
                <span className="font-bold text-blue-600 md:text-4xl" style={{ fontSize: '28px' }}>
                  {profileData.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="text-white">
                <h2 className="font-bold md:text-2xl" style={{ fontSize: '18px' }}>{profileData.name || 'Nama Siswa'}</h2>
                <p className="text-blue-100 md:text-sm" style={{ fontSize: '13px' }}>Siswa {siswaInfo?.kelas?.nama || ''}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="md:p-8 md:px-8" style={{ padding: '20px' }}>
            <div className="space-y-6">
              {/* Informasi Pribadi */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 md:text-lg" style={{ fontSize: '16px' }}>
                  <UserCircle size={18} className="text-blue-600" />
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5" style={{ gap: '16px' }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!editMode}
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Phone size={14} />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      disabled={!editMode}
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="08xx xxxx xxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <School size={14} />
                      Kelas
                    </label>
                    <input
                      type="text"
                      disabled
                      value={siswaInfo?.kelas?.nama || '-'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin size={14} />
                      Alamat
                    </label>
                    <textarea
                      rows={3}
                      disabled={!editMode}
                      value={profileData.alamat}
                      onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Alamat lengkap..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      // Reset form
                      setProfileData({
                        name: session.user.name || '',
                        email: session.user.email || '',
                        phone: session.user.phone || '',
                        alamat: session.user.alamat || '',
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingIndicator text="Menyimpan..." size="small" inline className="text-white" />
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white shadow-sm border border-gray-200 md:rounded-lg md:p-8" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 md:text-lg" style={{ fontSize: '16px' }}>
            <Lock size={18} className="text-blue-600" />
            Keamanan
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600">Ubah password akun Anda</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Ubah Password
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div>
              <p className="font-medium text-gray-900">Recovery Code</p>
              <p className="text-sm text-gray-600">Atur ulang kode pemulihan akun Anda</p>
            </div>
            <button
              onClick={handleRegenerateRecoveryCode}
              className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition"
            >
              Regenerasi Kode
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 md:rounded-lg" style={{ padding: '16px', borderRadius: '16px' }}>
          <p className="text-sm text-blue-900">
            <strong>💡 Tips:</strong> Pastikan informasi profil Anda selalu ter-update.
            Jika ada perubahan data seperti nomor telepon atau alamat, segera perbarui profil Anda.
          </p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl max-w-md w-full md:rounded-lg" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between border-b md:p-6" style={{ padding: '20px' }}>
              <h3 className="font-semibold text-gray-900 md:text-lg" style={{ fontSize: '16px' }}>Ubah Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 md:p-6" style={{ padding: '20px' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Lama <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password lama"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordData.newPassword && passwordData.newPassword.length < 8 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Minimal 8 karakter"
                />
                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                  <p className="text-xs text-red-600 mt-1 font-medium">Password minimal 8 karakter.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ketik ulang password baru"
                />
                {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                  <p className="text-xs text-red-600 mt-1 font-medium">Konfirmasi password tidak cocok.</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-2">Persyaratan Password:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Minimal 8 karakter</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || 
                    !passwordData.currentPassword || 
                    passwordData.newPassword.length < 8 || 
                    passwordData.newPassword !== passwordData.confirmPassword
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? (
                    <LoadingIndicator text="Menyimpan..." size="small" inline className="text-white" />
                  ) : (
                    'Ubah Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Code Modal */}
      <RecoveryCodeModal
        isOpen={showRecoveryModal}
        onClose={handleCloseRecoveryModal}
        recoveryCode={recoveryCode}
        onConfirm={handleRecoveryConfirm}
      />
    </SiswaLayout>
  );
}
