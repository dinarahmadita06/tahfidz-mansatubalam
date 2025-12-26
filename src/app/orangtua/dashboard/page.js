'use client';

import { useState, useEffect } from 'react';
import { User, BookOpen, TrendingUp, Calendar, Star, Clock, Award, MessageCircle, ChevronDown, Lightbulb } from "lucide-react";
import PengumumanWidget from "@/components/PengumumanWidget";

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CARD_GLASS = 'bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10';

function ChildCard({ child, isActive, onClick }) {
  return (
    <div
      className={`${CARD_GLASS} p-6 cursor-pointer transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/20'
          : 'hover:shadow-xl hover:shadow-green-500/15'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
          {child.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
          <p className="text-sm text-gray-600">{child.class} • {child.teacher}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-emerald-50/80 backdrop-blur rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-emerald-700">{child.progress}%</div>
          <div className="text-xs text-emerald-600">Progress</div>
        </div>
        <div className="text-center p-3 bg-blue-50/80 backdrop-blur rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-700">{child.ayatCount}</div>
          <div className="text-xs text-blue-600">Ayat Hafal</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Aktivitas Terakhir</span>
          <span className="text-gray-900">{child.lastActivity}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Streak</span>
          <span className="text-emerald-600 font-medium">{child.streak} hari</span>
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
    <div className={`${CARD_GLASS} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Progress Mingguan</h3>
        <span className="text-sm text-gray-600">Target vs Pencapaian</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="mb-2">
              <div className="h-20 bg-gray-100/70 backdrop-blur rounded-lg overflow-hidden relative shadow-sm">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-500"
                  style={{ height: `${(day.progress / day.target) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {day.progress}%
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {day.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Rata-rata minggu ini: <span className="font-semibold text-emerald-600">81%</span>
        </p>
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
      color: "text-blue-600"
    },
    {
      title: "Dampingi dengan Sabar",
      content: "Berikan dukungan positif dan sabar saat anak mengulang hafalan",
      icon: User,
      color: "text-blue-600"
    },
    {
      title: "Konsistensi adalah Kunci",
      content: "Lebih baik sedikit tapi konsisten daripada banyak tapi tidak rutin",
      icon: Star,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="bg-blue-50/60 backdrop-blur rounded-2xl border border-blue-200/40 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Star size={24} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">Tips untuk Orang Tua</h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <tip.icon size={20} className={tip.color} />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">{tip.title}</h4>
              <p className="text-sm text-blue-700">{tip.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dropdown untuk memilih anak
function ChildSelector({ children, selectedChild, onSelectChild }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
          {selectedChild.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">Pilih Anak</p>
          <p className="font-semibold text-gray-900">{selectedChild.name}</p>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[999] max-h-[300px] overflow-y-auto">
            {children.map((child, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectChild(child);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  selectedChild.name === child.name ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {child.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-600">{child.class}</p>
                </div>
                {selectedChild.name === child.name && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrangtuaDashboardPage() {
  // Mock data - in real app this would come from API
  const allChildren = [
    {
      name: "Ahmad Zaki",
      class: "Kelas X-A",
      teacher: "Ustadz Muhammad",
      progress: 72,
      ayatCount: 350,
      lastActivity: "2 jam lalu",
      streak: 24
    },
    {
      name: "Fatimah Azzahra",
      class: "Kelas IX-B",
      teacher: "Ustadzah Aisyah",
      progress: 85,
      ayatCount: 420,
      lastActivity: "1 jam lalu",
      streak: 30
    }
  ];

  const [selectedChild, setSelectedChild] = useState(allChildren[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner - Green Gradient */}
        <div className={`${BANNER_GRADIENT} rounded-2xl shadow-xl p-8 text-white`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Orang Tua</h1>
              <p className="text-green-50">Pantau perkembangan hafalan putra/putri Anda</p>
            </div>

            {/* Child Selector Dropdown */}
            <ChildSelector
              children={allChildren}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
            />
          </div>
        </div>

        {/* Motivational Quote - Blue Glass Style */}
        <div className="bg-blue-50/60 backdrop-blur rounded-2xl shadow-lg border border-blue-200/40 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="text-blue-600" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg italic leading-relaxed text-slate-700 mb-2 font-medium break-words">
                "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
              </p>
              <p className="text-sm text-slate-600 font-semibold">
                — HR. Bukhari
              </p>
            </div>
          </div>
        </div>

        {/* Selected Child Card */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Anak Terpilih</h2>
          <ChildCard child={selectedChild} isActive={true} />
        </div>

        {/* Pengumuman Widget */}
        <div className={`${CARD_GLASS} p-6`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengumuman</h2>
          <PengumumanWidget limit={3} />
        </div>

        {/* Weekly Progress */}
        <WeeklyProgress />

        {/* Monthly Overview */}
        <div className={`${CARD_GLASS} p-6`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Bulanan</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-emerald-50/80 backdrop-blur rounded-lg shadow-sm">
              <BookOpen size={32} className="text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">72</div>
              <div className="text-sm text-emerald-600">Ayat Baru</div>
            </div>
            <div className="text-center p-4 bg-blue-50/80 backdrop-blur rounded-lg shadow-sm">
              <TrendingUp size={32} className="text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">+15%</div>
              <div className="text-sm text-blue-600">Peningkatan</div>
            </div>
            <div className="text-center p-4 bg-purple-50/80 backdrop-blur rounded-lg shadow-sm">
              <Calendar size={32} className="text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">24</div>
              <div className="text-sm text-purple-600">Hari Aktif</div>
            </div>
            <div className="text-center p-4 bg-amber-50/80 backdrop-blur rounded-lg shadow-sm">
              <Award size={32} className="text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">3</div>
              <div className="text-sm text-amber-600">Prestasi</div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${CARD_GLASS} p-6`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-emerald-50/80 backdrop-blur hover:bg-emerald-100/80 transition-colors shadow-sm">
                <MessageCircle size={20} className="text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-900">Hubungi Guru</p>
                  <p className="text-xs text-emerald-600">Diskusi progress anak</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-blue-50/80 backdrop-blur hover:bg-blue-100/80 transition-colors shadow-sm">
                <Calendar size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Lihat Jadwal</p>
                  <p className="text-xs text-blue-600">Jadwal belajar anak</p>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <TipsAndGuidance />
          </div>
        </div>
      </div>
    </div>
  );
}
