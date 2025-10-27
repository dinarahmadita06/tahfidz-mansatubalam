'use client';

import { useState } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

// Data Dummy Kelas
const kelasList = [
  { id: 'x-a1', nama: 'Kelas X A1' },
  { id: 'x-a2', nama: 'Kelas X A2' },
  { id: 'xi-a1', nama: 'Kelas XI A1' },
  { id: 'xi-a2', nama: 'Kelas XI A2' },
  { id: 'xii-a1', nama: 'Kelas XII A1' },
  { id: 'xii-a2', nama: 'Kelas XII A2' },
];

export default function PenilaianHafalanIndexPage() {
  return (
    <GuruLayout>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#065F46',
          margin: 0,
          marginBottom: '8px',
        }}>
          📘 Penilaian Hafalan
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0,
        }}>
          Pilih kelas untuk melihat dan menilai hafalan siswa.
        </p>
      </div>

      {/* Grid Card Kelas */}
      <div
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 16px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '24px',
            justifyItems: 'center',
          }}
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        >
          {kelasList.map((kelas) => (
            <Link
              key={kelas.id}
              href={`/guru/penilaian-hafalan/${kelas.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '220px',
                  height: '160px',
                  background: 'white',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  padding: '20px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#D1FAE5';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                {/* Ikon Buku */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <BookOpen size={28} style={{ color: 'white' }} />
                </div>

                {/* Nama Kelas */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#059669',
                  margin: 0,
                  marginBottom: '8px',
                  textAlign: 'center',
                }}>
                  {kelas.nama}
                </h3>

                {/* Link Text */}
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#F59E0B',
                  margin: 0,
                }}>
                  Lihat Kelas →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Catatan UX */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: '#F0FDF4',
        border: '1px solid #86EFAC',
        borderRadius: '12px',
      }}>
        <p style={{
          fontSize: '14px',
          color: '#065F46',
          margin: 0,
        }}>
          Klik salah satu kelas untuk membuka halaman penilaian hafalan.
        </p>
      </div>
    </GuruLayout>
  );
}
