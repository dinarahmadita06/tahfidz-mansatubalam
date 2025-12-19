'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlus, Save, X, Loader2, Eye, EyeOff, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

// Islamic Modern Color Palette (same as Kelola Siswa)
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

export default function TambahSiswaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nisn: '',
    nis: '',
    kelasId: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    noHP: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchKelas();
    }
  }, [status, router]);

  useEffect(() => {
    // Auto-generate password on mount
    if (!formData.password) {
      generatePassword();
    }
  }, []);

  useEffect(() => {
    // Auto-generate email when name and NIS change
    if (formData.name && formData.nis) {
      const firstName = formData.name.trim().split(' ')[0].toLowerCase();
      const generatedEmail = `${firstName}.${formData.nis}@siswa.tahfidz.sch.id`;
      setFormData(prev => ({ ...prev, email: generatedEmail }));
    } else {
      setFormData(prev => ({ ...prev, email: '' }));
    }
  }, [formData.name, formData.nis]);

  const fetchKelas = async () => {
    try {
      const res = await fetch('/api/kelas?showAll=true');
      const data = await res.json();
      setKelasList(Array.isArray(data) ? data : []);

      // Auto-select first kelas if available (guru's assigned class)
      if (Array.isArray(data) && data.length > 0 && !formData.kelasId) {
        setFormData(prev => ({ ...prev, kelasId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const generatePassword = () => {
    // Generate random 8-character password with letters and numbers
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/siswa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          nisn: formData.nisn,
          nis: formData.nis,
          kelasId: formData.kelasId,
          jenisKelamin: formData.jenisKelamin,
          tempatLahir: formData.tempatLahir,
          tanggalLahir: formData.tanggalLahir,
          alamat: formData.alamat,
          noHP: formData.noHP,
          // Status 'pending' is set automatically by backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Siswa berhasil ditambahkan!\nData siswa akan ditampilkan setelah disetujui oleh admin.');
        router.push('/guru/siswa');
      } else {
        alert('Error: ' + (result.error || 'Failed to create siswa'));
      }
    } catch (error) {
      console.error('Error creating siswa:', error);
      alert('Terjadi kesalahan saat menambahkan siswa');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <GuruLayout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: colors.emerald[600] }} />
        </div>
      </GuruLayout>
    );
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <button
              onClick={() => router.push('/guru/siswa')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: colors.white,
                border: `2px solid ${colors.gray[300]}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}
              className="back-btn"
            >
              <ArrowLeft size={20} color={colors.text.primary} />
            </button>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(26, 147, 111, 0.3)',
            }}>
              <UserPlus size={28} color={colors.white} />
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '4px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Tambah Siswa Baru
              </h1>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Form input cepat untuk siswa pindahan atau siswa baru
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          {/* Info Alert */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
            border: `2px solid ${colors.amber[200]}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle size={22} color={colors.white} />
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '4px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Informasi Penting
              </p>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary,
                lineHeight: '1.6',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Data siswa yang Anda tambahkan akan masuk ke status <strong>Menunggu Validasi</strong> dan perlu disetujui oleh Admin sebelum menjadi data aktif.
                Namun, Anda tetap dapat melakukan input setoran, penilaian, dan presensi untuk siswa ini. Data akan tersimpan dan otomatis aktif setelah divalidasi Admin.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${colors.gray[200]}`,
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Nama Lengkap */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Nama Lengkap <span style={{ color: colors.emerald[600] }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    className="form-input"
                    placeholder="Contoh: Ahmad Zaki Mubarak"
                  />
                </div>

                {/* NIS and NISN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      NIS <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      className="form-input"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      NISN <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      className="form-input"
                      placeholder="Nomor Induk Siswa Nasional"
                    />
                  </div>
                </div>

                {/* Auto-generated Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Email Siswa <span style={{ color: colors.emerald[600] }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    readOnly
                    value={formData.email}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      background: colors.gray[50],
                      color: colors.text.secondary,
                      cursor: 'not-allowed',
                    }}
                    placeholder="Email akan dibuat otomatis"
                  />
                  <p style={{
                    fontSize: '12px',
                    color: colors.text.tertiary,
                    marginTop: '6px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    fontStyle: 'italic',
                  }}>
                    Email dibuat otomatis dari kata pertama nama dan NIS
                  </p>
                </div>

                {/* Auto-generated Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Password <span style={{ color: colors.emerald[600] }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      readOnly
                      value={formData.password}
                      style={{
                        width: '100%',
                        padding: '14px 100px 14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        background: colors.gray[50],
                        color: colors.text.primary,
                        cursor: 'not-allowed',
                        fontWeight: 600,
                        letterSpacing: showPassword ? 'normal' : '2px',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: '4px',
                    }}>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          padding: '8px',
                          background: colors.white,
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        className="icon-btn"
                        title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                      >
                        {showPassword ? <EyeOff size={18} color={colors.text.tertiary} /> : <Eye size={18} color={colors.text.tertiary} />}
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        style={{
                          padding: '8px',
                          background: colors.white,
                          border: `2px solid ${colors.emerald[300]}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        className="icon-btn-emerald"
                        title="Generate Password Baru"
                      >
                        <RefreshCw size={18} color={colors.emerald[600]} />
                      </button>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: colors.text.tertiary,
                    marginTop: '6px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    fontStyle: 'italic',
                  }}>
                    Password dibuat otomatis oleh sistem. Klik ikon refresh untuk membuat password baru.
                  </p>
                </div>

                {/* Kelas and Jenis Kelamin */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      Kelas <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <select
                      required
                      value={formData.kelasId}
                      onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      className="form-input"
                    >
                      <option value="">Pilih Kelas</option>
                      {kelasList.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>
                          {kelas.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      Jenis Kelamin <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <select
                      required
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      className="form-input"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Tempat Lahir and Tanggal Lahir */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      Tempat Lahir <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      className="form-input"
                      placeholder="Kota tempat lahir"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      marginBottom: '8px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}>
                      Tanggal Lahir <span style={{ color: colors.emerald[600] }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Nomor HP */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    value={formData.noHP}
                    onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    className="form-input"
                    placeholder="08xx xxxx xxxx (opsional)"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Alamat
                  </label>
                  <textarea
                    rows={4}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      resize: 'vertical',
                    }}
                    className="form-input"
                    placeholder="Alamat lengkap siswa (opsional)"
                  />
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  paddingTop: '24px',
                  borderTop: `2px solid ${colors.gray[200]}`,
                }}>
                  <button
                    type="button"
                    onClick={() => router.push('/guru/siswa')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px 24px',
                      background: colors.white,
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}
                    className="btn-cancel"
                  >
                    <X size={20} />
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px 24px',
                      background: loading
                        ? colors.gray[400]
                        : `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: colors.white,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(26, 147, 111, 0.3)',
                    }}
                    className="btn-submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Simpan Siswa
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Form Input Focus */
        .form-input:focus {
          border-color: ${colors.emerald[500]};
          box-shadow: 0 0 0 3px ${colors.emerald[100]};
        }

        /* Icon Buttons Hover */
        .icon-btn:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.gray[400]};
        }

        .icon-btn-emerald:hover {
          background: ${colors.emerald[50]};
          border-color: ${colors.emerald[500]};
        }

        /* Back Button Hover */
        .back-btn:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.emerald[500]};
          transform: translateX(-2px);
        }

        /* Action Buttons Hover */
        .btn-cancel:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.emerald[500]};
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.4);
        }

        /* Spin Animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </GuruLayout>
  );
}
