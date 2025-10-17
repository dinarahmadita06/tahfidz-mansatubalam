'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Calendar, Clock,
  CheckCircle, AlertCircle, XCircle, BookMarked,
  GraduationCap, Award, Sparkles, User, RefreshCw, X
} from 'lucide-react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';

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
    500: '#8B5CF6',
    600: '#7C3AED',
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
  success: '#1A936F',
  warning: '#F7C873',
  error: '#EF4444',
  info: '#3B82F6',
};

export default function GuruDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    jumlahKelas: 0,
    jumlahSiswa: 0,
    progressRataRata: 0,
  });
  const [kelasList, setKelasList] = useState([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState([]);
  const [agendaHariIni, setAgendaHariIni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [formAgenda, setFormAgenda] = useState({
    kelasId: '',
    judul: '',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktuMulai: '',
    waktuSelesai: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'GURU') {
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const kelasRes = await fetch('/api/kelas');
      const kelasData = await kelasRes.json();
      setKelasList(kelasData);

      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();

      const hafalanRes = await fetch('/api/hafalan');
      const hafalanData = await hafalanRes.json();
      setAktivitasTerbaru(hafalanData.slice(0, 5));

      if (siswaData.length > 0) {
        let totalProgress = 0;
        for (const siswa of siswaData) {
          const siswaHafalan = hafalanData.filter(h => h.siswaId === siswa.id);
          const uniqueJuz = [...new Set(siswaHafalan.map(h => h.juz))];
          const progress = (uniqueJuz.length / 30) * 100;
          totalProgress += progress;
        }
        const avgProgress = totalProgress / siswaData.length;

        setStats({
          jumlahKelas: kelasData.length,
          jumlahSiswa: siswaData.length,
          progressRataRata: avgProgress.toFixed(1),
        });
      } else {
        setStats({
          jumlahKelas: kelasData.length,
          jumlahSiswa: 0,
          progressRataRata: 0,
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const agendaRes = await fetch(`/api/agenda?tanggal=${today}`);
      const agendaData = await agendaRes.json();
      const agendaArray = Array.isArray(agendaData) ? agendaData : [];

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedAgenda = agendaArray.map(agenda => {
        if (agenda.waktuSelesai && currentTime > agenda.waktuSelesai) {
          return { ...agenda, status: 'selesai' };
        } else if (currentTime >= agenda.waktuMulai && (!agenda.waktuSelesai || currentTime <= agenda.waktuSelesai)) {
          return { ...agenda, status: 'berlangsung' };
        }
        return agenda;
      });

      setAgendaHariIni(updatedAgenda);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleSubmitAgenda = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formAgenda),
      });

      if (response.ok) {
        setShowAgendaModal(false);
        setFormAgenda({
          kelasId: '',
          judul: '',
          deskripsi: '',
          tanggal: new Date().toISOString().split('T')[0],
          waktuMulai: '',
          waktuSelesai: '',
        });
        fetchDashboardData();
      } else {
        alert('Gagal menambah agenda');
      }
    } catch (error) {
      console.error('Error creating agenda:', error);
      alert('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      LANCAR: { icon: CheckCircle, text: 'Lancar', bg: `${colors.success}15`, color: colors.success },
      PERLU_PERBAIKAN: { icon: AlertCircle, text: 'Perlu Perbaikan', bg: `${colors.warning}15`, color: colors.warning },
      DITOLAK: { icon: XCircle, text: 'Ditolak', bg: `${colors.error}15`, color: colors.error },
    };
    return badges[status] || badges.LANCAR;
  };

  const getAgendaStatus = (status) => {
    const statuses = {
      upcoming: { text: 'Akan Datang', bg: colors.gray[100], color: colors.text.tertiary },
      berlangsung: { text: 'Berlangsung', bg: `${colors.info}15`, color: colors.info },
      selesai: { text: 'Selesai', bg: `${colors.success}15`, color: colors.success },
    };
    return statuses[status] || statuses.upcoming;
  };

  if (status === 'loading' || loading) {
    return (
      <GuruLayout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: `4px solid ${colors.emerald[200]}`,
              borderTopColor: colors.emerald[500],
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{
              fontSize: '16px',
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Memuat dashboard...
            </p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GuruLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Islamic Pattern Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '500px',
          height: '500px',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <path d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z" fill="#1A936F" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#F7C873" strokeWidth="3" opacity="0.4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#1A936F" strokeWidth="2" opacity="0.3" />
            <path d="M60,100 Q60,60 100,60 Q140,60 140,100" fill="none" stroke="#F7C873" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>

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
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Dashboard Guru Tahfidz
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Selamat datang, {session?.user?.name} • {formattedDate}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: refreshing ? colors.gray[300] : `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
                color: colors.white,
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, system-ui, sans-serif',
                boxShadow: '0 2px 8px rgba(247, 200, 115, 0.3)',
              }}
            >
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Motivasi Harian */}
        <div style={{
          position: 'relative',
          padding: '24px 48px',
          zIndex: 2,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            borderRadius: '20px',
            padding: '24px 28px',
            boxShadow: '0 8px 24px rgba(26, 147, 111, 0.15)',
            border: `2px solid ${colors.emerald[400]}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `${colors.white}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={24} color={colors.amber[100]} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: colors.white,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '10px',
                  lineHeight: '1.6',
                }}>
                  "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.amber[100],
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
          className="stats-grid">
            {/* Kelas Card */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[200]}`,
            }}
            className="stats-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                  <GraduationCap size={24} color={colors.white} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '6px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Kelas Diampu
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.emerald[700],
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    lineHeight: '1.1',
                  }}>
                    {stats.jumlahKelas}
                  </p>
                </div>
              </div>
            </div>

            {/* Siswa Card */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.amber[200]}`,
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
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                  <Users size={24} color={colors.white} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '6px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Jumlah Siswa
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.amber[700],
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    lineHeight: '1.1',
                  }}>
                    {stats.jumlahSiswa}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.violet[100]} 0%, ${colors.violet[200]} 100%)`,
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.violet[200]}`,
            }}
            className="stats-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                  <Award size={24} color={colors.white} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '6px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Progress Rata-rata
                  </p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.violet[700],
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    lineHeight: '1.1',
                  }}>
                    {stats.progressRataRata}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}
          className="cards-grid">
            {/* Kelola Kelas Card */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[100]}`,
            }}
            className="card-container">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                }}>
                  <BookOpen size={22} color={colors.white} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Kelola Kelas
                </h3>
              </div>

              {kelasList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: colors.text.tertiary }}>
                  <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Belum ada kelas</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {kelasList.map((kelas) => (
                    <Link key={kelas.id} href={`/guru/siswa?kelasId=${kelas.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        border: `2px solid ${colors.emerald[100]}`,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.white} 100%)`,
                        transition: 'all 0.3s ease',
                      }}
                      className="kelas-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: `${colors.emerald[500]}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <BookOpen size={20} color={colors.emerald[600]} />
                          </div>
                          <div>
                            <p style={{
                              fontWeight: 600,
                              color: colors.text.primary,
                              fontFamily: 'Poppins, system-ui, sans-serif',
                              marginBottom: '2px',
                            }}>
                              {kelas.nama}
                            </p>
                            <p style={{
                              fontSize: '13px',
                              color: colors.text.tertiary,
                              fontFamily: 'Poppins, system-ui, sans-serif',
                            }}>
                              {kelas._count.siswa} siswa • Tingkat {kelas.tingkat}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Aktivitas Terbaru Card */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.amber[100]}`,
            }}
            className="card-container">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(247, 200, 115, 0.3)',
                }}>
                  <BookMarked size={22} color={colors.white} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Aktivitas Terbaru
                </h3>
              </div>

              {aktivitasTerbaru.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: colors.text.tertiary }}>
                  <BookMarked size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Belum ada aktivitas</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {aktivitasTerbaru.map((item, index) => {
                    const statusBadge = getStatusBadge(item.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'start',
                          gap: '12px',
                          padding: '16px 0',
                          borderBottom: index < aktivitasTerbaru.length - 1 ? `1px solid ${colors.gray[200]}` : 'none',
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: `${colors.emerald[500]}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <User size={18} color={colors.emerald[600]} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: 600,
                            color: colors.text.primary,
                            fontSize: '14px',
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            marginBottom: '4px',
                          }}>
                            {item.siswa.user.name}
                          </p>
                          <p style={{
                            fontSize: '13px',
                            color: colors.text.tertiary,
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            marginBottom: '6px',
                          }}>
                            Setoran {item.surah.namaLatin} ayat {item.ayatMulai}-{item.ayatSelesai}
                          </p>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '100px',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            fontFamily: 'Poppins, system-ui, sans-serif',
                          }}>
                            <StatusIcon size={12} />
                            {statusBadge.text}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: colors.text.tertiary,
                          fontFamily: 'Poppins, system-ui, sans-serif',
                        }}>
                          {new Date(item.tanggalSetor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Agenda Hari Ini - Full Width */}
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
            border: `2px solid ${colors.violet[100]}`,
          }}
          className="card-container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                }}>
                  <Calendar size={22} color={colors.white} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Agenda Setoran Hari Ini
                </h3>
              </div>
              <button
                onClick={() => setShowAgendaModal(true)}
                style={{
                  padding: '8px 16px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}
              >
                + Tambah
              </button>
            </div>

            {agendaHariIni.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: colors.text.tertiary }}>
                <Calendar size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '16px' }}>
                  Belum ada agenda hari ini
                </p>
                <button
                  onClick={() => setShowAgendaModal(true)}
                  style={{
                    padding: '10px 20px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  Tambah Agenda
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agendaHariIni.map((agenda) => {
                  const agendaStatus = getAgendaStatus(agenda.status);

                  return (
                    <div
                      key={agenda.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        border: `2px solid ${colors.violet[100]}`,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${colors.violet[50]} 0%, ${colors.white} 100%)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <Clock size={20} color={colors.violet[600]} />
                        <div>
                          <p style={{
                            fontWeight: 600,
                            color: colors.text.primary,
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            marginBottom: '2px',
                          }}>
                            {agenda.judul}
                          </p>
                          <p style={{
                            fontSize: '13px',
                            color: colors.text.tertiary,
                            fontFamily: 'Poppins, system-ui, sans-serif',
                          }}>
                            {agenda.waktuMulai}
                            {agenda.waktuSelesai && ` - ${agenda.waktuSelesai}`}
                            {agenda.kelas && ` • ${agenda.kelas.nama}`}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '100px',
                        background: agendaStatus.bg,
                        color: agendaStatus.color,
                        fontFamily: 'Poppins, system-ui, sans-serif',
                      }}>
                        {agendaStatus.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Agenda */}
      {showAgendaModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: `1px solid ${colors.gray[200]}`,
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Tambah Agenda Baru
              </h3>
              <button
                onClick={() => setShowAgendaModal(false)}
                style={{
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                <X size={20} color={colors.text.tertiary} />
              </button>
            </div>

            <form onSubmit={handleSubmitAgenda} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Judul Agenda <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formAgenda.judul}
                  onChange={(e) => setFormAgenda({ ...formAgenda, judul: e.target.value })}
                  placeholder="Contoh: Setoran Juz 1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Kelas (Opsional)
                </label>
                <select
                  value={formAgenda.kelasId}
                  onChange={(e) => setFormAgenda({ ...formAgenda, kelasId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={formAgenda.deskripsi}
                  onChange={(e) => setFormAgenda({ ...formAgenda, deskripsi: e.target.value })}
                  placeholder="Deskripsi agenda..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Tanggal <span style={{ color: colors.error }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formAgenda.tanggal}
                  onChange={(e) => setFormAgenda({ ...formAgenda, tanggal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Waktu Mulai <span style={{ color: colors.error }}>*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formAgenda.waktuMulai}
                    onChange={(e) => setFormAgenda({ ...formAgenda, waktuMulai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={formAgenda.waktuSelesai}
                    onChange={(e) => setFormAgenda({ ...formAgenda, waktuSelesai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `2px solid ${colors.gray[200]}`,
                    background: colors.white,
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .stats-card {
          animation: fadeIn 0.5s ease-out;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        .card-container {
          animation: fadeIn 0.6s ease-out;
          transition: all 0.3s ease;
        }

        .card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .kelas-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(26, 147, 111, 0.12);
        }

        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </GuruLayout>
  );
}
