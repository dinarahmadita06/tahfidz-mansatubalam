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
  BookOpen,
  FileSignature,
  Upload,
  Trash2,
  CheckCircle
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

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
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tandaTanganUrl, setTandaTanganUrl] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      // Load profile data from session
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        alamat: session.user.alamat || '',
        bidangKeahlian: session.user.bidangKeahlian || 'Tahfidz Al-Quran',
        mulaiMengajar: session.user.mulaiMengajar || ''
      });
      setLoading(false);

      // Load tanda tangan
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
      mulaiMengajar: profileData.mulaiMengajar
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setShowPasswordModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError('');

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setSuccess('Profil berhasil diperbarui!');
        setProfileData(editFormData);
        await update();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess('');
        }, 2000);
      } else {
        const error = await response.json();
        setError(error.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      setSaveLoading(true);
      setError('');

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
        setSuccess('Password berhasil diubah!');
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess('');
          setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }, 2000);
      } else {
        const error = await response.json();
        setError(error.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadSignature = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG/JPG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    try {
      setUploadingSignature(true);
      setError('');

      const formData = new FormData();
      formData.append('tandaTangan', file);

      const response = await fetch('/api/guru/upload-ttd', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setTandaTanganUrl(data.tandaTanganUrl);
        setSuccess('Tanda tangan berhasil diupload!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Gagal mengupload tanda tangan');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      setError('Terjadi kesalahan saat mengupload tanda tangan');
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
      setError('');

      const response = await fetch('/api/guru/upload-ttd', {
        method: 'DELETE'
      });

      if (response.ok) {
        setTandaTanganUrl(null);
        setSuccess('Tanda tangan berhasil dihapus!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Gagal menghapus tanda tangan');
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      setError('Terjadi kesalahan saat menghapus tanda tangan');
    } finally {
      setUploadingSignature(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body, * {
          font-family: 'Poppins', sans-serif;
        }

        /* Islamic ornament pattern */
        .islamic-ornament-topleft {
          position: absolute;
          top: 0;
          left: 0;
          width: 300px;
          height: 300px;
          background-image:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(16, 185, 129, 0.03) 20px, rgba(16, 185, 129, 0.03) 40px);
          filter: blur(1px);
          pointer-events: none;
          opacity: 0.8;
        }

        .islamic-ornament-bottomright {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 400px;
          height: 400px;
          background-image:
            radial-gradient(circle at center, rgba(245, 158, 11, 0.05) 0%, transparent 70%),
            repeating-linear-gradient(-45deg, transparent, transparent 25px, rgba(245, 158, 11, 0.04) 25px, rgba(245, 158, 11, 0.04) 50px);
          filter: blur(2px);
          pointer-events: none;
          opacity: 0.7;
        }

        /* Card with enhanced shadow */
        .profile-card {
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.06),
            0 1px 3px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .profile-card-hover {
          transition: all 0.3s ease;
        }

        .profile-card-hover:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.08),
            0 2px 6px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
      `}</style>

      <div
        className="min-h-screen p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        {/* Islamic Ornaments */}
        <div className="islamic-ornament-topleft"></div>
        <div className="islamic-ornament-bottomright"></div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 relative z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-emerald-100/50 shadow-sm">
            <Home size={16} className="text-emerald-600" strokeWidth={1.5} />
            <ChevronRight size={14} className="text-gray-400" strokeWidth={2} />
            <span className="font-semibold text-emerald-700">Profil Saya</span>
          </div>
        </div>

        {/* Header Section */}
        <div
          className="relative z-10 mb-8 p-8 profile-card"
          style={{
            background: 'linear-gradient(135deg, #FDFCF8 0%, #FFF9F0 100%)',
            borderTop: '3px solid #10B981'
          }}
        >
          <div className="flex items-start gap-5">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}
            >
              <User className="text-white" size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#064E3B' }}>
                Profil Saya
              </h1>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>
                Kelola informasi profil Anda
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700">Status: Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="relative z-10 mb-6 max-w-4xl mx-auto">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
              ✓ {success}
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div
          className="relative z-10 rounded-2xl p-8 mb-6 max-w-4xl mx-auto profile-card profile-card-hover"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span className="text-white text-4xl font-bold">
                  {profileData?.name?.charAt(0)?.toUpperCase() || 'G'}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profileData?.name || 'Nama Guru'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Mail size={16} />
                <span className="text-sm">{profileData?.email}</span>
              </div>

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border mb-4 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  borderColor: '#10B981',
                  color: '#065F46'
                }}
              >
                <Shield size={16} strokeWidth={2} />
                Guru Tahfidz
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <Edit size={18} strokeWidth={2} />
                  Edit Profil
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#92400E',
                    border: '1px solid #F59E0B'
                  }}
                >
                  <Lock size={18} strokeWidth={2} />
                  Ubah Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Pribadi Section */}
        <div
          className="relative z-10 rounded-2xl p-8 mb-6 max-w-4xl mx-auto profile-card profile-card-hover"
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200/50">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              }}
            >
              <User size={20} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#92400E' }}>
              Informasi Pribadi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <User size={16} className="text-amber-600" strokeWidth={2} />
                Nama Lengkap
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <Mail size={16} className="text-amber-600" strokeWidth={2} />
                Email
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.email}</p>
              </div>
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <Phone size={16} className="text-amber-600" strokeWidth={2} />
                Nomor Telepon
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.phone || '-'}</p>
              </div>
            </div>

            {/* Bidang Keahlian */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <BookOpen size={16} className="text-amber-600" strokeWidth={2} />
                Bidang Keahlian
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.bidangKeahlian}</p>
              </div>
            </div>

            {/* Mulai Mengajar */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <Calendar size={16} className="text-amber-600" strokeWidth={2} />
                Mulai Mengajar
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.mulaiMengajar || '-'}</p>
              </div>
            </div>

            {/* Alamat */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <MapPin size={16} className="text-amber-600" strokeWidth={2} />
                Alamat
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.alamat || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Digital Section */}
        <div
          className="relative z-10 rounded-2xl p-8 mb-6 max-w-4xl mx-auto profile-card profile-card-hover"
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-200/50">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
              }}
            >
              <FileSignature size={20} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold" style={{ color: '#1E3A8A' }}>
                Tanda Tangan Digital
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Upload tanda tangan untuk ditampilkan otomatis di semua laporan
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Preview Tanda Tangan */}
            {tandaTanganUrl ? (
              <div className="space-y-4">
                <div
                  className="p-6 rounded-xl border-2 border-dashed bg-white/50"
                  style={{ borderColor: '#3B82F6' }}
                >
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-3 flex justify-center">
                        <CheckCircle size={32} className="text-emerald-600" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-4">
                        Tanda Tangan Aktif
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                        <img
                          src={tandaTanganUrl}
                          alt="Tanda Tangan"
                          className="max-h-32 mx-auto"
                          style={{ maxWidth: '300px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <label
                    className="flex-1 cursor-pointer"
                  >
                    <div
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                      }}
                    >
                      <Upload size={18} strokeWidth={2} />
                      {uploadingSignature ? 'Mengupload...' : 'Ganti Tanda Tangan'}
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleUploadSignature}
                      disabled={uploadingSignature}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleDeleteSignature}
                    disabled={uploadingSignature}
                    className="px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                      color: '#991B1B',
                      border: '1px solid #EF4444'
                    }}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label
                  className="block cursor-pointer"
                >
                  <div
                    className="p-8 rounded-xl border-2 border-dashed transition-all duration-200 hover:border-blue-500 hover:bg-blue-50/30"
                    style={{
                      borderColor: '#93C5FD',
                      background: 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div
                          className="p-4 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
                          }}
                        >
                          <Upload size={32} className="text-blue-600" strokeWidth={2} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-2">
                        {uploadingSignature ? 'Mengupload...' : 'Klik untuk Upload Tanda Tangan'}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Format: PNG atau JPG • Maksimal 2MB
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                        }}
                      >
                        <Upload size={18} strokeWidth={2} />
                        Pilih File
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleUploadSignature}
                    disabled={uploadingSignature}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Info Box */}
            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'rgba(239, 246, 255, 0.5)',
                borderColor: '#BFDBFE'
              }}
            >
              <p className="text-xs font-medium text-blue-900 mb-2">
                💡 Informasi Penting:
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Tanda tangan akan otomatis muncul di semua laporan yang Anda buat</li>
                <li>• Gunakan gambar dengan latar belakang transparan untuk hasil terbaik</li>
                <li>• Pastikan tanda tangan jelas dan mudah dibaca</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informasi Akun Card */}
        <div
          className="relative z-10 rounded-2xl p-6 max-w-4xl mx-auto border profile-card"
          style={{
            background: 'linear-gradient(135deg, #D1FAE5 0%, #FEF3C7 100%)',
            borderColor: 'rgba(16, 185, 129, 0.3)'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <Shield size={22} className="text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base mb-2" style={{ color: '#065F46' }}>
                Informasi Keamanan Akun
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                💡 Tips: Pastikan informasi profil Anda selalu ter-update.
                Informasi ini akan ditampilkan kepada siswa dan orang tua siswa.
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs font-semibold" style={{ color: '#047857' }}>
                <Lock size={14} strokeWidth={2} />
                <span>Login terenkripsi • Sesi aman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
                border: '2px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    <Edit size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#064E3B' }}>Edit Profil</h3>
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
                      disabled
                      value={editFormData.email || ''}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                  </div>

                  {/* Nomor Telepon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="08xx xxxx xxxx"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={saveLoading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                      color: '#374151'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
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
            <div
              className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '2px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    }}
                  >
                    <Lock size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#92400E' }}>Ubah Password</h3>
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

              <form onSubmit={handleChangePasswordSubmit}>
                <div className="space-y-5">
                  {/* Password Lama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Lama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan password lama"
                      value={passwordFormData.currentPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={passwordFormData.newPassword}
                      onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Konfirmasi Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password Baru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Ketik ulang password baru"
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
                    <li>• Minimal 6 karakter</li>
                  </ul>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={saveLoading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                      color: '#374151'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    }}
                  >
                    {saveLoading ? 'Menyimpan...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
