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
  FileText,
  Upload,
  CheckCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingIndicator from "@/components/shared/LoadingIndicator";

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
  const [signaturePreviews, setSignaturePreviews] = useState({
    guru: null,
    koordinator: null
  });

  useEffect(() => {
    fetchProfileData();
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    try {
      console.log('[Load Signatures] Checking for existing signatures...');
      
      const res = await fetch('/api/admin/signature-upload');
      if (res.ok) {
        const data = await res.json();
        if (data.signatureUrl) {
          setSignaturePreviews(prev => ({ ...prev, koordinator: data.signatureUrl }));
          console.log('[Load Signatures] Signature found:', data.signatureUrl);
        } else {
          console.log('[Load Signatures] No signature URL in response');
        }
      } else {
        console.log('[Load Signatures] API returned status:', res.status);
      }
    } catch (error) {
      console.error('[Load Signatures] Error:', error);
    }
  };

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
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('Uploading signature:', { type, fileName: file.name, fileSize: file.size, fileType: file.type });
    
    // Validasi: hanya PNG
    if (file.type !== 'image/png') {
      const err = `Format file harus PNG saja (Anda upload: ${file.type})`;
      setError(err);
      console.error(err);
      return;
    }
    
    // Validasi: ukuran max 500 KB
    if (file.size > 500 * 1024) {
      const err = `Ukuran file tidak boleh lebih dari 500 KB (File Anda: ${(file.size / 1024).toFixed(2)} KB)`;
      setError(err);
      console.error(err);
      return;
    }
    
    try {
      setSaveLoading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type); // 'guru' atau 'koordinator'
      
      console.log('Sending request to /api/admin/signature-upload');
      const res = await fetch('/api/admin/signature-upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        const msg = `Tanda tangan ${type === 'guru' ? 'Guru Tahfidz' : 'Koordinator Tahfidz'} berhasil diupload!`;
        setSuccess(msg);
        console.log('Success:', msg);
        // Reload signatures to show preview
        await loadSignatures();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = data.error || `Gagal upload (Status: ${res.status})`;
        setError(err);
        console.error('API Error:', err);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      setError(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setSaveLoading(false);
      // Clear file input
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
        <LoadingIndicator fullPage text="Memuat profil..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight whitespace-normal break-words">
                  Profil Admin
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1 whitespace-normal">
                  Kelola informasi profil dan keamanan akun Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Avatar & Info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg mb-4">
                  <span className="text-white text-3xl font-bold">
                    {profileData?.nama?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1 break-words">
                  {profileData?.nama || 'Administrator'}
                </h2>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Mail size={14} />
                  <span className="text-sm break-all">{profileData?.email}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Shield size={16} />
                  Administrator
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEditProfile}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Edit size={18} />
                  Edit Profil
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Lock size={18} />
                  Ubah Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Info + Signature + Security */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
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
                    Nomor Telepon
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900">{profileData?.phoneNumber || '-'}</p>
                  </div>
                </div>

                {/* Jabatan */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Briefcase size={16} className="text-gray-400" />
                    Jabatan
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900">{profileData?.jabatan || '-'}</p>
                  </div>
                </div>

                {/* NIP (Opsional) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <IdCard size={16} className="text-gray-400" />
                    NIP (Opsional)
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900">{profileData?.nip || '-'}</p>
                  </div>
                </div>

                {/* Alamat Kantor - Full Width */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    Alamat Kantor
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900">{profileData?.alamat || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Uploader */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">Tanda Tangan Digital</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Untuk ditampilkan otomatis di laporan
                  </p>
                </div>
              </div>

              {signaturePreviews.koordinator ? (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                    <div className="flex flex-col items-center">
                      <CheckCircle size={24} className="text-emerald-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Tanda Tangan Aktif
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 inline-block">
                        <img
                          src={signaturePreviews.koordinator}
                          alt="Tanda Tangan"
                          className="max-h-24 mx-auto"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
                        <Upload size={18} />
                        Ganti
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSignatureFiles({ ...signatureFiles, koordinatorTandaTangan: file });
                            handleSignatureUpload('koordinator', file);
                          }
                        }}
                        disabled={saveLoading}
                        className="hidden"
                      />
                    </label>
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
                        {saveLoading ? 'Mengupload...' : 'Klik untuk Upload Tanda Tangan'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Format: PNG atau JPG • Maksimal 500 KB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSignatureFiles({ ...signatureFiles, koordinatorTandaTangan: file });
                        handleSignatureUpload('koordinator', file);
                      }
                    }}
                    disabled={saveLoading}
                    className="hidden"
                  />
                </label>
              )}

              {/* Info Note */}
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-900">
                  💡 Ukuran maksimal 500 KB. PNG transparan disarankan.
                </p>
              </div>
            </div>

            {/* Security Card */}
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
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.jabatan || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP <span className="text-gray-400">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.nip || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nip: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    placeholder="08xx xxxx xxxx"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    placeholder="Alamat lengkap..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
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
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  {saveLoading ? <LoadingIndicator inline text="Menyimpan..." size="small" /> : 'Simpan Perubahan'}
                </button>
              </div>
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
                    Password Lama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password lama"
                    value={passwordFormData.oldPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleChangePasswordSubmit}
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-100 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {saveLoading ? <LoadingIndicator inline text="Menyimpan..." size="small" /> : 'Ubah Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
