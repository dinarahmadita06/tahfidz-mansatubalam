'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Download, Settings, X, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import * as XLSX from 'xlsx';

// Islamic Modern Color Palette
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
  },
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    400: '#9CA3AF',
    600: '#4B5563',
  },
};

export default function ImportExportToolbar({
  kategori = 'guru', // 'guru' | 'siswa' | 'orangtua'
  data = [],
  onImportSuccess,
  onGenerateAccounts,
  showAddButton = false,
  onAddClick,
  addButtonLabel = 'Tambah',
  addButtonIcon
}) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoCreateAccount, setAutoCreateAccount] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showImportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showImportModal]);

  // Kapitalisasi kategori untuk display
  const kategoriDisplay = kategori === 'orangtua' ? 'Orang Tua' :
                          kategori.charAt(0).toUpperCase() + kategori.slice(1);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        alert('File harus berformat .xlsx atau .csv');
      }
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      alert('Pilih file terlebih dahulu');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('kategori', kategori);
      formData.append('autoCreateAccount', autoCreateAccount);

      const response = await fetch(`/api/admin/${kategori}/import`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          stats: result.stats,
          errors: result.errors || []
        });

        // Reset form setelah 2 detik jika semua berhasil
        if (result.stats.failed === 0) {
          setTimeout(() => {
            setShowImportModal(false);
            setSelectedFile(null);
            if (onImportSuccess) onImportSuccess();
          }, 2000);
        }
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Gagal import data',
          errors: result.errors || []
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Terjadi kesalahan saat import data'
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }

    try {
      // Format data sesuai kategori
      let exportData = [];

      if (kategori === 'guru') {
        exportData = data.map(item => ({
          'Nama Lengkap': item.user?.name || item.nama || '',
          'Email': item.user?.email || item.email || '',
          'NIP': item.nip || '',
          'Jenis Kelamin': item.jenisKelamin === 'LAKI_LAKI' ? 'L' : item.jenisKelamin === 'PEREMPUAN' ? 'P' : '',
          'Mata Pelajaran': item.bidangKeahlian || item.mataPelajaran || '',
          'No. Telepon': item.noTelepon || item.phone || '',
          'Status': item.user?.isActive ? 'Aktif' : 'Non-Aktif',
          'Username': item.user?.email || '',
          'Password': '(encrypted)'
        }));
      } else if (kategori === 'siswa') {
        exportData = data.map(item => ({
          'Nama Lengkap': item.user?.name || item.nama || '',
          'Email': item.user?.email || item.email || '',
          'NIS': item.nis || '',
          'Kelas': item.kelas?.nama ? `${item.kelas.tingkat} ${item.kelas.nama}` : '',
          'Tanggal Lahir': item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString('id-ID') : '',
          'Jenis Kelamin': item.jenisKelamin || '',
          'Alamat': item.alamat || '',
          'Status': item.status === 'approved' ? 'Approved' : 'Pending',
          'Username': item.user?.email || '',
          'Password': '(encrypted)'
        }));
      } else if (kategori === 'orangtua') {
        exportData = data.map(item => ({
          'Nama Lengkap': item.user?.name || item.nama || '',
          'Email': item.user?.email || item.email || '',
          'No. Telepon': item.noTelepon || '',
          'Hubungan': item.hubungan || '',
          'Nama Siswa': item.siswa?.user?.name || '',
          'Status': item.user?.isActive ? 'Aktif' : 'Non-Aktif',
          'Username': item.user?.email || '',
          'Password': '(encrypted)'
        }));
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, kategoriDisplay);

      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Data_${kategoriDisplay}_${timestamp}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data');
    }
  };

  // Modal content
  const modalContent = showImportModal && mounted ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2147483647,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out',
      overflow: 'auto',
      isolation: 'isolate'
    }}>
      <div style={{
        background: colors.white,
        borderRadius: '24px',
        padding: '0',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 2147483647,
        fontFamily: "'Poppins', sans-serif",
        animation: 'modalSlideUp 0.4s ease-out',
        maxHeight: '90vh',
        overflowY: 'auto',
        margin: 'auto'
      }}>
        {/* Header dengan Gradient */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
          padding: '28px 32px',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ornamen Pattern */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            background: `radial-gradient(circle, ${colors.white}15 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          <div style={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.white,
                margin: '0 0 8px 0',
                letterSpacing: '0.3px'
              }}>
                📥 Import Data {kategoriDisplay} dari Excel/CSV
              </h2>
              <p style={{
                fontSize: '14px',
                color: `${colors.white}90`,
                margin: 0,
                lineHeight: '1.6'
              }}>
                {kategori === 'guru' && 'Gunakan template Excel (.xlsx) atau CSV yang berisi nama, email, NIP, mata pelajaran, dan kelas binaan guru.'}
                {kategori === 'siswa' && 'Gunakan template Excel (.xlsx) atau CSV yang berisi nama, email, NIS, kelas, dan data siswa lainnya.'}
                {kategori === 'orangtua' && 'Gunakan template Excel (.xlsx) atau CSV yang berisi nama, email, no. telepon, dan hubungan dengan siswa.'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
                setImportResult(null);
              }}
              style={{
                background: `${colors.white}20`,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                padding: '10px',
                color: colors.white,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = `${colors.white}30`;
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = `${colors.white}20`;
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '32px' }}>
          {/* Download Template Button */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
            border: `2px solid ${colors.amber[200]}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
            }}>
              <Download size={24} color={colors.white} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.amber[900],
                margin: '0 0 4px 0'
              }}>
                Belum punya template?
              </p>
              <p style={{
                fontSize: '12px',
                color: colors.amber[700],
                margin: 0
              }}>
                Download template Excel untuk format yang benar
              </p>
            </div>
            <button
              onClick={() => {
                // Generate template
                const templateData = kategori === 'guru'
                  ? [{ 'Nama Lengkap': 'Contoh Nama', 'Email': 'guru@example.com', 'NIP': '1234567890', 'Jenis Kelamin': 'L', 'Mata Pelajaran': 'Tahfidz', 'No. Telepon': '08123456789' }]
                  : kategori === 'siswa'
                  ? [{ 'Nama Lengkap': 'Contoh Nama', 'Email': 'siswa@example.com', 'NIS': '1234567890', 'Kelas': '10A', 'Tanggal Lahir': '2005-01-01', 'Jenis Kelamin': 'L', 'Alamat': 'Alamat lengkap' }]
                  : [{ 'Nama Lengkap': 'Contoh Nama', 'Email': 'orangtua@example.com', 'No. Telepon': '08123456789', 'Hubungan': 'Ayah', 'Nama Siswa': 'Nama Anak' }];

                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Template');
                XLSX.writeFile(wb, `Template_${kategoriDisplay}.xlsx`);
              }}
              style={{
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
              }}
            >
              <Download size={16} />
              Download Template
            </button>
          </div>

          {/* File Upload Area */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: colors.gray[600],
              marginBottom: '12px'
            }}>
              📎 Pilih File Excel atau CSV
            </label>

            {/* Custom File Input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${selectedFile ? colors.emerald[300] : colors.gray[300]}`,
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedFile ? `${colors.emerald[50]}40` : colors.gray[50]
              }}
              onMouseOver={(e) => {
                if (!selectedFile) {
                  e.currentTarget.style.borderColor = colors.emerald[400];
                  e.currentTarget.style.background = `${colors.emerald[50]}30`;
                }
              }}
              onMouseOut={(e) => {
                if (!selectedFile) {
                  e.currentTarget.style.borderColor = colors.gray[300];
                  e.currentTarget.style.background = colors.gray[50];
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(26, 147, 111, 0.25)'
                  }}>
                    <CheckCircle size={28} color={colors.white} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: colors.emerald[700],
                      margin: '0 0 4px 0'
                    }}>
                      {selectedFile.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: colors.emerald[600],
                      margin: 0
                    }}>
                      {(selectedFile.size / 1024).toFixed(2)} KB • Klik untuk mengganti file
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: colors.gray[200],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload size={28} color={colors.gray[500]} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.gray[700],
                      margin: '0 0 4px 0'
                    }}>
                      Klik untuk memilih file
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: colors.gray[500],
                      margin: 0
                    }}>
                      Format: .xlsx, .xls, atau .csv (Max. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auto Create Account Checkbox */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: colors.emerald[50],
            border: `2px solid ${colors.emerald[200]}`,
            borderRadius: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              color: colors.gray[700]
            }}>
              <input
                type="checkbox"
                checked={autoCreateAccount}
                onChange={(e) => setAutoCreateAccount(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: colors.emerald[600]
                }}
              />
              <div>
                <span style={{ fontWeight: 600 }}>Buat akun otomatis setelah import</span>
                <p style={{
                  fontSize: '12px',
                  color: colors.emerald[700],
                  margin: '4px 0 0 0'
                }}>
                  Sistem akan otomatis membuat akun login untuk setiap data yang berhasil diimport
                </p>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {importing && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.emerald[100]} 100%)`,
              border: `2px solid ${colors.emerald[200]}`,
              borderRadius: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <LoadingIndicator size="small" text="File sedang diunggah dan diproses..." inline className="text-emerald-600" />
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: colors.emerald[200],
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.emerald[500]}, ${colors.emerald[600]}, ${colors.emerald[500]})`,
                  backgroundSize: '200% 100%',
                  animation: 'progressMove 1.5s ease-in-out infinite'
                }}></div>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: '16px',
              background: importResult.success
                ? `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.emerald[100]} 100%)`
                : 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
              border: `2px solid ${importResult.success ? colors.emerald[300] : '#FCA5A5'}`,
              boxShadow: importResult.success
                ? '0 4px 12px rgba(26, 147, 111, 0.15)'
                : '0 4px 12px rgba(220, 38, 38, 0.15)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'start',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: importResult.success
                    ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                    : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: importResult.success
                    ? '0 4px 12px rgba(26, 147, 111, 0.25)'
                    : '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}>
                  {importResult.success ? (
                    <CheckCircle size={24} color={colors.white} />
                  ) : (
                    <AlertCircle size={24} color={colors.white} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: importResult.success ? colors.emerald[800] : '#991B1B'
                  }}>
                    {importResult.success ? '🎉 Import Berhasil!' : '⚠️ Import Gagal'}
                  </p>
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: importResult.success ? colors.emerald[700] : '#DC2626',
                    lineHeight: '1.5'
                  }}>
                    {importResult.message}
                  </p>
                  {importResult.stats && (
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        padding: '8px 12px',
                        background: colors.white,
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          color: colors.gray[600],
                          margin: '0 0 2px 0',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          Berhasil
                        </p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: colors.emerald[600],
                          margin: 0
                        }}>
                          {importResult.stats.success}
                        </p>
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        background: colors.white,
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        <p style={{
                          fontSize: '11px',
                          color: colors.gray[600],
                          margin: '0 0 2px 0',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          Gagal
                        </p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#DC2626',
                          margin: 0
                        }}>
                          {importResult.stats.failed}
                        </p>
                      </div>
                    </div>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: colors.white,
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#DC2626',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Error Details:
                      </p>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '12px',
                        color: '#991B1B',
                        lineHeight: '1.8'
                      }}>
                        {importResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importResult.success && (
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setSelectedFile(null);
                        setImportResult(null);
                        if (onImportSuccess) onImportSuccess();
                      }}
                      style={{
                        padding: '10px 16px',
                        background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 147, 111, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.2)';
                      }}
                    >
                      <CheckCircle size={16} />
                      Lihat Data {kategoriDisplay}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
                setImportResult(null);
              }}
              disabled={importing}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: colors.white,
                color: colors.gray[700],
                border: `2px solid ${colors.gray[300]}`,
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: importing ? 'not-allowed' : 'pointer',
                opacity: importing ? 0.5 : 1,
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!importing) {
                  e.currentTarget.style.background = colors.gray[50];
                  e.currentTarget.style.borderColor = colors.gray[400];
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = colors.white;
                e.currentTarget.style.borderColor = colors.gray[300];
              }}
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: (!selectedFile || importing)
                  ? colors.gray[300]
                  : `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (!selectedFile || importing) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: (!selectedFile || importing)
                  ? 'none'
                  : '0 4px 12px rgba(26, 147, 111, 0.25)'
              }}
              onMouseOver={(e) => {
                if (selectedFile && !importing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 147, 111, 0.35)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.25)';
              }}
            >
              {importing ? (
                <LoadingIndicator size="small" text="Mengimport Data..." inline className="text-white" />
              ) : (
                <>
                  <Upload size={18} />
                  Mulai Import
                </>
              )}
            </button>
          </div>
        </div>

        {/* Style for animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes progressMove {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
        `}</style>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Add Button (Custom) - First Position */}
        {showAddButton && onAddClick && (
          <button
            onClick={onAddClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26, 147, 111, 0.25)',
              transition: 'all 0.3s ease',
              fontFamily: "'Poppins', sans-serif"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 147, 111, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.25)';
            }}
          >
            {addButtonIcon}
            <span>{addButtonLabel}</span>
          </button>
        )}

        {/* Divider */}
        {showAddButton && onAddClick && (
          <div style={{
            width: '1px',
            height: '32px',
            background: colors.gray[200]
          }}></div>
        )}

        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: colors.white,
            color: colors.emerald[600],
            border: `2px solid ${colors.emerald[200]}`,
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = colors.emerald[50];
            e.currentTarget.style.borderColor = colors.emerald[300];
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 147, 111, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = colors.white;
            e.currentTarget.style.borderColor = colors.emerald[200];
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
          }}
        >
          <Upload size={16} />
          <span>Import</span>
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={data.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: colors.white,
            color: colors.amber[600],
            border: `2px solid ${colors.amber[200]}`,
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: data.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            opacity: data.length === 0 ? 0.5 : 1,
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseOver={(e) => {
            if (data.length > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = colors.amber[50];
              e.currentTarget.style.borderColor = colors.amber[300];
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = colors.white;
            e.currentTarget.style.borderColor = colors.amber[200];
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
          }}
        >
          <Download size={16} />
          <span>Export</span>
        </button>

        {/* Generate Accounts Button */}
        {onGenerateAccounts && (
          <button
            onClick={onGenerateAccounts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: colors.white,
              color: '#8B5CF6',
              border: '2px solid #DDD6FE',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s ease',
              fontFamily: "'Poppins', sans-serif"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#F5F3FF';
              e.currentTarget.style.borderColor = '#C4B5FD';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = colors.white;
              e.currentTarget.style.borderColor = '#DDD6FE';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
          >
            <Settings size={16} />
            <span>Generate Akun</span>
          </button>
        )}
      </div>

      {/* Import Modal using Portal */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
