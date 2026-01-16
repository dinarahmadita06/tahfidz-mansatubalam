'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  MapPin,
  Shield,
  Edit,
  Lock,
  UserCircle,
  Loader,
  X,
  BookOpen,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import RecoveryCodeModal from '@/components/shared/RecoveryCodeModal';

// Single Source of Truth: Profile Fields Configuration
// Layout order: Row 1 (Nama | Telepon), Row 2 (Email | Status), Row 3 (Alamat full-width)
const PROFILE_FIELDS_CONFIG = [
  {
    key: 'namaLengkap',
    label: 'Nama Lengkap',
    icon: User,
    editable: true,
    required: true,
    type: 'text',
    placeholder: 'Masukkan nama lengkap',
    gridCols: 'md:col-span-1', // Changed from md:col-span-2 for balanced layout
  },
  {
    key: 'noTelepon',
    label: 'Nomor Telepon',
    icon: Phone,
    editable: true,
    required: true,
    type: 'tel',
    placeholder: 'Contoh: 0812-3456-7890',
    gridCols: 'md:col-span-1',
    validate: (value) => {
      const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
      return phoneRegex.test(value) ? null : 'Format nomor telepon tidak valid';
    },
  },
  {
    key: 'status',
    label: 'Status Keanggotaan',
    icon: Shield,
    editable: false,
    required: false,
    type: 'text',
    readOnlyNote: '(Tidak dapat diubah)',
    gridCols: 'md:col-span-1',
  },
  {
    key: 'alamat',
    label: 'Alamat Rumah',
    icon: MapPin,
    editable: true,
    required: false,
    type: 'textarea',
    placeholder: 'Masukkan alamat lengkap',
    gridCols: 'md:col-span-2',
    rows: 3,
  },
];

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
              Profil Orang Tua
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
              Kelola informasi profil dan data anak Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ProfileSummaryCard Component
function ProfileSummaryCard({ profileData, onEditProfile, onChangePassword, onRegenerateRecoveryCode }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-3xl font-bold">
            {profileData?.namaLengkap?.charAt(0)?.toUpperCase() || 'O'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 break-words">
          {profileData?.namaLengkap || 'Nama Orang Tua'}
        </h2>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
          <Shield size={16} />
          Orang Tua / Wali Siswa
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Status Aktif
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
        <button
          onClick={onRegenerateRecoveryCode}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Lock size={18} />
          Regenerasi Kode
        </button>
      </div>
    </div>
  );
}

// PersonalInfoCard Component (Read-only view using fieldsConfig)
function PersonalInfoCard({ profileData }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 rounded-lg bg-emerald-50">
          <User size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROFILE_FIELDS_CONFIG.map((field) => {
          const IconComponent = field.icon;
          const isReadOnly = !field.editable;
          const isTextarea = field.type === 'textarea';

          return (
            <div key={field.key} className={field.gridCols}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IconComponent size={16} className="text-gray-400" />
                {field.label}
                {isReadOnly && (
                  <span className="text-xs text-gray-500 italic">{field.readOnlyNote}</span>
                )}
              </label>
              <div
                className={`px-4 rounded-xl border ${
                  isReadOnly
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300'
                } ${isTextarea ? 'py-3 min-h-[88px]' : 'py-3 h-[48px] flex items-center'}`}
              >
                <p
                  className={`font-medium break-all ${
                    isReadOnly ? 'text-gray-600' : 'text-gray-900'
                  }`}
                >
                  {profileData?.[field.key] || '-'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Children Connected Section
function ChildrenConnectedCard({ children }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 rounded-lg bg-emerald-50">
          <Users size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Anak yang Terhubung</h3>
      </div>

      {!children || children.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto text-gray-300 mb-2" size={48} />
          <p className="text-gray-500 text-sm">Belum ada anak yang terhubung</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => {
            return (
              <div
                key={child.id}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {child.namaLengkap?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1">{child.namaLengkap}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{child.kelas}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// EditProfileModal Component (Using fieldsConfig)
function EditProfileModal({ isOpen, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && profileData) {
      // Initialize formData with only editable fields
      const initialData = {};
      PROFILE_FIELDS_CONFIG.filter((f) => f.editable).forEach((field) => {
        initialData[field.key] = profileData[field.key] || '';
      });
      setFormData(initialData);
      setError('');
      setSuccess('');

      // Autofocus first input after modal opens
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, profileData]);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError('');

      // Validate required fields
      for (const field of PROFILE_FIELDS_CONFIG.filter((f) => f.editable)) {
        if (field.required && !formData[field.key]?.trim()) {
          setError(`${field.label} wajib diisi`);
          setSaveLoading(false);
          return;
        }

        // Custom validation
        if (field.validate && formData[field.key]) {
          const validationError = field.validate(formData[field.key]);
          if (validationError) {
            setError(validationError);
            setSaveLoading(false);
            return;
          }
        }
      }

      // SECURITY: Ensure data being saved matches the session parent
      // (API will validate on server side anyway)
      await onSave(formData);

      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saveLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Green Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Edit size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Edit Informasi Pribadi</h3>
          </div>
          <button
            onClick={onClose}
            disabled={saveLoading}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Body - Solid White Background */}
        <div className="p-6 bg-white">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROFILE_FIELDS_CONFIG.map((field, index) => {
              const IconComponent = field.icon;
              const isEditable = field.editable;
              const isFirstEditableField = index === 0;
              const isTextarea = field.type === 'textarea';

              return (
                <div key={field.key} className={field.gridCols}>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <IconComponent size={16} className="text-gray-400" />
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                    {field.readOnlyNote && (
                      <span className="text-xs text-gray-500 italic ml-1">{field.readOnlyNote}</span>
                    )}
                  </label>

                  {isEditable ? (
                    isTextarea ? (
                      <textarea
                        ref={isFirstEditableField ? firstInputRef : null}
                        rows={field.rows || 3}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        disabled={saveLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-h-[88px]"
                      />
                    ) : (
                      <input
                        ref={isFirstEditableField ? firstInputRef : null}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        disabled={saveLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-[48px]"
                      />
                    )
                  ) : (
                    <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed h-[48px] flex items-center">
                      <p className="font-medium text-gray-600 break-all">
                        {profileData?.[field.key] || '-'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saveLoading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

// ChangePasswordModal Component
function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (isOpen) {
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      setSaveLoading(true);
      setError('');

      if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('Semua field wajib diisi');
        setSaveLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Password baru dan konfirmasi tidak cocok');
        setSaveLoading(false);
        return;
      }

      if (formData.newPassword.length < 8) {
        setError('Password minimal 8 karakter');
        setSaveLoading(false);
        return;
      }

      // Call API to change password
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Gagal mengubah password');
      }

      setSuccess('Password berhasil diubah!');
      setTimeout(() => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saveLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Lock size={20} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Ganti Password</h3>
          </div>
          <button
            onClick={onClose}
            disabled={saveLoading}
            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Lama <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  disabled={saveLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50"
                  placeholder="Masukkan password lama"
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
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  disabled={saveLoading}
                  minLength={8}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50 ${
                    formData.newPassword && formData.newPassword.length < 8 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.newPassword && formData.newPassword.length < 8 && (
                <p className="text-xs text-red-600 mt-1 font-medium">Password minimal 8 karakter.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={saveLoading}
                  minLength={8}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50 ${
                    formData.confirmPassword && formData.confirmPassword !== formData.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.confirmPassword !== formData.newPassword && (
                <p className="text-xs text-red-600 mt-1 font-medium">Konfirmasi password tidak cocok.</p>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-medium text-amber-900 mb-1">Persyaratan Password:</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Minimal 8 karakter</li>
              </ul>
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
            onClick={handleSubmit}
            disabled={
              saveLoading || 
              !formData.oldPassword || 
              formData.newPassword.length < 8 || 
              formData.newPassword !== formData.confirmPassword
            }
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
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
  );
}

// Main Component
export default function ProfilOrangtuaPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  // SECURITY: Fetch profile data when session is available
  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    fetchProfileData();
  }, [session, router]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // SECURITY: Fetch from API with session validation
      // API will reject if parent tries to access another parent's data
      const response = await fetch('/api/orangtua/profile', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal memuat data profil');
        if (response.status === 401) {
          router.push('/login');
        }
        return;
      }

      const data = await response.json();

      // SECURITY: Validate response contains expected fields from session parent
      if (!data.namaLengkap) {
        setError('Data profil tidak valid');
        return;
      }

      setProfileData(data);

      // Load children from profile
      if (data.children && Array.isArray(data.children)) {
        setChildren(data.children);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async (formData) => {
    try {
      // Update only editable fields
      const updateData = {
        namaLengkap: formData.namaLengkap,
        noTelepon: formData.noTelepon,
        alamat: formData.alamat,
      };

      // Call API to update profile
      const response = await fetch('/api/orangtua/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan profil');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);

      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Gagal menyimpan profil');
    }
  };

  const handleRegenerateRecoveryCode = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengatur ulang recovery code? Kode lama akan hangus dan kode baru akan dibuat.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/setup-recovery', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setRecoveryCode(data.recoveryCode);
        setShowRecoveryModal(true);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to regenerate recovery code');
      }
    } catch (error) {
      console.error('Error regenerating recovery code:', error);
      setError('Terjadi kesalahan saat mengatur ulang recovery code');
    }
  };

  const handleRecoveryConfirm = () => {
    setShowRecoveryModal(false);
    setRecoveryCode('');
    // Optionally redirect to dashboard or show success message
    router.push('/orangtua/dashboard');
  };

  const handleCloseRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryCode('');
  };

  const handleChangePassword = () => {
    setError('');
    setSuccess('');
    setShowPasswordModal(true);
  };

  const handleChangePasswordSubmit = async (formData) => {
    // TODO: Implement actual password change API call
    console.log('Change password:', formData);

    setSuccess('Password berhasil diubah!');
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  if (loading) {
    return (
      <OrangtuaLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingIndicator text="Memuat profil..." />
        </div>
      </OrangtuaLayout>
    );
  }

  if (error && !profileData) {
    return (
      <OrangtuaLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
              <p className="font-semibold mb-2">Gagal Memuat Profil</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </OrangtuaLayout>
    );
  }

  if (!profileData) {
    return (
      <OrangtuaLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-6 text-center">
              <p className="font-semibold">Data Profil Tidak Tersedia</p>
              <p className="text-sm mt-2">Silahkan hubungi administrator</p>
            </div>
          </div>
        </div>
      </OrangtuaLayout>
    );
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full max-w-none py-6 space-y-6">
          {/* Header */}
          <ProfileHeader />

          {/* Success/Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 shadow-sm">
              {success}
            </div>
          )}

          {/* 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Summary */}
            <div className="lg:col-span-1">
              <ProfileSummaryCard
                profileData={profileData}
                onEditProfile={handleEditProfile}
                onChangePassword={handleChangePassword}
                onRegenerateRecoveryCode={handleRegenerateRecoveryCode}
              />
            </div>

            {/* Right: Personal Info + Children */}
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoCard profileData={profileData} />
              <ChildrenConnectedCard children={children} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handleChangePasswordSubmit}
      />

      {/* Recovery Code Modal */}
      <RecoveryCodeModal
        isOpen={showRecoveryModal}
        onClose={handleCloseRecoveryModal}
        recoveryCode={recoveryCode}
        onConfirm={handleRecoveryConfirm}
      />
    </OrangtuaLayout>
  );
}
