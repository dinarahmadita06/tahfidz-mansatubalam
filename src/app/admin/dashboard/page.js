'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Settings, BarChart3, Shield, Database, Activity, AlertTriangle, CheckCircle, UserPlus, GraduationCap, Calendar } from "lucide-react";
import AdminLayout from '@/components/layout/AdminLayout';

function StatCard({ icon: Icon, title, value, subtitle, accent = "bg-orange-500", trend }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white ${accent}`}>
            <Icon size={24} />
          </span>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
            {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center justify-end gap-1 mt-1">
              <BarChart3 size={12} />
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemHealth() {
  const metrics = [
    { label: "Database", status: "healthy", value: "99.9%", color: "emerald" },
    { label: "API Response", status: "healthy", value: "45ms", color: "emerald" },
    { label: "Storage", status: "warning", value: "78%", color: "yellow" },
    { label: "Backup", status: "healthy", value: "OK", color: "emerald" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "text-emerald-600 dark:text-emerald-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      case "error": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy": return CheckCircle;
      case "warning": return AlertTriangle;
      case "error": return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-emerald-600 dark:text-emerald-400">Online</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const StatusIcon = getStatusIcon(metric.status);
          return (
            <div key={index} className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <StatusIcon size={16} className={getStatusColor(metric.status)} />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{metric.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserManagement() {
  const userStats = [
    { role: "Siswa", count: 245, change: "+12", color: "emerald" },
    { role: "Guru", count: 18, change: "+2", color: "blue" },
    { role: "Orang Tua", count: 198, change: "+8", color: "purple" },
    { role: "Admin", count: 3, change: "0", color: "orange" }
  ];

  const colorClasses = {
    emerald: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manajemen Pengguna</h3>
        <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium">
          Kelola Pengguna
        </button>
      </div>
      
      <div className="space-y-3">
        {userStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[stat.color]}`}>
                {stat.role}
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.change !== "0" && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {stat.change} bulan ini
                  </span>
                )}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    {
      type: "user_register",
      description: "Siswa baru mendaftar: Ahmad Zaki Rahman",
      time: "5 menit lalu",
      icon: UserPlus,
      color: "bg-emerald-500"
    },
    {
      type: "system_backup",
      description: "Backup database berhasil dilakukan",
      time: "1 jam lalu",
      icon: Database,
      color: "bg-blue-500"
    },
    {
      type: "security_alert",
      description: "Login gagal berulang kali dari IP: 192.168.1.100",
      time: "2 jam lalu",
      icon: Shield,
      color: "bg-red-500"
    },
    {
      type: "system_update",
      description: "Pembaruan sistem berhasil diinstal",
      time: "6 jam lalu",
      icon: Settings,
      color: "bg-purple-500"
    },
    {
      type: "data_export",
      description: "Laporan bulanan berhasil digenerate",
      time: "1 hari lalu",
      icon: BarChart3,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aktivitas Sistem</h3>
        <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium">
          Lihat Log Lengkap
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div className={`rounded-full p-2 ${activity.color} flex-shrink-0`}>
              <activity.icon size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Users, label: "Kelola Pengguna", desc: "Tambah, edit, hapus akun", color: "blue" },
    { icon: Settings, label: "Pengaturan Sistem", desc: "Konfigurasi aplikasi", color: "orange" },
    { icon: BarChart3, label: "Generate Laporan", desc: "Export data dan statistik", color: "green" },
    { icon: Shield, label: "Keamanan", desc: "Monitor dan audit log", color: "red" },
    { icon: Database, label: "Backup Data", desc: "Backup dan restore", color: "purple" },
    { icon: Activity, label: "Monitor Sistem", desc: "Status server dan performa", color: "teal" }
  ];

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-600 dark:text-orange-400",
    green: "bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400",
    teal: "bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-400"
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Aksi Cepat</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button key={index} className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${colorClasses[action.color]}`}>
            <action.icon size={20} />
            <div>
              <p className="font-medium">{action.label}</p>
              <p className="text-xs opacity-75">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <AdminLayout>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Administrator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan monitor seluruh sistem tahfidz
          {dashboardData?.tahunAjaranAktif && (
            <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
              • {dashboardData.tahunAjaranAktif.nama}
            </span>
          )}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={GraduationCap}
          title="Total Guru"
          value={stats.totalGuru || 0}
          subtitle="pengajar"
          accent="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Total Siswa"
          value={stats.totalSiswa || 0}
          subtitle="aktif"
          accent="bg-orange-500"
          trend={stats.siswaMenungguValidasi > 0 ? `${stats.siswaMenungguValidasi} menunggu validasi` : null}
        />
        <StatCard
          icon={BookOpen}
          title="Total Hafalan"
          value={stats.totalHafalan || 0}
          subtitle="setoran"
          accent="bg-emerald-500"
          trend={stats.recentHafalan > 0 ? `+${stats.recentHafalan} minggu ini` : null}
        />
        <StatCard
          icon={Activity}
          title="Kelas Aktif"
          value={stats.totalKelasAktif || 0}
          subtitle="kelas"
          accent="bg-purple-500"
        />
      </div>

      {/* Grafik Hafalan Per Kelas */}
      {dashboardData?.hafalanPerKelas && dashboardData.hafalanPerKelas.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Progres Hafalan Per Kelas
          </h3>
          <div className="space-y-4">
            {dashboardData.hafalanPerKelas.map((kelas, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{kelas.namaKelas}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {kelas.totalSiswa} siswa • Rata-rata: {kelas.rataRataJuz} juz
                      {kelas.target > 0 && ` • Target: ${kelas.target} juz`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {kelas.progress}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      kelas.progress >= 80 ? 'bg-emerald-500' :
                      kelas.progress >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${kelas.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Kehadiran */}
      {stats.kehadiranPercentage !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tingkat Kehadiran (30 Hari)
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-500 mb-2">
                  {stats.kehadiranPercentage}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kehadiran Siswa</p>
              </div>
            </div>
            {dashboardData?.presensiStats && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {dashboardData.presensiStats.map((stat, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{stat.status}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rata-rata Nilai Hafalan
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  {stats.rataRataNilai || 0}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dari skala 100</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Kelas Belum Update */}
      {dashboardData?.kelasBelumUpdate && dashboardData.kelasBelumUpdate.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Kelas Belum Update Hafalan Minggu Ini
              </h3>
              <div className="space-y-2">
                {dashboardData.kelasBelumUpdate.map((kelas, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      {kelas.nama} ({kelas.totalSiswa} siswa)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validasi Siswa Alert */}
      {stats.siswaMenungguValidasi > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-4">
            <UserPlus size={24} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Siswa Menunggu Validasi
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-orange-800 dark:text-orange-200">
                  {stats.siswaMenungguValidasi} siswa baru perlu divalidasi
                </p>
                <a
                  href="/admin/validasi-siswa"
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium"
                >
                  Lihat Detail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}