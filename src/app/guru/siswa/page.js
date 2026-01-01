'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Users,
  UserCheck,
  Clock,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

// PageHeader Component
function PageHeader({ onRefresh, refreshing }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Kelola Siswa
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-1">
            Monitoring siswa kelas binaan dan tracking progress hafalan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/guru/tambah-siswa">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 hover:bg-white/90 rounded-xl font-semibold text-sm transition-all shadow-md">
              <UserPlus size={18} />
              Tambah Siswa
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// StatsCard Component (sama dengan Tasmi style)
function StatsCard({ icon: Icon, title, value, subtitle, variant = 'green' }) {
  const variants = {
    green: {
      wrapper: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
      title: 'text-emerald-600',
      value: 'text-emerald-700',
      subtitle: 'text-emerald-600/80',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    blue: {
      wrapper: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 text-blue-700',
      title: 'text-blue-600',
      value: 'text-blue-700',
      subtitle: 'text-blue-600/80',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    orange: {
      wrapper: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-700',
      title: 'text-amber-600',
      value: 'text-amber-700',
      subtitle: 'text-amber-600/80',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.wrapper} rounded-xl border-2 p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${style.title} text-sm font-semibold mb-1`}>{title}</p>
          <h3 className={`${style.value} text-4xl font-bold`}>{value}</h3>
          {subtitle && (
            <p className={`${style.subtitle} text-sm mt-1`}>{subtitle}</p>
          )}
        </div>
        <div className={`${style.iconBg} p-4 rounded-full`}>
          <Icon size={32} className={style.iconColor} />
        </div>
      </div>
    </div>
  );
}

// FilterBar Component
function FilterBar({ searchQuery, onSearchChange, filterStatus, onFilterChange, onExport, itemsPerPage, onItemsPerPageChange }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        {/* Controls Group - Right side */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:items-center">
          {/* Rows Per Page */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="rowsPerPage" className="text-sm text-slate-600 font-medium whitespace-nowrap">Tampilkan:</label>
            <select
              id="rowsPerPage"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
              className="h-11 px-3 rounded-xl bg-white/70 backdrop-blur border border-emerald-100/60 focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-500 outline-none transition-all text-sm font-medium min-w-[110px] flex-1 sm:flex-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full sm:w-auto h-11 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all font-medium text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="menunggu_validasi">Menunggu Validasi</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

// EmptyState Component
function EmptyState({ message }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users size={32} className="text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium">{message}</p>
    </div>
  );
}

// StudentTable Component
function StudentTable({ students, currentPage, onPageChange, itemsPerPage, onItemsPerPageChange }) {
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);

  const getStatusConfig = (status) => {
    const configs = {
      aktif: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        label: 'Aktif',
        icon: CheckCircle2,
      },
      menunggu_validasi: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        label: 'Menunggu Validasi',
        icon: Clock,
      },
      tidak_aktif: {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        label: 'Tidak Aktif',
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.tidak_aktif;
  };

  if (students.length === 0) {
    return <EmptyState message="Tidak ada siswa yang sesuai dengan filter" />;
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Siswa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Total Juz</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Total Setoran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedStudents.map((student) => {
              const statusConfig = getStatusConfig(student.status);
              const StatusIcon = statusConfig.icon;
              return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{student.nama}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.kelas}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg}`}>
                      <StatusIcon size={14} className={statusConfig.text} />
                      <span className={`text-xs font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.totalJuz}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.totalSetoran}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, students.length)} dari {students.length} siswa
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-slate-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`min-w-[40px] px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                      : 'border border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-slate-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function KelolaSiswaPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    siswaAktif: 0,
    menungguValidasi: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch siswa dari kelas binaan guru
  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 Fetching kelas aktif dari /api/guru/kelas...');
      const kelasRes = await fetch('/api/guru/kelas', { credentials: 'include' });
      if (!kelasRes.ok) throw new Error('Failed to fetch kelas');
      const kelasData = await kelasRes.json();
      const kelasList = kelasData.kelas || [];
      console.log('Raw Kelas API Response:', kelasData);
      console.log('Extracted kelasList:', kelasList);
      console.log('✅ Kelas yang diampu (AKTIF):', kelasList.length, kelasList.map(k => ({ id: k.id, nama: k.nama })));
      
      let transformedData = [];
      if (kelasList.length > 0) {
        const klasIds = kelasList.map(k => k.id).join(',');
        console.log('🔗 Kelas IDs untuk fetch siswa:', klasIds);
        const siswaRes = await fetch(`/api/guru/siswa?kelasIds=${klasIds}`, { credentials: 'include' });
        if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
        const siswaData = await siswaRes.json();
        console.log('📊 API response:', siswaData);
        
        const siswaList = siswaData.data || [];
        console.log('✅ Siswa yang di-fetch:', siswaList.length, 'siswa');
        
        transformedData = siswaList.map((siswa) => ({
          id: siswa.id,
          nama: siswa.user?.name || '-',
          kelas: siswa.kelas?.nama || '-',
          status:
            siswa.status === 'approved'
              ? 'aktif'
              : siswa.status === 'pending'
              ? 'menunggu_validasi'
              : 'tidak_aktif',
          totalJuz: siswa.totalJuz || 0,
          totalSetoran: siswa.totalSetoran || 0,
        }));
      } else {
        console.warn('⚠️ Guru tidak memiliki kelas aktif yang diampu!');
        setError('Anda tidak memiliki kelas binaan yang aktif. Silahkan hubungi admin.');
      }

      setStudents(transformedData);

      // Hitung statistik
      const totalSiswa = transformedData.length;
      const siswaAktif = transformedData.filter((s) => s.status === 'aktif').length;
      const menungguValidasi = transformedData.filter(
        (s) => s.status === 'menunggu_validasi'
      ).length;

      console.log(`📈 Stats: Total=${totalSiswa}, Aktif=${siswaAktif}, Menunggu=${menungguValidasi}`);
      setStats({
        totalSiswa,
        siswaAktif,
        menungguValidasi,
      });
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error.message || 'Gagal memuat data siswa. Silahkan refresh halaman.');
      setStudents([]);
      setStats({ totalSiswa: 0, siswaAktif: 0, menungguValidasi: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSiswa();
    setRefreshing(false);
  };

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <PageHeader onRefresh={handleRefresh} refreshing={refreshing} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-600">Memuat data siswa...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Gagal Memuat Data</h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={Users}
                title="TOTAL SISWA"
                value={stats.totalSiswa}
                subtitle="Siswa dari kelas aktif"
                variant="green"
              />
              <StatsCard
                icon={UserCheck}
                title="SISWA AKTIF"
                value={stats.siswaAktif}
                subtitle="Siswa aktif belajar"
                variant="blue"
              />
              <StatsCard
                icon={Clock}
                title="MENUNGGU VALIDASI"
                value={stats.menungguValidasi}
                subtitle="Perlu persetujuan"
                variant="orange"
              />
            </div>

            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={handleFilterChange}
              onExport={handleExport}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />

            {/* Student Table */}
            <StudentTable
              students={filteredStudents}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>
    </GuruLayout>
  );
}
