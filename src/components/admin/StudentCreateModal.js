'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Key, 
  Users, 
  User, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  Edit,
  Mail, 
  Lock, 
  Calendar, 
  Hash, 
  UserCircle, 
  Info, 
  Copy,
  Eye,
  EyeOff,
  Check,
  ShieldAlert
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import PasswordField from './PasswordField';
import AccountSuccessModal from './AccountSuccessModal';
import toast from 'react-hot-toast';
import { generateSiswaEmail } from '@/lib/siswaUtils';
import { 
  generateWaliEmail, 
  generatePasswordMixed,
  generateStudentPassword,
  generateParentPassword,
  generateStudentUsername,
  generateParentUsername
} from '@/lib/passwordUtils';

export default function StudentCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userRole = 'ADMIN', // 'ADMIN' or 'GURU'
  initialKelasId = '',
  editingSiswa = null // If provided, we are in Edit mode
}) {
  const [kelas, setKelas] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newGeneratedPassword, setNewGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [isGeneratedStudentPw, setIsGeneratedStudentPw] = useState(false);
  const [isGeneratedParentPw, setIsGeneratedParentPw] = useState(false);
  const [dateDisplay, setDateDisplay] = useState('');

  const isEditing = !!editingSiswa;

  // Parent mode: 'select' or 'create'
  const [parentMode, setParentMode] = useState('select');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newParentData, setNewParentData] = useState({
    name: '',
    noHP: '',
    email: '',
    password: '',
    jenisWali: 'Ayah',
    jenisKelamin: 'LAKI_LAKI',
  });

  // Student form data
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    nis: '',
    nisn: '',
    kelasId: initialKelasId || '',
    tahunAjaranMasukId: '',
    kelasAngkatan: '',
    jenisKelamin: 'LAKI_LAKI',
    tanggalLahir: '',
    email: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      setNewGeneratedPassword('');
      setShowGeneratedPassword(false);
      if (isEditing) {
        setFormData({
          name: editingSiswa.user?.name || '',
          password: '', 
          nis: editingSiswa.nis || '',
          nisn: editingSiswa.nisn || '',
          kelasId: editingSiswa.kelasId || initialKelasId || '',
          tahunAjaranMasukId: editingSiswa.tahunAjaranMasukId || '',
          kelasAngkatan: editingSiswa.kelasAngkatan || '',
          jenisKelamin: editingSiswa.jenisKelamin || 'LAKI_LAKI',
          tanggalLahir: editingSiswa.tanggalLahir ? new Date(editingSiswa.tanggalLahir).toISOString().split('T')[0] : '',
          email: editingSiswa.user?.email || '',
        });
        
        // Set date display for editing
        if (editingSiswa.tanggalLahir) {
          const date = new Date(editingSiswa.tanggalLahir);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          setDateDisplay(`${day}/${month}/${year}`);
        }
        
        // Handle parent data for editing
        if (editingSiswa.orangTuaSiswa && editingSiswa.orangTuaSiswa.length > 0) {
          setParentMode('select');
          setSelectedParentId(editingSiswa.orangTuaSiswa[0].orangTuaId);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialKelasId, editingSiswa]);

  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true);
      const endpoints = [
        fetch('/api/tahun-ajaran'),
        userRole === 'GURU' ? fetch('/api/guru/kelas') : fetch('/api/kelas'),
        userRole === 'GURU' ? fetch('/api/teacher/parents') : fetch('/api/admin/orangtua?limit=1000')
      ];

      const [taRes, kelasRes, parentRes] = await Promise.all(endpoints);
      
      const taData = await taRes.json();
      const kelasData = await kelasRes.json();
      const parentData = await parentRes.json();

      const taList = taData.data || [];
      setTahunAjaranList(taList);
      
      // Auto-select active year for new student
      if (!isEditing) {
        const activeTa = taList.find(ta => ta.isActive);
        if (activeTa) {
          setFormData(prev => ({ ...prev, tahunAjaranMasukId: activeTa.id }));
        }
      }

      const kelasList = userRole === 'GURU' ? (kelasData.kelas || []) : (kelasData || []);
      setKelas(kelasList);
      
      const parentsList = parentData.data || (Array.isArray(parentData) ? parentData : []);
      setParents(parentsList);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoadingInitial(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      password: '',
      nis: '',
      nisn: '',
      kelasId: initialKelasId || '',
      tahunAjaranMasukId: '',
      kelasAngkatan: '',
      jenisKelamin: 'LAKI_LAKI',
      tanggalLahir: '',
      email: '',
    });
    setParentMode('select');
    setSelectedParentId('');
    setNewParentData({
      name: '',
      noHP: '',
      email: '',
      password: '',
      jenisWali: 'Ayah',
      jenisKelamin: 'LAKI_LAKI',
    });
    setFieldErrors({});
    setParentSearchTerm('');
    setIsGeneratedStudentPw(false);
    setIsGeneratedParentPw(false);
    setDateDisplay('');
  };

  // Auto-generate student email (Manual password generation only)
  useEffect(() => {
    if (!isEditing && formData.nis) {
      const generatedEmail = generateSiswaEmail(formData.name || 'Siswa', formData.nis);
      setFormData(prev => ({ 
        ...prev, 
        email: generatedEmail
      }));
    }
  }, [formData.name, formData.nis, isEditing]);

  // Auto-generate parent email (Manual password generation only)
  useEffect(() => {
    if (parentMode === 'create' && newParentData.name && formData.nis) {
      const generatedEmail = generateWaliEmail(newParentData.name, formData.nis);
      const updates = { email: generatedEmail };
      
      // Auto gender based on relation
      if (newParentData.jenisWali === 'Ayah') {
        updates.jenisKelamin = 'LAKI_LAKI';
      } else if (newParentData.jenisWali === 'Ibu') {
        updates.jenisKelamin = 'PEREMPUAN';
      }

      setNewParentData(prev => ({ ...prev, ...updates }));
    }
  }, [newParentData.name, formData.nis, newParentData.jenisWali, parentMode]);

  // Auto-fill student password from NISN - REMOVED per user request
  /*
  useEffect(() => {
    if (!isEditing && formData.nisn && formData.nisn.trim().length === 10 && !formData.password) {
      setFormData(prev => ({ 
        ...prev, 
        password: generateStudentPassword(formData.nisn)
      }));
    }
  }, [formData.nisn, isEditing, formData.password]);
  */

  // Auto-fill parent password from NISN and birth date - REMOVED per user request
  /*
  useEffect(() => {
    if (parentMode === 'create' && formData.nisn && formData.nisn.trim().length === 10 && formData.tanggalLahir && !newParentData.password) {
      setNewParentData(prev => ({ 
        ...prev, 
        password: generateParentPassword(formData.nisn, formData.tanggalLahir)
      }));
    }
  }, [formData.nisn, formData.tanggalLahir, parentMode, newParentData.password]);
  */

  const handleResetPassword = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset password siswa ini? Password lama akan langsung tidak berlaku.')) {
      return;
    }

    try {
      setResettingPassword(true);
      const res = await fetch(`/api/admin/siswa/${editingSiswa.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Gagal mereset password');

      const data = await res.json();
      setNewGeneratedPassword(data.newPassword);
      setShowGeneratedPassword(true);
      toast.success('Password berhasil di-reset');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mereset password siswa');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopyPassword = () => {
    if (!newGeneratedPassword) return;
    navigator.clipboard.writeText(newGeneratedPassword);
    setCopied(true);
    toast.success('Password disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateStudentPassword = () => {
    if (!formData.tanggalLahir) {
      toast.error('Isi tanggal lahir siswa terlebih dahulu');
      return;
    }
    const defaultPw = generateStudentPassword(formData.tanggalLahir);
    setFormData({ ...formData, password: defaultPw });
    setIsGeneratedStudentPw(true);
    toast.success(`Password siswa diset ke default (Tgl Lahir): ${defaultPw}`);
  };

  const handleGenerateParentPassword = () => {
    if (!formData.tanggalLahir) {
      toast.error('Isi tanggal lahir siswa terlebih dahulu');
      return;
    }
    const defaultPw = generateParentPassword(formData.tanggalLahir);
    setNewParentData({ ...newParentData, password: defaultPw });
    setIsGeneratedParentPw(true);
    toast.success(`Password wali diset ke default (Tgl Lahir): ${defaultPw}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const studentEmail = formData.email || generateSiswaEmail(formData.name, formData.nis);
      
      let payload;
      let endpoint;
      let method = isEditing ? 'PATCH' : 'POST';

      if (userRole === 'GURU') {
        endpoint = isEditing ? `/api/teacher/students/${editingSiswa.id}` : '/api/teacher/students';
        payload = {
          student: {
            ...formData,
            email: studentEmail,
            username: formData.nis, // Use NIS as username
            gender: formData.jenisKelamin, // Guru API uses 'gender'
            birthDate: formData.tanggalLahir, // Guru API uses 'birthDate'
          },
          parentMode: parentMode === 'select' ? 'EXISTING' : 'NEW',
          existingParentId: selectedParentId,
          parent: parentMode === 'create' ? {
            ...newParentData,
            username: formData.nis + '_wali', // Use child's NIS with suffix for parent username
            phone: newParentData.noHP, // Guru API uses 'phone'
            gender: newParentData.jenisKelamin, // Guru API uses 'gender'
            relationType: newParentData.jenisWali // Guru API uses 'relationType'
          } : null,
        };
      } else {
        endpoint = isEditing ? `/api/admin/siswa/${editingSiswa.id}` : '/api/admin/siswa';
        payload = {
          ...formData,
          email: studentEmail,
          username: formData.nis, // Use NIS as username
          parentData: parentMode === 'create' ? newParentData : null,
          existingParentId: parentMode === 'select' ? selectedParentId : null,
        };
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.invalidFields) setFieldErrors(result.invalidFields);
        // If the error contains NIS-related message, use that, otherwise use general error
        const errorMessage = result.error || result.message || 'Gagal menyimpan data';
        throw new Error(errorMessage);
      }

      if (isEditing) {
        alert('Siswa berhasil diperbarui');
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      // Prepare success details
      setCreatedAccounts({
        student: {
          name: formData.name,
          username: formData.nis,
          password: formData.password,
        },
        parent: {
          name: parentMode === 'create' ? newParentData.name : (parents.find(p => p.id === selectedParentId)?.user?.name || 'Orang Tua'),
          username: formData.nis, // Parent uses same NIS as username
          password: parentMode === 'create' ? newParentData.password : '********',
          isNew: parentMode === 'create',
        },
      });

      // Special case for admin: if existing parent, link if needed
      if (userRole === 'ADMIN' && parentMode === 'select' && selectedParentId) {
        await fetch('/api/admin/orangtua-siswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId: result.id,
            orangTuaId: selectedParentId,
            hubungan: 'Orang Tua',
          }),
        });
      }

      setShowSuccessModal(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Check if the error message indicates duplicate NIS
      if (error.message.includes('NIS') && error.message.includes('sudah terdaftar')) {
        toast.error(error.message);
      } else {
        alert(`❌ ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(p => 
    p.user?.name?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(parentSearchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div 
          className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 sm:p-8 z-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                {isEditing ? <Edit size={24} className="text-white" /> : <UserPlus size={24} className="text-white" />}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{isEditing ? 'Edit Data Siswa' : 'Tambah Siswa & Wali'}</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {isEditing ? 'Perbarui informasi data diri dan kelas siswa' : 'Daftarkan siswa baru ke dalam sistem Tahfidz'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
            {/* Warning for Guru */}
            {userRole === 'GURU' && !isEditing && (
              <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex gap-4 animate-pulse">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-amber-900">Menunggu Validasi Admin</p>
                  <p className="text-xs text-amber-800/80 leading-relaxed mt-0.5">Siswa yang Anda tambahkan akan berstatus <span className="font-bold">Pending</span>. Admin perlu memvalidasi data sebelum siswa aktif sepenuhnya.</p>
                </div>
              </div>
            )}

            {/* Section 1: Data Siswa */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                <User size={20} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Data Diri Siswa</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1: Nama Lengkap — Jenis Kelamin */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Jenis Kelamin *</label>
                  <select
                    required
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                {/* Row 2: NISN — NIS */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                    placeholder="NISN"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Nomor Induk Siswa"
                  />
                </div>

                {/* Row 3: Diterima di Kelas — Kelas */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Diterima di Kelas *</label>
                  <select
                    required
                    value={formData.kelasAngkatan}
                    onChange={(e) => setFormData({ ...formData, kelasAngkatan: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Angkatan --</option>
                    <option value="X">X (Sepuluh)</option>
                    <option value="XI">XI (Sebelas)</option>
                    <option value="XII">XII (Duabelas)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Kelas Saat Ini *</label>
                  <select
                    required
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelas.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Row 4: Tahun Ajaran Masuk — Tanggal Lahir */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tahun Ajaran Masuk *</label>
                  <select
                    required
                    value={formData.tahunAjaranMasukId}
                    onChange={(e) => setFormData({ ...formData, tahunAjaranMasukId: e.target.value })}
                    disabled={loadingInitial}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white disabled:bg-gray-50"
                  >
                    <option value="">{loadingInitial ? 'Memuat...' : '-- Pilih Tahun Ajaran --'}</option>
                    {tahunAjaranList.map(ta => (
                      <option key={ta.id} value={ta.id}>{ta.nama}{ta.isActive ? ' (Aktif)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={dateDisplay}
                    onChange={(e) => {
                      const input = e.target.value;
                      const nums = input.replace(/\D/g, '');
                      
                      let formatted = nums;
                      if (nums.length >= 3) {
                        formatted = nums.slice(0, 2) + '/' + nums.slice(2);
                      }
                      if (nums.length >= 5) {
                        formatted = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4);
                      }
                      
                      setDateDisplay(formatted.slice(0, 10));
                      
                      if (nums.length === 8) {
                        const day = nums.slice(0, 2);
                        const month = nums.slice(2, 4);
                        const year = nums.slice(4, 8);
                        setFormData({ ...formData, tanggalLahir: `${year}-${month}-${day}` });
                      } else {
                        setFormData({ ...formData, tanggalLahir: '' });
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>


              </div>
            </div>
            {!isEditing && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <Key size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Akun Siswa</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Username (Otomatis)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.nis || 'Isi NIS untuk membuat username'}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-500 outline-none italic"
                    />
                  </div>
                  <PasswordField
                    label="Password Siswa"
                    value={formData.password}
                    onChange={(val) => {
                      setFormData({ ...formData, password: val });
                      setIsGeneratedStudentPw(false);
                    }}
                    placeholder="Klik generate untuk membuat password"
                    required
                    iconOnlyGenerate={true}
                    onGenerateCustom={handleGenerateStudentPassword}
                    generateDisabled={!formData.tanggalLahir}
                    helperText={
                      isGeneratedStudentPw && formData.password !== generateStudentPassword(formData.tanggalLahir)
                        ? "Klik generate ulang untuk memperbarui password."
                        : `Password default (YYYY-MM-DD): ${generateStudentPassword(formData.tanggalLahir) || 'Pilih Tgl Lahir'}`
                    }
                  />
                </div>
              </div>
            )}

            {/* Section 2 (B): Reset Password (Only for edit admin) */}
            {isEditing && userRole === 'ADMIN' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
                  <ShieldAlert size={20} className="text-rose-600" />
                  <h3 className="text-lg font-bold text-gray-900">Reset Password Akun Siswa</h3>
                </div>

                <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <p className="text-sm font-bold text-rose-900">Generate Password Baru</p>
                    <p className="text-xs text-rose-800/70 leading-relaxed">
                      Lakukan generate ulang password jika siswa lupa kredensial login.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-rose-100 min-w-[280px]">
                    <div className="flex-1 px-4 py-2 font-mono text-lg font-bold text-rose-600 tracking-wider">
                      {newGeneratedPassword ? (
                        showGeneratedPassword ? newGeneratedPassword : '••••••••'
                      ) : (
                        <span className="text-slate-300 text-sm font-sans font-normal">Password baru...</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {newGeneratedPassword && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                            title={showGeneratedPassword ? "Sembunyikan" : "Tampilkan"}
                          >
                            {showGeneratedPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                            title="Salin Password"
                          >
                            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                          </button>
                        </>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resettingPassword}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-200 disabled:opacity-50"
                      >
                        {resettingPassword ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Data Wali (Only for create) */}
            {!isEditing && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <Users size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Data Orang Tua / Wali</h3>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parentMode === 'select' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                    <input type="radio" name="pMode" checked={parentMode === 'select'} onChange={() => setParentMode('select')} className="w-5 h-5 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Pilih Orang Tua Existing</p>
                      <p className="text-[11px] text-gray-500">Cari dari database terdaftar</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${parentMode === 'create' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                    <input type="radio" name="pMode" checked={parentMode === 'create'} onChange={() => setParentMode('create')} className="w-5 h-5 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Buat Orang Tua Baru</p>
                      <p className="text-[11px] text-gray-500">Daftarkan wali baru untuk siswa</p>
                    </div>
                  </label>
                </div>

                {parentMode === 'select' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Cari nama orang tua..."
                        value={parentSearchTerm}
                        onChange={(e) => setParentSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <select
                      required={parentMode === 'select'}
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white text-sm"
                    >
                      <option value="">-- Pilih Orang Tua --</option>
                      {filteredParents.map(p => (
                        <option key={p.id} value={p.id}>{p.user?.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Row 1: Jenis Wali — Nama Lengkap Wali */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Jenis Wali *</label>
                      <select
                        required={parentMode === 'create'}
                        value={newParentData.jenisWali}
                        onChange={(e) => setNewParentData({ ...newParentData, jenisWali: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Wali Lainnya">Wali Lainnya</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Nama Lengkap Wali *</label>
                      <input
                        type="text"
                        required={parentMode === 'create'}
                        value={newParentData.name}
                        onChange={(e) => setNewParentData({ ...newParentData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Nama lengkap wali"
                      />
                    </div>

                    {/* Row 2: Jenis Kelamin Wali — No Telp Wali */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Jenis Kelamin Wali *</label>
                      <select
                        required={parentMode === 'create'}
                        value={newParentData.jenisKelamin}
                        onChange={(e) => setNewParentData({ ...newParentData, jenisKelamin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                      >
                        <option value="LAKI_LAKI">Laki-laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    </div>
                    {/* COMMENTED OUT: No Telp Wali field hidden from UI per new policy (for future use) */}
                    {/*
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">No Telp Wali *</label>
                      <input
                        type="tel"
                        required={parentMode === 'create'}
                        value={newParentData.noHP}
                        onChange={(e) => setNewParentData({ ...newParentData, noHP: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                    */}

                    {/* Row 3: Email Akun Wali — Password Akun Wali */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Username Wali (Otomatis)</label>
                      <input
                        type="text"
                        disabled
                        value={formData.nis || 'Isi NIS untuk membuat username'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-500 outline-none italic"
                      />
                    </div>
                    <PasswordField
                      label="Password Wali"
                      value={newParentData.password}
                      onChange={(val) => {
                        setNewParentData({ ...newParentData, password: val });
                        setIsGeneratedParentPw(false);
                      }}
                      placeholder="Klik generate untuk membuat password"
                      required={parentMode === 'create'}
                      iconOnlyGenerate={true}
                      onGenerateCustom={handleGenerateParentPassword}
                      generateDisabled={!formData.tanggalLahir}
                      helperText={
                        isGeneratedParentPw && newParentData.password !== generateParentPassword(formData.tanggalLahir)
                          ? "Klik generate ulang untuk memperbarui password."
                          : `Password default (DDMMYYYY): ${generateParentPassword(formData.tanggalLahir) || 'Pilih Tgl Lahir'}`
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-2">
              <button
                type="button"
                onClick={onClose}
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
                  <>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Siswa'}</span>
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
            onClose();
          }}
        />
      )}
    </>
  );
}
