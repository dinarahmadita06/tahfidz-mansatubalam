'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  User,
  Monitor,
  Database,
  Bell,
  Eye,
  EyeOff,
  Save,
  Shield,
  Sun,
  Moon,
  Type,
  Film,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronRight,
  Lock,
  Mail,
  Key,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function PengaturanPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profil Administrator State
  const [profile, setProfile] = useState({
    nama: session?.user?.name || 'Administrator',
    email: session?.user?.email || 'admin@tahfidz.com',
    role: 'Administrator',
    lastLogin: new Date().toLocaleString('id-ID'),
    twoFactorEnabled: false,
    suspiciousActivityAlert: true,
    autoLogout: true
  });

  // Preferensi Tampilan State
  const [display, setDisplay] = useState({
    theme: 'light',
    fontSize: 'normal',
    animationEnabled: true
  });

  // Konfigurasi Sistem State
  const [system, setSystem] = useState({
    tahunAjaranAktif: '2024/2025',
    maintenanceMode: false,
    systemStatus: 'active'
  });

  // Notifikasi & Integrasi State
  const [notification, setNotification] = useState({
    emailNotification: true,
    realtimeNotification: true,
    apiKey: '',
    apiConnected: false
  });

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    alert('Eksport data sistem akan segera dimulai...');
  };

  const handleBackup = async () => {
    alert('Proses backup akan dimulai...');
    setShowBackupModal(false);
  };

  const handleReset = async () => {
    alert('Database hafalan akan direset...');
    setShowResetModal(false);
  };

  return (
    <AdminLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div
        className="min-h-screen p-8 settings-container"
        style={{
          background: 'linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Home size={16} />
          <ChevronRight size={14} />
          <span className="font-medium text-emerald-700">Pengaturan Sistem</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl shadow-lg">
            <Settings className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <p className="text-sm text-gray-600 mt-1">
              Atur preferensi, tampilan, dan keamanan sistem Tahfidz
            </p>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
            <CheckCircle size={20} />
            <span className="font-medium">Pengaturan berhasil disimpan!</span>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 1. Profil Administrator */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Profil Administrator</h2>
            </div>

            {/* Profile Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="text-white" size={40} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{profile.nama}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {profile.email}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                  {profile.role}
                </span>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-3">
                  <Clock size={12} />
                  Terakhir login: {profile.lastLogin}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all duration-200">
                <User size={18} />
                Edit Profil
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 hover:shadow-md transition-all duration-200"
              >
                <Lock size={18} />
                Ganti Password
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Keamanan Akun */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                Keamanan Akun
              </h3>

              <div className="space-y-4">
                {/* 2FA Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Autentikasi dua langkah (2FA)</p>
                      <p className="text-xs text-gray-500">Keamanan login dengan kode verifikasi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfile({ ...profile, twoFactorEnabled: !profile.twoFactorEnabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      profile.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        profile.twoFactorEnabled ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Suspicious Activity Alert */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifikasi aktivitas mencurigakan</p>
                      <p className="text-xs text-gray-500">Peringatan login tidak biasa</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setProfile({ ...profile, suspiciousActivityAlert: !profile.suspiciousActivityAlert })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      profile.suspiciousActivityAlert ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        profile.suspiciousActivityAlert ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Logout */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Logout otomatis (15 menit)</p>
                      <p className="text-xs text-gray-500">Keluar otomatis saat tidak aktif</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfile({ ...profile, autoLogout: !profile.autoLogout })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      profile.autoLogout ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        profile.autoLogout ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preferensi Tampilan */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Preferensi Tampilan</h2>
            </div>

            <div className="space-y-6">
              {/* Tema Warna */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Sun size={16} className="text-amber-500" />
                  Tema Warna
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setDisplay({ ...display, theme: 'light' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      display.theme === 'light'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <Sun size={20} className="mx-auto mb-1" />
                    <span className="text-xs">Light</span>
                  </button>
                  <button
                    onClick={() => setDisplay({ ...display, theme: 'emerald' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      display.theme === 'emerald'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="w-5 h-5 bg-emerald-400 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs">Emerald</span>
                  </button>
                  <button
                    onClick={() => setDisplay({ ...display, theme: 'dark' })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      display.theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <Moon size={20} className="mx-auto mb-1" />
                    <span className="text-xs">Dark</span>
                  </button>
                </div>
              </div>

              {/* Ukuran Font */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Type size={16} className="text-gray-600" />
                  Ukuran Font
                </label>
                <select
                  value={display.fontSize}
                  onChange={(e) => setDisplay({ ...display, fontSize: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="normal">Normal (16px)</option>
                  <option value="medium">Medium (18px)</option>
                  <option value="large">Besar (20px)</option>
                </select>
              </div>

              {/* Animasi Transisi */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Film size={16} className="text-gray-600" />
                    Animasi Transisi
                  </label>
                  <button
                    onClick={() => setDisplay({ ...display, animationEnabled: !display.animationEnabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      display.animationEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        display.animationEnabled ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {display.animationEnabled ? 'Animasi aktif' : 'Animasi dinonaktifkan'}
                </p>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Preview Tampilan:</p>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="h-2 bg-emerald-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Konfigurasi Sistem */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-amber-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Konfigurasi Sistem</h2>
            </div>

            <div className="space-y-6">
              {/* Tahun Ajaran Aktif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran Aktif
                </label>
                <select
                  value={system.tahunAjaranAktif}
                  onChange={(e) => setSystem({ ...system, tahunAjaranAktif: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>

              {/* System Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status Sistem</label>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-700">Sistem Aktif</span>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Mode Maintenance</p>
                  <p className="text-xs text-amber-700 mt-1">Nonaktifkan sementara sistem</p>
                </div>
                <button
                  onClick={() => setSystem({ ...system, maintenanceMode: !system.maintenanceMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    system.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      system.maintenanceMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => setShowBackupModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all duration-200"
                >
                  <Upload size={18} />
                  Backup & Restore Data
                </button>
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <Download size={18} />
                  Export Data Sistem
                </button>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 hover:shadow-md transition-all duration-200"
                >
                  <RefreshCw size={18} />
                  Reset Database Hafalan
                </button>
              </div>
            </div>
          </div>

          {/* 4. Notifikasi & Integrasi */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Notifikasi & Integrasi</h2>
            </div>

            <div className="space-y-6">
              {/* Email Notification */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Mail size={18} className="text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Pemberitahuan</p>
                    <p className="text-xs text-gray-500 mt-1">Kirim notifikasi ke guru/orang tua</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotification({ ...notification, emailNotification: !notification.emailNotification })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    notification.emailNotification ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      notification.emailNotification ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Realtime Notification */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Bell size={18} className="text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifikasi Real-time</p>
                    <p className="text-xs text-gray-500 mt-1">Aktifkan notifikasi di dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotification({
                      ...notification,
                      realtimeNotification: !notification.realtimeNotification
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    notification.realtimeNotification ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      notification.realtimeNotification ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* API Integration */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Key size={16} className="text-gray-600" />
                  API Key Integrasi
                </label>
                <div className="relative">
                  <input
                    type={notification.apiKey ? 'password' : 'text'}
                    value={notification.apiKey}
                    onChange={(e) => setNotification({ ...notification, apiKey: e.target.value })}
                    placeholder="Masukkan API Key (Firebase, Google Drive, dll)"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {notification.apiConnected ? (
                    <>
                      <CheckCircle size={16} className="text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">Terhubung</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">Tidak Terhubung</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 bg-white/50 rounded-lg p-4">
          Perubahan pengaturan akan disimpan secara otomatis. Pastikan Anda memiliki hak akses sebagai administrator
          utama.
        </div>

        <style jsx global>{`
          @media (max-width: 768px) {
            .settings-container {
              padding: 16px !important;
            }
          }
        `}</style>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ganti Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Batal
                </button>
                <button className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Modal */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Backup & Restore Data</h3>
              <p className="text-sm text-gray-600 mb-6">
                Pilih aksi yang ingin dilakukan untuk mengelola data sistem.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  <Upload size={18} />
                  Backup Data Sekarang
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200">
                  <Download size={18} />
                  Restore dari Backup
                </button>
              </div>
              <button
                onClick={() => setShowBackupModal(false)}
                className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Database Hafalan?</h3>
                <p className="text-sm text-gray-600">
                  Tindakan ini akan menghapus seluruh data hafalan. Data tidak dapat dikembalikan setelah dihapus.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ Pastikan Anda telah melakukan backup sebelum melanjutkan!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
