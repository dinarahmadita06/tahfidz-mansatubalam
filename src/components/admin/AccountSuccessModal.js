'use client';

import { useState } from 'react';
import { CheckCircle, Copy, Check, Eye, EyeOff, X, LogIn } from 'lucide-react';
import { copyToClipboard } from '@/lib/passwordUtils';

const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
};

export default function AccountSuccessModal({ accounts, onClose }) {
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const handleCopy = async (text, field) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 60,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.white,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: `2px solid ${colors.emerald[100]}`,
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 24px',
            borderBottom: `2px solid ${colors.gray[100]}`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(26, 147, 111, 0.3)',
            }}
          >
            <CheckCircle size={40} color={colors.white} />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              marginBottom: '8px',
            }}
          >
            Akun Berhasil Dibuat! 🎉
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: colors.text.secondary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            }}
          >
            Berikut detail akun yang telah dibuat. Pastikan untuk menyimpan informasi ini.
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Student Account */}
          <div
            style={{
              background: colors.emerald[50],
              border: `2px solid ${colors.emerald[100]}`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: colors.emerald[700],
                fontFamily: '"Poppins", system-ui, sans-serif',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: colors.emerald[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  fontSize: '18px',
                }}
              >
                {accounts.student.name.charAt(0).toUpperCase()}
              </span>
              Akun Siswa
            </h3>

            {/* Student Name */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Nama Siswa
              </label>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
              >
                {accounts.student.name}
              </div>
            </div>

            {/* Student Email */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Username
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: colors.text.secondary,
                  }}
                >
                  {accounts.student.username}
                </div>
                <button
                  onClick={() => handleCopy(accounts.student.username, 'student-username')}
                  style={{
                    padding: '10px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: copiedField === 'student-username' ? colors.emerald[600] : colors.text.tertiary,
                  }}
                  className="copy-btn"
                  title="Salin username"
                >
                  {copiedField === 'student-username' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Student Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: colors.text.secondary,
                  }}
                >
                  {showStudentPassword ? accounts.student.password : '••••••••'}
                </div>
                <button
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                  style={{
                    padding: '10px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: colors.text.tertiary,
                  }}
                  className="copy-btn"
                  title={showStudentPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showStudentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => handleCopy(accounts.student.password, 'student-password')}
                  style={{
                    padding: '10px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: copiedField === 'student-password' ? colors.emerald[600] : colors.text.tertiary,
                  }}
                  className="copy-btn"
                  title="Salin password"
                >
                  {copiedField === 'student-password' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Parent Account */}
          {accounts.parent && (
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.gray[100]} 0%, ${colors.gray[200]}50 100%)`,
                border: `2px solid ${colors.gray[200]}`,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.white,
                    fontSize: '18px',
                  }}
                >
                  {accounts.parent.name.charAt(0).toUpperCase()}
                </span>
                Akun Orang Tua {accounts.parent.isNew ? '(Baru Dibuat)' : '(Sudah Ada)'}
              </h3>

              {/* Parent Name */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.tertiary,
                    marginBottom: '6px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Nama Orang Tua
                </label>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                >
                  {accounts.parent.name}
                </div>
              </div>

              {/* Parent Email */}
              <div style={{ marginBottom: accounts.parent.isNew ? '16px' : '0' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.tertiary,
                    marginBottom: '6px',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Username
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: colors.white,
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      color: colors.text.secondary,
                    }}
                  >
                    {accounts.parent.username}
                  </div>
                  <button
                    onClick={() => handleCopy(accounts.parent.username, 'parent-username')}
                    style={{
                      padding: '10px',
                      background: colors.white,
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: copiedField === 'parent-username' ? colors.emerald[600] : colors.text.tertiary,
                    }}
                    className="copy-btn"
                    title="Salin username"
                  >
                    {copiedField === 'parent-username' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Parent Password (only if new) */}
              {accounts.parent.isNew && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: colors.text.tertiary,
                      marginBottom: '6px',
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: colors.white,
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        color: colors.text.secondary,
                      }}
                    >
                      {showParentPassword ? accounts.parent.password : '••••••••'}
                    </div>
                    <button
                      onClick={() => setShowParentPassword(!showParentPassword)}
                      style={{
                        padding: '10px',
                        background: colors.white,
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: colors.text.tertiary,
                      }}
                      className="copy-btn"
                      title={showParentPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showParentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => handleCopy(accounts.parent.password, 'parent-password')}
                      style={{
                        padding: '10px',
                        background: colors.white,
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: copiedField === 'parent-password' ? colors.emerald[600] : colors.text.tertiary,
                      }}
                      className="copy-btn"
                      title="Salin password"
                    >
                      {copiedField === 'parent-password' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {!accounts.parent.isNew && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: colors.white,
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: colors.text.tertiary,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                >
                  ℹ️ Siswa dihubungkan dengan akun orang tua yang sudah ada. Password tidak ditampilkan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: `2px solid ${colors.gray[100]}`,
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
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
            className="close-btn"
          >
            Tutup
          </button>
        </div>
      </div>

      <style jsx>{`
        .copy-btn:hover {
          background: ${colors.gray[100]} !important;
          transform: scale(1.05);
        }

        .close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
