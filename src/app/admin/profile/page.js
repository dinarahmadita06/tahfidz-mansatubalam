'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Edit,
  Lock,
  Home,
  ChevronRight,
  Briefcase,
  IdCard
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ProfileAdminPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile');

      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile);
      } else {
        // Fallback to default data if API fails
        setProfileData({
          nama: session?.user?.name || 'Administrator Tahfidz',
          email: session?.user?.email || 'admin@tahfidz.com',
          role: 'Administrator',
          phoneNumber: '0812-3456-7890',
          jabatan: 'Koordinator Tahfidz',
          nip: 'ADM.2024.001',
          alamat: 'MAN 1 Bandar Lampung, Jl. Raden Intan No. 12',
          tanggalBergabung: '15 Agustus 2024',
          lastLogin: new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to default data
      setProfileData({
        nama: session?.user?.name || 'Administrator Tahfidz',
        email: session?.user?.email || 'admin@tahfidz.com',
        role: 'Administrator',
        phoneNumber: '0812-3456-7890',
        jabatan: 'Koordinator Tahfidz',
        nip: 'ADM.2024.001',
        alamat: 'MAN 1 Bandar Lampung, Jl. Raden Intan No. 12',
        tanggalBergabung: '15 Agustus 2024',
        lastLogin: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      nama: profileData.nama,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber,
      jabatan: profileData.jabatan,
      nip: profileData.nip,
      alamat: profileData.alamat
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setShowPasswordModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      setError('');

      console.log('Sending profile update:', editFormData);

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        setSuccess('Profil berhasil diperbarui!');
        await fetchProfileData();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    try {
      setSaveLoading(true);
      setError('');

      if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
        setError('Password baru dan konfirmasi tidak cocok');
        setSaveLoading(false);
        return;
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordFormData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password berhasil diubah!');
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess('');
          setPasswordFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }, 2000);
      } else {
        setError(data.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div
        className="min-h-screen p-8"
        style={{
          background: 'linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Home size={16} />
          <ChevronRight size={14} />
          <span className="font-medium text-emerald-700">Profil Admin</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl shadow-lg">
            <User className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Admin</h1>
            <p className="text-sm text-gray-600 mt-1">
              Lihat dan kelola informasi akun Anda
            </p>
          </div>
        </div>

        {/* Main Profile Card */}
        <div
          className="bg-white rounded-2xl p-8 mb-6 max-w-4xl mx-auto"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-emerald-100">
                <User className="text-white" size={56} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profileData?.nama}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Mail size={16} />
                <span className="text-sm">{profileData?.email}</span>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200 mb-4">
                <Shield size={16} />
                {profileData?.role}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-emerald-600" />
                  <span>Bergabung sejak: <span className="font-medium text-gray-900">{profileData?.tanggalBergabung}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-amber-600" />
                  <span>Terakhir login: <span className="font-medium text-gray-900">{profileData?.lastLogin}</span></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all duration-200"
                >
                  <Edit size={18} />
                  Edit Profil
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 hover:shadow-md transition-all duration-200"
                >
                  <Lock size={18} />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biodata Section */}
        <div
          className="bg-white rounded-2xl p-8 mb-6 max-w-4xl mx-auto"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Biodata Lengkap
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomor Telepon */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Phone size={16} className="text-emerald-600" />
                Nomor Telepon
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border-b-2 border-gray-200">
                <p className="text-gray-900 font-medium">{profileData?.phoneNumber}</p>
              </div>
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Briefcase size={16} className="text-emerald-600" />
                Jabatan
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border-b-2 border-gray-200">
                <p className="text-gray-900 font-medium">{profileData?.jabatan}</p>
              </div>
            </div>

            {/* NIP/ID Admin */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <IdCard size={16} className="text-emerald-600" />
                NIP / ID Admin
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border-b-2 border-gray-200">
                <p className="text-gray-900 font-medium font-mono">{profileData?.nip}</p>
              </div>
            </div>

            {/* Alamat Kantor */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <MapPin size={16} className="text-emerald-600" />
                Alamat Kantor
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border-b-2 border-gray-200">
                <p className="text-gray-900 font-medium">{profileData?.alamat}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Akun Card */}
        <div
          className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl p-6 max-w-4xl mx-auto border border-emerald-200"
          style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Lock size={20} className="text-emerald-700" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Informasi Akun</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Akun ini memiliki hak akses penuh terhadap sistem Tahfidz MAN 1 Bandar Lampung.
                Pastikan untuk menjaga kerahasiaan kredensial login Anda dan segera laporkan
                jika ada aktivitas mencurigakan.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Profil</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success/Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phoneNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={editFormData.jabatan || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP / ID Admin
                  </label>
                  <input
                    type="text"
                    value={editFormData.nip || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nip: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Kantor
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Ganti Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success/Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-5">
                {/* Password Lama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={passwordFormData.oldPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-900 mb-2">Persyaratan Password:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Minimal 8 karakter</li>
                  <li>• Mengandung huruf besar dan kecil</li>
                  <li>• Mengandung angka dan simbol</li>
                </ul>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePasswordSubmit}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
