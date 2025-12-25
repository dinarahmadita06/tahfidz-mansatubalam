"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';
import PengumumanWidget from '@/components/PengumumanWidget';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Award,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';

// Mock data functions
const fetchDashboardStats = () => {
  return {
    kelasAjaran: 5,
    jumlahSiswa: 142,
    progressRataRata: 78,
    totalJuz: 12,
  };
};

const fetchJadwalHariIni = () => {
  return [
    {
      id: 1,
      waktu: "07:30",
      kelas: "XI IPA 1",
      totalSiswa: 32,
      sudahDinilai: 28,
      status: "berlangsung"
    },
    {
      id: 2,
      waktu: "09:15",
      kelas: "XI IPA 2",
      totalSiswa: 30,
      sudahDinilai: 30,
      status: "selesai"
    },
    {
      id: 3,
      waktu: "10:30",
      kelas: "XII IPS 1",
      totalSiswa: 28,
      sudahDinilai: 0,
      status: "belum_mulai"
    },
    {
      id: 4,
      waktu: "13:00",
      kelas: "X MIA 3",
      totalSiswa: 35,
      sudahDinilai: 0,
      status: "belum_mulai"
    }
  ];
};

const fetchRiwayatPenilaianHariIni = () => {
  return [
    {
      id: 1,
      siswa: "Ahmad Fahmi",
      kelas: "XI IPA 1",
      surat: "Al-Baqarah",
      ayat: "1-15",
      nilai: "A",
      waktu: "08:45"
    },
    {
      id: 2,
      siswa: "Nur Aisyah",
      kelas: "XI IPA 2",
      surat: "Al-Mulk",
      ayat: "1-10",
      nilai: "A-",
      waktu: "09:30"
    },
    {
      id: 3,
      siswa: "Bayu Saputra",
      kelas: "XII IPS 1",
      surat: "Ar-Rahman",
      ayat: "1-25",
      nilai: "B+",
      waktu: "10:15"
    },
    {
      id: 4,
      siswa: "Dewi Kartika",
      kelas: "X MIA 3",
      surat: "Al-Waqiah",
      ayat: "1-20",
      nilai: "A",
      waktu: "11:00"
    }
  ];
};

// Stats Card Component (Tasmi style)
function StatsCard({ icon: Icon, title, value, subtitle, variant = 'green' }) {
  const variants = {
    green: {
      wrapper: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'text-emerald-600',
      value: 'text-emerald-700',
    },
    blue: {
      wrapper: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'text-blue-600',
      value: 'text-blue-700',
    },
    amber: {
      wrapper: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'text-amber-600',
      value: 'text-amber-700',
    },
    violet: {
      wrapper: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      title: 'text-violet-600',
      value: 'text-violet-700',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.wrapper} rounded-xl border-2 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${style.title} text-sm font-semibold mb-1 uppercase`}>{title}</p>
          <h3 className={`${style.value} text-4xl font-bold`}>{value}</h3>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${style.iconBg} p-4 rounded-full`}>
          <Icon size={32} className={style.iconColor} />
        </div>
      </div>
    </div>
  );
}

// Jadwal Sesi Card Component
function JadwalSesiCard({ jadwalHariIni }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'selesai':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          label: 'Selesai',
        };
      case 'berlangsung':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          label: 'Berlangsung',
        };
      case 'belum_mulai':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          label: 'Belum Dimulai',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          label: 'Belum Dimulai',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <Calendar size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Jadwal Setoran Hari Ini
        </h3>
      </div>

      {jadwalHariIni.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Tidak ada jadwal hari ini</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jadwalHariIni.map((jadwal) => {
            const statusConfig = getStatusConfig(jadwal.status);
            const progress = Math.round((jadwal.sudahDinilai / jadwal.totalSiswa) * 100);

            return (
              <div
                key={jadwal.id}
                className="border-2 border-emerald-100 rounded-xl p-4 bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-600" />
                      <span className="font-semibold text-slate-800">
                        {jadwal.waktu}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {jadwal.kelas}
                    </span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">
                      Siswa Dinilai: {jadwal.sudahDinilai}/{jadwal.totalSiswa}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                {jadwal.status !== 'selesai' && (
                  <Link href={`/guru/penilaian?kelas=${jadwal.kelas}&jadwal=${jadwal.id}`}>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
                      <Play size={16} />
                      {jadwal.status === 'berlangsung' ? 'Lanjutkan Sesi' : 'Mulai Sesi'}
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Riwayat Penilaian Card Component
function RiwayatPenilaianCard({ riwayatPenilaian }) {
  const getNilaiConfig = (nilai) => {
    if (nilai.includes('A')) return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    };
    if (nilai.includes('B')) return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    };
    if (nilai.includes('C')) return {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
    };
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
    };
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Riwayat Penilaian Hari Ini
        </h3>
      </div>

      {riwayatPenilaian.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Belum ada penilaian hari ini</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {riwayatPenilaian.map((riwayat, index) => {
            const nilaiConfig = getNilaiConfig(riwayat.nilai);

            return (
              <div
                key={riwayat.id}
                className={`flex justify-between items-center py-4 ${
                  index < riwayatPenilaian.length - 1 ? 'border-b border-slate-200' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <User size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">
                      {riwayat.siswa}
                    </p>
                    <p className="text-sm text-slate-500">
                      {riwayat.kelas}
                    </p>
                  </div>
                  <div className="hidden md:block flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {riwayat.surat}
                    </p>
                    <p className="text-sm text-slate-500">
                      Ayat {riwayat.ayat}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-bold rounded-lg ${nilaiConfig.bg} ${nilaiConfig.text}`}>
                    {riwayat.nilai}
                  </span>
                  <span className="text-sm text-slate-500 min-w-[50px]">
                    {riwayat.waktu}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-slate-200">
        <Link
          href="/guru/laporan"
          className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors"
        >
          Lihat Laporan Lengkap →
        </Link>
      </div>
    </div>
  );
}

// Aktivitas Terbaru Card (Placeholder for Commit 2)
function AktivitasTerbaruCard() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center">
          <FileText size={22} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Aktivitas Terbaru
        </h3>
      </div>

      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Aktivitas akan ditampilkan di sini</p>
        <p className="text-sm text-slate-500 mt-1">Fitur sedang dalam pengembangan</p>
      </div>
    </div>
  );
}

export default function DashboardGuru() {
  const [stats, setStats] = useState(null);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [riwayatPenilaian, setRiwayatPenilaian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setTimeout(() => {
      setStats(fetchDashboardStats());
      setJadwalHariIni(fetchJadwalHariIni());
      setRiwayatPenilaian(fetchRiwayatPenilaianHariIni());
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }, 1000);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-600">Memuat dashboard...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Dashboard Guru Tahfidz
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                Selamat datang kembali! Berikut adalah ringkasan aktivitas tahfidz hari ini.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Motivasi Harian */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-amber-100" />
            </div>
            <div className="flex-1">
              <p className="text-base sm:text-lg font-semibold italic leading-relaxed mb-2">
                &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
              </p>
              <p className="text-sm text-amber-100">— HR. Bukhari</p>
            </div>
          </div>
        </div>

        {/* Pengumuman Widget */}
        <PengumumanWidget limit={3} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={GraduationCap}
            title="Kelas Diampu"
            value={stats?.kelasAjaran}
            subtitle="kelas aktif"
            variant="green"
          />
          <StatsCard
            icon={Users}
            title="Jumlah Siswa"
            value={stats?.jumlahSiswa}
            subtitle="siswa terdaftar"
            variant="amber"
          />
          <StatsCard
            icon={Award}
            title="Progres Rata-rata"
            value={`${stats?.progressRataRata}%`}
            subtitle="dari target"
            variant="blue"
          />
          <StatsCard
            icon={BookOpen}
            title="Total Juz"
            value={stats?.totalJuz}
            subtitle="juz diampu"
            variant="violet"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JadwalSesiCard jadwalHariIni={jadwalHariIni} />
          <AktivitasTerbaruCard />
        </div>

        {/* Riwayat Penilaian - Full Width */}
        <RiwayatPenilaianCard riwayatPenilaian={riwayatPenilaian} />
      </div>
    </GuruLayout>
  );
}
