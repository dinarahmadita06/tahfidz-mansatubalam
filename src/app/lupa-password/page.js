'use client';

import { useState } from 'react';
import { BookOpen, User, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LupaPasswordPage() {
  const [namaLengkap, setNamaLengkap] = useState('');

  const handleWhatsAppClick = () => {
    if (!namaLengkap.trim()) {
      alert('Mohon isi Nama Lengkap atau Nomor HP terlebih dahulu');
      return;
    }

    // Format pesan WhatsApp
    const message = `Assalamu'alaikum Admin, saya ${namaLengkap} ingin meminta reset password akun SIMTAQ. Mohon bantuannya.`;
    const whatsappUrl = `https://wa.me/6287713814763?text=${encodeURIComponent(message)}`;

    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Islamic Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,20 L65,35 L50,50 L35,35 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,50 L65,65 L50,80 L35,65 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M20,50 L35,65 L50,50 L35,35 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50,50 L65,35 L80,50 L65,65 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-emerald-600"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-2">
            SIMTAQ
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Informasi Manajemen Tahfidz Qur'an
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8" style={{ width: '420px', maxWidth: '100%', margin: '0 auto' }}>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Lupa Password</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Jika Anda lupa password, silakan hubungi Admin melalui WhatsApp untuk melakukan reset password.
          </p>

          <div className="space-y-5">
            {/* Nama/HP Input */}
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-2">
                Masukkan Nama Lengkap atau Nomor HP
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  id="namaLengkap"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                  placeholder="contoh: Ahmad Fauzi / 081234567890"
                />
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Hubungi Admin via WhatsApp
            </button>

            {/* Note Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Catatan:</strong> Fitur reset password hanya dapat dilakukan oleh Admin.
                  Jika Anda adalah Guru, Siswa, atau Orang Tua, silakan hubungi Admin melalui tombol di atas untuk meminta reset password.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            © 2025 SIMTAQ
          </p>
        </div>
      </div>
    </div>
  );
}
