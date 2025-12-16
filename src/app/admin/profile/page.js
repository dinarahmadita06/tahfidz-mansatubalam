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
  IdCard,
  FileText
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
  const [signatureFiles, setSignatureFiles] = useState({
    guruTandaTangan: null,
    koordinatorTandaTangan: null
  });

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

  const handleSignatureUpload = async (type, file) => {
    if (!file) return;
    
    // Validasi: hanya PNG
    if (file.type !== 'image/png') {
      setError('Format file harus PNG saja');
      return;
    }
    
    // Validasi: ukuran max 500 KB
    if (file.size > 500 * 1024) {
      setError('Ukuran file tidak boleh lebih dari 500 KB');
      return;
    }
    
    try {
      setSaveLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type); // 'guru' atau 'koordinator'
      
      const res = await fetch('/api/admin/signature-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Tanda tangan ${type === 'guru' ? 'Guru' : 'Koordinator'} berhasil diupload!`);
        await fetchProfileData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Gagal upload tanda tangan');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      setError('Terjadi kesalahan saat upload tanda tangan');
    } finally {
      setSaveLoading(false);
      setSignatureFiles({ ...signatureFiles, [type]: null });
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
        className="min-h-screen p-8 relative overflow-hidden profile-container"
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
            <span className="font-semibold text-emerald-700">Profil Admin</span>
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
                Profil Admin
              </h1>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>
                Lihat dan kelola informasi akun administrator Anda
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700">Status: Aktif</span>
              </div>
            </div>
          </div>
        </div>

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
                <User className="text-white" size={56} strokeWidth={1.5} />
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
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border mb-4 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  borderColor: '#10B981',
                  color: '#065F46'
                }}
              >
                <Shield size={16} strokeWidth={2} />
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
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biodata Section */}
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
              <IdCard size={20} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#92400E' }}>
              Biodata Lengkap
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.phoneNumber}</p>
              </div>
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <Briefcase size={16} className="text-amber-600" strokeWidth={2} />
                Jabatan
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.jabatan}</p>
              </div>
            </div>

            {/* NIP/ID Admin */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <IdCard size={16} className="text-amber-600" strokeWidth={2} />
                NIP / ID Admin
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold font-mono" style={{ color: '#374151' }}>{profileData?.nip}</p>
              </div>
            </div>

            {/* Alamat Kantor */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#78350F' }}>
                <MapPin size={16} className="text-amber-600" strokeWidth={2} />
                Alamat Kantor
              </label>
              <div
                className="px-4 py-3 rounded-xl border shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold" style={{ color: '#374151' }}>{profileData?.alamat}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature Section */}
        <div
          className="relative z-10 rounded-2xl p-8 mb-6 max-w-4xl mx-auto profile-card profile-card-hover"
          style={{
            background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-200/50">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
              }}
            >
              <Edit size={20} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#1E40AF' }}>
              Tanda Tangan Digital
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guru Tahfidz Signature */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E40AF' }}>
                <FileText size={16} className="text-blue-600" strokeWidth={2} />
                Tanda Tangan Guru Tahfidz
              </label>
              <div
                className="px-4 py-4 rounded-xl border-2 border-dashed"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: '#93C5FD'
                }}
              >
                <input
                  type="file"
                  accept=".png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSignatureFiles({ ...signatureFiles, guruTandaTangan: file });
                    handleSignatureUpload('guru', file);
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">Format: PNG | Max: 500 KB</p>
              </div>
            </div>

            {/* Koordinator Tahfidz Signature */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E40AF' }}>
                <FileText size={16} className="text-blue-600" strokeWidth={2} />
                Tanda Tangan Koordinator Tahfidz
              </label>
              <div
                className="px-4 py-4 rounded-xl border-2 border-dashed"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: '#93C5FD'
                }}
              >
                <input
                  type="file"
                  accept=".png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSignatureFiles({ ...signatureFiles, koordinatorTandaTangan: file });
                    handleSignatureUpload('koordinator', file);
                  }}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">Format: PNG | Max: 500 KB</p>
              </div>
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
                Akun ini memiliki hak akses <span className="font-semibold text-emerald-700">penuh</span> terhadap sistem Tahfidz MAN 1 Bandar Lampung.
                Pastikan untuk menjaga kerahasiaan kredensial login Anda dan segera laporkan
                jika ada aktivitas mencurigakan.
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
                  className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: '#374151'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
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
                  <h3 className="text-2xl font-bold" style={{ color: '#92400E' }}>Ganti Password</h3>
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
                  className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: '#374151'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePasswordSubmit}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}
                >
                  {saveLoading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .profile-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
