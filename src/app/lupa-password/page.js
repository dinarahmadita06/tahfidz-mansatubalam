'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Key, Loader2, Lock, Eye, EyeOff, Copy, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [role, setRole] = useState('SISWA');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newRecoveryCode, setNewRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          role, 
          recoveryCode: recoveryCode.replace(/-/g, ''), 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setNewRecoveryCode(data.newRecoveryCode);
      } else {
        setError(data.error || 'Gagal mereset password. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const formatted = newRecoveryCode.match(/.{1,3}/g).join('-');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryCard = () => {
    const formatted = newRecoveryCode.match(/.{1,3}/g).join('-');
    const content = `KARTU RECOVERY SIMTAQ

Username: ${username}
Role: ${role}
Recovery Code: ${formatted}

SIMPAN KODE INI DENGAN AMAN.
KODE INI ADALAH SATU-SATUNYA CARA UNTUK MERESET PASSWORD ANDA.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RecoveryCard_${username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (success) {
    const formatted = newRecoveryCode.match(/.{1,3}/g).join('-');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Diperbarui!</h1>
            <p className="text-gray-600 text-sm">
              Password Anda telah berhasil diubah. Berikut adalah <b>Recovery Code Baru</b> Anda.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 text-center">Recovery Code Baru (9 Digit)</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-mono font-bold text-gray-900 tracking-widest">
                {formatted}
              </span>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-700"
                title="Salin Kode"
              >
                {copied ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-[10px] text-amber-700 mt-3 text-center leading-relaxed italic">
              *Simpan kode ini baik-baik. Kode lama sudah tidak berlaku.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadRecoveryCard}
              className="w-full border border-emerald-600 text-emerald-600 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
            >
              <Download size={18} />
              Download Kartu Recovery
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
            >
              Ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <path d="M30,15 L40,30 L30,45 L20,30 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-emerald-600"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6 lg:p-8">
          <div className="flex items-center mb-6">
            <Link href="/login" className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          </div>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Gunakan recovery code 9-digit Anda untuk mereset password.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs mb-6 flex items-start gap-2 animate-shake">
              <div className="mt-0.5">⚠️</div>
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="NIS / Kode Guru"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Recovery Code</label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 9);
                    if (val.length > 6) val = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
                    else if (val.length > 3) val = `${val.slice(0, 3)}-${val.slice(3)}`;
                    setRecoveryCode(val);
                  }}
                  placeholder="XXX-XXX-XXX"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 font-mono tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'GURU', label: 'Guru' },
                  { value: 'SISWA', label: 'Siswa' },
                  { value: 'ORANG_TUA', label: 'Ortu' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                      role === option.value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password Baru</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                      newPassword && newPassword.length < 8 ? 'border-red-300 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && newPassword.length < 8 && (
                  <p className="text-[10px] text-red-600 mt-1 ml-1 font-medium">Password minimal 8 karakter.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Konfirmasi Password Baru</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    required
                    className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                      confirmPassword && confirmPassword !== newPassword ? 'border-red-300 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[10px] text-red-600 mt-1 ml-1 font-medium">Konfirmasi password tidak cocok.</p>
                )}
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <Lock size={12} /> Persyaratan Password:
                  </p>
                  <ul className="text-[9px] text-emerald-700 space-y-0.5">
                    <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {newPassword.length >= 8 ? '✓' : '•'} Minimal 8 karakter
                    </li>
                    <li className={`flex items-center gap-1 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '•'} Konfirmasi cocok
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !recoveryCode || !newPassword || !confirmPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed font-bold text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-100 active:scale-[0.98]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password Sekarang'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <Link href="/login" className="block text-xs text-gray-400 hover:text-emerald-600 font-bold transition-colors uppercase tracking-widest">
              ← Kembali ke Login
            </Link>
            
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 font-medium">
                Kehilangan Recovery Code? 
                <button 
                  type="button"
                  onClick={() => alert('Silakan hubungi Admin atau Koordinator Tahfidz untuk mereset keamanan akun Anda secara manual.')}
                  className="ml-1 text-emerald-600 hover:underline font-bold"
                >
                  Hubungi Admin
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
