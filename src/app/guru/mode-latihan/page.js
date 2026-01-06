'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, Target, Play, Award } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

// Mock data untuk mode latihan
const mockSessions = [
  {
    id: 1,
    title: "Latihan Al-Fatihah",
    surah: "Al-Fatihah",
    ayat: "1-7",
    difficulty: "Pemula",
    participants: 15,
    duration: "30 menit",
    status: "active",
    startTime: "2024-01-20 09:00"
  },
  {
    id: 2,
    title: "Review Juz 1",
    surah: "Al-Baqarah",
    ayat: "1-141",
    difficulty: "Menengah", 
    participants: 8,
    duration: "60 menit",
    status: "scheduled",
    startTime: "2024-01-21 10:00"
  }
];

const mockMaterials = [
  {
    id: 1,
    title: "Tajwid Dasar",
    type: "PDF",
    size: "2.5 MB",
    downloads: 45,
    uploadDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Murottal Al-Fatihah",
    type: "Audio",
    size: "8.2 MB", 
    downloads: 67,
    uploadDate: "2024-01-18"
  }
];

export default function ModeLatihan() {
  const [sessions, setSessions] = useState(mockSessions);
  const [materials, setMaterials] = useState(mockMaterials);
  const [activeTab, setActiveTab] = useState('sessions');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    surah: '',
    ayat: '',
    difficulty: 'Pemula',
    duration: '30',
    date: '',
    time: ''
  });

  const handleCreateSession = (e) => {
    e.preventDefault();
    const session = {
      id: Date.now(),
      ...newSession,
      participants: 0,
      status: 'scheduled',
      startTime: `${newSession.date} ${newSession.time}`
    };
    setSessions([...sessions, session]);
    setNewSession({
      title: '',
      surah: '',
      ayat: '',
      difficulty: 'Pemula',
      duration: '30',
      date: '',
      time: ''
    });
    setShowCreateForm(false);
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{session.title}</h4>
          <p className="text-sm text-gray-600">{session.surah} - Ayat {session.ayat}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          session.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : session.status === 'scheduled'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {session.status === 'active' ? 'Berlangsung' : 
           session.status === 'scheduled' ? 'Terjadwal' : 'Selesai'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Level:</span>
          <span className="font-medium">{session.difficulty}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Peserta:</span>
          <span className="font-medium">{session.participants} siswa</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Durasi:</span>
          <span className="font-medium">{session.duration}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Waktu:</span>
          <span className="font-medium">{new Date(session.startTime).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {session.status === 'active' ? (
          <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Masuk Sesi
          </button>
        ) : session.status === 'scheduled' ? (
          <button className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Mulai Sesi
          </button>
        ) : (
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Lihat Hasil
          </button>
        )}
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Edit
        </button>
      </div>
    </div>
  );

  const MaterialCard = ({ material }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            material.type === 'PDF' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <BookOpen className={`w-5 h-5 ${
              material.type === 'PDF' ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{material.title}</h4>
            <p className="text-sm text-gray-500">{material.type} • {material.size}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Download:</span>
          <span className="font-medium">{material.downloads}x</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Upload:</span>
          <span className="font-medium">{new Date(material.uploadDate).toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]">
          Download
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Edit
        </button>
      </div>
    </div>
  );

  return (
    <GuruLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Mode Latihan</h1>
        <p className="text-gray-600">Kelola sesi latihan dan materi pembelajaran tahfidz</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Clock className="w-6 h-6 text-white" />}
          title="Sesi Aktif"
          value={sessions.filter(s => s.status === 'active').length}
          color="bg-green-500"
        />
        <StatCard 
          icon={<Target className="w-6 h-6 text-white" />}
          title="Sesi Terjadwal"
          value={sessions.filter(s => s.status === 'scheduled').length}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />}
          title="Total Peserta"
          value={sessions.reduce((acc, s) => acc + s.participants, 0)}
          color="bg-[#FFB030]"
        />
        <StatCard 
          icon={<BookOpen className="w-6 h-6 text-white" />}
          title="Total Materi"
          value={materials.length}
          color="bg-[#874D14]"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'sessions' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Sesi Latihan
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'materials' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Kelola Materi
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'evaluation' 
                ? 'text-[#FFB030] border-b-2 border-[#FFB030]' 
                : 'text-gray-500'
            }`}
          >
            Evaluasi
          </button>
        </div>

        <div className="p-6">
          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Sesi Latihan</h3>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Buat Sesi Baru
                </button>
              </div>

              {/* Create Session Form */}
              {showCreateForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold mb-4">Buat Sesi Latihan Baru</h4>
                  <form onSubmit={handleCreateSession} className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Judul Sesi"
                      value={newSession.title}
                      onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nama Surah"
                      value={newSession.surah}
                      onChange={(e) => setNewSession({...newSession, surah: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Range Ayat (contoh: 1-10)"
                      value={newSession.ayat}
                      onChange={(e) => setNewSession({...newSession, ayat: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <select
                      value={newSession.difficulty}
                      onChange={(e) => setNewSession({...newSession, difficulty: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                    >
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Lanjut">Lanjut</option>
                    </select>
                    <select
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                    >
                      <option value="30">30 menit</option>
                      <option value="45">45 menit</option>
                      <option value="60">60 menit</option>
                      <option value="90">90 menit</option>
                    </select>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <input
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB030]"
                      required
                    />
                    <div className="col-span-2 flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28]"
                      >
                        Buat Sesi
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Kelola Materi</h3>
                <button className="px-4 py-2 bg-[#FFB030] text-white rounded-lg hover:bg-[#e69b28] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Upload Materi
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map(material => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluation' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Evaluasi Pembelajaran</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Chart Mockup */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Performa Siswa</h4>
                  <div className="h-48 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Grafik Performa</p>
                  </div>
                </div>

                {/* Recent Evaluations */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Evaluasi Terbaru</h4>
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Ahmad Rizki</p>
                            <p className="text-xs text-gray-500">Al-Fatihah - Sesi Latihan</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">85</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </GuruLayout>
  );
}