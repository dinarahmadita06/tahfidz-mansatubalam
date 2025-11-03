'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  CalendarCheck2,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Save,
  Loader2,
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
      }
    } catch (error) {
      console.error('Error fetching presensi:', error);
    }
  };

  const handleStatusChange = (siswaId, newStatus) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleKeteranganChange = (siswaId, keterangan) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId ? { ...item, keterangan } : item
      )
    );
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

      toast.success('Presensi berhasil disimpan!', {
        duration: 3000,
        style: {
          background: '#ECFDF5',
          color: '#059669',
          border: '1px solid #A7F3D0',
        },
      });

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

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div
        className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50"
        style={{ margin: '-32px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => router.push('/guru/presensi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#F9FAFB';
              e.target.style.borderColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#E5E7EB';
            }}
          >
            <ArrowLeft size={18} />
            Kembali ke Daftar Kelas
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              }}
            >
              <CalendarCheck2 size={28} style={{ color: 'white' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#065F46',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '-0.5px',
                }}
              >
                Presensi Kelas {kelas?.nama || '...'}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: '#6B7280',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Catat kehadiran siswa untuk tanggal yang dipilih
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tanggal */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(5, 150, 105, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#059669')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div style={{ flex: '1', minWidth: '200px', paddingTop: '28px' }}>
              <button
                onClick={handleSimpanPresensi}
                disabled={presensiData.length === 0 || saving}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background:
                    presensiData.length === 0 || saving
                      ? '#E5E7EB'
                      : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: presensiData.length === 0 || saving ? '#9CA3AF' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: presensiData.length === 0 || saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow:
                    presensiData.length === 0 || saving
                      ? 'none'
                      : '0 2px 8px rgba(5, 150, 105, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Presensi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && presensiData.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <StatCard
              icon={Users}
              label="Total Siswa"
              value={stats.total}
              color="#059669"
              bgGradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
              borderColor="#A7F3D0"
            />
            <StatCard
              icon={UserCheck}
              label="Hadir"
              value={stats.hadir}
              color="#10B981"
              bgGradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
              borderColor="#86EFAC"
            />
            <StatCard
              icon={Clock}
              label="Izin"
              value={stats.izin}
              color="#FBBF24"
              bgGradient="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
              borderColor="#FDE68A"
            />
            <StatCard
              icon={AlertCircle}
              label="Sakit"
              value={stats.sakit}
              color="#3B82F6"
              bgGradient="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
              borderColor="#BFDBFE"
            />
            <StatCard
              icon={XCircle}
              label="Alfa"
              value={stats.alfa}
              color="#EF4444"
              bgGradient="linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
              borderColor="#FCA5A5"
            />
          </div>
        )}

        {/* Table Presensi */}
        {loading ? (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '80px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Loader2
              size={48}
              style={{ color: '#059669', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}
            />
            <p
              style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Memuat data siswa...
            </p>
          </div>
        ) : presensiData.length === 0 ? (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '80px 20px',
              textAlign: 'center',
              border: '2px dashed #E5E7EB',
            }}
          >
            <Users size={64} style={{ color: '#D1D5DB', margin: '0 auto 20px' }} />
            <p
              style={{
                fontSize: '18px',
                color: '#374151',
                margin: '0 0 8px 0',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Tidak ada siswa di kelas ini
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(5, 150, 105, 0.08)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                      borderBottom: '2px solid #E5E7EB',
                    }}
                  >
                    <th style={headerStyle}>No</th>
                    <th style={{ ...headerStyle, textAlign: 'left' }}>Nama Siswa</th>
                    <th style={{ ...headerStyle, minWidth: '400px' }}>Status Kehadiran</th>
                    <th style={{ ...headerStyle, textAlign: 'left' }}>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
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

            {/* Signature Section */}
            <div
              style={{
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '2px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ textAlign: 'center', minWidth: '250px' }}>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Bandar Lampung, {today}
                </p>
                <p
                  style={{
                    margin: '0 0 60px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Guru Pengampu,
                </p>
                <div
                  style={{
                    borderBottom: '2px solid #374151',
                    marginBottom: '8px',
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1F2937',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {session?.user?.name || '...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </GuruLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, bgGradient, borderColor }) {
  return (
    <div
      style={{
        background: bgGradient,
        borderRadius: '14px',
        padding: '20px',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 10px ${color}33`,
          }}
        >
          <Icon size={22} style={{ color: 'white' }} />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: color,
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              color: color,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PresensiRow({ item, index, onStatusChange, onKeteranganChange }) {
  const isEven = index % 2 === 0;
  const [hover, setHover] = useState(false);

  const statusOptions = [
    { value: 'HADIR', label: 'Hadir', emoji: '✅', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    { value: 'IZIN', label: 'Izin', emoji: '🟡', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { value: 'SAKIT', label: 'Sakit', emoji: '🔵', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { value: 'ALFA', label: 'Alfa', emoji: '🔴', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
  ];

  return (
    <tr
      style={{
        background: hover ? '#F0FDF4' : isEven ? '#FAFBFC' : 'white',
        borderBottom: '1px solid #F3F4F6',
        transition: 'all 0.2s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <td style={{ ...cellStyle, textAlign: 'center', width: '60px' }}>{index + 1}</td>
      <td style={cellStyle}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '15px', color: '#1F2937' }}>
            {item.nama}
          </div>
          <div style={{ fontSize: '13px', color: '#9CA3AF' }}>NIS: {item.nis}</div>
        </div>
      </td>
      <td style={{ ...cellStyle, padding: '16px 8px' }}>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {statusOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                background: item.status === option.value ? option.bg : 'transparent',
                border: item.status === option.value ? `1.5px solid ${option.border}` : '1.5px solid transparent',
              }}
            >
              <input
                type="radio"
                name={`status-${item.siswaId}`}
                value={option.value}
                checked={item.status === option.value}
                onChange={(e) => onStatusChange(item.siswaId, e.target.value)}
                style={{
                  cursor: 'pointer',
                  accentColor: option.color,
                  width: '18px',
                  height: '18px',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: item.status === option.value ? '600' : '500',
                  color: item.status === option.value ? option.color : '#6B7280',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {option.emoji} {option.label}
              </span>
            </label>
          ))}
        </div>
      </td>
      <td style={cellStyle}>
        <input
          type="text"
          value={item.keterangan}
          onChange={(e) => onKeteranganChange(item.siswaId, e.target.value)}
          placeholder="Tambahkan keterangan..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1.5px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#059669';
            e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
      </td>
    </tr>
  );
}

const headerStyle = {
  padding: '16px 14px',
  textAlign: 'center',
  fontSize: '13px',
  fontWeight: '700',
  color: '#374151',
  fontFamily: 'Inter, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cellStyle = {
  padding: '16px 14px',
  fontSize: '14px',
  color: '#1F2937',
  fontFamily: 'Inter, sans-serif',
};
