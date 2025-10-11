'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, ClipboardList, Calendar,
  TrendingUp, Clock, MoreVertical, X, CheckCircle,
  AlertCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';

export default function GuruDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    jumlahKelas: 0,
    jumlahSiswa: 0,
    progressRataRata: 0,
  });
  const [kelasList, setKelasList] = useState([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState([]);
  const [agendaHariIni, setAgendaHariIni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [formAgenda, setFormAgenda] = useState({
    kelasId: '',
    judul: '',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktuMulai: '',
    waktuSelesai: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'GURU') {
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch kelas
      const kelasRes = await fetch('/api/kelas');
      const kelasData = await kelasRes.json();
      setKelasList(kelasData);

      // Fetch siswa count
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();

      // Fetch hafalan untuk aktivitas terbaru
      const hafalanRes = await fetch('/api/hafalan');
      const hafalanData = await hafalanRes.json();
      setAktivitasTerbaru(hafalanData.slice(0, 5));

      // Calculate average progress
      if (siswaData.length > 0) {
        let totalProgress = 0;
        for (const siswa of siswaData) {
          const siswaHafalan = hafalanData.filter(h => h.siswaId === siswa.id);
          const uniqueJuz = [...new Set(siswaHafalan.map(h => h.juz))];
          const progress = (uniqueJuz.length / 30) * 100;
          totalProgress += progress;
        }
        const avgProgress = totalProgress / siswaData.length;

        setStats({
          jumlahKelas: kelasData.length,
          jumlahSiswa: siswaData.length,
          progressRataRata: avgProgress.toFixed(1),
        });
      } else {
        setStats({
          jumlahKelas: kelasData.length,
          jumlahSiswa: 0,
          progressRataRata: 0,
        });
      }

      // Fetch agenda hari ini
      const today = new Date().toISOString().split('T')[0];
      const agendaRes = await fetch(`/api/agenda?tanggal=${today}`);
      const agendaData = await agendaRes.json();

      // Ensure agendaData is an array
      const agendaArray = Array.isArray(agendaData) ? agendaData : [];

      // Update status based on current time
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedAgenda = agendaArray.map(agenda => {
        if (agenda.waktuSelesai && currentTime > agenda.waktuSelesai) {
          return { ...agenda, status: 'selesai' };
        } else if (currentTime >= agenda.waktuMulai && (!agenda.waktuSelesai || currentTime <= agenda.waktuSelesai)) {
          return { ...agenda, status: 'berlangsung' };
        }
        return agenda;
      });

      setAgendaHariIni(updatedAgenda);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAgenda = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formAgenda),
      });

      if (response.ok) {
        setShowAgendaModal(false);
        setFormAgenda({
          kelasId: '',
          judul: '',
          deskripsi: '',
          tanggal: new Date().toISOString().split('T')[0],
          waktuMulai: '',
          waktuSelesai: '',
        });
        fetchDashboardData(); // Refresh data
      } else {
        alert('Gagal menambah agenda');
      }
    } catch (error) {
      console.error('Error creating agenda:', error);
      alert('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      LANCAR: { icon: CheckCircle, text: 'Lancar', className: 'bg-green-100 text-green-700' },
      PERLU_PERBAIKAN: { icon: AlertCircle, text: 'Perlu Perbaikan', className: 'bg-yellow-100 text-yellow-700' },
      DITOLAK: { icon: XCircle, text: 'Ditolak', className: 'bg-red-100 text-red-700' },
    };
    return badges[status] || badges.LANCAR;
  };

  const getAgendaStatus = (status) => {
    const statuses = {
      upcoming: { text: 'Akan Datang', className: 'bg-blue-100 text-blue-700' },
      berlangsung: { text: 'Berlangsung', className: 'bg-green-100 text-green-700' },
      selesai: { text: 'Selesai', className: 'bg-gray-100 text-gray-700' },
    };
    return statuses[status] || statuses.upcoming;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GuruLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru Tahfidz</h1>
            <p className="text-sm text-gray-600">Selamat datang, {session?.user?.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 ml-13">{formattedDate}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl">
        {/* Stats Cards - 3 Cards Besar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-blue-600">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Kelas yang Diampu</p>
                <p className="text-4xl font-bold text-gray-900 mb-4">{stats.jumlahKelas}</p>
                <Link
                  href="/guru/siswa"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Lihat Detail →
                </Link>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-green-600">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Jumlah Siswa</p>
                <p className="text-4xl font-bold text-gray-900">{stats.jumlahSiswa}</p>
                <p className="text-sm text-gray-500 mt-4">Total siswa aktif</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={28} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-purple-600">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Progress Rata-rata</p>
                <p className="text-4xl font-bold text-gray-900">{stats.progressRataRata}%</p>
                <p className="text-sm text-gray-500 mt-4">Hafalan siswa</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={28} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Kelola Kelas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kelola Kelas</h2>
            {kelasList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p>Belum ada kelas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kelasList.map((kelas) => (
                  <div
                    key={kelas.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Link href={`/guru/siswa?kelasId=${kelas.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{kelas.nama}</h3>
                          <p className="text-sm text-gray-600">
                            {kelas._count.siswa} siswa • Tingkat {kelas.tingkat}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="dropdown relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aktivitas Siswa Terbaru */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Siswa Terbaru</h2>
            {aktivitasTerbaru.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList size={48} className="mx-auto mb-3 opacity-50" />
                <p>Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aktivitasTerbaru.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-semibold text-sm">
                          {item.siswa.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.siswa.user.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Setoran {item.surah.namaLatin} ayat {item.ayatMulai}-{item.ayatSelesai}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusBadge.className}`}>
                          <StatusIcon size={12} />
                          {statusBadge.text}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.tanggalSetor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Agenda Setoran Hari Ini */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Agenda Setoran Hari Ini</h2>
            <button
              onClick={() => setShowAgendaModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Kelola
            </button>
          </div>

          {agendaHariIni.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>Belum ada agenda hari ini</p>
              <button
                onClick={() => setShowAgendaModal(true)}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                Tambah Agenda
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {agendaHariIni.map((agenda) => {
                const agendaStatus = getAgendaStatus(agenda.status);

                return (
                  <div
                    key={agenda.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Clock size={20} className="text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{agenda.judul}</h3>
                        <p className="text-sm text-gray-600">
                          {agenda.waktuMulai}
                          {agenda.waktuSelesai && ` - ${agenda.waktuSelesai}`}
                          {agenda.kelas && ` • ${agenda.kelas.nama}`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${agendaStatus.className}`}>
                      {agendaStatus.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Agenda */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Agenda Baru</h3>
              <button
                onClick={() => setShowAgendaModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAgenda} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Agenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAgenda.judul}
                  onChange={(e) => setFormAgenda({ ...formAgenda, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: Setoran Juz 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas (Opsional)
                </label>
                <select
                  value={formAgenda.kelasId}
                  onChange={(e) => setFormAgenda({ ...formAgenda, kelasId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={formAgenda.deskripsi}
                  onChange={(e) => setFormAgenda({ ...formAgenda, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Deskripsi agenda..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formAgenda.tanggal}
                  onChange={(e) => setFormAgenda({ ...formAgenda, tanggal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formAgenda.waktuMulai}
                    onChange={(e) => setFormAgenda({ ...formAgenda, waktuMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={formAgenda.waktuSelesai}
                    onChange={(e) => setFormAgenda({ ...formAgenda, waktuSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
