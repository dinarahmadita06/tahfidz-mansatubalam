"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LayoutGuruSimple from '@/components/guru/LayoutGuruSimple';
import StatCard from '@/components/ui/StatCard';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Play,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';

// Mock data functions
const fetchDashboardStats = () => {
  return {
    kelasAjaran: 5,
    jumlahSiswa: 142,
    progressRataRata: 78
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

const fetchSiswaBelumSetor = () => {
  return [
    { id: 1, nama: "Ahmad Rizki", kelas: "XI IPA 1", hariTerakhir: "3 hari lalu" },
    { id: 2, nama: "Siti Fatimah", kelas: "XI IPA 2", hariTerakhir: "4 hari lalu" },
    { id: 3, nama: "Muhammad Alif", kelas: "XII IPS 1", hariTerakhir: "2 hari lalu" },
    { id: 4, nama: "Zahra Amelia", kelas: "X MIA 3", hariTerakhir: "5 hari lalu" },
    { id: 5, nama: "Dafi Rahman", kelas: "XI IPA 1", hariTerakhir: "3 hari lalu" }
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

export default function DashboardGuru() {
  const [stats, setStats] = useState(null);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [siswaBelumSetor, setSiswaBelumSetor] = useState([]);
  const [riwayatPenilaian, setRiwayatPenilaian] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats(fetchDashboardStats());
      setJadwalHariIni(fetchJadwalHariIni());
      setSiswaBelumSetor(fetchSiswaBelumSetor());
      setRiwayatPenilaian(fetchRiwayatPenilaianHariIni());
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai':
        return 'text-green-600 bg-green-50';
      case 'berlangsung':
        return 'text-blue-600 bg-blue-50';
      case 'belum_mulai':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'selesai':
        return 'Selesai';
      case 'berlangsung':
        return 'Berlangsung';
      case 'belum_mulai':
        return 'Belum Dimulai';
      default:
        return 'Belum Dimulai';
    }
  };

  const getNilaiColor = (nilai) => {
    if (nilai.includes('A')) return 'text-green-600 bg-green-50';
    if (nilai.includes('B')) return 'text-blue-600 bg-blue-50';
    if (nilai.includes('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <LayoutGuruSimple>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </LayoutGuruSimple>
    );
  }

  return (
    <LayoutGuruSimple>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Guru</h1>
          <p className="text-gray-600">
            Selamat datang kembali! Berikut adalah ringkasan aktivitas tahfidz hari ini.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Kelas Diampu"
            value={stats?.kelasAjaran}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Jumlah Siswa"
            value={stats?.jumlahSiswa}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Progress Rata-rata"
            value={`${stats?.progressRataRata}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jadwal Sesi Hari Ini */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Jadwal Sesi Hari Ini</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {jadwalHariIni.map((jadwal) => (
                  <div key={jadwal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{jadwal.waktu}</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{jadwal.kelas}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(jadwal.status)}`}>
                        {getStatusText(jadwal.status)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Siswa Dinilai: {jadwal.sudahDinilai}/{jadwal.totalSiswa}</span>
                        <span>{Math.round((jadwal.sudahDinilai / jadwal.totalSiswa) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(jadwal.sudahDinilai / jadwal.totalSiswa) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {jadwal.status !== 'selesai' && (
                      <Link
                        href={`/guru/penilaian?kelas=${jadwal.kelas}&jadwal=${jadwal.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        {jadwal.status === 'berlangsung' ? 'Lanjutkan Sesi' : 'Mulai Sesi'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Siswa Belum Menyetor Minggu Ini */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Siswa Belum Menyetor Minggu Ini</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {siswaBelumSetor.map((siswa) => (
                  <div key={siswa.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{siswa.nama}</p>
                        <p className="text-sm text-gray-500">{siswa.kelas}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">{siswa.hariTerakhir}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/guru/siswa?filter=belum_setor"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Lihat Semua Siswa →
                </Link>
              </div>
            </div>
          </div>

          {/* Riwayat Penilaian Hari Ini */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Riwayat Penilaian Hari Ini</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {riwayatPenilaian.map((riwayat) => (
                  <div key={riwayat.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{riwayat.siswa}</p>
                        <p className="text-sm text-gray-500">{riwayat.kelas}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{riwayat.surat}</p>
                        <p className="text-sm text-gray-500">Ayat {riwayat.ayat}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-sm font-medium rounded ${getNilaiColor(riwayat.nilai)}`}>
                        {riwayat.nilai}
                      </span>
                      <span className="text-sm text-gray-500">{riwayat.waktu}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href="/guru/laporan"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Lihat Laporan Lengkap →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutGuruSimple>
  );
}