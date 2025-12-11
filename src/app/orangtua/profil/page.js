'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import {
  UserCircle,
  Edit,
  Lock,
  ShieldCheck,
  BookOpen,
  Home,
  Phone,
  Mail,
  Calendar,
  Clock,
  IdCard,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modal Edit Profil
function EditProfilModal({ isOpen, onClose, userData, onSave }) {
  const [formData, setFormData] = useState({
    namaLengkap: userData?.namaLengkap || '',
    email: userData?.email || '',
    noTelepon: userData?.noTelepon || '',
    alamat: userData?.alamat || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="text-emerald-600" size={24} />
                Edit Profil
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="text-gray-500" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={formData.noTelepon}
                  onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Rumah
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Modal Ganti Password
function GantiPasswordModal({ isOpen, onClose, onSave }) {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.passwordBaru !== formData.konfirmasiPassword) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="text-amber-600" size={24} />
                Ganti Password
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="text-gray-500" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    value={formData.passwordLama}
                    onChange={(e) => setFormData({ ...formData, passwordLama: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.passwordBaru}
                    onChange={(e) => setFormData({ ...formData, passwordBaru: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.konfirmasiPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, konfirmasiPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors"
                >
                  Ganti Password
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Data dummy orang tua
  const userData = {
    namaLengkap: 'Ali Rahman',
    email: 'ali.rahman@wali.sch.id',
    role: 'Orang Tua / Wali Siswa',
    noTelepon: '0812-3456-7890',
    alamat: 'Jl. Pahlawan No. 23, Bandar Lampung',
    idWali: 'WLI.2024.013',
    bergabungSejak: '12 Oktober 2025',
    terakhirLogin: '11 Desember 2025 pukul 21.13 WIB',
    status: 'Aktif',
  };

  // Data dummy anak
  const anakData = [
    {
      id: 1,
      nama: 'Ahmad Fauzan',
      kelas: 'X A1',
      guruPembimbing: 'Ustadz Ahmad',
      progressHafalan: 15,
      targetHafalan: 30,
      avatar: '👦',
    },
    {
      id: 2,
      nama: 'Fatimah Azzahra',
      kelas: 'XI A2',
      guruPembimbing: 'Ustadzah Siti',
      progressHafalan: 8,
      targetHafalan: 20,
      avatar: '👧',
    },
  ];

  const handleSaveProfile = (data) => {
    console.log('Saving profile:', data);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSavePassword = (data) => {
    console.log('Changing password:', data);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen animate-fade-in md:px-8" style={{ padding: '20px' }}>
        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
            >
              <CheckCircle size={20} />
              <span className="font-medium">✅ Perubahan profil berhasil disimpan</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-400 via-mint-400 to-amber-200 rounded-3xl shadow-lg" style={{ padding: '20px' }}>
            <div className="flex items-center gap-3 mb-3">
              <UserCircle className="text-white flex-shrink-0" size={42} style={{ minWidth: '42px', minHeight: '42px' }} />
              <h1 className="font-bold text-white md:text-2xl" style={{ fontSize: '20px' }}>
                Profil Orang Tua
              </h1>
            </div>
            <p className="text-emerald-50 text-base md:text-lg mb-3">
              Lihat dan kelola informasi akun Anda serta data anak yang terhubung.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 font-semibold rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Status: {userData.status}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Card Informasi Akun */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 md:rounded-xl" style={{ padding: '20px', borderRadius: '16px' }}>
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="bg-gradient-to-br from-emerald-400 to-mint-400 rounded-full flex items-center justify-center text-white shadow-lg md:w-20 md:h-20" style={{ width: '64px', height: '64px' }}>
                  <UserCircle size={44} />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h2 className="font-bold text-gray-900 mb-2 md:text-2xl" style={{ fontSize: '18px' }}>{userData.namaLengkap}</h2>
                  <p className="text-gray-600 mb-2 flex items-center gap-2 justify-center" style={{ fontSize: '13px' }}>
                    <Mail size={14} className="text-emerald-500" />
                    {userData.email}
                  </p>
                  <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold md:text-sm" style={{ fontSize: '13px' }}>
                    {userData.role}
                  </span>
                </div>

                {/* Stats */}
                <div className="w-full space-y-2 mt-2">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-emerald-600" />
                      <p className="text-xs text-gray-600">Bergabung Sejak</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{userData.bergabungSejak}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-amber-600" />
                      <p className="text-xs text-gray-600">Terakhir Login</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{userData.terakhirLogin}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-2 mt-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors md:px-5 md:text-sm"
                    style={{ padding: '10px 18px', minHeight: '44px', fontSize: '13px' }}
                  >
                    <Edit size={18} />
                    <span>Edit Profil</span>
                  </button>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition-colors md:px-5 md:text-sm"
                    style={{ padding: '10px 18px', minHeight: '44px', fontSize: '13px' }}
                  >
                    <Lock size={18} />
                    <span>Ganti Password</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biodata Lengkap */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 md:rounded-xl md:p-8 md:gap-5"
              style={{ padding: '20px', borderRadius: '16px' }}
            >
              <h3 className="font-semibold text-emerald-700 border-b border-gray-200 pb-3 mb-4 flex items-center gap-2 md:text-lg" style={{ fontSize: '16px' }}>
                <BookOpen size={22} />
                Biodata Lengkap
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Phone size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Nomor Telepon</p>
                      <p className="font-semibold text-gray-900">{userData.noTelepon}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <IdCard size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ID Wali</p>
                      <p className="font-semibold text-gray-900">{userData.idWali}</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Home size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Alamat Rumah</p>
                      <p className="font-semibold text-gray-900">{userData.alamat}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status Keanggotaan</p>
                      <p className="font-semibold text-gray-900">{userData.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Informasi Anak Terhubung */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 md:rounded-xl md:p-8"
              style={{ padding: '20px', borderRadius: '16px' }}
            >
              <h3 className="font-semibold text-emerald-700 border-b border-gray-200 pb-3 mb-4 flex items-center gap-2 md:text-lg" style={{ fontSize: '16px' }}>
                <UserCircle size={22} />
                Anak yang Terhubung dengan Akun Anda
              </h3>

              <div style={{ gap: '16px' }} className="space-y-4">
                {anakData.map((anak) => {
                  const percentage = Math.round((anak.progressHafalan / anak.targetHafalan) * 100);

                  return (
                    <div
                      key={anak.id}
                      className="bg-mint-50 border border-emerald-100 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">{anak.avatar}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{anak.nama}</h4>
                          <p className="text-sm text-gray-600">Kelas {anak.kelas}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Guru: {anak.guruPembimbing}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Progress Hafalan</span>
                          <span className="text-sm font-bold text-emerald-600">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          🌿 {anak.progressHafalan}/{anak.targetHafalan} Hafalan
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <EditProfilModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userData={userData}
          onSave={handleSaveProfile}
        />

        <GantiPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSave={handleSavePassword}
        />
      </div>
    </OrangtuaLayout>
  );
}
