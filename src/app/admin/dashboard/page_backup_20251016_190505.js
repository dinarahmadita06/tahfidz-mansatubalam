'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Activity,
  AlertTriangle,
  UserPlus,
  GraduationCap,
  Database,
  Shield,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Bell
} from "lucide-react";
import AdminLayout from '@/components/layout/AdminLayout';
import {
  PageHeader,
  Grid,
  StatsCard,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Flex,
  Stack,
  LoadingState,
} from '@/components/ui-islamic';
import { designSystem } from '@/styles/design-system';

// Sage & Sand Color Palette - Minimalis Islami Modern
const sageTheme = {
  // Sage Green (Primary)
  sage: {
    50: '#F6F8F6',
    100: '#E8EDE8',
    200: '#D1DBD1',
    300: '#A8B9A8',
    400: '#7A917A',
    500: '#5A6F5A',
    600: '#495A49',
    700: '#3C4A3C',
    800: '#2F3A2F',
    900: '#1F261F',
  },
  // Sand/Cream (Secondary)
  sand: {
    50: '#FDFCFB',
    100: '#FAF7F4',
    200: '#F5EFE7',
    300: '#EAE0D5',
    400: '#D9C7B8',
    500: '#C4AA95',
    600: '#A88F78',
    700: '#8C7460',
    800: '#6F5D4C',
    900: '#4A3F33',
  },
  // Gold Pastel (Accent)
  gold: {
    50: '#FEFBF3',
    100: '#FDF5E1',
    200: '#FAECC4',
    300: '#F5DC9F',
    400: '#EBC673',
    500: '#D4A855',
    600: '#B38E44',
    700: '#8F7136',
    800: '#6D552A',
    900: '#4A3A1D',
  },
  // Neutral
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

function SystemHealthCard() {
  const metrics = [
    { label: "Database", status: "healthy", value: "99.9%", color: "success", icon: Database },
    { label: "API Response", status: "healthy", value: "45ms", color: "success", icon: Activity },
    { label: "Storage", status: "warning", value: "78%", color: "warning", icon: Shield },
    { label: "Backup", status: "healthy", value: "OK", color: "success", icon: CheckCircle2 }
  ];

  const getStatusColor = (color) => {
    const colorMap = {
      success: {
        bg: sageTheme.sage[600],
        dot: sageTheme.sage[500],
        text: sageTheme.sage[700],
      },
      warning: {
        bg: sageTheme.gold[500],
        dot: sageTheme.gold[400],
        text: sageTheme.gold[700],
      },
      error: {
        bg: '#D4756E',
        dot: '#D4756E',
        text: '#A84B43',
      },
    };
    return colorMap[color] || colorMap.success;
  };

  return (
    <Card variant="elevated" style={{
      background: '#FFFFFF',
      border: `1px solid ${sageTheme.sage[100]}`,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
      borderRadius: '12px',
      padding: '2rem',
    }}>
      <CardHeader style={{ paddingBottom: '1.5rem' }}>
        <Flex justify="space-between" align="center">
          <Flex gap="md" align="center">
            <Activity size={22} color={sageTheme.sage[600]} />
            <CardTitle variant="small" style={{ color: sageTheme.neutral[800], fontWeight: 600, fontSize: '1.125rem' }}>Kesehatan Sistem</CardTitle>
          </Flex>
          <Flex gap="md" align="center">
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: sageTheme.sage[500],
              boxShadow: `0 0 0 3px ${sageTheme.sage[50]}`,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: sageTheme.sage[600],
              fontWeight: 500,
            }}>
              Online
            </span>
          </Flex>
        </Flex>
      </CardHeader>
      <CardContent>
        <Grid cols={2} gap="xl" responsive={false}>
          {metrics.map((metric, index) => {
            const colors = getStatusColor(metric.color);
            return (
              <div
                key={index}
                style={{
                  padding: '1.5rem',
                  background: sageTheme.sage[50],
                  border: `1px solid ${sageTheme.sage[100]}`,
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                }}
                className="hover-lift-card"
              >
                <Flex justify="space-between" align="center" gap="md" style={{ marginBottom: '1rem' }}>
                  <Flex gap="sm" align="center">
                    <metric.icon size={18} color={colors.text} />
                    <span style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: sageTheme.neutral[600],
                      fontWeight: 500,
                    }}>
                      {metric.label}
                    </span>
                  </Flex>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.dot,
                  }} />
                </Flex>
                <div style={{
                  fontSize: designSystem.typography.fontSize['2xl'],
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: colors.text,
                  marginTop: '0.75rem',
                }}>
                  {metric.value}
                </div>
              </div>
            );
          })}
        </Grid>
      </CardContent>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .hover-lift-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.06);
          border-color: ${sageTheme.sage[200]};
        }
      `}</style>
    </Card>
  );
}

function UserManagementCard() {
  const userStats = [
    { role: "Siswa", count: 245, change: "+12", color: "sage", icon: GraduationCap },
    { role: "Guru", count: 18, change: "+2", color: "sage2", icon: Users },
    { role: "Orang Tua", count: 198, change: "+8", color: "sand", icon: Users },
    { role: "Admin", count: 3, change: "0", color: "neutral", icon: Shield }
  ];

  const getRoleColor = (color) => {
    const colorMap = {
      sage: {
        bg: sageTheme.sage[50],
        badge: sageTheme.sage[600],
        text: sageTheme.sage[700],
        border: sageTheme.sage[100],
      },
      sage2: {
        bg: sageTheme.sage[100],
        badge: sageTheme.sage[500],
        text: sageTheme.sage[600],
        border: sageTheme.sage[200],
      },
      sand: {
        bg: sageTheme.sand[50],
        badge: sageTheme.sand[600],
        text: sageTheme.sand[700],
        border: sageTheme.sand[200],
      },
      neutral: {
        bg: sageTheme.neutral[50],
        badge: sageTheme.neutral[600],
        text: sageTheme.neutral[700],
        border: sageTheme.neutral[200],
      },
    };
    return colorMap[color];
  };

  return (
    <Card variant="elevated" style={{
      background: '#FFFFFF',
      border: `1px solid ${sageTheme.sage[100]}`,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
      borderRadius: '12px',
      padding: '2rem',
    }}>
      <CardHeader style={{ paddingBottom: '1.5rem' }}>
        <Flex justify="space-between" align="center">
          <Flex gap="md" align="center">
            <Users size={22} color={sageTheme.sage[600]} />
            <CardTitle variant="small" style={{ color: sageTheme.neutral[800], fontWeight: 600, fontSize: '1.125rem' }}>Manajemen Pengguna</CardTitle>
          </Flex>
          <button style={{
            color: sageTheme.sage[600],
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: `all ${designSystem.transitions.duration.base}`,
          }}
          className="hover-link-btn">
            Kelola Pengguna →
          </button>
        </Flex>
      </CardHeader>
      <CardContent>
        <Stack spacing="1.5rem">
          {userStats.map((stat, index) => {
            const colors = getRoleColor(stat.color);
            return (
              <Flex
                key={index}
                justify="space-between"
                align="center"
                style={{
                  padding: '1.5rem',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: designSystem.borderRadius.lg,
                  transition: 'all 0.2s ease',
                }}
                className="hover-user-card"
              >
                <Flex gap="lg" align="center">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: designSystem.borderRadius.lg,
                    background: colors.badge,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <stat.icon size={24} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.base,
                      fontWeight: 600,
                      color: sageTheme.neutral[800],
                      marginBottom: designSystem.spacing[2],
                    }}>
                      {stat.role}
                    </div>
                    {stat.change !== "0" && (
                      <span style={{
                        fontSize: designSystem.typography.fontSize.xs,
                        color: sageTheme.neutral[500],
                        fontWeight: 500,
                      }}>
                        {stat.change} bulan ini
                      </span>
                    )}
                  </div>
                </Flex>
                <div style={{
                  fontSize: designSystem.typography.fontSize['2xl'],
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: colors.text,
                }}>
                  {stat.count}
                </div>
              </Flex>
            );
          })}
        </Stack>
      </CardContent>
      <style jsx>{`
        .hover-user-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.06);
          border-color: ${sageTheme.sage[200]};
        }
        .hover-link-btn:hover {
          color: ${sageTheme.sage[700]};
        }
      `}</style>
    </Card>
  );
}

function RecentActivityCard() {
  const activities = [
    {
      type: "user_register",
      description: "Siswa baru mendaftar: Ahmad Zaki Rahman",
      time: "5 menit lalu",
      icon: UserPlus,
      bg: '#0D9488',
      bgLight: '#F0FDFA',
    },
    {
      type: "system_backup",
      description: "Backup database berhasil dilakukan",
      time: "1 jam lalu",
      icon: Database,
      bg: '#14B8A6',
      bgLight: '#CCFBF1',
    },
    {
      type: "security_alert",
      description: "Login gagal berulang kali dari IP: 192.168.1.100",
      time: "2 jam lalu",
      icon: Shield,
      bg: '#EF4444',
      bgLight: '#FEF2F2',
    },
    {
      type: "system_update",
      description: "Pembaruan sistem berhasil diinstal",
      time: "6 jam lalu",
      icon: Settings,
      bg: '#64748B',
      bgLight: '#F8FAFC',
    },
    {
      type: "data_export",
      description: "Laporan bulanan berhasil digenerate",
      time: "1 hari lalu",
      icon: BarChart3,
      bg: '#2DD4BF',
      bgLight: '#F0FDFA',
    }
  ];

  return (
    <Card variant="elevated" style={{
      background: '#FFFFFF',
      border: '1px solid #99F6E4',
      boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
      borderRadius: designSystem.borderRadius.xl,
      padding: '2rem',
    }}>
      <CardHeader style={{ paddingBottom: '1.5rem' }}>
        <Flex justify="space-between" align="center">
          <Flex gap="md" align="center">
            <Bell size={24} color="#0D9488" />
            <CardTitle variant="small" style={{ color: '#134E4A', fontWeight: 700, fontSize: '1.25rem' }}>Aktivitas Sistem</CardTitle>
          </Flex>
          <button style={{
            color: '#0D9488',
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: `all ${designSystem.transitions.duration.base}`,
          }}
          className="hover-link-btn-2">
            Lihat Log Lengkap →
          </button>
        </Flex>
      </CardHeader>
      <CardContent>
        <Stack spacing="1.5rem">
          {activities.map((activity, index) => (
            <Flex
              key={index}
              gap="lg"
              align="flex-start"
              style={{
                padding: '1.5rem',
                background: activity.bgLight,
                border: '1px solid #E2E8F0',
                borderRadius: designSystem.borderRadius.lg,
                transition: 'all 0.2s ease',
              }}
              className="hover-activity-card"
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: designSystem.borderRadius.md,
                background: activity.bg,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <activity.icon size={22} color="#FFFFFF" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: designSystem.typography.fontSize.base,
                  fontWeight: 600,
                  color: '#1E293B',
                  lineHeight: '1.5',
                }}>
                  {activity.description}
                </p>
                <Flex gap="sm" align="center" style={{ marginTop: designSystem.spacing[2] }}>
                  <Clock size={12} color="#94A3B8" />
                  <p style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: '#64748B',
                  }}>
                    {activity.time}
                  </p>
                </Flex>
              </div>
            </Flex>
          ))}
        </Stack>
      </CardContent>
      <style jsx>{`
        .hover-activity-card:hover {
          box-shadow: 0 4px 6px -1px rgb(13 148 136 / 0.15);
          border-color: #5EEAD4;
        }
        .hover-link-btn-2:hover {
          color: #0F766E;
        }
      `}</style>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { icon: Users, label: "Kelola Pengguna", desc: "Tambah, edit, hapus akun", bg: '#0D9488', bgLight: '#F0FDFA' },
    { icon: Settings, label: "Pengaturan Sistem", desc: "Konfigurasi aplikasi", bg: '#14B8A6', bgLight: '#CCFBF1' },
    { icon: BarChart3, label: "Generate Laporan", desc: "Export data dan statistik", bg: '#2DD4BF', bgLight: '#F0FDFA' },
    { icon: Shield, label: "Keamanan", desc: "Monitor dan audit log", bg: '#64748B', bgLight: '#F8FAFC' },
    { icon: Database, label: "Backup Data", desc: "Backup dan restore", bg: '#0F766E', bgLight: '#CCFBF1' },
    { icon: Activity, label: "Monitor Sistem", desc: "Status server dan performa", bg: '#134E4A', bgLight: '#F0FDFA' }
  ];

  return (
    <Card variant="elevated" style={{
      background: '#FFFFFF',
      border: '1px solid #99F6E4',
      boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
      borderRadius: designSystem.borderRadius.xl,
      padding: '2rem',
    }}>
      <CardHeader style={{ paddingBottom: '1.5rem' }}>
        <Flex gap="md" align="center">
          <Award size={24} color="#0D9488" />
          <CardTitle variant="small" style={{ color: '#134E4A', fontWeight: 700, fontSize: '1.25rem' }}>Aksi Cepat</CardTitle>
        </Flex>
      </CardHeader>
      <CardContent>
        <Grid cols={2} gap="1.5rem">
          {actions.map((action, index) => {
            return (
              <button
                key={index}
                className="quick-action-btn-admin"
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  borderRadius: designSystem.borderRadius.lg,
                  background: action.bgLight,
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: `all ${designSystem.transitions.duration.base}`,
                  textAlign: 'left',
                }}
              >
                <Flex gap="lg" align="center">
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: designSystem.borderRadius.md,
                    background: action.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <action.icon size={26} color="#FFFFFF" />
                  </div>
                  <div>
                    <p style={{
                      fontWeight: 600,
                      fontSize: designSystem.typography.fontSize.base,
                      color: '#1E293B',
                      marginBottom: designSystem.spacing[2],
                    }}>
                      {action.label}
                    </p>
                    <p style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: '#64748B',
                      lineHeight: '1.4',
                    }}>
                      {action.desc}
                    </p>
                  </div>
                </Flex>
              </button>
            );
          })}
        </Grid>
      </CardContent>
      <style jsx>{`
        .quick-action-btn-admin:hover {
          box-shadow: 0 4px 6px -1px rgb(13 148 136 / 0.15);
          border-color: #5EEAD4;
        }
      `}</style>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState fullScreen text="Memuat dashboard..." />
      </AdminLayout>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <AdminLayout>
      <div style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 50%, #E0F2FE 100%)',
        minHeight: '100vh'
      }}>
        <PageHeader
          title="Dashboard Administrator"
          subtitle={
            <>
              Kelola dan monitor seluruh sistem tahfidz secara profesional
              {dashboardData?.tahunAjaranAktif && (
                <span style={{
                  marginLeft: designSystem.spacing[2],
                  color: '#0D9488',
                  fontWeight: 700,
                }}>
                  • {dashboardData.tahunAjaranAktif.nama}
                </span>
              )}
            </>
          }
          pattern={true}
        />

        <div style={{ padding: '0 3rem 4rem' }}>
          <Stack spacing="2rem">
            {/* Main Stats */}
            <Grid cols={4} gap="1.5rem">
              <StatsCard
                icon={<GraduationCap size={24} />}
                title="Total Guru"
                value={stats.totalGuru || 0}
                trend={null}
              />
              <StatsCard
                icon={<Users size={24} />}
                title="Total Siswa"
                value={stats.totalSiswa || 0}
                trend={stats.siswaMenungguValidasi > 0 ? `${stats.siswaMenungguValidasi} menunggu` : null}
              />
              <StatsCard
                icon={<BookOpen size={24} />}
                title="Total Hafalan"
                value={stats.totalHafalan || 0}
                trend={stats.recentHafalan > 0 ? stats.recentHafalan : null}
              />
              <StatsCard
                icon={<Activity size={24} />}
                title="Kelas Aktif"
                value={stats.totalKelasAktif || 0}
                trend={null}
              />
            </Grid>

            {/* Progress Hafalan Per Kelas */}
            {dashboardData?.hafalanPerKelas && dashboardData.hafalanPerKelas.length > 0 && (
              <Card variant="elevated" style={{
                background: '#FFFFFF',
                border: '1px solid #99F6E4',
                boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
                borderRadius: designSystem.borderRadius.xl,
                padding: '2rem',
              }}>
                <CardHeader style={{ paddingBottom: '1.25rem' }}>
                  <Flex gap="sm" align="center">
                    <TrendingUp size={22} color="#0D9488" />
                    <CardTitle variant="small" style={{ color: '#134E4A', fontWeight: 700, fontSize: '1.125rem' }}>Progres Hafalan Per Kelas</CardTitle>
                  </Flex>
                </CardHeader>
                <CardContent>
                  <Stack spacing="1.5rem">
                    {dashboardData.hafalanPerKelas.map((kelas, index) => (
                      <div key={index} style={{
                        padding: '1.5rem',
                        background: '#F0FDFA',
                        border: '1px solid #CCFBF1',
                        borderRadius: designSystem.borderRadius.lg,
                      }}>
                        <Flex justify="space-between" align="center" gap="md">
                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontWeight: 600,
                              color: '#134E4A',
                              fontSize: designSystem.typography.fontSize.base,
                            }}>
                              {kelas.namaKelas}
                            </p>
                            <p style={{
                              fontSize: designSystem.typography.fontSize.sm,
                              color: '#64748B',
                              marginTop: designSystem.spacing[1],
                            }}>
                              {kelas.totalSiswa} siswa • Rata-rata: {kelas.rataRataJuz} juz
                              {kelas.target > 0 && ` • Target: ${kelas.target} juz`}
                            </p>
                          </div>
                          <div style={{
                            fontSize: designSystem.typography.fontSize['2xl'],
                            fontWeight: designSystem.typography.fontWeight.bold,
                            color: kelas.progress >= 80
                              ? '#0D9488'
                              : kelas.progress >= 50
                                ? '#14B8A6'
                                : '#EF4444',
                          }}>
                            {kelas.progress}%
                          </div>
                        </Flex>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#E5E7EB',
                          borderRadius: designSystem.borderRadius.full,
                          marginTop: designSystem.spacing[3],
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${kelas.progress}%`,
                            background: kelas.progress >= 80
                              ? '#0D9488'
                              : kelas.progress >= 50
                                ? '#14B8A6'
                                : '#EF4444',
                            borderRadius: designSystem.borderRadius.full,
                            transition: `width ${designSystem.transitions.duration.slow}`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Stats Kehadiran & Nilai */}
            {stats.kehadiranPercentage !== undefined && (
              <Grid cols={2} gap="2rem">
                <Card variant="elevated" style={{
                  background: '#FFFFFF',
                  border: '1px solid #99F6E4',
                  boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
                  borderRadius: designSystem.borderRadius.xl,
                  padding: '2rem',
                }}>
                  <CardHeader style={{ paddingBottom: '1.5rem' }}>
                    <Flex gap="sm" align="center">
                      <CheckCircle2 size={22} color="#0D9488" />
                      <CardTitle variant="small" style={{ color: '#134E4A', fontWeight: 700, fontSize: '1.125rem' }}>Tingkat Kehadiran (30 Hari)</CardTitle>
                    </Flex>
                  </CardHeader>
                  <CardContent>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: designSystem.typography.fontSize['5xl'],
                        fontWeight: designSystem.typography.fontWeight.bold,
                        color: '#0D9488',
                        marginBottom: designSystem.spacing[2],
                      }}>
                        {stats.kehadiranPercentage}%
                      </div>
                      <p style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        color: '#64748B',
                        fontWeight: 500,
                      }}>
                        Kehadiran Siswa
                      </p>
                    </div>
                    {dashboardData?.presensiStats && (
                      <Grid cols={2} gap="lg" style={{ marginTop: designSystem.spacing[6] }}>
                        {dashboardData.presensiStats.map((stat, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#F0FDFA',
                              border: '1px solid #CCFBF1',
                              borderRadius: designSystem.borderRadius.md,
                              padding: designSystem.spacing[3],
                              textAlign: 'center',
                            }}
                          >
                            <p style={{
                              fontSize: designSystem.typography.fontSize.xs,
                              color: '#94A3B8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                            }}>
                              {stat.status}
                            </p>
                            <p style={{
                              fontSize: designSystem.typography.fontSize.xl,
                              fontWeight: designSystem.typography.fontWeight.bold,
                              color: '#0F766E',
                              marginTop: designSystem.spacing[1],
                            }}>
                              {stat.count}
                            </p>
                          </div>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>

                <Card variant="elevated" style={{
                  background: '#FFFFFF',
                  border: '1px solid #99F6E4',
                  boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
                  borderRadius: designSystem.borderRadius.xl,
                  padding: '2rem',
                }}>
                  <CardHeader style={{ paddingBottom: '1.5rem' }}>
                    <Flex gap="sm" align="center">
                      <Award size={22} color="#FBBF24" />
                      <CardTitle variant="small" style={{ color: '#134E4A', fontWeight: 700, fontSize: '1.125rem' }}>Rata-rata Nilai Hafalan</CardTitle>
                    </Flex>
                  </CardHeader>
                  <CardContent>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: designSystem.typography.fontSize['5xl'],
                        fontWeight: designSystem.typography.fontWeight.bold,
                        color: '#FBBF24',
                        marginBottom: designSystem.spacing[2],
                      }}>
                        {stats.rataRataNilai || 0}
                      </div>
                      <p style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        color: '#64748B',
                        fontWeight: 500,
                      }}>
                        Dari skala 100
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Warning: Kelas Belum Update */}
            {dashboardData?.kelasBelumUpdate && dashboardData.kelasBelumUpdate.length > 0 && (
              <Card
                variant="cream"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #99F6E4',
                  boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
                  borderRadius: designSystem.borderRadius.xl,
                  padding: '2rem',
                }}
              >
                <CardContent>
                  <Flex gap="lg" align="flex-start">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: designSystem.borderRadius.lg,
                      background: '#FBBF24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)',
                    }}>
                      <AlertTriangle size={28} color="#FFFFFF" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: '#D97706',
                        marginBottom: '1rem',
                      }}>
                        Kelas Belum Update Hafalan Minggu Ini
                      </h3>
                      <Stack spacing="1.25rem">
                        {dashboardData.kelasBelumUpdate.map((kelas, index) => (
                          <div key={index} style={{
                            padding: '1.25rem',
                            background: '#FFFBEB',
                            border: '1px solid #FEF3C7',
                            borderRadius: designSystem.borderRadius.md,
                          }}>
                            <p style={{
                              color: '#1E293B',
                              fontSize: designSystem.typography.fontSize.sm,
                              fontWeight: designSystem.typography.fontWeight.medium,
                            }}>
                              {kelas.nama} ({kelas.totalSiswa} siswa)
                            </p>
                          </div>
                        ))}
                      </Stack>
                    </div>
                  </Flex>
                </CardContent>
              </Card>
            )}

            {/* Alert: Validasi Siswa */}
            {stats.siswaMenungguValidasi > 0 && (
              <Card
                variant="cream"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #99F6E4',
                  boxShadow: '0 2px 8px 0 rgb(13 148 136 / 0.08), 0 1px 3px -1px rgb(13 148 136 / 0.05)',
                  borderRadius: designSystem.borderRadius.xl,
                  padding: '2rem',
                }}
              >
                <CardContent>
                  <Flex gap="lg" align="flex-start">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: designSystem.borderRadius.lg,
                      background: '#0D9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                    }}>
                      <UserPlus size={28} color="#FFFFFF" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: '#0F766E',
                        marginBottom: '1rem',
                      }}>
                        Siswa Menunggu Validasi
                      </h3>
                      <Flex justify="space-between" align="center" style={{
                        padding: '1rem',
                        background: '#F0FDFA',
                        border: '1px solid #CCFBF1',
                        borderRadius: designSystem.borderRadius.lg,
                      }}>
                        <p style={{
                          color: '#1E293B',
                          fontSize: designSystem.typography.fontSize.base,
                          fontWeight: designSystem.typography.fontWeight.medium,
                        }}>
                          {stats.siswaMenungguValidasi} siswa baru perlu divalidasi
                        </p>
                        <a
                          href="/admin/validasi-siswa"
                          style={{
                            color: '#0D9488',
                            fontSize: designSystem.typography.fontSize.sm,
                            fontWeight: designSystem.typography.fontWeight.bold,
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                          }}
                          className="hover-link-btn-3"
                        >
                          Lihat Detail →
                        </a>
                      </Flex>
                    </div>
                  </Flex>
                </CardContent>
                <style jsx>{`
                  .hover-link-btn-3:hover {
                    color: #0F766E;
                    transform: translateX(4px);
                  }
                `}</style>
              </Card>
            )}

            {/* Dashboard Cards Grid */}
            <Grid cols={2} gap="2rem">
              <SystemHealthCard />
              <UserManagementCard />
              <RecentActivityCard />
              <QuickActionsCard />
            </Grid>
          </Stack>
        </div>
      </div>
    </AdminLayout>
  );
}
