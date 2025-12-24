'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  ClipboardCheck,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function PresensiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const kelasId = params.kelasId;

  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (kelasId) {
      fetchKelasDetail();
      fetchSiswaKelas();
    }
  }, [kelasId]);

  useEffect(() => {
    if (siswaList.length > 0) {
      fetchPresensi();
    }
  }, [tanggal, siswaList]);

  const fetchKelasDetail = async () => {
    try {
      const response = await fetch(`/api/guru/kelas/${kelasId}`);
      if (!response.ok) throw new Error('Gagal memuat data kelas');

      const data = await response.json();
      setKelas(data.kelas);
    } catch (error) {
      console.error('Error fetching kelas:', error);
      toast.error('Gagal memuat data kelas');
    }
  };

  const fetchSiswaKelas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/kelas/${kelasId}/siswa`);
      if (!response.ok) throw new Error('Gagal memuat data siswa');

      const data = await response.json();
      setSiswaList(data.siswa || []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      toast.error('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresensi = async () => {
    try {
      const response = await fetch(
        `/api/guru/presensi?kelasId=${kelasId}&tanggal=${tanggal}`
      );

      if (response.ok) {
        const data = await response.json();
        const presensiMap = {};

        data.presensi.forEach((p) => {
          presensiMap[p.siswaId] = {
            id: p.id,
            status: p.status,
            keterangan: p.keterangan || '',
          };
        });

        const newData = siswaList.map((siswa) => ({
          siswaId: siswa.id,
          nama: siswa.user.name,
          nis: siswa.nis,
          status: presensiMap[siswa.id]?.status || 'HADIR',
          keterangan: presensiMap[siswa.id]?.keterangan || '',
          presensiId: presensiMap[siswa.id]?.id || null,
        }));

        setPresensiData(newData);
        setIsSaved(data.presensi.length > 0);
        setHasChanges(false);
      } else {
        const newData = siswaList.map((siswa) => ({
          siswaId: siswa.id,
          nama: siswa.user.name,
          nis: siswa.nis,
          status: 'HADIR',
          keterangan: '',
          presensiId: null,
        }));
        setPresensiData(newData);
        setIsSaved(false);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error fetching presensi:', error);
    }
  };

  const handleStatusChange = (siswaId, newStatus) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId
          ? { ...item, status: newStatus, keterangan: newStatus === 'HADIR' ? '' : item.keterangan }
          : item
      )
    );
    setHasChanges(true);
  };

  const handleKeteranganChange = (siswaId, keterangan) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId ? { ...item, keterangan } : item
      )
    );
    setHasChanges(true);
  };

  const handleTandaiSemuaHadir = () => {
    setPresensiData((prev) =>
      prev.map((item) => ({ ...item, status: 'HADIR', keterangan: '' }))
    );
    setHasChanges(true);
    toast.success('Semua siswa ditandai hadir');
  };

  const handleResetStatus = () => {
    if (confirm('Yakin ingin mereset semua status?')) {
      fetchPresensi();
      toast.success('Status direset');
    }
  };

  const handleSimpanPresensi = async () => {
    if (!session?.user?.guru?.id) {
      toast.error('Sesi guru tidak ditemukan');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/guru/presensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kelasId,
          tanggal,
          guruId: session.user.guru.id,
          presensi: presensiData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menyimpan presensi');
      }

      toast.success('✅ Presensi berhasil disimpan!', {
        duration: 3000,
        style: {
          background: '#ECFDF5',
          color: '#059669',
          border: '1px solid #A7F3D0',
          fontWeight: '600',
        },
      });

      setIsSaved(true);
      setHasChanges(false);
      fetchPresensi();
    } catch (error) {
      console.error('Error saving presensi:', error);
      toast.error(error.message || 'Gagal menyimpan presensi');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: presensiData.length,
    hadir: presensiData.filter((p) => p.status === 'HADIR').length,
    izin: presensiData.filter((p) => p.status === 'IZIN').length,
    sakit: presensiData.filter((p) => p.status === 'SAKIT').length,
    alfa: presensiData.filter((p) => p.status === 'ALFA').length,
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.push('/guru/presensi')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-semibold hidden sm:inline">Kembali</span>
              </button>
              <ChevronRight size={16} className="text-white/60" />
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl flex-shrink-0">
                  <ClipboardCheck size={24} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-green-50 mb-0.5">Presensi</div>
                  <h1 className="text-lg sm:text-2xl font-bold truncate">
                    Kelas {kelas?.nama || '...'}
                  </h1>
                </div>
              </div>
            </div>
            <button
              onClick={handleSimpanPresensi}
              disabled={presensiData.length === 0 || saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                presensiData.length === 0 || saving
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-emerald-600 hover:bg-green-50 shadow-lg'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compact Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Tanggal Presensi
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleTandaiSemuaHadir}
                disabled={presensiData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              >
                <UserCheck size={16} />
                <span className="hidden sm:inline">Tandai Semua Hadir</span>
                <span className="sm:hidden">Semua Hadir</span>
              </button>
              <button
                onClick={handleResetStatus}
                disabled={presensiData.length === 0}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            <div className="flex items-end">
              {isSaved && !hasChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-semibold">Tersimpan</span>
                </div>
              )}
              {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <AlertCircle size={16} />
                  <span className="text-sm font-semibold">Ada Perubahan</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && presensiData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total" value={stats.total} icon={Users} color="emerald" />
            <StatCard label="Hadir" value={stats.hadir} icon={UserCheck} color="green" />
            <StatCard label="Izin" value={stats.izin} icon={Clock} color="amber" />
            <StatCard label="Sakit" value={stats.sakit} icon={AlertCircle} color="blue" />
            <StatCard label="Alfa" value={stats.alfa} icon={XCircle} color="red" />
          </div>
        )}

        {/* Table Presensi */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Memuat data siswa...</p>
          </div>
        ) : presensiData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tidak ada siswa di kelas ini
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 border-b">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={20} />
                Daftar Kehadiran Siswa ({stats.total} siswa)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Nama Siswa
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Status Kehadiran
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presensiData.map((item, index) => (
                    <PresensiRow
                      key={item.siswaId}
                      item={item}
                      index={index}
                      onStatusChange={handleStatusChange}
                      onKeteranganChange={handleKeteranganChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with recorder info */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Dicatat oleh: <strong>{session?.user?.name || '...'}</strong></span>
                <span>{new Date(tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className={`${colors[color]} rounded-xl border-2 p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold mb-1 opacity-75">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon size={24} className="opacity-50" />
      </div>
    </div>
  );
}

function PresensiRow({ item, index, onStatusChange, onKeteranganChange }) {
  const statusOptions = [
    { value: 'HADIR', label: 'Hadir', color: 'emerald', emoji: '✅' },
    { value: 'IZIN', label: 'Izin', color: 'amber', emoji: '🟡' },
    { value: 'SAKIT', label: 'Sakit', color: 'blue', emoji: '💊' },
    { value: 'ALFA', label: 'Alfa', color: 'red', emoji: '❌' },
  ];

  const colorClasses = {
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    red: 'bg-red-500 hover:bg-red-600',
  };

  const selectedOption = statusOptions.find(opt => opt.value === item.status);
  const showKeterangan = item.status !== 'HADIR';

  return (
    <tr className="hover:bg-emerald-50 transition-colors">
      <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">{item.nama}</div>
        <div className="text-xs text-gray-500">NIS: {item.nis}</div>
      </td>
      <td className="px-4 py-3">
        {/* Desktop: Segmented Button */}
        <div className="hidden md:flex gap-2 justify-center">
          {statusOptions.map((option) => {
            const isActive = item.status === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onStatusChange(item.siswaId, option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `${colorClasses[option.color]} text-white shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            );
          })}
        </div>
        {/* Mobile: Dropdown */}
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.siswaId, e.target.value)}
          className="md:hidden w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {showKeterangan ? (
          <input
            type="text"
            value={item.keterangan}
            onChange={(e) => onKeteranganChange(item.siswaId, e.target.value)}
            placeholder="Tambahkan keterangan..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        ) : (
          <span className="text-sm text-gray-400 italic">-</span>
        )}
      </td>
    </tr>
  );
}
