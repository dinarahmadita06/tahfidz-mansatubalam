'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  User,
  Mail,
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
} from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';

// Single Source of Truth: Profile Fields Configuration
const PROFILE_FIELDS_CONFIG = [
  {
    key: 'namaLengkap',
    label: 'Nama Lengkap',
    icon: User,
    editable: true,
    required: true,
    type: 'text',
    placeholder: 'Masukkan nama lengkap',
    gridCols: 'md:col-span-2',
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    editable: false,
    required: false,
    type: 'email',
    readOnlyNote: '(Tidak dapat diubah)',
    gridCols: 'md:col-span-1',
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
function ProfileSummaryCard({ profileData, onEditProfile, onChangePassword }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-3xl font-bold">
            {profileData?.namaLengkap?.charAt(0)?.toUpperCase() || 'O'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1 break-words">
          {profileData?.namaLengkap || 'Nama Orang Tua'}
        </h2>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <Mail size={14} />
          <span className="text-sm break-all">{profileData?.email || '-'}</span>
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROFILE_FIELDS_CONFIG.map((field) => {
          const IconComponent = field.icon;
          return (
            <div key={field.key} className={field.gridCols}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IconComponent size={16} className="text-gray-400" />
                {field.label}
              </label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-medium text-gray-900 break-all">
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
          {children.map((child, index) => {
            const percentage = Math.round((child.progressHafalan / child.targetHafalan) * 100);

            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {child.nama?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1">{child.nama}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>Kelas {child.kelas}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{child.guruPembimbing}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Progress Hafalan</span>
                    <span className="text-xs font-bold text-emerald-600">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {child.progressHafalan} dari {child.targetHafalan} Juz
                  </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROFILE_FIELDS_CONFIG.map((field, index) => {
              const IconComponent = field.icon;
              const isEditable = field.editable;
              const isFirstEditableField = index === 0;

              return (
                <div key={field.key} className={field.gridCols}>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <IconComponent size={16} className="text-gray-400" />
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                    {field.readOnlyNote && (
                      <span className="text-xs text-gray-500 ml-1">{field.readOnlyNote}</span>
                    )}
                  </label>

                  {isEditable ? (
                    field.type === 'textarea' ? (
                      <textarea
                        ref={isFirstEditableField ? firstInputRef : null}
                        rows={field.rows || 3}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        disabled={saveLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      />
                    ) : (
                      <input
                        ref={isFirstEditableField ? firstInputRef : null}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        disabled={saveLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      />
                    )
                  ) : (
                    <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                      <p className="font-medium text-gray-900 break-all">
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
              <>
                <Loader className="animate-spin" size={18} />
                Menyimpan...
              </>
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
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

      if (formData.newPassword.length < 6) {
        setError('Password minimal 6 karakter');
        setSaveLoading(false);
        return;
      }

      await onSave(formData);

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
              <input
                type="password"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                disabled={saveLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50"
                placeholder="Masukkan password lama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                disabled={saveLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50"
                placeholder="Masukkan password baru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={saveLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:opacity-50"
                placeholder="Konfirmasi password baru"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-medium text-amber-900 mb-1">Persyaratan Password:</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Minimal 6 karakter</li>
                <li>• Gunakan kombinasi huruf dan angka</li>
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
            disabled={saveLoading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saveLoading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Mengubah...
              </>
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Children data (demo data)
  const children = [
    {
      nama: 'Ahmad Fauzan',
      kelas: '10 A',
      guruPembimbing: 'Ustadz Ahmad',
      progressHafalan: 15,
      targetHafalan: 30,
    },
    {
      nama: 'Fatimah Azzahra',
      kelas: '11 B',
      guruPembimbing: 'Ustadzah Siti',
      progressHafalan: 8,
      targetHafalan: 20,
    },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('orangtua_profile');
      if (saved) {
        setProfileData(JSON.parse(saved));
      } else {
        // Default demo data (ID Wali still in data but not displayed)
        setProfileData({
          namaLengkap: 'Ali Rahman',
          email: 'ali.rahman@wali.sch.id',
          noTelepon: '0812-3456-7890',
          alamat: 'Jl. Pahlawan No. 23, Bandar Lampung',
          status: 'Aktif',
          // idWali exists in data but is NOT displayed in UI
          idWali: 'WLI.2024.013',
        });
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
    // Merge only editable fields, keep read-only fields unchanged
    const updatedData = {
      ...profileData,
      ...formData,
      // Ensure read-only fields are NOT overwritten
      email: profileData.email,
      status: profileData.status,
      idWali: profileData.idWali, // Keep in data but not displayed
    };

    setProfileData(updatedData);
    localStorage.setItem('orangtua_profile', JSON.stringify(updatedData));

    setSuccess('Profil berhasil diperbarui!');
    setTimeout(() => {
      setSuccess('');
    }, 3000);
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
          <Loader className="animate-spin h-12 w-12 text-emerald-600" />
        </div>
      </OrangtuaLayout>
    );
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 py-6 space-y-6">
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
    </OrangtuaLayout>
  );
}
