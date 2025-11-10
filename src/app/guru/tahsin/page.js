'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { Volume2, Search, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TahsinIndexPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchKelas();
    }
  }, [session]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/guru/kelas');
      if (response.ok) {
        const data = await response.json();
        setKelasList(data.kelas || []);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter kelas berdasarkan search query
  const filteredKelas = kelasList.filter(kelas =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GuruLayout>
      {/* Background Gradient Container */}
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50" style={{ margin: '-32px', padding: '32px' }}>
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
                background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Volume2 size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#5B21B6',
                  margin: 0,
                  marginBottom: '4px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Tahsin Al-Qur'an
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pencatatan progres bacaan dan latihan tajwid siswa.
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
                  e.target.style.borderColor = '#8B5CF6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '16px', color: '#6B7280' }}>Memuat data kelas...</div>
            </div>
          )}

          {/* Grid Card Kelas */}
          {!loading && (
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
                  transition={{ duration: 0.5 }}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <BookOpen size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
                    {searchQuery ? 'Tidak ada kelas yang ditemukan' : 'Belum ada kelas tersedia'}
                  </p>
                </motion.div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {filteredKelas.map((kelas, index) => (
                    <motion.div
                      key={kelas.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link
                        href={`/guru/tahsin/${kelas.id}`}
                        style={{
                          display: 'block',
                          background: 'white',
                          borderRadius: '12px',
                          padding: '24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s',
                          textDecoration: 'none',
                          color: 'inherit',
                          border: '2px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.2)';
                          e.currentTarget.style.borderColor = '#8B5CF6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                          }}
                        >
                          <Volume2 size={24} style={{ color: 'white' }} />
                        </div>

                        {/* Nama Kelas */}
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 8px 0',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          {kelas.nama}
                        </h3>

                        {/* Info Jumlah Siswa */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '12px',
                          }}
                        >
                          <Users size={16} style={{ color: '#8B5CF6' }} />
                          <span
                            style={{
                              fontSize: '14px',
                              color: '#6B7280',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {kelas._count?.siswa || 0} Siswa
                          </span>
                        </div>

                        {/* Tahun Ajaran Info */}
                        {kelas.tahunAjaran && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              background: '#F5F3FF',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#7C3AED',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: '500',
                            }}
                          >
                            {kelas.tahunAjaran.nama}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}
