'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Key, Users, BookOpen, User, Search, AlertCircle } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import PasswordField from '@/components/admin/PasswordField';
import AccountSuccessModal from '@/components/admin/AccountSuccessModal';
import { generateSiswaEmail } from '@/lib/siswaUtils';
import { generateWaliEmail } from '@/lib/passwordUtils';

const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  teal: {
    500: '#14b8a6',
    600: '#0d9488',
  },
  amber: {
    50: '#FEF3C7',
    200: '#FCD34D',
  },
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
};

export default function TeacherStudentCreateModal({ isOpen, onClose, onSuccess, initialKelasId }) {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(false);
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
    nik: '',
    gender: 'LAKI_LAKI',
    relationType: 'Ayah',
  });

  // Parent selection state
  const [parents, setParents] = useState([]);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [loadingParents, setLoadingParents] = useState(false);

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

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchTeacherKelas();
      fetchParents();
    }
  }, [isOpen]);

  const fetchTeacherKelas = async () => {
    try {
      const response = await fetch('/api/guru/kelas');
      const data = await response.json();
      const kelasList = data.kelas || [];
      setKelas(kelasList);
      if (kelasList.length > 0) {
        if (initialKelasId) {
          setFormData(prev => ({ ...prev, kelasId: initialKelasId }));
        } else if (!formData.kelasId) {
          setFormData(prev => ({ ...prev, kelasId: kelasList[0].id }));
        }
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

  // Auto-generate parent email and set gender
  useEffect(() => {
    if (parentMode === 'create') {
      let updates = {};
      
      // Auto email
      if (newParentData.name && formData.nis) {
        updates.email = generateWaliEmail(newParentData.name, formData.nis);
      }
      
      // Auto gender based on relation
      if (newParentData.relationType === 'Ayah') {
        updates.gender = 'LAKI_LAKI';
      } else if (newParentData.relationType === 'Ibu') {
        updates.gender = 'PEREMPUAN';
      }
      
      if (Object.keys(updates).length > 0) {
        setNewParentData(prev => ({ ...prev, ...updates }));
      }
    }
  }, [newParentData.name, formData.nis, newParentData.relationType, parentMode]);

  const resetForm = () => {
    setFormData({
      name: '',
      password: '',
      nis: '',
      nisn: '',
      kelasId: initialKelasId || (kelas.length > 0 ? kelas[0].id : ''),
      gender: 'LAKI_LAKI',
      birthDate: '',
    });
    setParentMode('select');
    setSelectedParentId('');
    setNewParentData({
      name: '',
      phone: '',
      email: '',
      password: '',
      nik: '',
      gender: 'LAKI_LAKI',
      relationType: 'Ayah',
    });
    setFieldErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

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
      if (onSuccess) onSuccess();
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-emerald-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 sm:p-8 z-10 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <UserPlus size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tambah Siswa & Wali</h2>
                <p className="text-sm text-gray-500 font-medium">Daftarkan siswa baru sekaligus akun orang tua pendamping</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
            {/* Section 1: Data Siswa */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                <User size={22} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Data Diri Siswa</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    placeholder="Nomor Induk Siswa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    placeholder="Nomor Induk Siswa Nasional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kelas *</label>
                  <select
                    required
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white"
                  >
                    {kelas.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1.5 px-1 italic">Hanya menampilkan kelas yang Anda ampu</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Kelamin *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Lahir (Opsional)</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Akun Siswa */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                <Key size={22} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Akun Siswa</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email (Otomatis)</label>
                  <input
                    type="text"
                    disabled
                    value={generateSiswaEmail(formData.name, formData.nis)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed italic"
                  />
                </div>

                <PasswordField
                  label="Password Siswa"
                  value={formData.password}
                  onChange={(val) => setFormData({ ...formData, password: val })}
                  placeholder="Gunakan password aman"
                  required
                />
              </div>
            </div>

            {/* Section 3: Data Wali */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                <Users size={22} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Data Orang Tua / Wali</h3>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parentMode === 'select' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                  <input type="radio" name="pMode" checked={parentMode === 'select'} onChange={() => setParentMode('select')} className="w-5 h-5 accent-emerald-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Pilih Orang Tua Existing</p>
                    <p className="text-[11px] text-gray-500">Cari dari database orang tua terdaftar</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parentMode === 'create' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                  <input type="radio" name="pMode" checked={parentMode === 'create'} onChange={() => setParentMode('create')} className="w-5 h-5 accent-emerald-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Buat Orang Tua Baru</p>
                    <p className="text-[11px] text-gray-500">Daftarkan wali utama baru untuk siswa</p>
                  </div>
                </label>
              </div>

              {parentMode === 'select' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor HP orang tua..."
                      value={parentSearchTerm}
                      onChange={(e) => setParentSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <select
                    required={parentMode === 'select'}
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                  >
                    <option value="">-- Pilih Orang Tua --</option>
                    {filteredParents.map(p => (
                      <option key={p.id} value={p.id}>{p.user.name} ({p.noTelepon || 'No HP -'})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Wali *</label>
                    <select
                      required={parentMode === 'create'}
                      value={newParentData.relationType}
                      onChange={(e) => setNewParentData({ ...newParentData, relationType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white"
                    >
                      <option value="Ayah">Ayah</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Wali">Wali</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap Wali *</label>
                    <input
                      type="text"
                      required={parentMode === 'create'}
                      value={newParentData.name}
                      onChange={(e) => setNewParentData({ ...newParentData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Nama wali utama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">NIK Wali *</label>
                    <input
                      type="text"
                      required={parentMode === 'create'}
                      value={newParentData.nik}
                      onChange={(e) => setNewParentData({ ...newParentData, nik: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all"
                      placeholder="16 digit NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon Wali *</label>
                    <input
                      type="tel"
                      required={parentMode === 'create'}
                      value={newParentData.phone}
                      onChange={(e) => setNewParentData({ ...newParentData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Kelamin Wali *</label>
                    <select
                      required={parentMode === 'create'}
                      value={newParentData.gender}
                      onChange={(e) => setNewParentData({ ...newParentData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-all bg-white"
                    >
                      <option value="LAKI_LAKI">Laki-laki</option>
                      <option value="PEREMPUAN">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Akun Wali (Otomatis)</label>
                    <input
                      type="text"
                      disabled
                      value={newParentData.email}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed italic"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <PasswordField
                      label="Password Akun Wali"
                      value={newParentData.password}
                      onChange={(val) => setNewParentData({ ...newParentData, password: val })}
                      placeholder="Gunakan password aman untuk wali"
                      required={parentMode === 'create'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Helpers */}
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-amber-900">Menunggu Validasi Admin</p>
                  <p className="text-xs text-amber-800/80 leading-relaxed mt-0.5">Siswa yang Anda tambahkan akan berstatus <span className="font-bold">Pending</span>. Admin perlu melakukan validasi sebelum siswa muncul di laporan resmi.</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex gap-4">
                <Users className="text-emerald-600 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Akun Wali Utama Shared</p>
                  <p className="text-xs text-emerald-800/80 leading-relaxed mt-0.5">Satu akun wali dapat digunakan bersama oleh ayah dan ibu untuk memantau perkembangan hafalan anak secara real-time.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 justify-end pt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <LoadingIndicator size="small" text="Memproses..." inline className="text-white" />
                ) : (
                  'Simpan Siswa'
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
            handleClose();
          }}
        />
      )}
    </>
  );
}
