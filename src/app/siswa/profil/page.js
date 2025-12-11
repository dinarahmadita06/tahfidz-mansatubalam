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
  BookOpen,
  IdCard,
  UserCircle
} from 'lucide-react';
import SiswaLayout from '@/components/layout/SiswaLayout';

export default function ProfileSiswaPage() {
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
      const saved = localStorage.getItem('siswa_profile');
      if (saved) {
        setProfileData(JSON.parse(saved));
      } else {
        // Fallback to default data
        setProfileData({
          nama: 'Ahmad Fauzi',
          email: 'ahmad.fauzi@student.tahfidz.sch.id',
          role: 'Siswa',
          phone: '0812-3456-7890',
          alamat: 'Jl. Al-Qur\'an No. 123, Jakarta Selatan',
          tanggalLahir: '15 Mei 2010',
          jenisKelamin: 'Laki-laki',
          kelas: '9 Tahfidz A',
          nisn: '0051234567',
          nis: '2024001',
          namaWali: 'Bapak Hasan',
          phoneWali: '0813-9876-5432',
          tanggalBergabung: '15 Juli 2024',
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
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      nama: profileData.nama,
      email: profileData.email,
      phone: profileData.phone,
      alamat: profileData.alamat,
      namaWali: profileData.namaWali,
      phoneWali: profileData.phoneWali
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

      // Update profileData with edited data
      const updatedData = { ...profileData, ...editFormData };
      setProfileData(updatedData);
      localStorage.setItem('siswa_profile', JSON.stringify(updatedData));

      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Terjadi kesalahan saat menyimpan profil');
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

      if (passwordFormData.newPassword.length < 6) {
        setError('Password minimal 6 karakter');
        setSaveLoading(false);
        return;
      }

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
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Terjadi kesalahan saat mengubah password');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
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
        className="min-h-screen relative overflow-hidden md:p-8"
        style={{
          background: 'linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)',
          fontFamily: 'Poppins, sans-serif',
          padding: '20px'
        }}
      >
        {/* Islamic Ornaments */}
        <div className="islamic-ornament-topleft"></div>
        <div className="islamic-ornament-bottomright"></div>

        {/* Header Section */}
        <div
          className="relative z-10 mb-8 rounded-xl profile-card md:px-8"
          style={{
            background: 'linear-gradient(135deg, #FDFCF8 0%, #FFF9F0 100%)',
            borderTop: '3px solid #10B981',
            padding: '20px'
          }}
        >
          <div className="flex items-start gap-5">
            <div
              className="p-3 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                flexShrink: 0
              }}
            >
              <User className="text-white" size={42} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold mb-2 md:text-2xl" style={{ fontSize: '20px', color: '#064E3B' }}>
                Profil Siswa
              </h1>
              <p className="text-xs md:text-sm font-medium" style={{ color: '#374151' }}>
                Lihat dan kelola informasi profil Anda
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700">Status: Aktif</span>
              </div>
            </div>
            <button
              onClick={handleEditProfile}
              className="flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 md:px-4"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                padding: '10px 18px',
                minHeight: '44px',
                fontSize: '13px'
              }}
            >
              <Edit size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div
          className="relative z-10 rounded-xl mb-6 max-w-4xl mx-auto profile-card profile-card-hover md:px-8"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            borderRadius: '16px',
            padding: '24px 20px'
          }}
        >
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div
                className="rounded-full flex items-center justify-center shadow-xl ring-4 ring-white md:w-20 md:h-20"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                  width: '64px',
                  height: '64px'
                }}
              >
                <User className="text-white md:text-4xl" size={28} strokeWidth={1.5} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <h2 className="font-bold text-gray-900 mb-2 md:text-2xl" style={{ fontSize: '18px' }}>
                {profileData?.nama}
              </h2>
              <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-600 mb-3">
                <Mail size={16} className="hidden md:block" />
                <span className="text-xs md:text-sm">{profileData?.email}</span>
              </div>

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold border mb-4 shadow-sm md:text-sm"
                style={{
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  borderColor: '#10B981',
                  color: '#065F46',
                  fontSize: '13px'
                }}
              >
                <Shield size={14} strokeWidth={2} />
                {profileData?.kelas}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 mt-4 text-xs md:text-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-600">
                  <Calendar size={14} className="text-emerald-600 hidden md:block" />
                  <span>Bergabung: <span className="font-medium text-gray-900">{profileData?.tanggalBergabung}</span></span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-600">
                  <Clock size={14} className="text-amber-600 hidden md:block" />
                  <span>Login: <span className="font-medium text-gray-900">{profileData?.lastLogin}</span></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-6">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center justify-center gap-2 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    padding: '10px 16px',
                    minHeight: '40px',
                    fontSize: '13px'
                  }}
                >
                  <Edit size={16} strokeWidth={2} />
                  Edit Profil
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#92400E',
                    border: '1px solid #F59E0B',
                    padding: '10px 16px',
                    minHeight: '40px',
                    fontSize: '13px'
                  }}
                >
                  <Lock size={16} strokeWidth={2} />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biodata Section */}
        <div
          className="relative z-10 rounded-xl mb-6 max-w-4xl mx-auto profile-card profile-card-hover md:px-8"
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '16px',
            padding: '20px'
          }}
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-200/50">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              }}
            >
              <IdCard size={18} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="font-bold md:text-lg" style={{ color: '#92400E', fontSize: '16px' }}>
              Biodata Lengkap
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Nomor Telepon */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <Phone size={14} className="text-amber-600" strokeWidth={2} />
                Nomor Telepon
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.phone}</p>
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <UserCircle size={14} className="text-amber-600" strokeWidth={2} />
                Jenis Kelamin
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.jenisKelamin}</p>
              </div>
            </div>

            {/* NISN */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <IdCard size={14} className="text-amber-600" strokeWidth={2} />
                NISN
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold font-mono text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.nisn}</p>
              </div>
            </div>

            {/* NIS */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <IdCard size={14} className="text-amber-600" strokeWidth={2} />
                NIS
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold font-mono text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.nis}</p>
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <Calendar size={14} className="text-amber-600" strokeWidth={2} />
                Tanggal Lahir
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.tanggalLahir}</p>
              </div>
            </div>

            {/* Kelas */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <BookOpen size={14} className="text-amber-600" strokeWidth={2} />
                Kelas
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.kelas}</p>
              </div>
            </div>

            {/* Alamat - Full width */}
            <div className="md:col-span-2 space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <MapPin size={14} className="text-amber-600" strokeWidth={2} />
                Alamat
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.alamat}</p>
              </div>
            </div>

            {/* Nama Wali */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <User size={14} className="text-amber-600" strokeWidth={2} />
                Nama Wali
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.namaWali}</p>
              </div>
            </div>

            {/* No HP Wali */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-semibold md:text-sm" style={{ color: '#78350F', fontSize: '13px' }}>
                <Phone size={14} className="text-amber-600" strokeWidth={2} />
                No. HP Wali
              </label>
              <div
                className="px-3 py-2 rounded-lg border shadow-sm md:px-4 md:py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: '#FCD34D'
                }}
              >
                <p className="font-semibold text-xs md:text-sm" style={{ color: '#374151' }}>{profileData?.phoneWali}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto md:p-8"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFDFB 100%)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                padding: '20px'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  >
                    <Edit size={18} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold md:text-2xl" style={{ color: '#064E3B', fontSize: '18px' }}>Edit Profil</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 flex-shrink-0"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success/Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs md:text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs md:text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4 md:space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none md:px-4 md:py-3"
                  />
                </div>

                {/* Nama Wali */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Nama Wali
                  </label>
                  <input
                    type="text"
                    value={editFormData.namaWali || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, namaWali: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* No HP Wali */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    No. HP Wali
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phoneWali || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneWali: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 mt-6 md:mt-8 md:gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm md:px-6 md:py-3 md:rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: '#374151',
                    fontSize: '13px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md md:px-6 md:py-3 md:rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    fontSize: '13px'
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
              className="rounded-xl max-w-md w-full shadow-2xl md:p-8"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '2px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '20px'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    }}
                  >
                    <Lock size={18} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold md:text-2xl" style={{ color: '#92400E', fontSize: '18px' }}>Ganti Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 flex-shrink-0"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Success/Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs md:text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs md:text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4 md:space-y-5">
                {/* Password Lama */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Password Lama
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={passwordFormData.oldPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Password Baru
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1 md:mb-2" style={{ fontSize: '13px' }}>
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent md:px-4 md:py-3"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-900 mb-1 md:mb-2">Persyaratan Password:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Minimal 6 karakter</li>
                  <li>• Gunakan kombinasi huruf dan angka</li>
                </ul>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 mt-5 md:mt-6 md:gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm md:px-6 md:py-3 md:rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: '#374151',
                    fontSize: '13px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePasswordSubmit}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md md:px-6 md:py-3 md:rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    fontSize: '13px'
                  }}
                >
                  {saveLoading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}
