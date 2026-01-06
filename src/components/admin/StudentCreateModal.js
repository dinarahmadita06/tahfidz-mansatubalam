'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Key, Users, BookOpen, User } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import PasswordField from './PasswordField';
import ParentLinkSection from './ParentLinkSection';
import AccountSuccessModal from './AccountSuccessModal';
import { generateSiswaEmail } from '@/lib/siswaUtils';

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
  amber: {
    50: '#FEF3C7',
    200: '#FCD34D',
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

export default function StudentCreateModal({ isOpen, onClose, onSuccess, defaultKelasId = null }) {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState(null);

  // Parent mode: 'select' or 'create'
  const [parentMode, setParentMode] = useState('select');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newParentData, setNewParentData] = useState({
    name: '',
    noHP: '',
    email: '',
    password: '',
    jenisWali: 'Ayah',
  });

  // Student form data
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    nis: '',
    nisn: '',
    kelasId: defaultKelasId || '',
    jenisKelamin: 'LAKI_LAKI',
    tanggalLahir: '',
    alamat: '',
    noTelepon: '',
  });

  // Error state for field-level validation
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchKelas();
      // Set defaultKelasId when modal opens
      if (defaultKelasId) {
        setFormData(prev => ({ ...prev, kelasId: defaultKelasId }));
      }
    }
  }, [isOpen, defaultKelasId]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data || []);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      password: '',
      nis: '',
      nisn: '',
      kelasId: defaultKelasId || '',
      jenisKelamin: 'LAKI_LAKI',
      tanggalLahir: '',
      alamat: '',
      noTelepon: '',
    });
    setParentMode('select');
    setSelectedParentId('');
    setNewParentData({
      name: '',
      noHP: '',
      email: '',
      password: '',
      jenisWali: 'Ayah',
    });
    setFieldErrors({});
  };

  // Clear error for specific field when user starts typing
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Scroll to first error field
  const scrollToFirstError = (errorMap) => {
    const firstErrorField = Object.keys(errorMap)[0];
    if (firstErrorField) {
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({}); // Clear previous errors

    try {
      // 1. Create student
      const siswaPayload = {
        ...formData,
        email: generateSiswaEmail(formData.name, formData.nis),
      };

      const siswaResponse = await fetch('/api/admin/siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siswaPayload),
      });

      const siswaResult = await siswaResponse.json();

      if (!siswaResponse.ok) {
        // Handle validation errors from backend
        if (siswaResponse.status === 400) {
          // Missing fields error
          if (siswaResult.missingFields) {
            const errors = {};
            siswaResult.missingFields.forEach(field => {
              errors[field] = 'Wajib diisi';
            });
            setFieldErrors(errors);
            scrollToFirstError(errors);
            throw new Error('Beberapa field masih kosong. Silakan periksa kembali.');
          }
        } else if (siswaResponse.status === 422) {
          // Invalid format error
          if (siswaResult.invalidFields) {
            setFieldErrors(siswaResult.invalidFields);
            scrollToFirstError(siswaResult.invalidFields);
            throw new Error('Beberapa field memiliki format yang tidak valid.');
          }
        }
        throw new Error(siswaResult.error || 'Gagal membuat akun siswa');
      }

      const siswaId = siswaResult.id;
      const siswaEmail = siswaResult.user.email;

      let parentEmail = '';
      let parentPassword = '';
      let parentName = '';

      // 2. Handle parent linking
      if (parentMode === 'select') {
        // Link to existing parent
        if (!selectedParentId) {
          throw new Error('Silakan pilih orang tua');
        }

        const linkResponse = await fetch('/api/admin/orangtua-siswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId,
            orangTuaId: selectedParentId,
            hubungan: 'Orang Tua',
          }),
        });

        if (!linkResponse.ok) {
          const linkError = await linkResponse.json();
          throw new Error(linkError.error || 'Gagal menghubungkan dengan orang tua');
        }

        // Fetch parent data for display
        const parentData = await fetch(`/api/admin/orangtua/${selectedParentId}`);
        const parent = await parentData.json();
        parentEmail = parent.user?.email || '';
        parentName = parent.user?.name || '';
        parentPassword = '(Password orang tua yang sudah ada tidak ditampilkan)';
      } else {
        // Create new parent
        // Validate all required parent fields
        const missingParentFields = [];
        if (!newParentData.name || !newParentData.name.trim()) missingParentFields.push('Nama orang tua');
        if (!newParentData.noHP || !newParentData.noHP.trim()) missingParentFields.push('Nomor telepon');
        if (!newParentData.email || !newParentData.email.trim()) missingParentFields.push('Email wali');
        if (!newParentData.password || !newParentData.password.trim()) missingParentFields.push('Password wali');
        if (!newParentData.jenisWali) missingParentFields.push('Jenis wali');

        if (missingParentFields.length > 0) {
          throw new Error(`Data orang tua tidak lengkap: ${missingParentFields.join(', ')}`);
        }

        // Normalize data before sending
        const parentPayload = {
          name: newParentData.name.trim(),
          noHP: newParentData.noHP.trim().replace(/[^0-9]/g, ''), // Remove non-digits
          email: newParentData.email.trim().toLowerCase(),
          password: newParentData.password.trim(),
          nik: `NIK${Date.now()}${Math.random().toString().slice(2, 10)}`,  // Better unique NIK
          jenisKelamin: 'LAKI_LAKI',  // Default, could be enhanced
        };

        console.log('Creating parent with payload:', parentPayload);

        const parentResponse = await fetch('/api/admin/orangtua', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parentPayload),
        });

        const parentResult = await parentResponse.json();

        console.log('Parent creation response:', parentResult);

        if (!parentResponse.ok) {
          console.error('❌ Parent creation failed:', parentResult);
          // Show specific error messages from backend
          if (parentResult.error === 'Email sudah terdaftar') {
            throw new Error('Email wali sudah digunakan');
          }
          throw new Error(parentResult.error || 'Gagal membuat akun orang tua');
        }

        const orangTuaId = parentResult.id;
        parentEmail = parentResult.user.email;
        parentPassword = newParentData.password;
        parentName = parentResult.user.name;

        console.log('✅ Parent created successfully:', { orangTuaId, parentName, parentEmail });

        // Link new parent to student
        const linkResponse = await fetch('/api/admin/orangtua-siswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId,
            orangTuaId,
            hubungan: 'Orang Tua',
          }),
        });

        const linkResult = await linkResponse.json();

        if (!linkResponse.ok) {
          console.error('❌ Link creation failed:', linkResult);
          throw new Error(linkResult.error || 'Gagal menghubungkan dengan orang tua');
        }

        console.log('✅ Parent linked to student successfully');
      }

      // 3. Show success modal with account details
      setCreatedAccounts({
        student: {
          name: formData.name,
          email: siswaEmail,
          password: formData.password,
        },
        parent: {
          name: parentName,
          email: parentEmail,
          password: parentPassword,
          isNew: parentMode === 'create',
        },
      });
      setShowSuccessModal(true);

      // 4. Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.white,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.emerald[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              background: colors.white,
              borderBottom: `2px solid ${colors.gray[100]}`,
              padding: '24px 32px',
              borderRadius: '24px 24px 0 0',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserPlus size={24} color={colors.white} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: colors.text.primary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      marginBottom: '2px',
                    }}
                  >
                    Tambah Siswa Baru
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      color: colors.text.tertiary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    }}
                  >
                    Lengkapi data siswa dan hubungkan dengan orang tua
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1,
                }}
                className="close-modal-btn"
              >
                <X size={24} color={colors.text.tertiary} />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '32px' }}>
              {/* Section 1: Data Siswa */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <User size={20} color={colors.teal[600]} />
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: colors.text.primary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    }}
                  >
                    Data Siswa
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Name */}
                  <div style={{ gridColumn: '1 / -1' }}>
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
                      Nama Lengkap
                      <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Contoh: Ahmad Zaki"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: fieldErrors.name ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                    />
                    {fieldErrors.name && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '6px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      }}>
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* NIS */}
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
                      NIS
                      <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nis"
                      value={formData.nis}
                      onChange={(e) => handleFieldChange('nis', e.target.value)}
                      placeholder="Nomor Induk Siswa"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: fieldErrors.nis ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                    />
                    {fieldErrors.nis && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '6px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      }}>
                        {fieldErrors.nis}
                      </p>
                    )}
                  </div>

                  {/* NISN */}
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
                      NISN (Opsional)
                    </label>
                    <input
                      type="text"
                      name="nisn"
                      value={formData.nisn}
                      onChange={(e) => handleFieldChange('nisn', e.target.value)}
                      placeholder="Nomor Induk Siswa Nasional"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: fieldErrors.nisn ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      className="form-input"
                    />
                    {fieldErrors.nisn && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '6px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      }}>
                        {fieldErrors.nisn}
                      </p>
                    )}
                  </div>

                  {/* Kelas */}
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
                      Kelas
                      <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
                    </label>
                    <select
                      name="kelasId"
                      value={formData.kelasId}
                      onChange={(e) => handleFieldChange('kelasId', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: fieldErrors.kelasId ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: colors.white,
                      }}
                      className="form-input"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {kelas.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.kelasId && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '6px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      }}>
                        {fieldErrors.kelasId}
                      </p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
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
                      Jenis Kelamin
                      <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
                    </label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={(e) => handleFieldChange('jenisKelamin', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: fieldErrors.jenisKelamin ? '2px solid #ef4444' : `2px solid ${colors.gray[200]}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: colors.white,
                      }}
                      className="form-input"
                    >
                      <option value="LAKI_LAKI">Laki-laki</option>
                      <option value="PEREMPUAN">Perempuan</option>
                    </select>
                    {fieldErrors.jenisKelamin && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        marginTop: '6px',
                        fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      }}>
                        {fieldErrors.jenisKelamin}
                      </p>
                    )}
                  </div>

                  {/* Tanggal Lahir */}
                  <div style={{ gridColumn: '1 / -1' }}>
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
                      Tanggal Lahir (Opsional)
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
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
              </div>

              {/* Section 2: Akun Siswa */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Key size={20} color={colors.teal[600]} />
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: colors.text.primary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    }}
                  >
                    Akun Siswa
                  </h3>
                </div>

                {/* Email (Auto) */}
                <div style={{ marginBottom: '16px' }}>
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
                    Email (Otomatis)
                  </label>
                  <input
                    type="email"
                    value={formData.name && formData.nis ? generateSiswaEmail(formData.name, formData.nis) : ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      outline: 'none',
                      background: colors.gray[100],
                      color: colors.text.tertiary,
                    }}
                  />
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.text.tertiary,
                      marginTop: '6px',
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    }}
                  >
                    Email otomatis dibuat dari Nama + NIS siswa
                  </p>
                </div>

                {/* Password */}
                <PasswordField
                  label="Password Akun Siswa"
                  value={formData.password}
                  onChange={(password) => handleFieldChange('password', password)}
                  placeholder="Password untuk akun siswa"
                  required={true}
                  helperText="Gunakan kombinasi angka dan huruf. Bisa generate otomatis."
                  error={fieldErrors.password}
                />
              </div>

              {/* Section 3: Parent Linking */}
              <ParentLinkSection
                mode={parentMode}
                onModeChange={setParentMode}
                selectedParentId={selectedParentId}
                onSelectParent={setSelectedParentId}
                newParentData={newParentData}
                onNewParentChange={setNewParentData}
                siswaFormData={formData}
              />
            </div>

            {/* Footer Actions */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                background: colors.white,
                borderTop: `2px solid ${colors.gray[100]}`,
                padding: '20px 32px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                borderRadius: '0 0 24px 24px',
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.5 : 1,
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1,
                }}
                className="submit-btn"
              >
                {loading ? (
                  <LoadingIndicator size="small" inline text="Menyimpan..." className="text-white" />
                ) : (
                  'Simpan Siswa'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdAccounts && (
        <AccountSuccessModal accounts={createdAccounts} onClose={handleSuccessModalClose} />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .close-modal-btn:hover {
          background: ${colors.gray[100]} !important;
        }

        .form-input:focus {
          border-color: ${fieldErrors.name || fieldErrors.nis || fieldErrors.nisn || fieldErrors.kelasId || fieldErrors.jenisKelamin ? '#ef4444' : colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${fieldErrors.name || fieldErrors.nis || fieldErrors.nisn || fieldErrors.kelasId || fieldErrors.jenisKelamin ? '#ef444420' : colors.emerald[500]}20 !important;
        }

        .cancel-btn:hover {
          background: ${colors.gray[100]} !important;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }
      `}</style>
    </>
  );
}
