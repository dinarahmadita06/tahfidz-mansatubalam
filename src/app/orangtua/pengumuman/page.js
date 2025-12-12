'use client';

import { useState, useEffect } from 'react';
import { Calendar, Megaphone } from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';

export default function OrangtuaPengumumanPage() {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllPengumuman();
  }, []);

  const fetchAllPengumuman = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/pengumuman?limit=100');
      
      if (!res.ok) {
        throw new Error('Gagal memuat pengumuman');
      }
      
      const data = await res.json();
      setPengumuman(data.pengumuman || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal memuat riwayat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <OrangtuaLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
            Riwayat Pengumuman
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Daftar semua pengumuman yang telah dikirimkan
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '128px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            ))}
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#DC2626'
          }}>
            {error}
          </div>
        ) : pengumuman.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #E5E7EB'
          }}>
            <Megaphone size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
            <p style={{ color: '#6B7280', fontSize: '18px' }}>Tidak ada pengumuman</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pengumuman.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', flex: 1 }}>
                    {item.judul}
                  </h2>
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.kategori}
                  </span>
                </div>

                <p style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                  {item.isi}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', fontSize: '14px', color: '#4B5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    <span>Dibuat: {formatDate(item.createdAt)}</span>
                  </div>
                  {item.tanggalSelesai && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      <span>Berakhir: {formatDate(item.tanggalSelesai)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OrangtuaLayout>
  );
}
