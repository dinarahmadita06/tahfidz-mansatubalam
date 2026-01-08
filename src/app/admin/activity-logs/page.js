'use client';

import { useState, useEffect } from 'react';
import { Activity, Filter, RotateCcw, FileDown, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingIndicator from "@/components/shared/LoadingIndicator";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Filters
  const [filters, setFilters] = useState({
    role: 'all',
    action: 'all',
    module: 'all',
    tanggalMulai: '',
    tanggalSelesai: '',
    search: ''
  });

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.module !== 'all') params.append('module', filters.module);
      if (filters.tanggalMulai) params.append('tanggalMulai', filters.tanggalMulai);
      if (filters.tanggalSelesai) params.append('tanggalSelesai', filters.tanggalSelesai);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs);
        setPagination(data.pagination);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleFilter = () => {
    fetchLogs(1);
  };

  const handleReset = () => {
    setFilters({
      role: 'all',
      action: 'all',
      module: 'all',
      tanggalMulai: '',
      tanggalSelesai: '',
      search: ''
    });
    setTimeout(() => fetchLogs(1), 100);
  };

  const handleExport = () => {
    const exportData = logs.map((log, index) => ({
      No: (pagination.page - 1) * pagination.limit + index + 1,
      'Tanggal & Waktu': new Date(log.createdAt).toLocaleString('id-ID'),
      User: log.userName,
      Role: log.userRole,
      Aktivitas: log.action,
      Modul: log.module,
      Detail: log.description,
      'IP Address': log.ipAddress || '-',
      Device: log.deviceInfo
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity Logs');
    XLSX.writeFile(workbook, `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
      GURU: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      SISWA: 'bg-sky-50 text-sky-700 border border-sky-200',
      ORANG_TUA: 'bg-amber-50 text-amber-700 border border-amber-200'
    };
    return classes[role] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getActionIcon = (action) => {
    const icons = {
      LOGIN: '🔑',
      LOGOUT: '🚪',
      CREATE: '➕',
      UPDATE: '📝',
      DELETE: '🗑️',
      VIEW: '👁️',
      EXPORT: '📤',
      APPROVE: '✅',
      REJECT: '❌',
      IMPORT: '📥'
    };
    return icons[action] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 shadow-lg">
                <Activity className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Log Activity</h1>
                <p className="text-green-50 text-sm opacity-90">Tracking semua aktivitas pengguna dalam sistem</p>
              </div>
            </div>
            
            {/* Action Button & Status */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/30 shadow-sm animate-pulse">
                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <span className="text-xs font-semibold uppercase tracking-wider">Realtime Tracking ON</span>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 h-11 px-5 bg-white text-emerald-700 hover:bg-white/90 rounded-xl font-bold text-sm transition-all duration-300 shadow-md"
              >
                <FileDown size={18} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md shadow-emerald-100/30 p-6">
          <h2 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Filter size={18} className="text-emerald-600" />
            Filter & Pencarian
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">Semua Role</option>
                <option value="ADMIN">Admin</option>
                <option value="GURU">Guru</option>
                <option value="SISWA">Siswa</option>
                <option value="ORANG_TUA">Orang Tua</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktivitas
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">Semua Aktivitas</option>
                <option value="LOGIN">Login</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="CREATE">Tambah</option>
                <option value="EXPORT">Export</option>
              </select>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modul
              </label>
              <select
                value={filters.module}
                onChange={(e) => setFilters({...filters, module: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">Semua Modul</option>
                <option value="USER">User</option>
                <option value="KELAS">Kelas</option>
                <option value="TAHUN_AJARAN">Tahun Ajaran</option>
                <option value="HAFALAN">Hafalan</option>
                <option value="LAPORAN">Laporan</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => setFilters({...filters, tanggalMulai: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={filters.tanggalSelesai}
                onChange={(e) => setFilters({...filters, tanggalSelesai: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <input
              type="text"
              placeholder="Cari berdasarkan deskripsi aktivitas atau nama user..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleFilter}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all duration-200"
            >
              <Filter size={18} />
              Filter
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 hover:shadow-md transition-all duration-200"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={18} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          {loading ? (
            <LoadingIndicator text="Memuat data log aktivitas..." className="py-20" />
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 font-medium">Tidak ada data log aktivitas</p>
              <p className="text-sm text-gray-500 mt-2">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-amber-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Tanggal & Waktu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Aktivitas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Modul
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[300px]">
                        Detail/Deskripsi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Device
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(Array.isArray(logs) ? logs : []).map((log, index) => (
                      <tr
                        key={log.id}
                        className="hover:bg-emerald-50/30 transition-colors duration-150"
                        style={{ borderSpacing: '0 20px' }}
                      >
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(log.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{log.userName}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleBadgeClass(log.userRole)}`}
                          >
                            {log.userRole}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getActionIcon(log.action)}</span>
                            <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-700 max-w-md line-clamp-2" title={log.description}>
                            {log.description}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-xs text-gray-600 font-mono">
                            {log.ipAddress || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-xs text-gray-600">
                            {log.deviceInfo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Info & Pagination */}
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-amber-50/30 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span className="font-medium">
                      Menampilkan {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount)} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} dari {pagination.totalCount} log aktivitas
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      Diperbarui {lastUpdated.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fetchLogs(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-3">
                      Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchLogs(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
