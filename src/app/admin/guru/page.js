'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, Users, UserCheck, UserX, GraduationCap } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import ImportExportToolbar from '@/components/ImportExportToolbar';

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

export default function AdminGuruPage() {
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    jenisKelamin: 'L',
    noHP: '',
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
      noHP: guruItem.noHP || '',
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

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/guru/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        alert(`Guru berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchGuru();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengubah status guru');
      }
    } catch (error) {
      console.error('Error toggling guru status:', error);
      alert('Gagal mengubah status guru');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      nip: '',
      jenisKelamin: 'L',
      noHP: '',
      alamat: ''
    });
    setEditingGuru(null);
  };


  // Filter data
  const filteredGuru = guru.filter(g => {
    const matchSearch = g.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.nip && g.nip.includes(searchTerm));

    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && g.user.isActive) ||
      (filterStatus === 'inactive' && !g.user.isActive);

    return matchSearch && matchFilter;
  });

  // Statistics
  const stats = {
    total: guru.length,
    active: guru.filter(g => g.user.isActive).length,
    inactive: guru.filter(g => !g.user.isActive).length,
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
                Manajemen Guru
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Kelola data guru tahfidz dengan mudah dan efisien
              </p>
            </div>

            {/* Action Buttons */}
            <ImportExportToolbar
              kategori="guru"
              data={filteredGuru}
              onImportSuccess={fetchGuru}
              showAddButton
              onAddClick={() => {
                resetForm();
                setShowModal(true);
              }}
              addButtonLabel="Tambah Guru"
              addButtonIcon={<UserPlus size={18} />}
            />
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
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                        Kelas Binaan
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
                    {filteredGuru.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                          color: colors.text.tertiary,
                          fontSize: '14px',
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              }}>
                                {guruItem.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: colors.text.primary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                  marginBottom: '2px',
                                }}>
                                  {guruItem.user.name}
                                </div>
                                {guruItem.nip && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: colors.text.tertiary,
                                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                    }}
                                  >
                                    <GraduationCap size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {kg.kelas.namaKelas}
                                  </span>
                                ))}
                              </div>
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
                            <button
                              onClick={() => handleToggleActive(guruItem.id, guruItem.user.isActive)}
                              style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                border: 'none',
                                cursor: 'pointer',
                                background: guruItem.user.isActive ? colors.emerald.light : colors.amber.light,
                                color: guruItem.user.isActive ? colors.emerald[700] : colors.amber[700],
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              }}
                              className="status-badge"
                            >
                              {guruItem.user.isActive ? 'Aktif' : 'Non-Aktif'}
                            </button>
                          </td>
                          <td style={{
                            padding: '20px 24px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Password {editingGuru ? '(kosongkan jika tidak diubah)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingGuru}
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    No. HP
                  </label>
                  <input
                    type="text"
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
        }
      `}</style>
    </AdminLayout>
  );
}
