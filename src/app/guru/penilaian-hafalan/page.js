'use client';

import { useState } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter kelas berdasarkan search query
  const filteredKelas = kelasList.filter(kelas =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GuruLayout>
      {/* Background Gradient Container */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50" style={{ margin: '-32px', padding: '32px' }}>
        {/* Content Container */}
        <div>
          {/* Header Area */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#065F46',
                  margin: 0,
                  marginBottom: '4px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Penilaian Hafalan
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pilih kelas untuk melihat dan menilai hafalan siswa.
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Cari kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10B981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              />
            </div>
          </motion.div>

          {/* Grid Card Kelas */}
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              marginBottom: '40px',
            }}
          >
            {filteredKelas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '2px dashed #E5E7EB',
                }}
              >
                <BookOpen size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                  Tidak ada kelas yang ditemukan
                </p>
              </motion.div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '24px',
                  justifyItems: 'center',
                }}
              >
                {filteredKelas.map((kelas, index) => (
                  <motion.div
                    key={kelas.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      href={`/guru/penilaian-hafalan/${kelas.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="group"
                        style={{
                          width: '220px',
                          height: '160px',
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          padding: '20px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #ECFDF5 0%, #FEF3C7 100%)';
                          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(5, 150, 105, 0.15)';
                          e.currentTarget.style.borderColor = '#10B981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                      >
                        {/* Ikon Buku */}
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                            transition: 'transform 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                          }}
                        >
                          <BookOpen size={30} style={{ color: 'white' }} />
                        </div>

                        {/* Nama Kelas */}
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#065F46',
                            margin: 0,
                            marginBottom: '8px',
                            textAlign: 'center',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          {kelas.nama}
                        </h3>

                        {/* Link Text */}
                        <p
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#F59E0B',
                            margin: 0,
                            fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline';
                            e.currentTarget.style.color = '#D97706';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none';
                            e.currentTarget.style.color = '#F59E0B';
                          }}
                        >
                          Lihat Kelas →
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Tips & Catatan di Bawah */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              textAlign: 'center',
              padding: '16px 20px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '10px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#065F46',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              💡 <strong>Tips:</strong> Klik salah satu kelas untuk membuka halaman penilaian
              hafalan siswa.
            </p>
          </motion.div>
        </div>

      {/* Close Background Gradient Container */}
      </div>
    </GuruLayout>
  );
}
