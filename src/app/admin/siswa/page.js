'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Upload, Search, Edit, Trash2, Users, UserCheck, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Islamic Modern Color Palette (sama dengan Dashboard & Guru)
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
    mint: '#B4E8C1', // Custom untuk status Aktif
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
    light: '#FFD78C', // Custom untuk Belum Divalidasi
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
      bg: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
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
      animation: 'slideInUp 0.6s ease-out',
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

export default function AdminSiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, unvalidated
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nisn: '',
    jenisKelamin: 'L',
    tanggalLahir: '',
    kelasId: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement tambah siswa
    alert('Fitur tambah siswa akan segera tersedia. Silakan gunakan menu Kelas → Kelola Siswa untuk menambah siswa.');
    setShowModal(false);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    // TODO: Implement import CSV
    alert('Fitur import CSV akan segera tersedia.');
    setShowImportModal(false);
  };

  const handleEdit = (siswaItem) => {
    // TODO: Implement edit
    alert('Untuk mengedit data siswa lengkap, gunakan menu Kelas → Kelola Siswa');
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;
    // TODO: Implement delete
    alert('Fitur hapus akan segera tersedia.');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      nisn: '',
      jenisKelamin: 'L',
      tanggalLahir: '',
      kelasId: '',
    });
    setEditingSiswa(null);
  };

  // Filter data
  const filteredSiswa = siswa.filter(s => {
    const matchSearch = s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchTerm));

    const matchKelas = filterKelas === 'all' ||
      (s.kelasId && s.kelasId.toString() === filterKelas);

    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && s.user.isActive && s.validasiStatus === 'APPROVED') ||
      (filterStatus === 'unvalidated' && s.validasiStatus !== 'APPROVED');

    return matchSearch && matchKelas && matchStatus;
  });

  // Calculate total hafalan for each siswa
  const getSiswaHafalan = (siswaItem) => {
    if (!siswaItem.hafalanSiswa || siswaItem.hafalanSiswa.length === 0) return 0;

    // Count unique juz from hafalan
    const uniqueJuz = new Set(
      siswaItem.hafalanSiswa
        .filter(h => h.status === 'APPROVED')
        .map(h => h.juz)
    );
    return uniqueJuz.size;
  };

  // Statistics
  const stats = {
    total: siswa.length,
    active: siswa.filter(s => s.user.isActive && s.validasiStatus === 'APPROVED').length,
    unvalidated: siswa.filter(s => s.validasiStatus !== 'APPROVED').length,
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
        }}>
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
                Manajemen Siswa
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Kelola data siswa tahfidz dengan mudah dan efisien
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowImportModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: colors.white,
                  color: colors.emerald[600],
                  border: `2px solid ${colors.emerald[500]}`,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
                className="import-btn"
              >
                <Upload size={18} />
                Import dari CSV
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                }}
                className="add-btn"
              >
                <UserPlus size={18} />
                Tambah Siswa
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              <StatCard
                icon={<Users size={24} color={colors.white} />}
                title="Total Siswa"
                value={stats.total}
                subtitle="Total siswa terdaftar"
                color="emerald"
              />
              <StatCard
                icon={<UserCheck size={24} color={colors.white} />}
                title="Siswa Aktif"
                value={stats.active}
                subtitle="Siswa tervalidasi dan aktif"
                color="blue"
              />
              <StatCard
                icon={<AlertCircle size={24} color={colors.white} />}
                title="Belum Divalidasi"
                value={stats.unvalidated}
                subtitle="Menunggu validasi"
                color="amber"
              />
            </div>

            {/* Search & Filter Section */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[100]}`,
              animation: 'slideInUp 0.6s ease-out 0.1s both',
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
                    <option value="active">Aktif</option>
                    <option value="unvalidated">Belum Divalidasi</option>
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
              animation: 'slideInUp 0.6s ease-out 0.2s both',
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
                        Kelas
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
                        Total Hafalan
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
                        Tanggal Bergabung
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
                        <td colSpan="7" style={{
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
                        const totalHafalan = getSiswaHafalan(siswaItem);
                        const isValidated = siswaItem.validasiStatus === 'APPROVED';

                        return (
                          <tr
                            key={siswaItem.id}
                            style={{
                              borderBottom: `1px solid ${colors.gray[100]}`,
                              transition: 'all 0.2s ease',
                              animation: `slideInUp 0.4s ease-out ${0.3 + (index * 0.05)}s both`,
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
                            }}>
                              {siswaItem.kelas ? (
                                <span style={{
                                  padding: '6px 12px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  background: `${colors.emerald[500]}15`,
                                  color: colors.emerald[700],
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}>
                                  <GraduationCap size={14} />
                                  {siswaItem.kelas.namaKelas}
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '13px',
                                  color: colors.text.tertiary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                }}>
                                  Belum ada kelas
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                              <span style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                background: isValidated ? colors.emerald.mint : colors.amber.light,
                                color: isValidated ? colors.emerald[700] : colors.amber[700],
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                display: 'inline-block',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              }}>
                                {isValidated ? 'Aktif' : 'Belum Divalidasi'}
                              </span>
                            </td>
                            <td style={{
                              padding: '20px 24px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}>
                                <BookOpen size={16} color={colors.emerald[600]} />
                                <span style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                }}>
                                  {totalHafalan} Juz
                                </span>
                              </div>
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
                                  onClick={() => handleEdit(siswaItem)}
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
                                  className="action-btn-edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(siswaItem.id)}
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
                                  className="action-btn-delete"
                                >
                                  <Trash2 size={16} />
                                </button>
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

      {/* Modal Tambah Siswa */}
      {showModal && (
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
                Tambah Siswa Baru
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
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

            <div style={{
              background: colors.amber[50],
              border: `2px solid ${colors.amber[200]}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                <strong>Catatan:</strong> Untuk menambah siswa, silakan gunakan menu{' '}
                <strong>Kelas → Kelola Siswa</strong> untuk manajemen yang lebih lengkap.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                style={{
                  width: '100%',
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
                Lanjut ke Menu Kelas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import CSV */}
      {showImportModal && (
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
                Import Data Siswa dari CSV
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
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

            <div style={{
              background: colors.amber[50],
              border: `2px solid ${colors.amber[200]}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Fitur import CSV akan segera tersedia. Saat ini, silakan tambahkan siswa satu per satu
                melalui menu <strong>Kelas → Kelola Siswa</strong>.
              </p>
            </div>

            <form onSubmit={handleImport}>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{
                  width: '100%',
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
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Keyframe Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        /* Button Hover Effects */
        .import-btn:hover {
          background: ${colors.emerald[50]} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.15) !important;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 147, 111, 0.3) !important;
        }

        /* Input Focus */
        .search-input:focus,
        .filter-select:focus {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${colors.emerald[500]}20 !important;
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.emerald[50]}40 !important;
        }

        /* Action Button Hover */
        .action-btn-edit:hover {
          background: ${colors.emerald[500]}30 !important;
          transform: scale(1.1);
        }

        .action-btn-delete:hover {
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

        /* Responsive */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
