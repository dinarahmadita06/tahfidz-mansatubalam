'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  CalendarCheck2,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function PresensiPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKelasGuru();
  }, []);

  const fetchKelasGuru = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guru/kelas');

      if (!response.ok) {
        throw new Error('Gagal memuat data kelas');
      }

      const data = await response.json();
      setKelasList(data.kelas || []);
    } catch (error) {
      console.error('Error fetching kelas:', error);
      toast.error('Gagal memuat data kelas yang diampu');
    } finally {
      setLoading(false);
    }
  };

  const handleKelasClick = (kelasId) => {
    router.push(`/guru/presensi/${kelasId}`);
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      {/* Background Gradient Container */}
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50"
        style={{ margin: '-32px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
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
                Presensi Siswa
              </h1>
              <p
                style={{
                  margin: 0,
                  color: '#6B7280',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pilih kelas untuk mencatat kehadiran siswa
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} style={{ color: '#1D4ED8', flexShrink: 0 }} />
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#1E40AF',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <strong>Informasi:</strong> Pilih salah satu kelas di bawah untuk mulai mencatat presensi siswa.
          </p>
        </div>

        {/* Loading State */}
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
            <Loader2 size={48} style={{ color: '#059669', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p
              style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Memuat data kelas...
            </p>
            <style jsx>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : kelasList.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '80px 20px',
              textAlign: 'center',
              border: '2px dashed #E5E7EB',
            }}
          >
            <BookOpen size={64} style={{ color: '#D1D5DB', margin: '0 auto 20px' }} />
            <p
              style={{
                fontSize: '18px',
                color: '#374151',
                margin: '0 0 8px 0',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Belum ada kelas yang diampu
            </p>
            <p
              style={{
                fontSize: '15px',
                color: '#9CA3AF',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Anda belum ditugaskan untuk mengampu kelas manapun.
            </p>
          </div>
        ) : (
          /* Kelas List */
          <div>
            <div
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1F2937',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Daftar Kelas yang Diampu
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '4px 0 0 0',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Total {kelasList.length} kelas
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {kelasList.map((kelas) => (
                <div
                  key={kelas.id}
                  onClick={() => handleKelasClick(kelas.id)}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.15)';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)',
                      }}
                    >
                      <BookOpen size={24} style={{ color: 'white' }} />
                    </div>
                    <ChevronRight size={24} style={{ color: '#9CA3AF' }} />
                  </div>

                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: '0 0 8px 0',
                      color: '#1F2937',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Kelas {kelas.nama}
                  </h3>

                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: kelas.status === 'AKTIF'
                          ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                          : 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                        color: kelas.status === 'AKTIF' ? '#059669' : '#B91C1C',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        border: kelas.status === 'AKTIF' ? '1px solid #A7F3D0' : '1px solid #FCA5A5',
                      }}
                    >
                      {kelas.status === 'AKTIF' ? '✓ Aktif' : '✗ Nonaktif'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Users size={16} style={{ color: '#6B7280' }} />
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6B7280',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {kelas._count?.siswa || 0} siswa
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarCheck2 size={16} style={{ color: '#6B7280' }} />
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6B7280',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {kelas.tahunAjaran?.nama || 'Tidak ada tahun ajaran'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
