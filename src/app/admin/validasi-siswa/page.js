'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Users, Clock, UserCheck, Search, FileText } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Islamic Modern Color Palette
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
    bright: '#A3E4D7', // Custom untuk status Divalidasi
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
    light: '#FFD78C', // Custom untuk status Menunggu
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    pastel: '#FFB3A7', // Custom untuk status Ditolak
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
};

// Toast Notification Component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? colors.emerald[500] : colors.red[500];
  const icon = type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: bgColor,
      color: colors.white,
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      animation: 'slideInRight 0.3s ease-out',
      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: '14px',
    }}>
      {icon}
      {message}
    </div>
  );
}

// Komponen StatCard
function StatCard({ icon, title, value, subtitle, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    amber: {
      bg: `linear-gradient(135deg, ${colors.amber[100]} 0%, ${colors.amber[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[600],
      border: colors.amber[200],
    },
    blue: {
      bg: `linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)`,
      iconBg: `linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)`,
      value: '#1E40AF',
      border: '#BFDBFE',
    },
  };

  const scheme = colorMap[color];

  return (
    <div style={{
      background: scheme.bg,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
      animation: 'fadeInUp 0.6s ease-out',
    }}
    className="stats-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '6px',
            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            letterSpacing: '0.3px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            lineHeight: '1.1',
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ValidasiSiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, PENDING, APPROVED, REJECTED
  const [filterKelas, setFilterKelas] = useState('all');
  const [kelas, setKelas] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSiswa();
    fetchKelas();
  }, []);

  const fetchSiswa = async () => {
    try {
      const response = await fetch('/api/admin/siswa');
      const data = await response.json();
      setSiswa(data);
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const handleViewDetail = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setShowDetailModal(true);
  };

  const handleApproveClick = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setShowApproveModal(true);
  };

  const handleRejectClick = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          action: 'approve',
        }),
      });

      if (response.ok) {
        setShowApproveModal(false);
        setToast({ message: 'Siswa berhasil disetujui!', type: 'success' });
        fetchSiswa();
      } else {
        const error = await response.json();
        setToast({ message: error.error || 'Gagal menyetujui siswa', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving siswa:', error);
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setToast({ message: 'Mohon masukkan alasan penolakan', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId: selectedSiswa.id,
          action: 'reject',
          rejectionReason,
        }),
      });

      if (response.ok) {
        setShowRejectModal(false);
        setRejectionReason('');
        setToast({ message: 'Siswa berhasil ditolak', type: 'success' });
        fetchSiswa();
      } else {
        const error = await response.json();
        setToast({ message: error.error || 'Gagal menolak siswa', type: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting siswa:', error);
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    }
  };

  // Filter data
  const filteredSiswa = siswa.filter(s => {
    const matchSearch = s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchTerm));

    const matchStatus = filterStatus === 'all' || s.validasiStatus === filterStatus;

    const matchKelas = filterKelas === 'all' ||
      (s.kelasId && s.kelasId.toString() === filterKelas);

    return matchSearch && matchStatus && matchKelas;
  });

  // Statistics
  const stats = {
    total: siswa.length,
    pending: siswa.filter(s => s.validasiStatus === 'PENDING').length,
    approved: siswa.filter(s => s.validasiStatus === 'APPROVED').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Subtle Pattern Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%231A936F' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23F7C873' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 48px 24px',
          borderBottom: `1px solid ${colors.gray[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }} className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Validasi Siswa
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Verifikasi dan kelola akun siswa baru tahfidz
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 2 }} className="page-main-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              <StatCard
                icon={<Users size={24} color={colors.white} />}
                title="Total Pendaftar"
                value={stats.total}
                subtitle="Total siswa terdaftar"
                color="blue"
              />
              <StatCard
                icon={<Clock size={24} color={colors.white} />}
                title="Menunggu Validasi"
                value={stats.pending}
                subtitle="Perlu direview"
                color="amber"
              />
              <StatCard
                icon={<UserCheck size={24} color={colors.white} />}
                title="Sudah Divalidasi"
                value={stats.approved}
                subtitle="Siswa aktif"
                color="emerald"
              />
            </div>

            {/* Search & Filter Section */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[100]}`,
              animation: 'fadeInUp 0.6s ease-out 0.1s both',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '16px',
                alignItems: 'end',
              }}>
                {/* Search Input */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Cari Siswa
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.text.tertiary
                      }}
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama, email, atau NISN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: '16px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="search-input"
                    />
                  </div>
                </div>

                {/* Filter Kelas */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Filter Kelas
                  </label>
                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="filter-select"
                  >
                    <option value="all">Semua Kelas</option>
                    {kelas.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Status */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Filter Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="filter-select"
                  >
                    <option value="all">Semua Status</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="APPROVED">Divalidasi</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[100]}`,
              overflow: 'hidden',
              animation: 'fadeInUp 0.6s ease-out 0.2s both',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.emerald[100]} 100%)`,
                    }}>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Nama Lengkap
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Email
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Kelas Tujuan
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Status
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Tanggal Pendaftaran
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSiswa.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: colors.text.tertiary,
                          fontSize: '14px',
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        }}>
                          Tidak ada data siswa yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredSiswa.map((siswaItem, index) => {
                        const getStatusStyle = () => {
                          switch (siswaItem.validasiStatus) {
                            case 'APPROVED':
                              return {
                                bg: colors.emerald.bright,
                                color: colors.emerald[700],
                                label: 'Divalidasi'
                              };
                            case 'REJECTED':
                              return {
                                bg: colors.red.pastel,
                                color: colors.red[700],
                                label: 'Ditolak'
                              };
                            default:
                              return {
                                bg: colors.amber.light,
                                color: colors.amber[700],
                                label: 'Menunggu'
                              };
                          }
                        };

                        const statusStyle = getStatusStyle();

                        return (
                          <tr
                            key={siswaItem.id}
                            style={{
                              borderBottom: `1px solid ${colors.gray[100]}`,
                              transition: 'all 0.2s ease',
                              animation: `fadeInUp 0.4s ease-out ${0.3 + (index * 0.05)}s both`,
                            }}
                            className="table-row"
                          >
                            <td style={{
                              padding: '20px 24px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '12px',
                                  background: `linear-gradient(135deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: colors.white,
                                  fontWeight: 700,
                                  fontSize: '16px',
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                }}>
                                  {siswaItem.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                    marginBottom: '2px',
                                  }}>
                                    {siswaItem.user.name}
                                  </div>
                                  {siswaItem.nisn && (
                                    <div style={{
                                      fontSize: '12px',
                                      color: colors.text.tertiary,
                                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                    }}>
                                      NISN: {siswaItem.nisn}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{
                              padding: '20px 24px',
                              fontSize: '14px',
                              color: colors.text.secondary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            }}>
                              {siswaItem.user.email}
                            </td>
                            <td style={{
                              padding: '20px 24px',
                              fontSize: '14px',
                              color: colors.text.secondary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            }}>
                              {siswaItem.kelas?.namaKelas || '-'}
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                              <span style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                display: 'inline-block',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              }}>
                                {statusStyle.label}
                              </span>
                            </td>
                            <td style={{
                              padding: '20px 24px',
                              fontSize: '14px',
                              color: colors.text.secondary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            }}>
                              {new Date(siswaItem.user.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}>
                                <button
                                  onClick={() => handleViewDetail(siswaItem)}
                                  style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: `${colors.emerald[500]}15`,
                                    color: colors.emerald[600],
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  className="action-btn-view"
                                  title="Lihat Detail"
                                >
                                  <Eye size={16} />
                                </button>
                                {siswaItem.validasiStatus === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveClick(siswaItem)}
                                      style={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: `${colors.emerald[500]}15`,
                                        color: colors.emerald[600],
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      className="action-btn-approve"
                                      title="Setujui"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectClick(siswaItem)}
                                      style={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#FEE2E2',
                                        color: '#DC2626',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      className="action-btn-reject"
                                      title="Tolak"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetailModal && selectedSiswa && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.emerald[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Detail Siswa
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: colors.text.tertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'all 0.2s ease',
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Nama Lengkap
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.user.name}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Email
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.user.email}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  NISN
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.nisn || '-'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Kelas
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.kelas?.namaKelas || '-'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Jenis Kelamin
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Tanggal Lahir
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.tanggalLahir ? new Date(selectedSiswa.tanggalLahir).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Status Validasi
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedSiswa.validasiStatus === 'APPROVED' ? 'Divalidasi' :
                   selectedSiswa.validasiStatus === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approve Confirmation */}
      {showApproveModal && selectedSiswa && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.emerald[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <CheckCircle size={32} color={colors.white} />
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                marginBottom: '8px',
              }}>
                Setujui Siswa?
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Anda akan menyetujui pendaftaran <strong>{selectedSiswa.user.name}</strong>. Siswa akan mendapatkan akses ke sistem.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowApproveModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                }}
                className="submit-btn"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject Confirmation */}
      {showRejectModal && selectedSiswa && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.red[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.red[400]} 0%, ${colors.red[600]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <XCircle size={32} color={colors.white} />
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                marginBottom: '8px',
              }}>
                Tolak Siswa?
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                marginBottom: '20px',
              }}>
                Anda akan menolak pendaftaran <strong>{selectedSiswa.user.name}</strong>. Mohon berikan alasan penolakan.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: colors.text.secondary,
                marginBottom: '8px',
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Alasan Penolakan *
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  resize: 'vertical',
                }}
                className="form-input"
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.red[500]} 0%, ${colors.red[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                }}
                className="submit-btn-danger"
              >
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Keyframe Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Stats Card Hover */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        /* Input Focus */
        .search-input:focus,
        .filter-select:focus,
        .form-input:focus {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${colors.emerald[500]}20 !important;
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.emerald[50]}40 !important;
        }

        /* Action Button Hover */
        .action-btn-view:hover,
        .action-btn-approve:hover {
          background: ${colors.emerald[500]}30 !important;
          transform: scale(1.1);
        }

        .action-btn-reject:hover {
          background: #FEE2E2 !important;
          transform: scale(1.1);
        }

        /* Modal Close Button Hover */
        .close-btn:hover {
          color: ${colors.text.primary} !important;
          transform: rotate(90deg);
        }

        /* Form Button Hover */
        .cancel-btn:hover {
          background: ${colors.gray[50]} !important;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }

        .submit-btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
          
          .page-header {
            padding: 24px 16px 20px !important;
          }
          
          .page-main-content {
            padding: 24px 16px 32px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
