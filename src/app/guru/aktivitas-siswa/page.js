"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LayoutGuru from "../../../components/guru/LayoutGuru";
import { 
  Users, 
  BookOpen, 
  Clock,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// Extended mock data untuk aktivitas siswa yang lebih lengkap
const allActivities = [
  {
    id: 1,
    siswa: "Ahmad Faiz",
    nis: "2024001",
    kelas: "X IPA 1",
    materi: "Juz 1 (Al-Fatihah - Al-Baqarah 141)",
    jenis: "Setoran Hafalan",
    tanggal: "2025-09-28",
    waktu: "07:30",
    status: "selesai",
    statusLabel: "Selesai",
    nilai: 85,
    catatan: "Lancar, hafalan baik. Perlu perbaikan tajwid di ayat 45-50.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 2,
    siswa: "Fatimah Zahra",
    nis: "2024002", 
    kelas: "X IPA 1",
    materi: "Juz 1 Review (Al-Fatihah - Al-Baqarah 50)",
    jenis: "Muroja'ah",
    tanggal: "2025-09-28",
    waktu: "07:35",
    status: "selesai",
    statusLabel: "Selesai",
    nilai: 92,
    catatan: "Sangat baik, hafalan kuat dan tajwid benar.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 3,
    siswa: "Muhammad Zaki",
    nis: "2024003",
    kelas: "XI IPS 2", 
    materi: "Juz 2 (Al-Baqarah 142-200)",
    jenis: "Setoran Hafalan",
    tanggal: "2025-09-28",
    waktu: "08:30",
    status: "pending",
    statusLabel: "Menunggu",
    nilai: null,
    catatan: "Belum setor, dijadwal ulang.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 4,
    siswa: "Aisyah Khadijah",
    nis: "2024004",
    kelas: "XI IPS 2",
    materi: "Juz 2 (Al-Baqarah 150-180)",
    jenis: "Setoran Hafalan", 
    tanggal: "2025-09-28",
    waktu: "08:35",
    status: "tidak_hadir",
    statusLabel: "Tidak Hadir",
    nilai: null,
    catatan: "Tidak hadir tanpa keterangan.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 5,
    siswa: "Omar bin Khattab",
    nis: "2024005",
    kelas: "XII IPA 3",
    materi: "Juz 3 (Al-Baqarah 253 - Ali Imran 50)",
    jenis: "Ujian Hafalan",
    tanggal: "2025-09-28", 
    waktu: "09:30",
    status: "selesai",
    statusLabel: "Selesai",
    nilai: 78,
    catatan: "Cukup baik, perlu latihan lebih untuk kelancaran.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 6,
    siswa: "Khadijah binti Khuwailid",
    nis: "2024006",
    kelas: "X IPA 2", 
    materi: "Juz 1 (Al-Fatihah - Al-Baqarah 100)",
    jenis: "Setoran Hafalan",
    tanggal: "2025-09-27",
    waktu: "07:30",
    status: "selesai",
    statusLabel: "Selesai", 
    nilai: 88,
    catatan: "Bagus, hafalan lancar dengan tajwid yang benar.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 7,
    siswa: "Ali bin Abi Thalib",
    nis: "2024007",
    kelas: "XII IPA 3",
    materi: "Juz 3 Review (Ali Imran 1-50)",
    jenis: "Muroja'ah",
    tanggal: "2025-09-27",
    waktu: "09:35",
    status: "selesai",
    statusLabel: "Selesai",
    nilai: 95,
    catatan: "Excellent! Hafalan sangat kuat dan tajwid perfect.",
    guru: "Ustadz Muhammad"
  },
  {
    id: 8,
    siswa: "Hafsah binti Umar",
    nis: "2024008", 
    kelas: "XI IPS 2",
    materi: "Juz 2 (Al-Baqarah 100-142)",
    jenis: "Setoran Hafalan",
    tanggal: "2025-09-26",
    waktu: "08:30",
    status: "selesai",
    statusLabel: "Selesai",
    nilai: 82,
    catatan: "Baik, sedikit terbata-bata di ayat 120-125.",
    guru: "Ustadz Muhammad"
  }
];

export default function AktivitasSiswa() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState(allActivities);
  const [filteredActivities, setFilteredActivities] = useState(allActivities);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [filterJenis, setFilterJenis] = useState("semua");
  const router = useRouter();

  useEffect(() => {
    // Simulasi auth check
    const mockUser = {
      name: "Ustadz Muhammad",
      role: "guru",
      id: 1
    };
    
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role !== "guru") {
        router.push("/dashboard");
        return;
      }
    } else {
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    }

    setIsLoading(false);
  }, [router]);

  // Filter dan search activities
  useEffect(() => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.nis.includes(searchTerm) ||
        activity.materi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "semua") {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    // Kelas filter
    if (filterKelas !== "semua") {
      filtered = filtered.filter(activity => activity.kelas === filterKelas);
    }

    // Jenis filter
    if (filterJenis !== "semua") {
      filtered = filtered.filter(activity => activity.jenis === filterJenis);
    }

    setFilteredActivities(filtered);
  }, [searchTerm, filterStatus, filterKelas, filterJenis, activities]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'selesai': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'tidak_hadir': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'selesai':
        return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Selesai</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">Menunggu</span>;
      case 'tidak_hadir':
        return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Tidak Hadir</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Unknown</span>;
    }
  };

  const getNilaiColor = (nilai) => {
    if (!nilai) return "text-gray-400";
    if (nilai >= 90) return "text-green-600";
    if (nilai >= 80) return "text-blue-600";
    if (nilai >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getUniqueKelas = () => {
    const kelas = [...new Set(activities.map(activity => activity.kelas))];
    return kelas.sort();
  };

  const getUniqueJenis = () => {
    const jenis = [...new Set(activities.map(activity => activity.jenis))];
    return jenis.sort();
  };

  const getStatistics = () => {
    const total = filteredActivities.length;
    const selesai = filteredActivities.filter(a => a.status === 'selesai').length;
    const pending = filteredActivities.filter(a => a.status === 'pending').length;
    const tidakHadir = filteredActivities.filter(a => a.status === 'tidak_hadir').length;
    const rataRataNilai = filteredActivities
      .filter(a => a.nilai)
      .reduce((acc, curr) => acc + curr.nilai, 0) / filteredActivities.filter(a => a.nilai).length || 0;

    return { total, selesai, pending, tidakHadir, rataRataNilai };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const stats = getStatistics();

  return (
    <LayoutGuru>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/guru/dashboard"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Aktivitas Siswa</h1>
            <p className="text-gray-600">Riwayat lengkap kegiatan setoran dan evaluasi hafalan</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-xl font-bold text-gray-900">{stats.selesai}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tidak Hadir</p>
                <p className="text-xl font-bold text-gray-900">{stats.tidakHadir}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata</p>
                <p className="text-xl font-bold text-gray-900">{stats.rataRataNilai.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, NIS, atau materi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua Status</option>
              <option value="selesai">Selesai</option>
              <option value="pending">Menunggu</option>
              <option value="tidak_hadir">Tidak Hadir</option>
            </select>

            {/* Kelas Filter */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua Kelas</option>
              {getUniqueKelas().map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>

            {/* Jenis Filter */}
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua Jenis</option>
              {getUniqueJenis().map(jenis => (
                <option key={jenis} value={jenis}>{jenis}</option>
              ))}
            </select>

            {/* Export Button */}
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Aktivitas ({filteredActivities.length} dari {activities.length} total)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Tidak ada aktivitas yang sesuai dengan filter.</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.siswa}</h3>
                      <p className="text-sm text-gray-600">NIS: {activity.nis} • {activity.kelas}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(activity.status)}
                    <p className="text-sm text-gray-500 mt-1">{activity.tanggal} • {activity.waktu}</p>
                  </div>
                </div>

                <div className="ml-8 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Materi Hafalan:</p>
                      <p className="text-sm text-gray-600">{activity.materi}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Jenis Kegiatan:</p>
                      <p className="text-sm text-gray-600">{activity.jenis}</p>
                    </div>
                  </div>

                  {activity.nilai && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nilai:</p>
                      <p className={`text-sm font-semibold ${getNilaiColor(activity.nilai)}`}>
                        {activity.nilai}/100
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">Catatan Guru:</p>
                    <p className="text-sm text-gray-600 italic">{activity.catatan}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500">Guru: {activity.guru}</p>
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded">
                        Edit
                      </button>
                      <button className="text-xs text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </LayoutGuru>
  );
}