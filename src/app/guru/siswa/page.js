"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Users,
  UserCheck,
  UserPlus,
  Award,
  Search,
  RefreshCw,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

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
  violet: {
    50: '#F5F3FF',
    100: '#E9D5FF',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
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
  success: '#1A936F',
  warning: '#F7C873',
  info: '#3B82F6',
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
    violet: {
      bg: `linear-gradient(135deg, ${colors.violet[100]} 0%, ${colors.violet[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
      value: colors.violet[700],
      border: colors.violet[200],
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
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: `2px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
    }}
    className="stats-card-small">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '4px',
            fontFamily: '"Poppins", system-ui, sans-serif',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '26px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", system-ui, sans-serif',
            lineHeight: '1.1',
            marginBottom: subtitle ? '3px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '11px',
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

export default function KelolaSiswaPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    siswaAktif: 0,
    menungguValidasi: 0,
    rataRataNilai: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch siswa dari kelas binaan guru
  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/siswa');
      if (!response.ok) throw new Error('Failed to fetch siswa');

      const data = await response.json();

      // Transform data untuk match format yang digunakan component
      // Hanya tampilkan siswa dengan status approved (Aktif)
      const transformedData = data
        .filter(siswa => siswa.status === 'approved')
        .map(siswa => ({
          id: siswa.id,
          nama: siswa.user.name,
          kelas: siswa.kelas?.nama || '-',
          status: 'aktif', // Semua siswa yang ditampilkan adalah aktif
          totalJuz: siswa.totalJuz || 0,
          totalSetoran: siswa.totalSetoran || 0,
          averageNilai: siswa.averageNilai || 0,
        }));

      setStudents(transformedData);

      // Hitung statistik dari data real
      const totalSiswa = transformedData.length;
      const siswaAktif = transformedData.length; // Semua siswa adalah aktif
      const menungguValidasi = 0; // Tidak ada siswa menunggu validasi di halaman ini
      const rataRataNilai = totalSiswa > 0
        ? (transformedData.reduce((sum, s) => sum + s.averageNilai, 0) / totalSiswa).toFixed(1)
        : 0;

      setStats({
        totalSiswa,
        siswaAktif,
        menungguValidasi,
        rataRataNilai: parseFloat(rataRataNilai),
      });
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSiswa();
    setRefreshing(false);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusConfig = (status) => {
    const configs = {
      aktif: {
        bg: `${colors.emerald[500]}20`,
        text: colors.emerald[700],
        label: 'Aktif',
        icon: CheckCircle2,
      },
      menunggu_validasi: {
        bg: `${colors.amber[400]}20`,
        text: colors.amber[700],
        label: 'Menunggu Validasi',
        icon: Clock,
      },
      tidak_aktif: {
        bg: `${colors.gray[400]}20`,
        text: colors.gray[700],
        label: 'Tidak Aktif',
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.aktif;
  };

  return (
    <GuruLayout>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Kelola Siswa
              </h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Monitoring siswa kelas binaan dan tracking progress hafalan
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: refreshing ? colors.gray[300] : colors.white,
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
                className="action-btn-secondary"
              >
                <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>

              <Link href="/guru/tambah-siswa">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.white,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    boxShadow: '0 4px 12px rgba(26, 147, 111, 0.3)',
                  }}
                  className="action-btn-primary"
                >
                  <UserPlus size={18} />
                  Tambah Siswa
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}>
              <StatCard
                icon={<Users size={22} color={colors.white} />}
                title="Total Siswa"
                value={stats.totalSiswa}
                subtitle="Siswa terdaftar"
                color="emerald"
              />
              <StatCard
                icon={<UserCheck size={22} color={colors.white} />}
                title="Siswa Aktif"
                value={stats.siswaAktif}
                subtitle="Siswa aktif belajar"
                color="blue"
              />
              <StatCard
                icon={<Clock size={22} color={colors.white} />}
                title="Menunggu Validasi"
                value={stats.menungguValidasi}
                subtitle="Perlu persetujuan"
                color="amber"
              />
            </div>

            {/* Search and Filter */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: `2px solid ${colors.gray[200]}`,
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Search Input */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.text.tertiary,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau kelas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    className="search-input"
                  />
                </div>

                {/* Filter Buttons */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    background: colors.white,
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="filter-btn"
                >
                  <Filter size={18} />
                  Filter
                </button>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    background: colors.white,
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="filter-btn"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: colors.white,
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: `2px solid ${colors.gray[200]}`,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: '0',
                }}>
                  <thead>
                    <tr style={{
                      background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                      borderRadius: '12px',
                    }}>
                      <th style={{
                        padding: '18px 20px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px',
                      }}>
                        Nama Siswa
                      </th>
                      <th style={{
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        Kelas
                      </th>
                      <th style={{
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        Status
                      </th>
                      <th style={{
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        Total Juz
                      </th>
                      <th style={{
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                      }}>
                        Total Setoran
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => {
                      const statusConfig = getStatusConfig(student.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr
                          key={student.id}
                          style={{
                            borderBottom: index < paginatedStudents.length - 1 ? `2px solid ${colors.gray[100]}` : 'none',
                            transition: 'all 0.2s ease',
                            background: index % 2 === 0 ? colors.white : `${colors.gray[50]}`,
                          }}
                          className="table-row"
                        >
                          <td style={{
                            padding: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.text.primary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {student.nama}
                          </td>
                          <td style={{
                            padding: '20px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: colors.text.secondary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {student.kelas}
                          </td>
                          <td style={{
                            padding: '20px',
                            textAlign: 'center',
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              background: statusConfig.bg,
                              color: statusConfig.text,
                              fontSize: '13px',
                              fontWeight: 600,
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}>
                              <StatusIcon size={14} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td style={{
                            padding: '20px',
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: colors.emerald[600],
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {student.totalJuz} Juz
                          </td>
                          <td style={{
                            padding: '20px',
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: colors.text.primary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            {student.totalSetoran}×
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: `1px solid ${colors.gray[200]}`,
              }}>
                <p style={{
                  fontSize: '13px',
                  color: colors.text.tertiary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 14px',
                      background: currentPage === 1 ? colors.gray[100] : colors.white,
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '10px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="pagination-btn"
                  >
                    <ChevronLeft size={18} color={currentPage === 1 ? colors.gray[400] : colors.text.primary} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        padding: '10px 16px',
                        background: currentPage === i + 1
                          ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                          : colors.white,
                        border: `2px solid ${currentPage === i + 1 ? colors.emerald[500] : colors.gray[300]}`,
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: currentPage === i + 1 ? colors.white : colors.text.primary,
                        cursor: 'pointer',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        transition: 'all 0.2s ease',
                      }}
                      className="pagination-btn"
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '10px 14px',
                      background: currentPage === totalPages ? colors.gray[100] : colors.white,
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '10px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="pagination-btn"
                  >
                    <ChevronRight size={18} color={currentPage === totalPages ? colors.gray[400] : colors.text.primary} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Stats Card Animations */
        .stats-card-small {
          transition: all 0.3s ease;
        }

        .stats-card-small:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(26, 147, 111, 0.12);
        }

        /* Search Input */
        .search-input:focus {
          border-color: ${colors.emerald[500]};
          box-shadow: 0 0 0 3px ${colors.emerald[100]};
        }

        /* Filter Buttons */
        .filter-btn:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.emerald[500]};
        }

        /* Action Buttons */
        .action-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.4);
        }

        .action-btn-secondary:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.emerald[500]};
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.emerald[100]} !important;
          transform: scale(1.01);
          box-shadow: 0 2px 8px rgba(26, 147, 111, 0.15);
        }

        /* Pagination Buttons */
        .pagination-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* Spin Animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-card-small {
            min-width: 100%;
          }
        }
      `}</style>
    </GuruLayout>
  );
}
