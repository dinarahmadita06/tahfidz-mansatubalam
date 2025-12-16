'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Download, Search, Edit, Trash2, Users, UserCheck, UserX, Heart, Upload } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Islamic Modern Color Palette dengan variasi Violet & Gold
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
  },
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    pastel: '#E5D4FF', // Custom untuk status Terhubung
  },
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    light: '#FFD580', // Custom untuk status Belum Terhubung
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
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

// Komponen StatCard dengan efek glowing
function StatCard({ icon, title, value, subtitle, color = 'violet' }) {
  const colorMap = {
    violet: {
      bg: `linear-gradient(135deg, ${colors.violet[100]} 0%, ${colors.violet[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
      value: colors.violet[700],
      border: colors.violet[200],
      glow: colors.violet[400],
    },
    gold: {
      bg: `linear-gradient(135deg, ${colors.gold[100]} 0%, ${colors.gold[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.gold[400]} 0%, ${colors.gold[500]} 100%)`,
      value: colors.gold[600],
      border: colors.gold[200],
      glow: colors.gold[400],
    },
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
      glow: colors.emerald[400],
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
    className="stats-card"
    data-glow-color={scheme.glow}>
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

export default function AdminOrangTuaPage() {
  const [orangTua, setOrangTua] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, connected, disconnected
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingOrangTua, setEditingOrangTua] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    noHP: '',
    pekerjaan: '',
    alamat: '',
  });

  useEffect(() => {
    fetchOrangTua();
  }, []);

  const fetchOrangTua = async () => {
    try {
      const response = await fetch('/api/admin/orangtua?page=1&limit=1000');
      const result = await response.json();
      setOrangTua(result.data || []);
    } catch (error) {
      console.error('Error fetching orang tua:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingOrangTua ? `/api/admin/orangtua/${editingOrangTua.id}` : '/api/admin/orangtua';
      const method = editingOrangTua ? 'PUT' : 'POST';

      const submitData = { ...formData };
      if (editingOrangTua && !showPasswordField) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingOrangTua ? 'Orang tua berhasil diupdate' : 'Orang tua berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchOrangTua();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data orang tua');
      }
    } catch (error) {
      console.error('Error saving orang tua:', error);
      alert('Gagal menyimpan data orang tua');
    }
  };

  const handleEdit = (orangTuaItem) => {
    setEditingOrangTua(orangTuaItem);
    setFormData({
      name: orangTuaItem.user.name,
      email: orangTuaItem.user.email,
      password: '',
      noHP: orangTuaItem.noHP || '',
      pekerjaan: orangTuaItem.pekerjaan || '',
      alamat: orangTuaItem.alamat || '',
    });
    setShowPasswordField(false);
    setShowModal(true);
  };

  const handleDelete = async (orangTuaItem) => {
    const childrenCount = orangTuaItem._count?.siswa || 0;
    let confirmMessage = 'Yakin ingin menghapus orang tua ini?';

    if (childrenCount > 0) {
      confirmMessage = `Orang tua ini memiliki ${childrenCount} anak terhubung. Jika dihapus, koneksi dengan anak-anak akan diputus. Yakin ingin melanjutkan?`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/admin/orangtua/${orangTuaItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Orang tua berhasil dihapus');
        fetchOrangTua();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus orang tua');
      }
    } catch (error) {
      console.error('Error deleting orang tua:', error);
      alert('Gagal menghapus orang tua');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nama Lengkap', 'Email', 'No HP', 'Pekerjaan', 'Anak Terhubung', 'Status Akun', 'Tanggal Pendaftaran'],
      ...filteredOrangTua.map(o => [
        o.user.name,
        o.user.email,
        o.noHP || '-',
        o.pekerjaan || '-',
        `${o._count?.siswa || 0} anak`,
        (o._count?.siswa || 0) > 0 ? 'Terhubung' : 'Belum Terhubung',
        new Date(o.user.createdAt).toLocaleDateString('id-ID')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data-orangtua-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      noHP: '',
      pekerjaan: '',
      alamat: '',
    });
    setEditingOrangTua(null);
    setShowPasswordField(false);
  };

  // Filter data
  const filteredOrangTua = orangTua.filter(o => {
    const matchSearch = o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.noHP && o.noHP.includes(searchTerm));

    const childrenCount = o._count?.siswa || 0;
    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'connected' && childrenCount > 0) ||
      (filterStatus === 'disconnected' && childrenCount === 0);

    return matchSearch && matchFilter;
  });

  // Statistics
  const stats = {
    total: orangTua.length,
    connected: orangTua.filter(o => (o._count?.siswa || 0) > 0).length,
    disconnected: orangTua.filter(o => (o._count?.siswa || 0) === 0).length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.violet[50]} 0%, ${colors.gold[50]} 50%, ${colors.emerald[50]} 100%)`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%238B5CF6' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexDirection: 'column', gap: '16px' }} className="header-container sm:flex-row sm:gap-0">
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.violet[600]} 0%, ${colors.violet[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Manajemen Orang Tua
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Kelola akun wali siswa tahfidz dengan mudah dan efisien
              </p>
            </div>

            {/* Action Buttons - Two Row Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }} className="action-buttons-container">
              {/* Row 1: Tambah Orang Tua Button - Full Width */}
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
                  background: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
                }}
              >
                <UserPlus size={18} />
                <span>Tambah Orang Tua</span>
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
                    color: colors.violet[600],
                    border: `2px solid ${colors.violet[200]}`,
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
                    e.currentTarget.style.background = colors.violet[50];
                    e.currentTarget.style.borderColor = colors.violet[300];
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = colors.white;
                    e.currentTarget.style.borderColor = colors.violet[200];
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
                      ['Nama Lengkap', 'Email', 'No HP', 'Pekerjaan', 'Tanggal Bergabung'],
                      ...filteredOrangTua.map(ot => [
                        ot.user.name,
                        ot.user.email,
                        ot.noHP || '-',
                        ot.pekerjaan || '-',
                        new Date(ot.user.createdAt).toLocaleDateString('id-ID')
                      ])
                    ].map(row => row.join(',')).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `data-orangtua-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    background: colors.white,
                    color: colors.gold[600],
                    border: `2px solid ${colors.gold[200]}`,
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
                    e.currentTarget.style.background = colors.gold[50];
                    e.currentTarget.style.borderColor = colors.gold[300];
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = colors.white;
                    e.currentTarget.style.borderColor = colors.gold[200];
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
                title="Total Akun"
                value={stats.total}
                subtitle="Total orang tua terdaftar"
                color="violet"
              />
              <StatCard
                icon={<UserCheck size={24} color={colors.white} />}
                title="Terhubung dengan Siswa"
                value={stats.connected}
                subtitle="Memiliki anak terhubung"
                color="emerald"
              />
              <StatCard
                icon={<UserX size={24} color={colors.white} />}
                title="Belum Terhubung"
                value={stats.disconnected}
                subtitle="Belum ada anak terhubung"
                color="gold"
              />
            </div>

            {/* Search & Filter Section */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.violet[100]}`,
              animation: 'slideInUp 0.6s ease-out 0.1s both',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
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
                    Cari Orang Tua
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
                      placeholder="Cari berdasarkan nama, email, atau no HP..."
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
                    Filter Keterhubungan
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
                    <option value="connected">Terhubung</option>
                    <option value="disconnected">Belum Terhubung</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.violet[100]}`,
              overflow: 'hidden',
              animation: 'slideInUp 0.6s ease-out 0.2s both',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: `linear-gradient(135deg, ${colors.violet[50]} 0%, ${colors.violet[100]} 100%)`,
                    }}>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.violet[700],
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
                        color: colors.violet[700],
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
                        color: colors.violet[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Anak Terhubung
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.violet[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Status Akun
                      </th>
                      <th style={{
                        padding: '18px 24px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.violet[700],
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
                        color: colors.violet[700],
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrangTua.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: colors.text.tertiary,
                          fontSize: '14px',
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        }}>
                          Tidak ada data orang tua yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredOrangTua.map((orangTuaItem, index) => {
                        const childrenCount = orangTuaItem._count?.siswa || 0;
                        const isConnected = childrenCount > 0;

                        return (
                          <tr
                            key={orangTuaItem.id}
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
                                  background: `linear-gradient(135deg, ${colors.violet[400]} 0%, ${colors.violet[600]} 100%)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: colors.white,
                                  fontWeight: 700,
                                  fontSize: '16px',
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                }}>
                                  {orangTuaItem.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                    marginBottom: '2px',
                                  }}>
                                    {orangTuaItem.user.name}
                                  </div>
                                  {orangTuaItem.noHP && (
                                    <div style={{
                                      fontSize: '12px',
                                      color: colors.text.tertiary,
                                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                    }}>
                                      {orangTuaItem.noHP}
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
                              {orangTuaItem.user.email}
                            </td>
                            <td style={{
                              padding: '20px 24px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}>
                                <Heart
                                  size={16}
                                  color={isConnected ? colors.violet[600] : colors.gray[400]}
                                  fill={isConnected ? colors.violet[600] : 'none'}
                                />
                                <span style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: isConnected ? colors.violet[700] : colors.text.tertiary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                }}>
                                  {childrenCount} {childrenCount === 1 ? 'anak' : 'anak'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                              <span style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                background: isConnected ? colors.violet.pastel : colors.gold.light,
                                color: isConnected ? colors.violet[700] : colors.gold[700],
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                display: 'inline-block',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              }}
                              className="status-badge">
                                {isConnected ? 'Aktif & Terhubung' : 'Belum Terhubung'}
                              </span>
                            </td>
                            <td style={{
                              padding: '20px 24px',
                              fontSize: '14px',
                              color: colors.text.secondary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            }}>
                              {new Date(orangTuaItem.user.createdAt).toLocaleDateString('id-ID', {
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
                                  onClick={() => handleEdit(orangTuaItem)}
                                  style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: `${colors.violet[500]}15`,
                                    color: colors.violet[600],
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
                                  onClick={() => handleDelete(orangTuaItem)}
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

      {/* Modal Add/Edit */}
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
            border: `2px solid ${colors.violet[100]}`,
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
                {editingOrangTua ? 'Edit Data Orang Tua' : 'Tambah Orang Tua Baru'}
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
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    className="form-input"
                  />
                </div>

                {editingOrangTua && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.text.secondary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={showPasswordField}
                        onChange={(e) => setShowPasswordField(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      Ganti Password
                    </label>
                  </div>
                )}

                {(!editingOrangTua || showPasswordField) && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.text.secondary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    }}>
                      Password {editingOrangTua ? '' : '*'} (minimal 6 karakter)
                    </label>
                    <input
                      type="password"
                      required={!editingOrangTua}
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                    />
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    No. HP *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.noHP}
                    onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                    background: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                  }}
                  className="submit-btn"
                >
                  {editingOrangTua ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
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

        /* Stats Card with Glowing Effect */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.2);
          filter: drop-shadow(0 0 10px var(--glow-color, rgba(139, 92, 246, 0.3)));
        }

        .stats-card[data-glow-color] {
          --glow-color: attr(data-glow-color);
        }

        /* Button Hover Effects with Glow */
        .export-btn:hover {
          background: ${colors.violet[50]} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.15), 0 0 20px rgba(139, 92, 246, 0.1) !important;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.2) !important;
        }

        /* Input Focus with Glow */
        .search-input:focus,
        .filter-select:focus,
        .form-input:focus {
          border-color: ${colors.violet[500]} !important;
          box-shadow: 0 0 0 3px ${colors.violet[500]}20, 0 0 20px ${colors.violet[500]}15 !important;
        }

        /* Table Row Hover with Subtle Glow */
        .table-row:hover {
          background: ${colors.violet[50]}30 !important;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.05);
        }

        /* Status Badge Hover */
        .status-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 15px rgba(139, 92, 246, 0.1) !important;
        }

        /* Action Button Hover with Glow */
        .action-btn-edit:hover {
          background: ${colors.violet[500]}30 !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .action-btn-delete:hover {
          background: #FEE2E2 !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }

        /* Modal Close Button Hover */
        .close-btn:hover {
          color: ${colors.text.primary} !important;
          transform: rotate(90deg);
        }

        /* Form Button Hover */
        .cancel-btn:hover {
          background: ${colors.gray[50]} !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3), 0 0 25px rgba(139, 92, 246, 0.15) !important;
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

          /* Mobile: Keep 2-row layout for buttons */
          .action-buttons-container {
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }

          .action-buttons-container > button:first-child {
            width: 100% !important;
          }

          .action-buttons-container > div {
            width: 100% !important;
          }
        }

        @media (min-width: 640px) {
          .header-container {
            flex-direction: row !important;
            gap: 0 !important;
          }
        }

        @media (min-width: 769px) {
          /* Desktop: Change to 1-row layout */
          .action-buttons-container {
            flex-direction: row !important;
            gap: 8px !important;
            width: auto !important;
          }

          .action-buttons-container > button:first-child {
            width: auto !important;
            padding: 8px 14px !important;
            font-size: 13px !important;
          }

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
