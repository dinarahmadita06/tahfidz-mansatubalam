'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  });

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
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      GURU: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SISWA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ORANG_TUA: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action) => {
    const icons = {
      LOGIN: '🔑',
      LOGOUT: '🚪',
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      VIEW: '👁️',
      EXPORT: '📥',
      APPROVE: '✅',
      REJECT: '❌',
      IMPORT: '📤'
    };
    return icons[action] || '📝';
  };

  return (
    <AdminLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tracking semua aktivitas yang dilakukan oleh user
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Filter & Pencarian</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="GURU">Guru</SelectItem>
                <SelectItem value="SISWA">Siswa</SelectItem>
                <SelectItem value="ORANG_TUA">Orang Tua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aktivitas
            </label>
            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Aktivitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aktivitas</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
                <SelectItem value="IMPORT">Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modul
            </label>
            <Select value={filters.module} onValueChange={(value) => setFilters({...filters, module: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Modul</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SISWA">Siswa</SelectItem>
                <SelectItem value="GURU">Guru</SelectItem>
                <SelectItem value="ORANG_TUA">Orang Tua</SelectItem>
                <SelectItem value="KELAS">Kelas</SelectItem>
                <SelectItem value="HAFALAN">Hafalan</SelectItem>
                <SelectItem value="PRESENSI">Presensi</SelectItem>
                <SelectItem value="LAPORAN">Laporan</SelectItem>
                <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                <SelectItem value="AGENDA">Agenda</SelectItem>
                <SelectItem value="WISUDA">Wisuda</SelectItem>
                <SelectItem value="TARGET_HAFALAN">Target Hafalan</SelectItem>
                <SelectItem value="TAHUN_AJARAN">Tahun Ajaran</SelectItem>
                <SelectItem value="STATISTIK">Statistik</SelectItem>
                <SelectItem value="SETTINGS">Settings</SelectItem>
                <SelectItem value="AUTH">Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <Input
              type="date"
              value={filters.tanggalMulai}
              onChange={(e) => setFilters({...filters, tanggalMulai: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Selesai
            </label>
            <Input
              type="date"
              value={filters.tanggalSelesai}
              onChange={(e) => setFilters({...filters, tanggalSelesai: e.target.value})}
            />
          </div>
        </div>

        {/* Search Box */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pencarian
          </label>
          <Input
            type="text"
            placeholder="Cari berdasarkan deskripsi aktivitas atau nama user..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleFilter}>
            Filter
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="secondary" onClick={handleExport} disabled={logs.length === 0}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada data log aktivitas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Aktivitas</TableHead>
                    <TableHead>Modul</TableHead>
                    <TableHead className="min-w-[300px]">Detail/Deskripsi</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(log.userRole)}`}>
                          {log.userRole}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <span>{getActionIcon(log.action)}</span>
                          <span>{log.action}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                          {log.module}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2" title={log.description}>
                          {log.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {log.deviceInfo}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} dari {pagination.totalCount} data
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
