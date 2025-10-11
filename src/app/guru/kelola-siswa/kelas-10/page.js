'use client';
import { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, Award, Edit, Trash2, Eye, Download, Calendar, CheckCircle, XCircle, BookOpen, BarChart3, Clock } from 'lucide-react';

// Mock data untuk siswa kelas 10 dengan detail lengkap
const mockStudentsKelas10 = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    nis: "2024001",
    kelas: "X IPA 1",
    targetHafalan: "Juz 30",
    progressHafalan: 65,
    totalJuz: 1.2,
    status: "Aktif",
    lastActivity: "26 Sep 2025",
    lastSetoran: {
      date: "26 Sep 2025",
      surah: "Al-Fatihah",
      ayat: "1-7",
      status: "Diterima"
    },
    kehadiran: {
      today: "Hadir",
      thisWeek: 4,
      totalDays: 5
    },
    detailHafalan: [
      { tanggal: "25 Sep 2025", surah: "An-Nas", ayat: "1-6", status: "Diterima", nilai: "A" },
      { tanggal: "24 Sep 2025", surah: "Al-Falaq", ayat: "1-5", status: "Diterima", nilai: "B+" },
      { tanggal: "23 Sep 2025", surah: "Al-Ikhlas", ayat: "1-4", status: "Diterima", nilai: "A" }
    ]
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    nis: "2024002", 
    kelas: "X IPA 1",
    targetHafalan: "Juz 30",
    progressHafalan: 78,
    totalJuz: 1.5,
    status: "Aktif",
    lastActivity: "27 Sep 2025",
    lastSetoran: {
      date: "27 Sep 2025",
      surah: "Al-Kautsar",
      ayat: "1-3",
      status: "Diterima"
    },
    kehadiran: {
      today: "Hadir",
      thisWeek: 5,
      totalDays: 5
    },
    detailHafalan: [
      { tanggal: "27 Sep 2025", surah: "Al-Kautsar", ayat: "1-3", status: "Diterima", nilai: "A+" },
      { tanggal: "26 Sep 2025", surah: "Al-Maun", ayat: "1-7", status: "Diterima", nilai: "A" },
      { tanggal: "25 Sep 2025", surah: "Quraisy", ayat: "1-4", status: "Diterima", nilai: "A" }
    ]
  },
  {
    id: 3,
    name: "Muhammad Rizki",
    nis: "2024003",
    kelas: "X IPS 1", 
    targetHafalan: "Juz 30",
    progressHafalan: 45,
    totalJuz: 0.8,
    status: "Perlu Perhatian",
    lastActivity: "25 Sep 2025",
    lastSetoran: {
      date: "25 Sep 2025",
      surah: "Al-Fil",
      ayat: "1-5",
      status: "Perlu Perbaikan"
    },
    kehadiran: {
      today: "Tidak Hadir",
      thisWeek: 3,
      totalDays: 5
    },
    detailHafalan: [
      { tanggal: "25 Sep 2025", surah: "Al-Fil", ayat: "1-5", status: "Perlu Perbaikan", nilai: "C+" },
      { tanggal: "24 Sep 2025", surah: "Al-Humazah", ayat: "1-9", status: "Diterima", nilai: "B" },
      { tanggal: "22 Sep 2025", surah: "Al-Asr", ayat: "1-3", status: "Diterima", nilai: "B+" }
    ]
  },
  // Tambahkan siswa lainnya...
  {
    id: 4,
    name: "Fatimah Az-Zahra",
    nis: "2024004",
    kelas: "X IPS 1",
    targetHafalan: "Juz 30",
    progressHafalan: 82,
    totalJuz: 1.7,
    status: "Aktif", 
    lastActivity: "27 Sep 2025",
    lastSetoran: {
      date: "27 Sep 2025",
      surah: "At-Takasur",
      ayat: "1-8",
      status: "Diterima"
    },
    kehadiran: {
      today: "Hadir",
      thisWeek: 5,
      totalDays: 5
    },
    detailHafalan: [
      { tanggal: "27 Sep 2025", surah: "At-Takasur", ayat: "1-8", status: "Diterima", nilai: "A+" },
      { tanggal: "26 Sep 2025", surah: "Al-Qoriah", ayat: "1-11", status: "Diterima", nilai: "A" },
      { tanggal: "25 Sep 2025", surah: "Al-Adiyat", ayat: "1-11", status: "Diterima", nilai: "A" }
    ]
  }
];

export default function KelolaKelas10() {
  const [students, setStudents] = useState(mockStudentsKelas10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewDetailStudent, setViewDetailStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    nis: '',
    kelas: 'X IPA 1',
    targetHafalan: 'Juz 30'
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    const student = {
      id: Date.now(),
      ...newStudent,
      progressHafalan: 0,
      totalJuz: 0,
      status: 'Aktif',
      lastActivity: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      lastSetoran: null,
      kehadiran: {
        today: "Hadir",
        thisWeek: 0,
        totalDays: 0
      },
      detailHafalan: []
    };
    setStudents([...students, student]);
    setNewStudent({ name: '', nis: '', kelas: 'X IPA 1', targetHafalan: 'Juz 30' });
    setShowAddForm(false);
  };

  const handleEditStudent = (student) => {
    setEditStudent(student);
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    setStudents(students.map(s => 
      s.id === editStudent.id 
        ? { ...editStudent, lastActivity: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
        : s
    ));
    setEditStudent(null);
  };

  const handleDeleteStudent = (studentId) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      setStudents(students.filter(s => s.id !== studentId));
    }
  };

  // Function to export student report
  const handleExportReport = (student) => {
    const reportData = `
LAPORAN HAFALAN SISWA
======================

Nama: ${student.name}
NIS: ${student.nis}
Kelas: ${student.kelas}
Target Hafalan: ${student.targetHafalan}
Progress: ${student.progressHafalan}%
Total Juz: ${student.totalJuz}
Status: ${student.status}

RIWAYAT SETORAN:
${student.detailHafalan.map(item => 
  `- ${item.tanggal}: ${item.surah} ${item.ayat} - ${item.status} (Nilai: ${item.nilai})`
).join('\n')}

KEHADIRAN:
- Hari ini: ${student.kehadiran.today}
- Minggu ini: ${student.kehadiran.thisWeek}/${student.kehadiran.totalDays} hari

Laporan dibuat pada: ${new Date().toLocaleDateString('id-ID', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
    `.trim();

    // Create and download file
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Hafalan_${student.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const StudentRow = ({ student }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-6">
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <p className="text-sm text-gray-500">NIS: {student.nis}</p>
          <p className="text-xs text-gray-400">{student.kelas}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">{student.totalJuz} Juz</p>
          <div className="flex items-center">
            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-[#FFB030] h-2 rounded-full" 
                style={{ width: `${student.progressHafalan}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">{student.progressHafalan}%</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        {student.lastSetoran ? (
          <div className="space-y-1">
            <p className="text-sm font-medium">{student.lastSetoran.surah} {student.lastSetoran.ayat}</p>
            <p className="text-xs text-gray-500">{student.lastSetoran.date}</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              student.lastSetoran.status === 'Diterima' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.lastSetoran.status}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Belum ada setoran</p>
        )}
      </td>
      <td className="py-4 px-6">
        <div className="space-y-1">
          <div className={`flex items-center gap-1 ${
            student.kehadiran.today === 'Hadir' ? 'text-green-600' : 'text-red-600'
          }`}>
            {student.kehadiran.today === 'Hadir' ? 
              <CheckCircle size={14} /> : 
              <XCircle size={14} />
            }
            <span className="text-sm font-medium">{student.kehadiran.today}</span>
          </div>
          <p className="text-xs text-gray-500">
            Minggu ini: {student.kehadiran.thisWeek}/{student.kehadiran.totalDays}
          </p>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          student.status === 'Aktif' 
            ? 'bg-green-100 text-green-800' 
            : student.status === 'Perlu Perhatian'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {student.status}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewDetailStudent(student)}
            className="text-blue-600 hover:text-blue-800"
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleExportReport(student)}
            className="text-green-600 hover:text-green-800"
            title="Export Laporan"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => handleEditStudent(student)}
            className="text-orange-600 hover:text-orange-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDeleteStudent(student.id)}
            className="text-red-600 hover:text-red-800"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  // Statistik kelas
  const totalStudents = students.length;
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progressHafalan, 0) / totalStudents);
  const activeStudents = students.filter(s => s.status === 'Aktif').length;
  const excellentStudents = students.filter(s => s.progressHafalan >= 80).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Kelola Siswa Kelas 10</h1>
        <p className="text-gray-600">Manajemen siswa kelas X tahfidz</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Siswa Kelas 10"
          value={totalStudents}
          color="bg-[#FFB030]"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Rata-rata Progress"
          value={`${avgProgress}%`}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />}
          title="Siswa Aktif"
          value={activeStudents}
          color="bg-green-500"
        />
        <StatCard 
          icon={<Award className="w-6 h-6 text-white" />}
          title="Progress ≥ 80%"
          value={excellentStudents}
          color="bg-[#874D14]"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Siswa Kelas 10</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siswa
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress Hafalan
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Setoran Terakhir
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kehadiran
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <StudentRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah Siswa Kelas 10</h3>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NIS</label>
                <input
                  type="text"
                  value={newStudent.nis}
                  onChange={(e) => setNewStudent({...newStudent, nis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kelas</label>
                <select
                  value={newStudent.kelas}
                  onChange={(e) => setNewStudent({...newStudent, kelas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                >
                  <option value="X IPA 1">X IPA 1</option>
                  <option value="X IPA 2">X IPA 2</option>
                  <option value="X IPS 1">X IPS 1</option>
                  <option value="X IPS 2">X IPS 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Hafalan</label>
                <select
                  value={newStudent.targetHafalan}
                  onChange={(e) => setNewStudent({...newStudent, targetHafalan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                >
                  <option value="Juz 30">Juz 30</option>
                  <option value="Juz 30 + Juz 29">Juz 30 + Juz 29</option>
                  <option value="Juz 30 + Juz 29 + Juz 28">Juz 30 + Juz 29 + Juz 28</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]"
                >
                  Tambah Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Siswa</h3>
            
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({...editStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NIS</label>
                <input
                  type="text"
                  value={editStudent.nis}
                  onChange={(e) => setEditStudent({...editStudent, nis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kelas</label>
                <select
                  value={editStudent.kelas}
                  onChange={(e) => setEditStudent({...editStudent, kelas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                >
                  <option value="X IPA 1">X IPA 1</option>
                  <option value="X IPA 2">X IPA 2</option>
                  <option value="X IPS 1">X IPS 1</option>
                  <option value="X IPS 2">X IPS 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Hafalan</label>
                <select
                  value={editStudent.targetHafalan}
                  onChange={(e) => setEditStudent({...editStudent, targetHafalan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                >
                  <option value="Juz 30">Juz 30</option>
                  <option value="Juz 30 + Juz 29">Juz 30 + Juz 29</option>
                  <option value="Juz 30 + Juz 29 + Juz 28">Juz 30 + Juz 29 + Juz 28</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Progress Hafalan (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editStudent.progressHafalan}
                  onChange={(e) => setEditStudent({...editStudent, progressHafalan: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editStudent.status}
                  onChange={(e) => setEditStudent({...editStudent, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Perlu Perhatian">Perlu Perhatian</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {viewDetailStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Detail Siswa</h3>
                <button 
                  onClick={() => setViewDetailStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student Info Header */}
              <div className="bg-gradient-to-r from-[#FFB030] to-[#874D14] text-white rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold">{viewDetailStudent.name}</h4>
                    <p className="text-lg opacity-90">NIS: {viewDetailStudent.nis}</p>
                    <p className="opacity-80">{viewDetailStudent.kelas}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-3xl font-bold">{viewDetailStudent.totalJuz}</p>
                      <p className="text-sm opacity-90">Juz Hafalan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{viewDetailStudent.progressHafalan}%</p>
                      <p className="text-sm text-blue-700">Progress</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">{viewDetailStudent.detailHafalan.length}</p>
                      <p className="text-sm text-green-700">Total Setoran</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-900">{viewDetailStudent.kehadiran.thisWeek}</p>
                      <p className="text-sm text-orange-700">Hadir Minggu Ini</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {viewDetailStudent.detailHafalan.filter(h => h.nilai.includes('A')).length}
                      </p>
                      <p className="text-sm text-purple-700">Nilai A</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Riwayat Setoran */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h5 className="text-lg font-semibold text-gray-900">Riwayat Setoran Hafalan</h5>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {viewDetailStudent.detailHafalan.map((item, index) => (
                        <div key={index} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-gray-900">{item.surah} {item.ayat}</h6>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'Diterima' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{item.tanggal}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Nilai:</span>
                              <span className={`font-bold ${
                                item.nilai.includes('A') ? 'text-green-600' : 
                                item.nilai.includes('B') ? 'text-blue-600' : 'text-orange-600'
                              }`}>
                                {item.nilai}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Kehadiran & Status */}
                <div className="space-y-6">
                  {/* Kehadiran */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h5 className="text-lg font-semibold text-gray-900">Status Kehadiran</h5>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status Hari Ini:</span>
                          <div className={`flex items-center gap-2 ${
                            viewDetailStudent.kehadiran.today === 'Hadir' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {viewDetailStudent.kehadiran.today === 'Hadir' ? 
                              <CheckCircle size={16} /> : 
                              <XCircle size={16} />
                            }
                            <span className="font-medium">{viewDetailStudent.kehadiran.today}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Hadir Minggu Ini:</span>
                          <span className="font-bold text-blue-600">
                            {viewDetailStudent.kehadiran.thisWeek}/{viewDetailStudent.kehadiran.totalDays} hari
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(viewDetailStudent.kehadiran.thisWeek / viewDetailStudent.kehadiran.totalDays) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target & Progress */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h5 className="text-lg font-semibold text-gray-900">Target & Progress</h5>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Target Hafalan:</span>
                            <span className="font-medium">{viewDetailStudent.targetHafalan}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress Saat Ini:</span>
                            <span className="font-bold text-[#FFB030]">{viewDetailStudent.progressHafalan}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-[#FFB030] to-[#874D14] h-3 rounded-full" 
                              style={{ width: `${viewDetailStudent.progressHafalan}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="pt-4">
                          <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                            viewDetailStudent.status === 'Aktif' 
                              ? 'bg-green-100 text-green-800' 
                              : viewDetailStudent.status === 'Perlu Perhatian'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Status: {viewDetailStudent.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => handleExportReport(viewDetailStudent)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] transition-colors"
                >
                  <Download size={18} />
                  Export Laporan
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setViewDetailStudent(null);
                      handleEditStudent(viewDetailStudent);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Data
                  </button>
                  <button
                    onClick={() => setViewDetailStudent(null)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}