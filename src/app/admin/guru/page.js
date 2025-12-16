'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, Users, UserCheck, UserX, GraduationCap, RefreshCw, Upload } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Islamic Modern Color Palette (sama dengan Dashboard)
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
    light: '#A3E4D7', // Custom untuk status Aktif
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
    light: '#FFD580', // Custom untuk status Non-Aktif
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
            fontFamily: '"Poppins", system-ui, sans-serif',
            letterSpacing: '0.3px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", system-ui, sans-serif',
            lineHeight: '1.1',
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminGuruPage() {
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    jenisKelamin: 'L',
    alamat: ''
  });

  useEffect(() => {
    fetchGuru();
  }, []);

  const fetchGuru = async () => {
    try {
      const response = await fetch('/api/guru');
      const data = await response.json();
      setGuru(data);
    } catch (error) {
      console.error('Error fetching guru:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingGuru ? `/api/guru/${editingGuru.id}` : '/api/guru';
      const method = editingGuru ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingGuru ? 'Guru berhasil diupdate' : 'Guru berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data guru');
      }
    } catch (error) {
      console.error('Error saving guru:', error);
      alert('Gagal menyimpan data guru');
    }
  };

  const handleEdit = (guruItem) => {
    setEditingGuru(guruItem);
    setFormData({
      name: guruItem.user.name,
      email: guruItem.user.email,
      password: '',
      nip: guruItem.nip || '',
      jenisKelamin: guruItem.jenisKelamin,
      alamat: guruItem.alamat || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus guru ini?')) return;

    try {
      const response = await fetch(`/api/guru/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Guru berhasil dihapus');
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus guru');
      }
    } catch (error) {
      console.error('Error deleting guru:', error);
      alert('Gagal menghapus guru');
    }
  };

  // Note: isActive field is not available in User model
  // Keeping this function for future implementation if needed
  const handleToggleActive = async (id, currentStatus) => {
    alert('Fitur aktivasi/nonaktifkan guru belum tersedia. Semua guru aktif secara default.');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      nip: '',
      jenisKelamin: 'L',
      alamat: ''
    });
    setEditingGuru(null);
  };

  // Generate email from name
  const generateEmail = () => {
    if (!formData.name) {
      alert('Masukkan nama terlebih dahulu');
      return;
    }
    // Ambil kata pertama dari nama
    const firstName = formData.name.trim().split(' ')[0].toLowerCase();
    // Format: guru.{firstName}@tahfidz.sch.id
    const generatedEmail = `guru.${firstName}@tahfidz.sch.id`;
    setFormData({ ...formData, email: generatedEmail });
  };

  // Generate 6 digit random password
  const generatePassword = () => {
    // Generate random 6 digit number
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData({ ...formData, password });
  };


  // Filter data
  const filteredGuru = Array.isArray(guru) ? guru.filter(g => {
    const matchSearch = g.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.nip && g.nip.includes(searchTerm));

    // Since we don't have isActive field, treat all guru as active
    const matchFilter = filterStatus === 'all' || filterStatus === 'active';

    return matchSearch && matchFilter;
  }) : [];

  // Statistics
  const stats = {
    total: Array.isArray(guru) ? guru.length : 0,
    active: Array.isArray(guru) ? guru.length : 0,
    inactive: 0,
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
        {/* ... existing code ... */}

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 48px 24px',
          borderBottom: `1px solid ${colors.gray[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 1,
        }} className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexDirection: 'column', gap: '16px' }} className="header-container sm:flex-row sm:gap-0">
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Manajemen Guru
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Kelola data guru tahfidz dengan mudah dan efisien
              </p>
            </div>

            {/* Action Buttons - Two Row Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }} className="action-buttons-container">
              {/* Row 1: Tambah Guru Button - Full Width */}
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 147, 111, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.2)';
                }}
              >
                <UserPlus size={18} />
                <span>Tambah Guru</span>
              </button>

              {/* Row 2: Import & Export Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                {/* Import Button */}
                <button
                  onClick={() => setShowImportModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    background: colors.white,
                    color: colors.emerald[600],
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    flex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = colors.emerald[50];
                    e.currentTarget.style.borderColor = colors.emerald[300];
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = colors.white;
                    e.currentTarget.style.borderColor = colors.emerald[200];
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  <Upload size={16} />
                  <span>Import</span>
                </button>

                {/* Export Button */}
                <button
                  onClick={() => {
                    // Export implementation
                    const csvContent = [
                      ['Nama Lengkap', 'Email', 'NIP', 'Status', 'Tanggal Bergabung'],
                      ...filteredGuru.map(g => [
                        g.user.name,
                        g.user.email,
                        g.nip || '-',
                        'Aktif',
                        new Date(g.user.createdAt).toLocaleDateString('id-ID')
                      ])
                    ].map(row => row.join(',')).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `data-guru-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    background: colors.white,
                    color: colors.amber[600],
                    border: `2px solid ${colors.amber[200]}`,
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    flex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = colors.amber[50];
                    e.currentTarget.style.borderColor = colors.amber[300];
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = colors.white;
                    e.currentTarget.style.borderColor = colors.amber[200];
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1 }} className="page-main-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              <StatCard
                icon={<Users size={24} color={colors.white} />}
                title="Total Guru"
                value={stats.total}
                subtitle="Total guru terdaftar"
                color="emerald"
              />
              <StatCard
                icon={<UserCheck size={24} color={colors.white} />}
                title="Guru Aktif"
                value={stats.active}
                subtitle="Guru yang aktif mengajar"
                color="blue"
              />
              <StatCard
                icon={<UserX size={24} color={colors.white} />}
                title="Guru Non-Aktif"
                value={stats.inactive}
                subtitle="Guru yang tidak aktif"
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
              animation: 'fadeInUp 0.6s ease-out 0.1s both',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
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
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Cari Guru
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
                      placeholder="Cari berdasarkan nama, email, atau NIP..."
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="search-input"
                    />
                  </div>
                </div>

                {/* Filter Status */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Filter Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: '160px',
                      transition: 'all 0.3s ease',
                    }}
                    className="filter-select"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Kelas Binaan
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.emerald[700],
                        fontFamily: '"Poppins", system-ui, sans-serif',
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
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
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuru.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: colors.text.tertiary,
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                        }}>
                          Tidak ada data guru yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredGuru.map((guruItem, index) => (
                        <tr
                          key={guruItem.id}
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
                                fontFamily: '"Poppins", system-ui, sans-serif',
                              }}>
                                {guruItem.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  fontFamily: '"Poppins", system-ui, sans-serif',
                                  marginBottom: '2px',
                                }}>
                                  {guruItem.user.name}
                                </div>
                                {guruItem.nip && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: colors.text.tertiary,
                                    fontFamily: '"Poppins", system-ui, sans-serif',
                                  }}>
                                    NIP: {guruItem.nip}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{
                            padding: '20px 24px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {guruItem.user.email}
                          </td>
                          <td style={{
                            padding: '20px 24px',
                          }}>
                            {guruItem.kelasGuru && guruItem.kelasGuru.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {guruItem.kelasGuru.map((kg) => (
                                  <span
                                    key={kg.id}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      borderRadius: '8px',
                                      background: `${colors.emerald[500]}15`,
                                      color: colors.emerald[700],
                                      fontFamily: '"Poppins", system-ui, sans-serif',
                                    }}
                                  >
                                    <GraduationCap size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {kg.kelas.nama}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{
                                fontSize: '13px',
                                color: colors.text.tertiary,
                                fontFamily: '"Poppins", system-ui, sans-serif',
                              }}>
                                Belum ada kelas
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <span
                              style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                border: 'none',
                                background: colors.emerald.light,
                                color: colors.emerald[700],
                                fontFamily: '"Poppins", system-ui, sans-serif',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                display: 'inline-block',
                              }}
                              className="status-badge"
                            >
                              Aktif
                            </span>
                          </td>
                          <td style={{
                            padding: '20px 24px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {new Date(guruItem.user.createdAt).toLocaleDateString('id-ID', {
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
                                onClick={() => handleEdit(guruItem)}
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
                                onClick={() => handleDelete(guruItem.id)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
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
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Email *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                      placeholder="guru.nama@tahfidz.sch.id"
                    />
                    <button
                      type="button"
                      onClick={generateEmail}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      className="generate-btn"
                      title="Generate email otomatis"
                    >
                      <RefreshCw size={16} color={colors.white} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Password {editingGuru ? '(kosongkan jika tidak diubah)' : '*'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required={!editingGuru}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                      placeholder="6 digit angka"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      className="generate-btn"
                      title="Generate password 6 digit"
                    >
                      <RefreshCw size={16} color={colors.white} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    NIP
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Jenis Kelamin *
                  </label>
                  <select
                    required
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    className="form-input"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Alamat
                </label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical',
                  }}
                  className="form-input"
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    background: colors.white,
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  className="cancel-btn"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                  }}
                  className="submit-btn"
                >
                  {editingGuru ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
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
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        /* Generate Button Hover */
        .generate-btn:hover {
          transform: translateY(-50%) scale(1.1) rotate(180deg);
          box-shadow: 0 4px 12px rgba(26, 147, 111, 0.3) !important;
        }

        /* Button Hover Effects */
        .export-btn:hover {
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
        .filter-select:focus,
        .form-input:focus {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${colors.emerald[500]}20 !important;
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.emerald[50]}40 !important;
        }

        /* Status Badge Hover */
        .status-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
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
          
          .page-header {
            padding: 24px 16px 20px !important;
          }
          
          .page-main-content {
            padding: 24px 16px 32px !important;
          }

          .header-container {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .header-container div:last-child {
            width: 100%;
          }
        }

        @media (min-width: 640px) {
          .header-container {
            flex-direction: row !important;
            gap: 0 !important;
          }
        }

        /* Responsive Action Buttons - Desktop: 1 row, Mobile: 2 rows */
        @media (max-width: 768px) {
          /* Mobile: Keep 2-row layout */
          .action-buttons-container {
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
        }

        @media (min-width: 769px) {
          /* Desktop: Change to 1-row layout with small buttons */
          .action-buttons-container {
            flex-direction: row !important;
            gap: 8px !important;
            width: auto !important;
          }

          /* Tambah button on desktop - smaller width */
          .action-buttons-container > button:first-child {
            width: auto !important;
            padding: 8px 14px !important;
            font-size: 13px !important;
          }

          /* Import/Export row on desktop - auto layout */
          .action-buttons-container > div {
            width: auto !important;
            flex-direction: row !important;
          }

          .action-buttons-container > div > button {
            flex: 0 1 auto !important;
            min-width: 110px !important;
          }
        }

        /* Toolbar button spacing */
        .page-header div[style*="gap: '12px'"] {
          gap: 8px !important;
        }
      `}</style>
    </AdminLayout>
  );
}
