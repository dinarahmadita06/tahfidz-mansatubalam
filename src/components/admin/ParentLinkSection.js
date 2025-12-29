'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import PasswordField from './PasswordField';
import { generateParentEmail, generateWaliEmail } from '@/lib/passwordUtils';

const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  teal: {
    500: '#14b8a6',
    600: '#0d9488',
  },
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
};

export default function ParentLinkSection({
  mode,
  onModeChange,
  selectedParentId,
  onSelectParent,
  newParentData,
  onNewParentChange,
  siswaFormData = {}, // Receive siswa form data to access NIS
}) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [waliType, setWaliType] = useState('Ayah'); // 'Ayah', 'Ibu', 'Wali Lainnya'
  const [emailWaliManuallyEdited, setEmailWaliManuallyEdited] = useState(false); // Track if email was manually edited

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await fetch('/api/admin/orangtua?limit=1000');
      const result = await response.json();
      setParents(result.data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate email when name or NIS changes (if not manually edited)
  useEffect(() => {
    if (mode === 'create' && newParentData.name && siswaFormData.nis && !emailWaliManuallyEdited) {
      const email = generateWaliEmail(newParentData.name, siswaFormData.nis);
      if (email) {
        onNewParentChange({ ...newParentData, email });
      }
    }
  }, [newParentData.name, siswaFormData.nis, emailWaliManuallyEdited, mode]);

  // Auto-generate email when name or phone changes (fallback to phone-based for compatibility)
  useEffect(() => {
    if (mode === 'create' && newParentData.name && newParentData.noTelepon && !siswaFormData.nis) {
      const email = generateParentEmail(newParentData.name, newParentData.noTelepon);
      onNewParentChange({ ...newParentData, email });
    }
  }, [newParentData.name, newParentData.noTelepon]);

  const filteredParents = parents.filter(
    (p) =>
      p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.noTelepon && p.noTelepon.includes(searchTerm))
  );

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Users size={20} color={colors.teal[600]} />
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            }}
          >
            Data Orang Tua / Wali
          </h3>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: colors.text.tertiary,
            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          }}
        >
          Hubungkan siswa dengan akun orang tua / wali
        </p>
      </div>

      {/* Mode Selector - Radio Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Select Existing Parent */}
        <label
          style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: `2px solid ${mode === 'select' ? colors.emerald[500] : colors.gray[200]}`,
            borderRadius: '12px',
            background: mode === 'select' ? colors.emerald[50] : colors.white,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          className="parent-mode-option"
        >
          <input
            type="radio"
            name="parentMode"
            value="select"
            checked={mode === 'select'}
            onChange={() => onModeChange('select')}
            style={{
              width: '18px',
              height: '18px',
              accentColor: colors.emerald[600],
              cursor: 'pointer',
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: '"Poppins", system-ui, sans-serif',
                marginBottom: '2px',
              }}
            >
              Pilih Orang Tua yang Sudah Ada
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}
            >
              Pilih dari daftar orang tua terdaftar
            </div>
          </div>
        </label>

        {/* Create New Parent */}
        <label
          style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: `2px solid ${mode === 'create' ? colors.emerald[500] : colors.gray[200]}`,
            borderRadius: '12px',
            background: mode === 'create' ? colors.emerald[50] : colors.white,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          className="parent-mode-option"
        >
          <input
            type="radio"
            name="parentMode"
            value="create"
            checked={mode === 'create'}
            onChange={() => onModeChange('create')}
            style={{
              width: '18px',
              height: '18px',
              accentColor: colors.emerald[600],
              cursor: 'pointer',
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: '"Poppins", system-ui, sans-serif',
                marginBottom: '2px',
              }}
            >
              Buat Orang Tua Baru
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}
            >
              Daftarkan orang tua baru
            </div>
          </div>
        </label>
      </div>

      {/* Content Based on Mode */}
      {mode === 'select' ? (
        /* Select Existing Parent Mode */
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: colors.text.secondary,
              marginBottom: '8px',
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            }}
          >
            Pilih Orang Tua
            <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
          </label>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '10px',
              paddingBottom: '10px',
              border: `2px solid ${colors.gray[200]}`,
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              outline: 'none',
              marginBottom: '12px',
              transition: 'all 0.3s ease',
            }}
            className="search-parent-input"
          />

          {/* Dropdown List */}
          <select
            value={selectedParentId || ''}
            onChange={(e) => onSelectParent(e.target.value)}
            required={mode === 'select'}
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
              background: colors.white,
            }}
            className="select-parent-dropdown"
          >
            <option value="">-- Pilih Orang Tua --</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : filteredParents.length === 0 ? (
              <option disabled>Tidak ada orang tua ditemukan</option>
            ) : (
              filteredParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.user.name} - {parent.user.email}
                  {parent.noTelepon ? ` (${parent.noTelepon})` : ''}
                </option>
              ))
            )}
          </select>

          {/* Info about selected parent */}
          {selectedParentId && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: colors.emerald[50],
                border: `1px solid ${colors.emerald[100]}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}
            >
              ✅ Orang tua dipilih. Siswa akan terhubung dengan akun orang tua yang sudah ada.
            </div>
          )}
        </div>
      ) : (
        /* Create New Parent Mode */
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
            }}
          >
            {/* Wali Type Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}
              >
                Jenis Wali
                <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
              </label>
              <select
                value={waliType}
                onChange={(e) => setWaliType(e.target.value)}
                required={mode === 'create'}
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
                  background: colors.white,
                }}
                className="parent-input"
              >
                <option value="Ayah">Ayah</option>
                <option value="Ibu">Ibu</option>
                <option value="Wali Lainnya">Wali Lainnya</option>
              </select>
              <p
                style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  marginTop: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
              >
                Pilih jenis wali utama untuk siswa
              </p>
            </div>
          
            {/* Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}
              >
                Nama Lengkap Orang Tua
                <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="text"
                value={newParentData.name}
                onChange={(e) => onNewParentChange({ ...newParentData, name: e.target.value })}
                placeholder="Contoh: Ahmad Fauzi"
                required={mode === 'create'}
                style={{
                  width: '100%',
                  paddingLeft: '16px',
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
                className="parent-input"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}
              >
                Nomor Telepon
                <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="tel"
                value={newParentData.noTelepon}
                onChange={(e) => onNewParentChange({ ...newParentData, noTelepon: e.target.value })}
                placeholder="Contoh: 081234567890"
                required={mode === 'create'}
                style={{
                  width: '100%',
                  paddingLeft: '16px',
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
                className="parent-input"
              />
            </div>

            {/* Email (Auto-generated based on NIS, editable) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}
              >
                Email (Otomatis dari Nama + NIS Siswa)
                <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="email"
                value={newParentData.email}
                onChange={(e) => {
                  onNewParentChange({ ...newParentData, email: e.target.value });
                  setEmailWaliManuallyEdited(true); // Mark as manually edited
                }}
                placeholder="Email akan digenerate otomatis dari nama + NIS siswa"
                required={mode === 'create'}
                style={{
                  width: '100%',
                  paddingLeft: '16px',
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
                className="parent-input"
              />
              <p
                style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  marginTop: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}
              >
                Format: namapertama.NIS@wali.tahfidz.sch.id. Bisa diedit manual jika diperlukan.
              </p>
            </div>

            {/* Password */}
            <PasswordField
              label="Password Akun Wali Utama"
              value={newParentData.password}
              onChange={(password) => onNewParentChange({ ...newParentData, password })}
              placeholder="Password untuk akun wali utama"
              required={mode === 'create'}
              helperText="Password untuk login wali. Satu akun wali dapat digunakan bersama oleh ayah/ibu untuk mengakses data siswa."
            />

            {/* Info about shared wali account */}
            <div
              style={{
                padding: '12px',
                background: colors.emerald[50],
                border: `1px solid ${colors.emerald[100]}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: colors.text.secondary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}
            >
              ✅ <strong>Akun Wali Utama:</strong> Satu akun ini dapat digunakan bersama oleh {waliType.toLowerCase()} dan keluarganya (misalnya ayah dan ibu) untuk mengakses data siswa dari perangkat berbeda.
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .parent-mode-option:hover {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 2px 8px rgba(26, 147, 111, 0.1);
        }

        .search-parent-input:focus,
        .select-parent-dropdown:focus,
        .parent-input:focus {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${colors.emerald[500]}20 !important;
        }
      `}</style>
    </div>
  );
}
