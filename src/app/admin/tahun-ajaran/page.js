'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Plus, CheckCircle2, Archive, Edit, Trash2,
  BookOpen, Users, GraduationCap, Clock, XCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Elegant Amber-Emerald Color Palette
const colors = {
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    warm: '#FFD78C', // Amber dominan hangat
    soft: '#FFE6A7',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    pastel: '#C4F1C1', // Emerald pastel untuk aktif
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
    primary: '#1F2937',
    secondary: '#374151',
    tertiary: '#6B7280',
  },
};

// Success Check Animation Component
function SuccessCheck({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      animation: 'successPulse 0.6s ease-out',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.emerald.pastel} 0%, ${colors.emerald[400]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
        animation: 'checkBounce 0.6s ease-out',
      }}>
        <CheckCircle2 size={48} color={colors.white} strokeWidth={3} />
      </div>
      <p style={{
        fontSize: '18px',
        fontWeight: 600,
        color: colors.emerald[600],
        fontFamily: '"Poppins", sans-serif',
        animation: 'fadeInUp 0.6s ease-out 0.3s both',
      }}>
        Periode Berhasil Diaktifkan!
      </p>
    </div>
  );
}

// StatCard Component
function StatCard({ icon, title, value, subtitle, color = 'amber' }) {
  const colorMap = {
    amber: {
      bg: `linear-gradient(135deg, ${colors.amber[100]} 0%, ${colors.amber[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
      value: colors.amber[700],
      border: colors.amber[200],
    },
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    warm: {
      bg: `linear-gradient(135deg, ${colors.amber.soft}40 0%, ${colors.amber.warm}60 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[700],
      border: colors.amber.warm,
    },
  };

  const scheme = colorMap[color];

  return (
    <div style={{
      background: scheme.bg,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(217, 119, 6, 0.08)',
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
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '6px',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", sans-serif',
            lineHeight: '1.1',
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              fontFamily: '"Poppins", sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminTahunAjaranPage() {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTahunAjaranModal, setShowTahunAjaranModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [editingTahunAjaran, setEditingTahunAjaran] = useState(null);
  const [showUpdateTargetModal, setShowUpdateTargetModal] = useState(false);
  const [targetHafalanInput, setTargetHafalanInput] = useState('');
  const [tahunAjaranFormData, setTahunAjaranFormData] = useState({
    nama: '',
    semester: 1,
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/tahun-ajaran');
      const data = await response.json();
      setTahunAjaran(data);
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTahunAjaranSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingTahunAjaran ? `/api/admin/tahun-ajaran/${editingTahunAjaran.id}` : '/api/admin/tahun-ajaran';
      const method = editingTahunAjaran ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tahunAjaranFormData),
      });

      if (response.ok) {
        alert(editingTahunAjaran ? 'Tahun ajaran berhasil diupdate' : 'Tahun ajaran berhasil ditambahkan');
        setShowTahunAjaranModal(false);
        resetTahunAjaranForm();
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data tahun ajaran');
      }
    } catch (error) {
      console.error('Error saving tahun ajaran:', error);
      alert('Gagal menyimpan data tahun ajaran');
    }
  };

  const handleActivatePeriod = async (tahunAjaranItem) => {
    setSelectedTahunAjaran(tahunAjaranItem);
    setShowActivateModal(true);
  };

  const confirmActivate = async () => {
    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${selectedTahunAjaran.id}/activate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setShowActivateModal(false);
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          fetchTahunAjaran();
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengaktifkan periode');
      }
    } catch (error) {
      console.error('Error activating period:', error);
      alert('Gagal mengaktifkan periode');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Yakin ingin menonaktifkan tahun ajaran ini?')) return;

    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${id}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Tahun ajaran berhasil dinonaktifkan');
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menonaktifkan tahun ajaran');
      }
    } catch (error) {
      console.error('Error deactivating tahun ajaran:', error);
      alert('Gagal menonaktifkan tahun ajaran');
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Yakin ingin mengarsipkan tahun ajaran ini?')) return;

    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${id}/archive`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Tahun ajaran berhasil diarsipkan');
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mengarsipkan tahun ajaran');
      }
    } catch (error) {
      console.error('Error archiving tahun ajaran:', error);
      alert('Gagal mengarsipkan tahun ajaran');
    }
  };

  const handleEdit = (tahunAjaranItem) => {
    setEditingTahunAjaran(tahunAjaranItem);
    setTahunAjaranFormData({
      nama: tahunAjaranItem.nama,
      semester: tahunAjaranItem.semester,
      tanggalMulai: tahunAjaranItem.tanggalMulai.split('T')[0],
      tanggalSelesai: tahunAjaranItem.tanggalSelesai.split('T')[0],
    });
    setShowTahunAjaranModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus tahun ajaran ini? Data terkait akan terpengaruh.')) return;

    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tahun ajaran berhasil dihapus');
        fetchTahunAjaran();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus tahun ajaran');
      }
    } catch (error) {
      console.error('Error deleting tahun ajaran:', error);
      alert('Gagal menghapus tahun ajaran');
    }
  };

  const resetTahunAjaranForm = () => {
    setTahunAjaranFormData({
      nama: '',
      semester: 1,
      tanggalMulai: '',
      tanggalSelesai: '',
    });
    setEditingTahunAjaran(null);
  };

  const handleUpdateTargetHafalan = async (e) => {
    e.preventDefault();

    if (!stats.activeTahunAjaranId) {
      alert('Tahun ajaran aktif tidak ditemukan');
      return;
    }

    const numTarget = parseInt(targetHafalanInput);
    if (isNaN(numTarget) || numTarget < 1 || numTarget > 30) {
      alert('Target hafalan harus antara 1-30 juz');
      return;
    }

    try {
      const response = await fetch(`/api/admin/tahun-ajaran/${stats.activeTahunAjaranId}/target`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetHafalan: numTarget }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Target hafalan berhasil diperbarui.');
        setShowUpdateTargetModal(false);
        setTargetHafalanInput('');
        fetchTahunAjaran();
      } else {
        alert(data.error || 'Gagal memperbarui target hafalan');
      }
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Gagal memperbarui target hafalan: ' + error.message);
    }
  };

  // Statistics
  const activeTahunAjaran = tahunAjaran.find(ta => ta.isActive);
  const stats = {
    activePeriod: activeTahunAjaran ? `${activeTahunAjaran.nama} - Semester ${activeTahunAjaran.semester}` : 'Belum ada',
    activePeriodSubtitle: activeTahunAjaran ? `${new Date(activeTahunAjaran.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(activeTahunAjaran.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
    totalKelas: activeTahunAjaran?._count?.kelas || 0,
    totalSiswa: tahunAjaran.reduce((sum, ta) => {
      return sum + (ta.kelas?.reduce((kelasSum, k) => kelasSum + (k._count?.siswa || 0), 0) || 0);
    }, 0),
    activeTargetHafalan: activeTahunAjaran?.targetHafalan || null,
    activeTahunAjaranId: activeTahunAjaran?.id || null,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(to bottom, ${colors.amber.warm}25 0%, ${colors.white} 40%, ${colors.white} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Arabesque Ornament - Sudut Kanan Atas */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D97706' stroke-width='1.5' opacity='0.08'%3E%3Cpath d='M150 50 Q200 75 250 50 Q225 100 250 150 Q200 125 150 150 Q175 100 150 50 Z'/%3E%3Ccircle cx='150' cy='100' r='40'/%3E%3Cpath d='M150 60 L170 80 L150 100 L130 80 Z'/%3E%3Cpath d='M110 100 Q130 110 150 100 Q170 90 190 100'/%3E%3Ccircle cx='150' cy='100' r='15' fill='%23FFD78C' opacity='0.3'/%3E%3Cpath d='M200 50 L220 70 M200 150 L220 130 M100 50 L80 70 M100 150 L80 130' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 48px 24px',
          borderBottom: `2px solid ${colors.amber[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.amber[50]}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.amber[600]} 0%, ${colors.amber[700]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-0.5px',
              }}>
                Manajemen Tahun Ajaran
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", sans-serif',
              }}>
                Kelola periode pembelajaran dan siklus tahfidz tahunan
              </p>
            </div>

            <button
              onClick={() => {
                resetTahunAjaranForm();
                setShowTahunAjaranModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
                color: colors.white,
                border: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: '"Poppins", sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.25)',
              }}
              className="add-btn"
            >
              <Plus size={18} />
              Tambah Tahun Ajaran
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${colors.amber.soft}40 0%, ${colors.amber.warm}60 100%)`,
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 6px 20px rgba(217, 119, 6, 0.08)',
                border: `2px solid ${colors.amber.warm}`,
                transition: 'all 0.3s ease',
                animation: 'fadeInUp 0.6s ease-out',
              }}
              className="stats-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                  }}>
                    <Calendar size={28} color={colors.white} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.text.secondary,
                      marginBottom: '6px',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}>
                      Tahun Ajaran Aktif
                    </p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: colors.amber[700],
                      fontFamily: '"Poppins", sans-serif',
                      lineHeight: '1.2',
                      marginBottom: '4px',
                    }}>
                      {stats.activePeriod}
                    </p>
                    {stats.activePeriodSubtitle && (
                      <p style={{
                        fontSize: '12px',
                        color: colors.text.tertiary,
                        fontFamily: '"Poppins", sans-serif',
                      }}>
                        {stats.activePeriodSubtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Target Hafalan Section */}
                {stats.activePeriod && (
                  <div style={{
                    marginTop: '20px',
                    padding: '18px 24px',
                    background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
                    borderRadius: '16px',
                    border: `2px solid ${colors.amber[200]}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: colors.text.secondary,
                          marginBottom: '6px',
                          fontFamily: '"Poppins", sans-serif',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}>
                          Target Hafalan Tahun Ini
                        </p>
                        <p style={{
                          fontSize: '28px',
                          fontWeight: 700,
                          color: colors.amber[700],
                          fontFamily: '"Poppins", sans-serif',
                          marginBottom: '4px',
                        }}>
                          {stats.activeTargetHafalan || '-'} Juz
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: colors.text.tertiary,
                          fontFamily: '"Poppins", sans-serif',
                        }}>
                          Target hafalan minimum untuk seluruh kelas pada tahun ajaran ini.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (stats.activeTahunAjaranId) {
                            setTargetHafalanInput(stats.activeTargetHafalan?.toString() || '');
                            setShowUpdateTargetModal(true);
                          }
                        }}
                        style={{
                          padding: '10px 18px',
                          background: colors.white,
                          border: `2px solid ${colors.amber[500]}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: colors.amber[700],
                          fontFamily: '"Poppins", sans-serif',
                          transition: 'all 0.3s ease',
                          whiteSpace: 'nowrap',
                        }}
                        className="update-target-btn"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.amber[50];
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.white;
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Perbarui Target
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <StatCard
                icon={<BookOpen size={28} color={colors.white} />}
                title="Jumlah Kelas"
                value={stats.totalKelas}
                subtitle="Kelas terdaftar periode aktif"
                color="amber"
              />
              <StatCard
                icon={<Users size={28} color={colors.white} />}
                title="Jumlah Siswa"
                value={stats.totalSiswa}
                subtitle="Siswa aktif di semua periode"
                color="emerald"
              />
            </div>

            {/* Table */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.08)',
              border: `2px solid ${colors.amber[100]}`,
              overflow: 'hidden',
              animation: 'fadeInUp 0.6s ease-out 0.2s both',
            }}>
              <div style={{
                padding: '24px 28px',
                borderBottom: `2px solid ${colors.amber[100]}`,
                background: `linear-gradient(to right, ${colors.amber[50]} 0%, ${colors.white} 100%)`,
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.amber[700],
                  fontFamily: '"Poppins", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <GraduationCap size={22} />
                  Daftar Periode Tahun Ajaran
                </h2>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: '"Poppins", sans-serif',
                }}>
                  <thead>
                    <tr style={{
                      background: `linear-gradient(to bottom, ${colors.amber[50]} 0%, ${colors.white} 100%)`,
                      borderBottom: `2px solid ${colors.amber[200]}`,
                    }}>
                      <th style={{ width: '8px', padding: 0 }}></th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Tahun Ajaran
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Periode
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Status
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Tanggal Mulai
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Tanggal Selesai
                      </th>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tahunAjaran.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                        }}>
                          <Calendar size={48} color={colors.gray[300]} style={{ margin: '0 auto 16px' }} />
                          <p style={{
                            fontSize: '14px',
                            color: colors.text.tertiary,
                            fontFamily: '"Poppins", sans-serif',
                          }}>
                            Belum ada tahun ajaran terdaftar
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tahunAjaran.map((taItem, index) => (
                        <tr key={taItem.id} style={{
                          borderBottom: `1px solid ${colors.gray[100]}`,
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.4s ease-out ${0.4 + (index * 0.05)}s both`,
                        }}
                        className="table-row">
                          {/* Color Strip Indicator */}
                          <td style={{
                            padding: 0,
                            background: taItem.isActive
                              ? `linear-gradient(to bottom, ${colors.emerald.pastel} 0%, ${colors.emerald[500]} 100%)`
                              : colors.gray[300],
                            width: '8px',
                          }} />

                          <td style={{
                            padding: '18px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.text.primary,
                          }}>
                            {taItem.nama}
                          </td>
                          <td style={{
                            padding: '18px 20px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                          }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: taItem.semester === 1 ? colors.amber[100] : colors.emerald[100],
                              color: taItem.semester === 1 ? colors.amber[700] : colors.emerald[700],
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                            }}>
                              <Clock size={14} />
                              Semester {taItem.semester === 1 ? 'Ganjil' : 'Genap'}
                            </div>
                          </td>
                          <td style={{
                            padding: '18px 20px',
                            fontSize: '14px',
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '6px 14px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: 600,
                              background: taItem.isActive ? colors.emerald.pastel : colors.gray[200],
                              color: taItem.isActive ? colors.emerald[700] : colors.gray[600],
                            }}>
                              {taItem.isActive ? '● Aktif' : '○ Nonaktif'}
                            </span>
                          </td>
                          <td style={{
                            padding: '18px 20px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                          }}>
                            {new Date(taItem.tanggalMulai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{
                            padding: '18px 20px',
                            fontSize: '14px',
                            color: colors.text.secondary,
                          }}>
                            {new Date(taItem.tanggalSelesai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{
                            padding: '18px 20px',
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '6px',
                              justifyContent: 'center',
                            }}>
                              {taItem.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(taItem.id)}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: `linear-gradient(135deg, #EF4444 0%, #DC2626 100%)`,
                                    color: colors.white,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontFamily: '"Poppins", sans-serif',
                                  }}
                                  className="deactivate-btn"
                                  title="Nonaktifkan Periode"
                                >
                                  <XCircle size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivatePeriod(taItem)}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                                    color: colors.white,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontFamily: '"Poppins", sans-serif',
                                  }}
                                  className="activate-btn"
                                  title="Aktifkan Periode"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(taItem)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: `${colors.amber[500]}15`,
                                  color: colors.amber[600],
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                }}
                                className="action-btn-edit"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              {!taItem.isActive && (
                                <button
                                  onClick={() => handleArchive(taItem.id)}
                                  style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: `${colors.gray[400]}15`,
                                    color: colors.gray[600],
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                  }}
                                  className="action-btn-archive"
                                  title="Arsipkan"
                                >
                                  <Archive size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(taItem.id)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: '#FEE2E2',
                                  color: '#DC2626',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                }}
                                className="action-btn-delete"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
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

      {/* Modal Tambah/Edit Tahun Ajaran */}
      {showTahunAjaranModal && (
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
            boxShadow: '0 20px 60px rgba(217, 119, 6, 0.2)',
            border: `2px solid ${colors.amber[200]}`,
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
                color: colors.amber[700],
                fontFamily: '"Poppins", sans-serif',
              }}>
                {editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowTahunAjaranModal(false);
                  resetTahunAjaranForm();
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

            <form onSubmit={handleTahunAjaranSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", sans-serif',
                }}>
                  Nama Tahun Ajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2024/2025"
                  value={tahunAjaranFormData.nama}
                  onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, nama: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: '"Poppins", sans-serif',
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
                  fontFamily: '"Poppins", sans-serif',
                }}>
                  Semester *
                </label>
                <select
                  required
                  value={tahunAjaranFormData.semester}
                  onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, semester: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: '"Poppins", sans-serif',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  className="form-input"
                >
                  <option value={1}>Semester 1 (Ganjil)</option>
                  <option value={2}>Semester 2 (Genap)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", sans-serif',
                  }}>
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={tahunAjaranFormData.tanggalMulai}
                    onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, tanggalMulai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", sans-serif',
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
                    fontFamily: '"Poppins", sans-serif',
                  }}>
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={tahunAjaranFormData.tanggalSelesai}
                    onChange={(e) => setTahunAjaranFormData({ ...tahunAjaranFormData, tanggalSelesai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    className="form-input"
                  />
                </div>
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
                    setShowTahunAjaranModal(false);
                    resetTahunAjaranForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    background: colors.white,
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
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
                    background: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
                  }}
                  className="submit-btn"
                >
                  {editingTahunAjaran ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aktivasi Periode */}
      {showActivateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
            border: `2px solid ${colors.emerald.pastel}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.emerald.pastel} 0%, ${colors.emerald[400]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={32} color={colors.white} />
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", sans-serif',
                marginBottom: '8px',
              }}>
                Aktifkan Periode Ini?
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", sans-serif',
              }}>
                Periode aktif sebelumnya akan dinonaktifkan
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: colors.amber[50],
              borderRadius: '12px',
              marginBottom: '24px',
              border: `1px solid ${colors.amber[200]}`,
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.amber[800],
                fontFamily: '"Poppins", sans-serif',
              }}>
                {selectedTahunAjaran?.nama} - Semester {selectedTahunAjaran?.semester}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                onClick={confirmActivate}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                }}
                className="submit-btn"
              >
                Ya, Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Modal */}
      {showSuccessAnimation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 60,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
            border: `2px solid ${colors.emerald.pastel}`,
          }}>
            <SuccessCheck onComplete={() => setShowSuccessAnimation(false)} />
          </div>
        </div>
      )}

      {/* Modal Perbarui Target Hafalan */}
      {showUpdateTargetModal && (
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
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.amber[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", sans-serif',
              }}>
                Perbarui Target Hafalan Tahun Ajaran
              </h2>
              <button
                onClick={() => setShowUpdateTargetModal(false)}
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
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateTargetHafalan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Target Hafalan (dalam Juz)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  value={targetHafalanInput}
                  onChange={(e) => setTargetHafalanInput(e.target.value)}
                  placeholder="Contoh: 3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: '"Poppins", sans-serif',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  className="form-input"
                />
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontFamily: '"Poppins", sans-serif',
                  marginTop: '8px',
                }}>
                  Target berlaku untuk seluruh kelas dalam tahun ajaran ini.
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '8px',
              }}>
                <button
                  type="button"
                  onClick={() => setShowUpdateTargetModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    background: colors.white,
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
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
                    background: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
                  }}
                  className="submit-btn"
                >
                  Simpan
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

        @keyframes successPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes checkBounce {
          0%, 100% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.2);
          }
          60% {
            transform: scale(0.95);
          }
        }

        /* Stats Card Hover */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 32px rgba(217, 119, 6, 0.2);
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.amber[50]}40;
        }

        /* Button Hover Effects */
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35) !important;
        }

        .activate-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .deactivate-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .action-btn-edit:hover {
          background: ${colors.amber[500]}30 !important;
          transform: scale(1.1);
        }

        .action-btn-archive:hover {
          background: ${colors.gray[400]}30 !important;
          transform: scale(1.1);
        }

        .action-btn-delete:hover {
          background: #FEE2E2 !important;
          transform: scale(1.1);
        }

        /* Input Focus */
        .form-input:focus {
          border-color: ${colors.amber[500]} !important;
          box-shadow: 0 0 0 3px ${colors.amber[500]}20 !important;
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
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3) !important;
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
