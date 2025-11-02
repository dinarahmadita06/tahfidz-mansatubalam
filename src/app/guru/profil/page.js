'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircle, Mail, Phone, MapPin, BookOpen, Calendar, Lock, Save, Edit2, X, Shield, Award } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

// Islamic Modern Color Palette - Emerald & Teal Theme
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
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
    700: '#374151',
    800: '#1F2937',
  },
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#6B7280',
  },
};

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    alamat: '',
    bidangKeahlian: '',
    mulaiMengajar: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Load profile data from session or API
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        alamat: session.user.alamat || '',
        bidangKeahlian: session.user.bidangKeahlian || 'Tahfidz Al-Quran',
        mulaiMengajar: session.user.mulaiMengajar || '',
      });
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setSuccess(true);
        setEditMode(false);
        // Update session
        await update();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert('Password berhasil diubah');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to change password'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: `4px solid ${colors.emerald[200]}`,
            borderTop: `4px solid ${colors.emerald[600]}`,
            borderRadius: '50%',
            margin: '0 auto 16px',
          }} className="spinner" />
          <p style={{
            color: colors.text.secondary,
            fontFamily: '"Poppins", system-ui, sans-serif',
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <GuruLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.teal[50]} 100%)`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23059669' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%2314B8A6' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '20px',
          borderBottom: `1px solid ${colors.gray[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }}
        className="md:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.teal[500]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                flexShrink: 0,
              }}>
                <UserCircle size={22} style={{ color: colors.white }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
                className="md:text-2xl">
                  Profil Saya
                </h1>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.text.secondary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
                className="md:text-sm">
                  Kelola informasi profil Anda
                </p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  minHeight: '44px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
                className="edit-btn md:text-sm md:px-5"
              >
                <Edit2 size={16} />
                Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          position: 'relative',
          padding: '20px',
          zIndex: 2,
          maxWidth: '1024px',
          margin: '0 auto',
        }}
        className="md:px-8 md:py-8">
          {success && (
            <div style={{
              marginBottom: '24px',
              background: `${colors.emerald[100]}`,
              border: `2px solid ${colors.emerald[300]}`,
              color: colors.emerald[800],
              padding: '14px 16px',
              borderRadius: '12px',
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
            }}>
              ✓ Profil berhasil diperbarui!
            </div>
          )}

          {/* Profile Card */}
          <div style={{
            background: colors.white,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${colors.gray[200]}`,
            overflow: 'hidden',
            marginBottom: '20px',
          }}
          className="md:rounded-xl">
            {/* Header Section */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.teal[500]} 100%)`,
              padding: '24px 20px',
              position: 'relative',
            }}
            className="md:p-8">
              {/* Islamic Pattern Decoration */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
                opacity: 0.5,
              }} className="md:w-48 md:h-48" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: colors.white,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                  border: `3px solid ${colors.white}`,
                  flexShrink: 0,
                }}
                className="md:w-20 md:h-20">
                  <span style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="md:text-4xl">
                    {profileData.name?.charAt(0)?.toUpperCase() || 'G'}
                  </span>
                </div>
                <div style={{ color: colors.white, flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="md:text-2xl">
                    {profileData.name || 'Nama Guru'}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    opacity: 0.95,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="md:text-sm">
                    <Shield size={14} />
                    <span>Guru Tahfidz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}
            className="md:p-8">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Informasi Pribadi */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: colors.text.primary,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="md:text-lg">
                    <UserCircle size={18} style={{ color: colors.emerald[600] }} />
                    Informasi Pribadi
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '16px',
                  }}
                  className="md:grid-cols-2 md:gap-5">
                    {/* Nama Lengkap */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        Nama Lengkap <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!editMode}
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          outline: 'none',
                          background: !editMode ? colors.gray[50] : colors.white,
                          color: !editMode ? colors.text.tertiary : colors.text.primary,
                        }}
                        className="profile-input"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        <Mail size={14} />
                        Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          background: colors.gray[50],
                          color: colors.text.tertiary,
                        }}
                      />
                      <p style={{
                        fontSize: '11px',
                        color: colors.text.tertiary,
                        marginTop: '6px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        Email tidak dapat diubah
                      </p>
                    </div>

                    {/* Nomor Telepon */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        <Phone size={14} />
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        disabled={!editMode}
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="08xx xxxx xxxx"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          outline: 'none',
                          background: !editMode ? colors.gray[50] : colors.white,
                          color: !editMode ? colors.text.tertiary : colors.text.primary,
                        }}
                        className="profile-input"
                      />
                    </div>

                    {/* Mulai Mengajar */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        <Calendar size={14} />
                        Mulai Mengajar
                      </label>
                      <input
                        type="date"
                        disabled={!editMode}
                        value={profileData.mulaiMengajar}
                        onChange={(e) => setProfileData({ ...profileData, mulaiMengajar: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          outline: 'none',
                          background: !editMode ? colors.gray[50] : colors.white,
                          color: !editMode ? colors.text.tertiary : colors.text.primary,
                        }}
                        className="profile-input"
                      />
                    </div>

                    {/* Alamat */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        <MapPin size={14} />
                        Alamat
                      </label>
                      <textarea
                        rows={3}
                        disabled={!editMode}
                        value={profileData.alamat}
                        onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                        placeholder="Alamat lengkap..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          outline: 'none',
                          background: !editMode ? colors.gray[50] : colors.white,
                          color: !editMode ? colors.text.tertiary : colors.text.primary,
                          resize: 'vertical',
                        }}
                        className="profile-input"
                      />
                    </div>

                    {/* Bidang Keahlian */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        marginBottom: '8px',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        <BookOpen size={14} />
                        Bidang Keahlian
                      </label>
                      <input
                        type="text"
                        disabled={!editMode}
                        value={profileData.bidangKeahlian}
                        onChange={(e) => setProfileData({ ...profileData, bidangKeahlian: e.target.value })}
                        placeholder="Contoh: Tahfidz Al-Quran, Tahsin, dll"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${colors.gray[300]}`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                          outline: 'none',
                          background: !editMode ? colors.gray[50] : colors.white,
                          color: !editMode ? colors.text.tertiary : colors.text.primary,
                        }}
                        className="profile-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {editMode && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '20px',
                    borderTop: `1px solid ${colors.gray[200]}`,
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        // Reset form
                        setProfileData({
                          name: session.user.name || '',
                          email: session.user.email || '',
                          phone: session.user.phone || '',
                          alamat: session.user.alamat || '',
                          bidangKeahlian: session.user.bidangKeahlian || 'Tahfidz Al-Quran',
                          mulaiMengajar: session.user.mulaiMengajar || '',
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '14px 20px',
                        border: `2px solid ${colors.gray[300]}`,
                        background: colors.white,
                        color: colors.text.primary,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}
                      className="cancel-btn"
                    >
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
                        padding: '14px 20px',
                        background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        opacity: loading ? 0.6 : 1,
                      }}
                      className="save-btn"
                    >
                      <Save size={18} />
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Security Section */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${colors.gray[200]}`,
            padding: '28px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.text.primary,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            }}>
              <Lock size={20} style={{ color: colors.teal[600] }} />
              Keamanan
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.teal[50]} 100%)`,
              borderRadius: '14px',
              border: `2px solid ${colors.emerald[200]}`,
            }}>
              <div>
                <p style={{
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontSize: '15px',
                  marginBottom: '4px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Password
                </p>
                <p style={{
                  fontSize: '13px',
                  color: colors.text.secondary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Ubah password akun Anda
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                style={{
                  padding: '12px 20px',
                  border: `2px solid ${colors.emerald[400]}`,
                  background: colors.white,
                  color: colors.emerald[700],
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
                className="password-btn"
              >
                Ubah Password
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            marginTop: '24px',
            background: `${colors.teal[100]}`,
            border: `2px solid ${colors.teal[300]}`,
            borderRadius: '16px',
            padding: '16px 20px',
          }}>
            <p style={{
              fontSize: '13px',
              color: colors.teal[900],
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            }}>
              <strong>💡 Tips:</strong> Pastikan informasi profil Anda selalu ter-update.
              Informasi ini akan ditampilkan kepada siswa dan orang tua siswa.
            </p>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
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
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              maxWidth: '480px',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 28px',
                borderBottom: `1px solid ${colors.gray[200]}`,
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Ubah Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text.tertiary,
                    cursor: 'pointer',
                  }}
                  className="close-modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Password Lama */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Password Lama <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Masukkan password lama"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                    }}
                    className="modal-input"
                  />
                </div>

                {/* Password Baru */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Password Baru <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                    }}
                    className="modal-input"
                  />
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Konfirmasi Password Baru <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ketik ulang password baru"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[300]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      outline: 'none',
                    }}
                    className="modal-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: `2px solid ${colors.gray[300]}`,
                      background: colors.white,
                      color: colors.text.primary,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                    }}
                    className="modal-cancel-btn"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      opacity: loading ? 0.6 : 1,
                    }}
                    className="modal-submit-btn"
                  >
                    {loading ? 'Menyimpan...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global Styles */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

          /* Spinner Animation */
          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Edit Button Hover */
          .edit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }

          /* Profile Input Focus */
          .profile-input:focus {
            border-color: ${colors.emerald[500]};
            box-shadow: 0 0 0 3px ${colors.emerald[100]};
          }

          /* Cancel Button Hover */
          .cancel-btn:hover {
            background: ${colors.gray[50]};
            border-color: ${colors.emerald[500]};
          }

          /* Save Button Hover */
          .save-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }

          /* Password Button Hover */
          .password-btn:hover {
            background: ${colors.emerald[50]};
            border-color: ${colors.emerald[600]};
          }

          /* Close Modal Hover */
          .close-modal:hover {
            color: ${colors.text.primary};
          }

          /* Modal Input Focus */
          .modal-input:focus {
            border-color: ${colors.emerald[500]};
            box-shadow: 0 0 0 3px ${colors.emerald[100]};
          }

          /* Modal Cancel Button Hover */
          .modal-cancel-btn:hover {
            background: ${colors.gray[50]};
            border-color: ${colors.emerald[500]};
          }

          /* Modal Submit Button Hover */
          .modal-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: ${colors.gray[100]};
            borderRadius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, ${colors.emerald[400]} 0%, ${colors.teal[400]} 100%);
            borderRadius: 10px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.teal[500]} 100%);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .edit-btn {
              padding: 10px 18px;
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </GuruLayout>
  );
}
