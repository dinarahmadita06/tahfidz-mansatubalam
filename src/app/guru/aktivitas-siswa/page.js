"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GuruLayout from "@/components/layout/GuruLayout";
import LoadingIndicator from "@/components/shared/LoadingIndicator";
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
  AlertCircle,
  TrendingUp
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
    return (
      <GuruLayout>
        <LoadingIndicator text="Memuat data aktivitas..." fullPage />
      </GuruLayout>
    );
  }

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const stats = getStatistics();

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Detail Aktivitas Siswa
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                Riwayat lengkap kegiatan setoran dan evaluasi hafalan
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<Users size={20} />}
              title="Total"
              value={stats.total}
              color="bg-blue-500"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              title="Selesai"
              value={stats.selesai}
              color="bg-emerald-500"
            />
            <StatCard
              icon={<Clock size={20} />}
              title="Pending"
              value={stats.pending}
              color="bg-amber-500"
            />
            <StatCard
              icon={<XCircle size={20} />}
              title="Tidak Hadir"
              value={stats.tidakHadir}
              color="bg-rose-500"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              title="Rata-rata"
              value={stats.rataRataNilai.toFixed(1)}
              color="bg-teal-600"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, atau materi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="semua">Semua Jenis</option>
                {getUniqueJenis().map(jenis => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </select>

              {/* Export Button */}
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-emerald-50">
              <h2 className="text-lg font-bold text-emerald-900">
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
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          activity.status === 'selesai' ? 'bg-emerald-100' : 
                          activity.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{activity.siswa}</h3>
                          <p className="text-sm text-gray-600">NIS: {activity.nis} • {activity.kelas}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(activity.status)}
                        <p className="text-sm text-gray-500 mt-2 font-medium">{activity.tanggal} • {activity.waktu}</p>
                      </div>
                    </div>

                    <div className="ml-14 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Materi Hafalan</p>
                          <p className="text-sm font-semibold text-gray-800">{activity.materi}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Jenis Kegiatan</p>
                          <p className="text-sm font-semibold text-gray-800">{activity.jenis}</p>
                        </div>
                      </div>

                      {activity.nilai && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">Nilai:</span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${
                            activity.nilai >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            activity.nilai >= 80 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {activity.nilai}/100
                          </span>
                        </div>
                      )}

                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Catatan Guru</p>
                        <p className="text-sm text-gray-700 leading-relaxed italic">{activity.catatan}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Guru: <span className="text-gray-700">{activity.guru}</span></p>
                        <div className="flex gap-2">
                          <button className="px-4 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-100 rounded-xl transition-all">
                            Detail
                          </button>
                          <button className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all">
                            Edit
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
      </div>
    </GuruLayout>
  );
}