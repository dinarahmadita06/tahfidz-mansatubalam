'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Download, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Link, 
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  BookOpen,
  Calendar,
  Eye
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// Mock data for classes and students
const mockClasses = [
  { id: 'cmj5e0vj40001jm04gnqslpzs', name: 'X A1', tahunAjaran: '2024/2025', targetJuz: 1 },
  { id: 'cmj5e0vj40001jm04gnqslpzt', name: 'X A2', tahunAjaran: '2024/2025', targetJuz: 1 },
  { id: 'cmj5e0vj40001jm04gnqslpzu', name: 'XI A1', tahunAjaran: '2024/2025', targetJuz: 2 },
  { id: 'cmj5e0vj40001jm04gnqslpzv', name: 'XI A2', tahunAjaran: '2024/2025', targetJuz: 2 },
  { id: 'cmj5e0vj40001jm04gnqslpzw', name: 'XII A1', tahunAjaran: '2024/2025', targetJuz: 3 },
];

const mockStudents = [
  {
    id: 1,
    nama: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@example.com',
    nis: '12345',
    nisn: '1234567890',
    jenisKelamin: 'Laki-laki',
    orangTua: { id: 1, nama: 'Bapak Fauzi' },
    kelasId: 'cmj5e0vj40001jm04gnqslpzs',
    progressHafalan: 45,
    totalJuz: 0.8,
    status: 'Aktif',
    lastActivity: '2024-12-28',
    kehadiran: { today: 'Hadir', thisWeek: 4, totalDays: 5 }
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    email: 'siti.nur@example.com',
    nis: '12346',
    nisn: '1234567891',
    jenisKelamin: 'Perempuan',
    orangTua: null,
    kelasId: 'cmj5e0vj40001jm04gnqslpzs',
    progressHafalan: 65,
    totalJuz: 1.2,
    status: 'Aktif',
    lastActivity: '2024-12-29',
    kehadiran: { today: 'Hadir', thisWeek: 5, totalDays: 5 }
  },
  {
    id: 3,
    nama: 'Muhammad Rizki',
    email: 'm.rizki@example.com',
    nis: '12347',
    nisn: '1234567892',
    jenisKelamin: 'Laki-laki',
    orangTua: { id: 2, nama: 'Ibu Rizki' },
    kelasId: 'cmj5e0vj40001jm04gnqslpzs',
    progressHafalan: 30,
    totalJuz: 0.5,
    status: 'Perlu Perhatian',
    lastActivity: '2024-12-27',
    kehadiran: { today: 'Tidak Hadir', thisWeek: 2, totalDays: 5 }
  },
  {
    id: 4,
    nama: 'Fatimah Az-Zahra',
    email: 'fatimah.z@example.com',
    nis: '12348',
    nisn: '1234567893',
    jenisKelamin: 'Perempuan',
    orangTua: null,
    kelasId: 'cmj5e0vj40001jm04gnqslpzs',
    progressHafalan: 78,
    totalJuz: 1.5,
    status: 'Aktif',
    lastActivity: '2024-12-29',
    kehadiran: { today: 'Hadir', thisWeek: 5, totalDays: 5 }
  }
];

export default function KelolaSiswaByKelas() {
  const { kelasId } = useParams();
  const router = useRouter();
  const [kelas, setKelas] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenisKelamin, setFilterJenisKelamin] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    const foundKelas = mockClasses.find(k => k.id === kelasId);
    if (foundKelas) {
      setKelas(foundKelas);
    }
    
    const kelasStudents = mockStudents.filter(s => s.kelasId === kelasId);
    setStudents(kelasStudents);
    setFilteredStudents(kelasStudents);
  }, [kelasId]);

  useEffect(() => {
    let result = students;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.nama.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.nis.toLowerCase().includes(term) ||
        s.nisn.toLowerCase().includes(term) ||
        (s.orangTua && s.orangTua.nama.toLowerCase().includes(term))
      );
    }
    
    // Apply jenis kelamin filter
    if (filterJenisKelamin) {
      result = result.filter(s => s.jenisKelamin === filterJenisKelamin);
    }
    
    setFilteredStudents(result);
  }, [searchTerm, filterJenisKelamin, students]);

  const handleDeleteStudent = (student) => {
    setDeletingStudent(student);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingStudent) {
      const updatedStudents = students.filter(s => s.id !== deletingStudent.id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setShowDeleteConfirm(false);
      setDeletingStudent(null);
    }
  };

  const StatCard = ({ icon: Icon, title, value, theme = 'emerald' }) => {
    const themeConfig = {
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
        border: 'border-2 border-emerald-200',
        titleColor: 'text-emerald-600',
        valueColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      },
      amber: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        border: 'border-2 border-amber-200',
        titleColor: 'text-amber-600',
        valueColor: 'text-amber-700',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-2 border-blue-200',
        titleColor: 'text-blue-600',
        valueColor: 'text-blue-700',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
    };

    const config = themeConfig[theme] || themeConfig.emerald;

    return (
      <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
              {title}
            </p>
            <h3 className={`${config.valueColor} text-3xl font-bold`}>
              {value}
            </h3>
          </div>
          <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
            <Icon size={28} className={config.iconColor} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  };

  if (!kelas) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kelas tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const avgProgress = totalStudents > 0 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.progressHafalan, 0) / totalStudents)
    : 0;
  const activeStudents = filteredStudents.filter(s => s.status === 'Aktif').length;
  const studentsWithParents = filteredStudents.filter(s => s.orangTua).length;

  const colors = {
    white: '#FFFFFF',
    emerald: { 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBFBDA', 500: '#10B981', 600: '#059669', 900: '#064E3B' },
    gray: { 200: '#E5E7EB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563' },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '24px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ============ HEADER SECTION ============ */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: '20px',
            padding: '32px',
            color: colors.white,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)'
          }}
        >
          {/* Decorative Circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Back Button & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <button
                onClick={() => router.back()}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: colors.white,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0', lineHeight: '1.2' }}>
                  Kelola Siswa – {kelas.name}
                </h1>
                <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.95 }}>
                  Tahun Ajaran {kelas.tahunAjaran} • Target {kelas.targetJuz} Juz
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px',
                background: 'rgba(255, 255, 255, 0.2)', color: colors.white, borderRadius: '12px',
                fontWeight: '600', cursor: 'pointer', fontSize: '14px', border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <Upload size={18} />
                Import Excel
                <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} />
              </label>

              <button
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px',
                  background: 'rgba(255, 255, 255, 0.2)', color: colors.white, border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <Download size={18} />
                Template Excel
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px',
                  background: colors.white, color: colors.emerald[600], border: 'none',
                  borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <UserPlus size={18} />
                Tambah Siswa
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Pastel Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users}
            title="Total Siswa"
            value={totalStudents}
            theme="emerald"
          />
          <StatCard 
            icon={TrendingUp}
            title="Rata-rata Progress"
            value={`${avgProgress}%`}
            theme="amber"
          />
          <StatCard 
            icon={Users}
            title="Siswa Aktif"
            value={activeStudents}
            theme="blue"
          />
          <StatCard 
            icon={Link}
            title="Terhubung Ortu"
            value={studentsWithParents}
            theme="emerald"
          />
        </div>

        {/* ============ FILTER SECTION ============ */}
        <div style={{
          background: `${colors.white}B3`,
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: `1px solid ${colors.emerald[100]}`,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.gray[600], marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cari Siswa
              </label>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.gray[400], flexShrink: 0 }} size={18} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, NIS, NISN, atau nama orang tua..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
                    border: `2px solid ${colors.gray[200]}`, borderRadius: '12px', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = colors.emerald[500]}
                  onBlur={(e) => e.currentTarget.style.borderColor = colors.gray[200]}
                />
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: colors.gray[600], marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Filter Jenis Kelamin
              </label>
              <select
                value={filterJenisKelamin}
                onChange={(e) => setFilterJenisKelamin(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: `2px solid ${colors.gray[200]}`, borderRadius: '12px',
                  fontSize: '14px', outline: 'none', cursor: 'pointer', background: colors.white,
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = colors.emerald[500]}
                onBlur={(e) => e.currentTarget.style.borderColor = colors.gray[200]}
              >
                <option value="">Semua</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Info Text */}
          <div style={{ fontSize: '13px', color: colors.gray[500], fontWeight: '500' }}>
            Menampilkan {filteredStudents.length} dari {students.length} siswa
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
          <div className="p-6 border-b border-emerald-100/30">
            <h2 className="text-xl font-bold text-emerald-900">Daftar Siswa {kelas.name}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">No</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Siswa</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NISN</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NIS</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Jenis Kelamin</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Orang Tua</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="text-gray-600">{index + 1}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{student.nama}</p>
                        <p className="text-sm text-gray-500">Progress: {student.progressHafalan}%</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{student.nisn}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{student.nis}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.jenisKelamin === 'Laki-laki' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        {student.orangTua ? (
                          <p className="text-sm font-medium text-green-600">{student.orangTua.nama}</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                        <p className="text-xs text-gray-500">{student.kehadiran.thisWeek}/{student.kehadiran.totalDays} hadir</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setEditingStudent(student);
                            setShowEditForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                        {!student.orangTua && (
                          <button 
                            className="text-orange-600 hover:text-orange-800 p-1 rounded"
                            title="Hubungkan Orang Tua"
                          >
                            <Link size={16} />
                          </button>
                        )}
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Tidak ada siswa ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6">Tambah Siswa Baru</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Nama lengkap siswa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Email siswa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NIS</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Nomor Induk Siswa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NISN</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Nomor Induk Siswa Nasional"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Hafalan (Juz)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Target juz hafalan"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md"
                >
                  Tambah Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditForm && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6">Edit Siswa</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    defaultValue={editingStudent.nama}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={editingStudent.email}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NIS</label>
                  <input
                    type="text"
                    defaultValue={editingStudent.nis}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NISN</label>
                  <input
                    type="text"
                    defaultValue={editingStudent.nisn}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                  <select
                    defaultValue={editingStudent.jenisKelamin}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Hafalan (Juz)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    defaultValue={editingStudent.totalJuz}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md"
                >
                  Update Siswa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-red-100">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus siswa <strong>{deletingStudent.nama}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingStudent(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}