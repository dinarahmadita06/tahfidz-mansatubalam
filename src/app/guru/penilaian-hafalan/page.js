'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { BookOpen, Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PenilaianHafalanIndexPage() {
  const [kelasBinaan, setKelasBinaan] = useState([]);
  const [semuaKelas, setSemuaKelas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllKelas, setShowAllKelas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch kelas binaan dan semua kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setLoading(true);

        // Fetch kelas binaan dari /api/guru/kelas
        const resBinaan = await fetch('/api/guru/kelas');
        const dataBinaan = await resBinaan.json();
        setKelasBinaan(dataBinaan.kelas || []);

        // Fetch semua kelas dari /api/kelas?showAll=true
        const resAll = await fetch('/api/kelas?showAll=true');
        const dataAll = await resAll.json();
        setSemuaKelas(dataAll || []);
      } catch (error) {
        console.error('Error fetching kelas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, []);

  // Filter kelas non-binaan berdasarkan search query
  const filteredSemuaKelas = semuaKelas.filter(kelas =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if kelas is in kelasBinaan
  const isKelasBinaan = (kelasId) => {
    return kelasBinaan.some(k => k.id === kelasId);
  };

  // Handle kelas click
  const handleKelasClick = (e, kelas) => {
    if (!isKelasBinaan(kelas.id)) {
      e.preventDefault();
      setSelectedKelas(kelas);
      setShowConfirmation(true);
    }
  };

  // Component for rendering kelas card
  const KelasCard = ({ kelas, index, onClick }) => (
    <motion.div
      key={kelas.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/guru/penilaian-hafalan/${kelas.id}`}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onClick && onClick(e, kelas)}
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
            e.currentTarget.style.background = 'linear-gradient(135deg, #ECFDF5 0%, #FEF3C7 100%)';
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
          >
            <BookOpen size={30} style={{ color: 'white' }} />
          </div>
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
          <p
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#F59E0B',
              margin: 0,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Lihat Kelas →
          </p>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <GuruLayout>
      {/* Background Gradient Container */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50" style={{ margin: '-32px', padding: '32px' }}>
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
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Pilih kelas untuk melihat dan menilai hafalan siswa.
              </p>
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                Memuat data kelas...
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Kelas Binaan (Default Terbuka) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginBottom: '32px' }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#065F46',
                    marginBottom: '16px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Kelas Binaan Saya
                </h2>

                {kelasBinaan.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px dashed #E5E7EB',
                    }}
                  >
                    <BookOpen size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                      Anda belum memiliki kelas binaan
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '24px',
                      justifyItems: 'center',
                    }}
                  >
                    {kelasBinaan.map((kelas, index) => (
                      <KelasCard key={kelas.id} kelas={kelas} index={index} />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Pembatas Visual dengan Expand/Collapse */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ marginBottom: '32px' }}
              >
                <div
                  onClick={() => setShowAllKelas(!showAllKelas)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: '1px solid #E5E7EB',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {showAllKelas ? (
                        <ChevronUp size={20} style={{ color: '#10B981' }} />
                      ) : (
                        <ChevronDown size={20} style={{ color: '#6B7280' }} />
                      )}
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: showAllKelas ? '#10B981' : '#6B7280',
                          fontFamily: 'Poppins, sans-serif',
                        }}
                      >
                        {showAllKelas ? 'Sembunyikan' : 'Tampilkan'} Semua Kelas
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#9CA3AF',
                        margin: '4px 0 0 28px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      Untuk menggantikan guru lain atau mengisi kelas di luar kelas binaan
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Section 2: Semua Kelas (Default Tertutup) */}
              <AnimatePresence>
                {showAllKelas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Search Bar untuk Semua Kelas */}
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
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
                            fontFamily: 'Poppins, sans-serif',
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
                    </div>

                    {/* Grid Semua Kelas */}
                    {filteredSemuaKelas.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          background: 'white',
                          borderRadius: '12px',
                          border: '2px dashed #E5E7EB',
                        }}
                      >
                        <BookOpen size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                          Tidak ada kelas yang ditemukan
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '24px',
                          justifyItems: 'center',
                        }}
                      >
                        {filteredSemuaKelas.map((kelas, index) => (
                          <KelasCard
                            key={kelas.id}
                            kelas={kelas}
                            index={index}
                            onClick={handleKelasClick}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tips */}
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
                  margin: '32px auto 0',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: '#065F46',
                    margin: 0,
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  💡 <strong>Tips:</strong> Kelas binaan adalah kelas yang telah ditetapkan oleh Admin untuk Anda.
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Kelas Non-Binaan */}
      <AnimatePresence>
        {showConfirmation && selectedKelas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={28} style={{ color: '#F59E0B' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1F2937',
                      margin: '0 0 8px 0',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Konfirmasi Akses Kelas
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#6B7280',
                      margin: 0,
                      lineHeight: '1.6',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    <strong style={{ color: '#1F2937' }}>{selectedKelas.nama}</strong> bukan kelas binaan yang telah ditetapkan oleh Admin.
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#F59E0B',
                      margin: '12px 0 0 0',
                      lineHeight: '1.6',
                      fontFamily: 'Poppins, sans-serif',
                      background: '#FEF3C7',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    Pastikan Anda sedang bertugas menggantikan guru kelas tersebut sebelum melanjutkan.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowConfirmation(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#F9FAFB';
                    e.target.style.borderColor = '#9CA3AF';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#D1D5DB';
                  }}
                >
                  Batal
                </button>
                <Link href={`/guru/penilaian-hafalan/${selectedKelas.id}`} style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Ya, Lanjutkan
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GuruLayout>
  );
}
