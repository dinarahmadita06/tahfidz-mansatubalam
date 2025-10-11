'use client';
import { useState, useEffect } from 'react';
import { Users, UserPlus, GraduationCap, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function KelolaSiswa() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    nis: '',
    kelas: '',
    hafalan: 'Belum Mulai'
  });

  useEffect(() => {
    fetchData();

    // Auto-refresh setiap 30 detik untuk melihat perubahan status validasi
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch siswa
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();

      // Fetch all classes
      const kelasRes = await fetch('/api/kelas?showAll=true');
      const kelasData = await kelasRes.json();

      setStudents(Array.isArray(siswaData) ? siswaData : []);
      setClasses(Array.isArray(kelasData) ? kelasData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStudents([]);
      setClasses([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    // Form tambah siswa di halaman ini tidak digunakan lagi
    // Gunakan halaman /guru/tambah-siswa untuk menambahkan siswa baru
    alert('Silakan gunakan menu "Tambah Siswa" untuk menambahkan siswa baru');
    setShowAddForm(false);
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

  const StudentCard = ({ student }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{student.user?.name || student.name}</h4>
          <p className="text-sm text-gray-500">NIS: {student.nis}</p>
          <p className="text-sm text-gray-500">{student.kelas?.nama || student.kelas}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          student.status === 'active' || student.status === 'approved' || student.status === 'Aktif'
            ? 'bg-green-100 text-green-800'
            : student.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
        }`}>
          {student.status === 'active' || student.status === 'approved' ? 'Aktif' : student.status === 'pending' ? 'Pending' : student.status}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button className="flex-1 px-3 py-2 bg-[#FFB030] text-white rounded-lg text-sm hover:bg-[#e69b28]">
          Edit
        </button>
        <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          Detail
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFB030]" />
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Kelola Siswa</h1>
          <p className="text-gray-600">Kelola data siswa dan kelas tahfidz</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Siswa"
          value={students.length}
          color="bg-[#FFB030]"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          title="Total Kelas"
          value={classes.length}
          color="bg-[#874D14]"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Kelas Aktif"
          value={classes.filter(c => c.tahunAjaran?.isActive).length}
          color="bg-green-500"
        />
        <StatCard
          icon={<UserPlus className="w-6 h-6 text-white" />}
          title="Siswa Aktif"
          value={students.filter(s => s.status === 'active' || s.status === 'approved').length}
          color="bg-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'students' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Daftar Siswa
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'classes' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Kelola Kelas
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'progress' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Progress Siswa
          </button>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Daftar Siswa</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah Siswa
                </button>
              </div>

              {/* Add Student Form */}
              {showAddForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold mb-4">Tambah Siswa Baru</h4>
                  <form onSubmit={handleAddStudent} className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="NIS"
                      value={newStudent.nis}
                      onChange={(e) => setNewStudent({...newStudent, nis: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <select
                      value={newStudent.kelas}
                      onChange={(e) => setNewStudent({...newStudent, kelas: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {Array.isArray(classes) && classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.nama} - {cls.tahunAjaran?.nama || 'Tahun Ajaran Belum Ditentukan'}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newStudent.hafalan}
                      onChange={(e) => setNewStudent({...newStudent, hafalan: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                    >
                      <option value="Belum Mulai">Belum Mulai</option>
                      <option value="Juz 1">Juz 1</option>
                      <option value="Juz 2">Juz 2</option>
                      <option value="Juz 3">Juz 3</option>
                    </select>
                    <div className="col-span-2 flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Students Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Kelola Kelas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(classes) && classes.map(cls => (
                  <div key={cls.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-1">{cls.nama}</h4>
                      <p className="text-sm text-gray-500">
                        {cls.tahunAjaran?.nama || 'Tahun Ajaran Belum Ditentukan'}
                      </p>
                      {cls.tahunAjaran?.isActive && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Tahun Ajaran Aktif
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Siswa:</span>
                        <span className="font-medium">{cls._count?.siswa || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tingkat:</span>
                        <span className="font-medium">Kelas {cls.tingkat}</span>
                      </div>
                      {cls.targetJuz && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target Juz:</span>
                          <span className="font-medium">Juz {cls.targetJuz}</span>
                        </div>
                      )}
                    </div>
                    <button className="w-full px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]">
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
              {classes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada kelas yang tersedia</p>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Progress Siswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Nama</th>
                      <th className="text-left py-3 px-4">NIS</th>
                      <th className="text-left py-3 px-4">Kelas</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(students) && students.map(student => (
                      <tr key={student.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{student.user?.name || student.name}</td>
                        <td className="py-3 px-4">{student.nis}</td>
                        <td className="py-3 px-4">{student.kelas?.nama || student.kelas}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'active' || student.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : student.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {student.status === 'active' || student.status === 'approved'
                              ? 'Aktif'
                              : student.status === 'pending'
                                ? 'Pending'
                                : student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {students.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada data siswa</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </GuruLayout>
  );
}