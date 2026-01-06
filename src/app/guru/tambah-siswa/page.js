'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Save, 
  X, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  ArrowLeft,
  User,
  Key,
  Users,
  Search,
  CheckCircle2
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import PasswordField from '@/components/admin/PasswordField';
import AccountSuccessModal from '@/components/admin/AccountSuccessModal';
import { generateSiswaEmail } from '@/lib/siswaUtils';
import { generateWaliEmail } from '@/lib/passwordUtils';

export default function TambahSiswaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState(null);

  // Parent mode: 'select' or 'create'
  const [parentMode, setParentMode] = useState('select');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newParentData, setNewParentData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    relationType: 'Ayah',
  });

  // Student form data
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    nis: '',
    nisn: '',
    kelasId: '',
    gender: 'LAKI_LAKI',
    birthDate: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTeacherKelas();
      fetchParents();
    }
  }, [status, router]);

  const fetchTeacherKelas = async () => {
    try {
      const response = await fetch('/api/guru/kelas');
      const data = await response.json();
      const list = data.kelas || [];
      setKelasList(list);
      if (list.length > 0 && !formData.kelasId) {
        setFormData(prev => ({ ...prev, kelasId: list[0].id }));
      }
    } catch (error) {
      console.error('Error fetching teacher kelas:', error);
    }
  };

  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const response = await fetch('/api/teacher/parents');
      const result = await response.json();
      setParents(result.data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoadingParents(false);
    }
  };

  // Auto-generate parent email
  useEffect(() => {
    if (parentMode === 'create' && newParentData.name && formData.nis) {
      const email = generateWaliEmail(newParentData.name, formData.nis);
      setNewParentData(prev => ({ ...prev, email }));
    }
  }, [newParentData.name, formData.nis, parentMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        student: {
          ...formData,
          email: generateSiswaEmail(formData.name, formData.nis),
        },
        parentMode: parentMode === 'select' ? 'EXISTING' : 'NEW',
        existingParentId: selectedParentId,
        parent: parentMode === 'create' ? newParentData : null,
      };

      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menambahkan siswa');
      }

      // Prepare success data
      setCreatedAccounts({
        student: {
          name: formData.name,
          email: payload.student.email,
          password: formData.password,
        },
        parent: {
          name: parentMode === 'create' ? newParentData.name : (parents.find(p => p.id === selectedParentId)?.user?.name || 'Orang Tua'),
          email: parentMode === 'create' ? newParentData.email : (parents.find(p => p.id === selectedParentId)?.user?.email || ''),
          password: parentMode === 'create' ? newParentData.password : '********',
          isNew: parentMode === 'create',
        },
      });

      setShowSuccessModal(true);
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(p => 
    p.user.name.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    (p.noTelepon && p.noTelepon.includes(parentSearchTerm))
  );

  if (status === 'loading') return null;

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 pt-10 pb-24 px-6 sm:px-10">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => router.push('/guru/kelola-siswa')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Kembali ke Daftar Siswa</span>
            </button>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                <UserPlus size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Tambah Siswa & Wali</h1>
                <p className="text-emerald-50 font-medium opacity-90">Sistem Registrasi Terpadu (Siswa + Orang Tua)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-5xl mx-auto -mt-16 px-6 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Data Siswa */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-900/5 border border-white p-8">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-4 mb-8">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <User size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">1. Data Diri Siswa</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                    placeholder="Masukkan nama lengkap sesuai ijazah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="Nomor Induk Siswa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="Nomor Induk Siswa Nasional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Kelas *</label>
                  <select
                    required
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-600 mt-2 font-medium italic">Hanya menampilkan kelas yang Anda ampu</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Jenis Kelamin *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'LAKI_LAKI' })}
                      className={`py-4 rounded-2xl font-bold border-2 transition-all ${formData.gender === 'LAKI_LAKI' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'PEREMPUAN' })}
                      className={`py-4 rounded-2xl font-bold border-2 transition-all ${formData.gender === 'PEREMPUAN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Tanggal Lahir (Opsional)</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Akun Siswa */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-900/5 border border-white p-8">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-4 mb-8">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <Key size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">2. Keamanan Akun Siswa</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2.5">Email Akses (Otomatis)</label>
                  <div className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/80 text-gray-400 font-medium italic">
                    {generateSiswaEmail(formData.name, formData.nis) || 'Selesaikan Nama & NIS terlebih dahulu'}
                  </div>
                </div>

                <PasswordField
                  label="Password Login Siswa"
                  value={formData.password}
                  onChange={(val) => setFormData({ ...formData, password: val })}
                  placeholder="Gunakan password aman"
                  required
                />
              </div>
            </div>

            {/* Section 3: Data Wali */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-900/5 border border-white p-8">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-4 mb-8">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <Users size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">3. Data Orang Tua / Wali</h3>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => setParentMode('select')}
                  className={`flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${parentMode === 'select' ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${parentMode === 'select' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 text-gray-300'}`}>
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Pilih Existing</p>
                    <p className="text-xs text-gray-500 mt-0.5">Cari orang tua yang sudah terdaftar</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setParentMode('create')}
                  className={`flex-1 flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${parentMode === 'create' ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${parentMode === 'create' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 text-gray-300'}`}>
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Buat Baru</p>
                    <p className="text-xs text-gray-500 mt-0.5">Daftarkan akun wali utama baru</p>
                  </div>
                </button>
              </div>

              {parentMode === 'select' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor HP orang tua..."
                      value={parentSearchTerm}
                      onChange={(e) => setParentSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Hasil Pencarian</label>
                    <select
                      required={parentMode === 'select'}
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- Silakan Pilih Orang Tua --</option>
                      {filteredParents.map(p => (
                        <option key={p.id} value={p.id}>{p.user.name} ({p.noTelepon || 'No HP -'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Jenis Wali *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Ayah', 'Ibu', 'Wali'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewParentData({ ...newParentData, relationType: type })}
                          className={`py-3 rounded-xl font-bold border-2 transition-all text-sm ${newParentData.relationType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Nama Lengkap Wali *</label>
                    <input
                      type="text"
                      required={parentMode === 'create'}
                      value={newParentData.name}
                      onChange={(e) => setNewParentData({ ...newParentData, name: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Nama wali utama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Nomor Telepon Wali *</label>
                    <input
                      type="tel"
                      required={parentMode === 'create'}
                      value={newParentData.phone}
                      onChange={(e) => setNewParentData({ ...newParentData, phone: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Email Wali (Otomatis)</label>
                    <div className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50/80 text-gray-400 font-medium italic">
                      {newParentData.email || 'Otomatis dari Nama Wali + NIS'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <PasswordField
                      label="Password Login Wali"
                      value={newParentData.password}
                      onChange={(val) => setNewParentData({ ...newParentData, password: val })}
                      placeholder="Gunakan password aman untuk wali"
                      required={parentMode === 'create'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Helpers & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-amber-50/50 border-2 border-amber-100 rounded-3xl flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-amber-900">Menunggu Validasi</p>
                  <p className="text-xs text-amber-800/70 leading-relaxed mt-1">Siswa baru akan berstatus <span className="font-bold underline italic">Pending</span> dan memerlukan persetujuan Admin sebelum aktif penuh di sistem.</p>
                </div>
              </div>
              <div className="p-6 bg-emerald-50/50 border-2 border-emerald-100 rounded-3xl flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">Shared Account</p>
                  <p className="text-xs text-emerald-800/70 leading-relaxed mt-1">Satu akun wali dapat diakses bersama oleh Ayah & Ibu untuk memantau hafalan anak dari HP masing-masing.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-end pt-10 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/guru/kelola-siswa')}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-14 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={22} />
                    Simpan Siswa Baru
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && createdAccounts && (
        <AccountSuccessModal
          accounts={createdAccounts}
          onClose={() => {
            setShowSuccessModal(false);
            router.push('/guru/kelola-siswa');
          }}
        />
      )}
    </GuruLayout>
  );
}
