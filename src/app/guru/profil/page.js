'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  FileSignature,
  Upload,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import GuruLayout from '@/components/layout/GuruLayout';
import { toast, Toaster } from 'react-hot-toast';

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
              Profil Guru
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
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-3xl font-bold">
            {profileData?.name?.charAt(0)?.toUpperCase() || 'G'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1 break-words">
          {profileData?.name || 'Nama Guru'}
        </h2>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <Mail size={14} />
          <span className="text-sm break-all">{profileData?.email}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Shield size={16} />
          Guru Tahfidz
        </div>
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

// PersonalInfoForm Component
function PersonalInfoForm({ profileData, formatDisplayValue }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
            <p className="font-medium text-gray-900">{formatDisplayValue(profileData?.name)}</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="text-gray-400" />
            Email
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900 break-all">{formatDisplayValue(profileData?.email)}</p>
          </div>
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="text-gray-400" />
            Nomor WhatsApp
          </label>
          <div className={`px-4 py-3 rounded-xl border ${!profileData?.phone ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
            {profileData?.phone ? (
              <p className="font-medium text-gray-900">{profileData.phone}</p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-amber-700 text-sm italic">Belum diisi</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const editBtn = document.querySelector('button[onClick*="onEditProfile"]');
                    if (editBtn) editBtn.click();
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Lengkapi nomor WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="text-gray-400" />
            Tanggal Lahir
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{formatDisplayValue(profileData?.tanggalLahir)}</p>
          </div>
        </div>

        {/* Bidang Keahlian */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BookOpen size={16} className="text-gray-400" />
            Bidang Keahlian
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{formatDisplayValue(profileData?.bidangKeahlian)}</p>
          </div>
        </div>

        {/* Mulai Mengajar */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="text-gray-400" />
            Mulai Mengajar
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{formatDisplayValue(profileData?.mulaiMengajar)}</p>
          </div>
        </div>

        {/* Alamat - Full Width */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="text-gray-400" />
            Alamat
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{formatDisplayValue(profileData?.alamat)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SignatureUploader Component
function SignatureUploader({ tandaTanganUrl, uploadingSignature, onUpload, onDelete }) {
  const [signatureLoadError, setSignatureLoadError] = useState(false);

  // Reset error state when URL changes
  useEffect(() => {
    setSignatureLoadError(false);
  }, [tandaTanganUrl]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 rounded-lg bg-blue-50">
          <FileSignature size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900">Tanda Tangan Digital</h3>
          <p className="text-xs text-gray-500 mt-1">
            Untuk ditampilkan otomatis di laporan
          </p>
        </div>
      </div>

      {tandaTanganUrl ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
            <div className="flex flex-col items-center">
              <CheckCircle size={24} className="text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Tanda Tangan Aktif
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-200 inline-block">
                {!signatureLoadError ? (
                  <img
                    src={tandaTanganUrl}
                    alt="Tanda Tangan"
                    className="max-h-24 mx-auto"
                    style={{ maxWidth: '200px' }}
                    onError={() => setSignatureLoadError(true)}
                    onLoad={() => setSignatureLoadError(false)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-600 font-medium">Gagal memuat tanda tangan</p>
                    <p className="text-xs text-gray-500 mt-1">Silakan upload ulang</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
                <Upload size={18} />
                {uploadingSignature ? 'Mengupload...' : 'Ganti'}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={onUpload}
                disabled={uploadingSignature}
                className="hidden"
              />
            </label>

            <button
              onClick={onDelete}
              disabled={uploadingSignature}
              className="px-6 py-3 rounded-xl font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Upload size={24} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {uploadingSignature ? 'Mengupload...' : 'Klik untuk Upload Tanda Tangan'}
              </p>
              <p className="text-xs text-gray-500">
                Format: PNG atau JPG • Maksimal 2MB
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={onUpload}
            disabled={uploadingSignature}
            className="hidden"
          />
        </label>
      )}

      {/* Info Note */}
      <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-900">
          💡 Ukuran maksimal 2MB. PNG transparan disarankan.
        </p>
      </div>
    </div>
  );
}

// SecurityCard Component
function SecurityCard() {
  return (
    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Shield size={20} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-2 text-emerald-900">
            Informasi Keamanan Akun
          </h4>
          <p className="text-sm leading-relaxed text-emerald-800">
            💡 Pastikan informasi profil Anda selalu ter-update. Informasi ini akan ditampilkan kepada siswa dan orang tua siswa.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilGuruPage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [tandaTanganUrl, setTandaTanganUrl] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  /**
   * Format display value:
   * - null/undefined/empty string → "-"
   * - whitespace-only string → "-"
   * - otherwise → trimmed value
   */
  const formatDisplayValue = (value) => {
    if (!value || typeof value !== 'string' || !value.trim()) {
      return '-';
    }
    return value.trim();
  };

  /**
   * Convert DateTime to YYYY-MM-DD format for input field
   * Handles: string ISO, Date object, or null
   */
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string') {
        return dateValue.split('T')[0];
      }
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    return '';
  };

  /**
   * Fetch guru profile from API (not from session)
   * Session is cached and doesn't have guru-specific fields
   */
  const fetchGuruProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guru/profile');
      
      if (response.ok) {
        const guruData = await response.json();
        console.log('[GURU PROFILE] Fetched from API:', guruData);
        
        setProfileData({
          name: guruData.user?.name || '',
          email: guruData.user?.email || '',
          phone: guruData.noTelepon || '',
          alamat: guruData.alamat || '',
          bidangKeahlian: guruData.bidangKeahlian || 'Tahfidz Al-Quran',
          mulaiMengajar: formatDateForInput(guruData.mulaiMengajar),
          tanggalLahir: formatDateForInput(guruData.tanggalLahir)
        });
      } else {
        console.error('Failed to fetch guru profile:', response.status);
        console.error('Response:', await response.text());
        // Set empty profile data on error
        setProfileData({
          name: '',
          email: '',
          phone: '',
          alamat: '',
          bidangKeahlian: 'Tahfidz Al-Quran',
          mulaiMengajar: ''
        });
      }
    } catch (error) {
      console.error('Error fetching guru profile:', error);
      toast.error('Gagal memuat profil');
      // Set empty profile data on error
      setProfileData({
        name: '',
        email: '',
        phone: '',
        alamat: '',
        bidangKeahlian: 'Tahfidz Al-Quran',
        mulaiMengajar: ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGuruProfile();
      fetchTandaTangan();
    }
  }, [status, session]);

  const fetchTandaTangan = async () => {
    try {
      const response = await fetch('/api/guru/upload-ttd');
      if (response.ok) {
        const data = await response.json();
        setTandaTanganUrl(data.tandaTanganUrl);
      }
    } catch (error) {
      console.error('Error fetching signature:', error);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      alamat: profileData.alamat,
      bidangKeahlian: profileData.bidangKeahlian,
      mulaiMengajar: profileData.mulaiMengajar,
      tanggalLahir: profileData.tanggalLahir
    });
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);

      const response = await fetch('/api/guru/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success('Profil berhasil diperbarui!');
        
        // ✅ Update profileData dengan response dari API (bukan hanya editFormData)
        setProfileData({
          name: responseData.data.user.name || '',
          email: responseData.data.user.email || '',
          phone: responseData.data.noTelepon || '',
          alamat: responseData.data.alamat || '',
          bidangKeahlian: responseData.data.bidangKeahlian || 'Tahfidz Al-Quran',
          mulaiMengajar: formatDateForInput(responseData.data.mulaiMengajar),
          tanggalLahir: formatDateForInput(responseData.data.tanggalLahir)
        });
        
        await update();
        setTimeout(() => {
          setShowEditModal(false);
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      setSaveLoading(true);

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password berhasil diubah!');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadSignature = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (PNG/JPG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    try {
      setUploadingSignature(true);

      const formData = new FormData();
      formData.append('tandaTangan', file);

      const response = await fetch('/api/guru/upload-ttd', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setTandaTanganUrl(data.tandaTanganUrl);
        toast.success('Tanda tangan berhasil diupload!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengupload tanda tangan');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast.error('Terjadi kesalahan saat mengupload tanda tangan');
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleDeleteSignature = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus tanda tangan?')) {
      return;
    }

    try {
      setUploadingSignature(true);

      const response = await fetch('/api/guru/upload-ttd', {
        method: 'DELETE'
      });

      if (response.ok) {
        setTandaTanganUrl(null);
        toast.success('Tanda tangan berhasil dihapus!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus tanda tangan');
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast.error('Terjadi kesalahan saat menghapus tanda tangan');
    } finally {
      setUploadingSignature(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <GuruLayout>
        <LoadingIndicator fullPage text="Memuat profil..." />
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <ProfileHeader />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-1">
            <ProfileSummaryCard
              profileData={profileData}
              onEditProfile={handleEditProfile}
              onChangePassword={handleChangePassword}
            />
          </div>

          {/* Right Column: Info + Signature + Security */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoForm profileData={profileData} formatDisplayValue={formatDisplayValue} />

            <SignatureUploader
              tandaTanganUrl={tandaTanganUrl}
              uploadingSignature={uploadingSignature}
              onUpload={handleUploadSignature}
              onDelete={handleDeleteSignature}
            />

            <SecurityCard />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Edit size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Edit Profil</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={editFormData.email || ''}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.tanggalLahir || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Bidang Keahlian */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bidang Keahlian
                  </label>
                  <input
                    type="text"
                    value={editFormData.bidangKeahlian || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, bidangKeahlian: e.target.value })}
                    placeholder="Contoh: Tahfidz Al-Quran, Tahsin, dll"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Mulai Mengajar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mulai Mengajar
                  </label>
                  <input
                    type="date"
                    value={editFormData.mulaiMengajar || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mulaiMengajar: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    placeholder="Alamat lengkap..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Lock size={20} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ubah Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="space-y-5">
                {/* Password Lama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Lama <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan password lama"
                      value={passwordFormData.currentPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={passwordFormData.newPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Ketik ulang password baru"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-900 mb-2">Persyaratan Password:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Minimal 6 karakter</li>
                </ul>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all duration-200 disabled:opacity-50"
                >
                  {saveLoading ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
