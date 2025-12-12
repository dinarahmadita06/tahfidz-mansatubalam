'use client';

import { User, BookOpen, TrendingUp, Calendar, Star, Clock, Award, MessageCircle } from "lucide-react";
import PengumumanWidget from "@/components/PengumumanWidget";

function ChildCard({ child }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {child.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{child.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{child.class} • {child.teacher}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{child.progress}%</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Progress</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{child.ayatCount}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Ayat Hafal</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Aktivitas Terakhir</span>
          <span className="text-gray-900 dark:text-white">{child.lastActivity}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Streak</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{child.streak} hari</span>
        </div>
      </div>
    </div>
  );
}

function WeeklyProgress() {
  const weekData = [
    { day: "Sen", progress: 85, target: 100 },
    { day: "Sel", progress: 92, target: 100 },
    { day: "Rab", progress: 78, target: 100 },
    { day: "Kam", progress: 95, target: 100 },
    { day: "Jum", progress: 88, target: 100 },
    { day: "Sab", progress: 70, target: 100 },
    { day: "Min", progress: 60, target: 100 }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Mingguan</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">Target vs Pencapaian</span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="mb-2">
              <div className="h-20 bg-gray-200 dark:bg-neutral-800 rounded-lg overflow-hidden relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-500"
                  style={{ height: `${(day.progress / day.target) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {day.progress}%
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {day.day}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Rata-rata minggu ini: <span className="font-semibold text-emerald-600 dark:text-emerald-400">81%</span>
        </p>
      </div>
    </div>
  );
}

function RecentCommunications() {
  const communications = [
    {
      type: "teacher_note",
      from: "Ustadz Muhammad",
      message: "Ahmad menunjukkan progress yang baik dalam hafalan Al-Baqarah",
      time: "2 jam lalu",
      icon: MessageCircle,
      color: "bg-blue-500"
    },
    {
      type: "achievement",
      from: "Sistem",
      message: "Ahmad mencapai streak 20 hari berturut-turut!",
      time: "1 hari lalu",
      icon: Award,
      color: "bg-emerald-500"
    },
    {
      type: "reminder",
      from: "Sistem",
      message: "Waktu murajaah harian - jangan lupa dampingi anak",
      time: "1 hari lalu",
      icon: Clock,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Komunikasi Terkini</h3>
        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
          Lihat Semua
        </button>
      </div>
      
      <div className="space-y-4">
        {communications.map((comm, index) => (
          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div className={`rounded-full p-2 ${comm.color} flex-shrink-0`}>
              <comm.icon size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{comm.from}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">{comm.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{comm.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsAndGuidance() {
  const tips = [
    {
      title: "Waktu Terbaik Menghafal",
      content: "Pagi hari setelah subuh adalah waktu terbaik untuk menghafal Al-Qur'an",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Dampingi dengan Sabar",
      content: "Berikan dukungan positif dan sabar saat anak mengulang hafalan",
      icon: User,
      color: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Konsistensi adalah Kunci",
      content: "Lebih baik sedikit tapi konsisten daripada banyak tapi tidak rutin",
      icon: Star,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-4">
        <Star size={24} className="text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Tips untuk Orang Tua</h3>
      </div>
      
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <tip.icon size={20} className={tip.color} />
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">{tip.title}</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">{tip.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrangtuaDashboardPage() {
  // Mock data - in real app this would come from API
  const children = [
    {
      name: "Ahmad Zaki",
      class: "Kelas X-A",
      teacher: "Ustadz Muhammad",
      progress: 72,
      ayatCount: 350,
      lastActivity: "2 jam lalu",
      streak: 24
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Orang Tua</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Pantau perkembangan hafalan putra/putri Anda</p>
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Putra/Putri Saya</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <ChildCard key={index} child={child} />
          ))}
        </div>
      </div>

      {/* Weekly Progress and Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyProgress />
        <RecentCommunications />
      </div>

      {/* Monthly Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Ringkasan Bulanan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <BookOpen size={32} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">72</div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Ayat Baru</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <TrendingUp size={32} className="text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">+15%</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Peningkatan</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <Calendar size={32} className="text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">24</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Hari Aktif</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <Award size={32} className="text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">3</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Prestasi</div>
          </div>
        </div>
      </div>

      {/* Pengumuman Widget */}
      <PengumumanWidget limit={5} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors">
              <MessageCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">Hubungi Guru</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Diskusi progress anak</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
              <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Lihat Jadwal</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Jadwal belajar anak</p>
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <TipsAndGuidance />
        </div>
      </div>
    </div>
  );
}