'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Lock,
  BookOpen,
  IdCard,
  UserCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { getStatusBadgeConfig } from '@/lib/helpers/statusHelpers';

// ProfileHeader Component
function ProfileHeader() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
              Profil Siswa
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
              Kelola informasi profil dan keamanan akun Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ProfileSummaryCard Component
function ProfileSummaryCard({ profileData, onEditProfile, onChangePassword }) {
  const statusBadge = getStatusBadgeConfig(profileData?.statusSiswa || 'AKTIF');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-3xl font-bold">
            {profileData?.nama?.charAt(0)?.toUpperCase() || 'S'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1 break-words">
          {profileData?.nama || 'Nama Siswa'}
        </h2>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <Mail size={14} />
          <span className="text-sm break-all">{profileData?.email || '-'}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <Shield size={16} />
          {profileData?.kelas || 'Siswa'}
        </div>

        {/* Dynamic Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}
        >
          <span className="text-sm">{statusBadge.emoji}</span>
          Status: {statusBadge.label}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onEditProfile}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Edit size={18} />
          Edit Profil
        </button>
        <button
          onClick={onChangePassword}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Lock size={18} />
          Ubah Password
        </button>
      </div>
    </div>
  );
}

// PersonalInfoCard Component (Read-only view only)
function PersonalInfoCard({ profileData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 rounded-lg bg-emerald-50">
          <User size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="text-gray-400" />
            Nama Lengkap
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.nama || '-'}</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="text-gray-400" />
            Email
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900 break-all">{profileData?.email || '-'}</p>
          </div>
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="text-gray-400" />
            Nomor WhatsApp
          </label>
          <div className={`px-4 py-3 rounded-xl border ${!profileData?.phone ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
            <p className="font-medium text-gray-900">{profileData?.phone ? profileData.phone : <span className="text-amber-700 italic">Belum diisi</span>}</p>
          </div>
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserCircle size={16} className="text-gray-400" />
            Jenis Kelamin
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.jenisKelamin || '-'}</p>
          </div>
        </div>

        {/* NISN */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <IdCard size={16} className="text-gray-400" />
            NISN
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900 font-mono">{profileData?.nisn || '-'}</p>
          </div>
        </div>

        {/* NIS */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <IdCard size={16} className="text-gray-400" />
            NIS
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900 font-mono">{profileData?.nis || '-'}</p>
          </div>
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="text-gray-400" />
            Tanggal Lahir
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.tanggalLahir || '-'}</p>
          </div>
        </div>

        {/* Kelas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BookOpen size={16} className="text-gray-400" />
            Kelas
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.kelas || '-'}</p>
          </div>
        </div>

        {/* Alamat (full width) */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="text-gray-400" />
            Alamat
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.alamat || '-'}</p>
          </div>
        </div>

        {/* Nama Wali */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="text-gray-400" />
            Nama Wali
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.namaWali || '-'}</p>
          </div>
        </div>

        {/* No HP Wali */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="text-gray-400" />
            No. HP Wali
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{profileData?.phoneWali || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// EditProfileModal Component
function EditProfileModal({ isOpen, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prefill form data when modal opens
  useEffect(() => {
    if (isOpen && profileData) {
      setFormData({
        nama: profileData.nama || '',
        phone: profileData.phone || '',
        jenisKelamin: profileData.jenisKelamin || '',
        tanggalLahir: profileData.tanggalLahir || '',
        alamat: profileData.alamat || '',
        namaWali: profileData.namaWali || '',
        phoneWali: profileData.phoneWali || '',
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, profileData]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError('');

      // Validasi required fields
      if (!formData.nama || !formData.phone) {
        setError('Nama dan nomor telepon wajib diisi');
        setSaveLoading(false);
        return;
      }

      // Validasi format nomor
      const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Format nomor telepon tidak valid');
        setSaveLoading(false);
        return;
      }

      if (formData.phoneWali && !phoneRegex.test(formData.phoneWali)) {
        setError('Format nomor HP wali tidak valid');
        setSaveLoading(false);
        return;
      }

      // Call onSave callback
      await onSave(formData);

      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Terjadi kesalahan saat menyimpan profil');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Edit size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Edit Informasi Pribadi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error/Success Message */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Lengkap - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="text-gray-400" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama || ''}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Nomor Telepon - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="text-gray-400" />
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Contoh: 0812-3456-7890"
              />
            </div>

            {/* Jenis Kelamin - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserCircle size={16} className="text-gray-400" />
                Jenis Kelamin
              </label>
              <select
                value={formData.jenisKelamin || ''}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="text-gray-400" />
                Tanggal Lahir
              </label>
              <input
                type="text"
                value={formData.tanggalLahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Contoh: 15 Mei 2010"
              />
            </div>

            {/* Email - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="text-gray-400" />
                Email <span className="text-xs text-gray-500">(Tidak dapat diubah)</span>
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900 break-all">{profileData?.email || '-'}</p>
              </div>
            </div>

            {/* NISN - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IdCard size={16} className="text-gray-400" />
                NISN <span className="text-xs text-gray-500">(Tidak dapat diubah)</span>
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900 font-mono">{profileData?.nisn || '-'}</p>
              </div>
            </div>

            {/* NIS - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IdCard size={16} className="text-gray-400" />
                NIS <span className="text-xs text-gray-500">(Tidak dapat diubah)</span>
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900 font-mono">{profileData?.nis || '-'}</p>
              </div>
            </div>

            {/* Kelas - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="text-gray-400" />
                Kelas <span className="text-xs text-gray-500">(Tidak dapat diubah)</span>
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900">{profileData?.kelas || '-'}</p>
              </div>
            </div>

            {/* Alamat - Editable (full width) */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="text-gray-400" />
                Alamat
              </label>
              <textarea
                rows={3}
                value={formData.alamat || ''}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            {/* Nama Wali - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="text-gray-400" />
                Nama Wali
              </label>
              <input
                type="text"
                value={formData.namaWali || ''}
                onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Masukkan nama wali"
              />
            </div>

            {/* No HP Wali - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="text-gray-400" />
                No. HP Wali
              </label>
              <input
                type="tel"
                value={formData.phoneWali || ''}
                onChange={(e) => setFormData({ ...formData, phoneWali: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Contoh: 0813-9876-5432"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saveLoading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saveLoading ? (
              <LoadingIndicator size="small" text="Menyimpan..." inline className="text-white" />
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilClient({ initialData }) {
  const [profileData, setProfileData] = useState(initialData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleEditProfile = () => {
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async (formData) => {
    try {
      const payload = {
        phone: formData.phone || '',
        alamat: formData.alamat || '',
      };

      const res = await fetch('/api/siswa/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfileData(updatedData);
        toast.success('Profil berhasil disimpan!');
        setShowEditModal(false);
        setError('');
      } else {
        const errorData = await res.json();
        const errorMsg = errorData.error || 'Gagal menyimpan profil';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = 'Terjadi kesalahan saat menyimpan profil';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!passwordFormData.oldPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      setError('Semua field wajib diisi');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('Password baru tidak sesuai dengan konfirmasi');
      return;
    }

    try {
      setSaveLoading(true);
      const payload = {
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword,
      };
            
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Password berhasil diubah!');
        setShowPasswordModal(false);
        setPasswordFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setError(''), 3000);
      } else {
        const data = await res.json();
        const errorMsg = data.error || 'Gagal mengubah password';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMsg = 'Terjadi kesalahan saat mengubah password';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <ProfileHeader />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileSummaryCard
            profileData={profileData}
            onEditProfile={handleEditProfile}
            onChangePassword={handleChangePassword}
          />
        </div>

        <div className="lg:col-span-2">
          <PersonalInfoCard profileData={profileData} />
        </div>
      </div>

      <Toaster position="top-right" />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Lock size={20} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Ganti Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{success}</div>}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Lama <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordFormData.oldPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                    placeholder="Masukkan password lama"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    minLength={6}
                    placeholder="Ketik ulang password baru"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={saveLoading}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={saveLoading}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saveLoading ? (
                  <LoadingIndicator size="small" text="Mengubah..." inline className="text-white" />
                ) : (
                  'Ubah Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
