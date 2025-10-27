'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Settings, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
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
  const fileInputRef = useRef(null);

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
          stats: result.stats
        });

        // Reset form setelah 2 detik
        setTimeout(() => {
          setShowImportModal(false);
          setSelectedFile(null);
          if (onImportSuccess) onImportSuccess();
        }, 2000);
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Gagal import data'
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
          'Mata Pelajaran': item.mataPelajaran || '',
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

  return (
    <>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            color: colors.white,
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
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
          <Upload size={18} />
          <span>📥 Import Data</span>
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={data.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
            color: colors.white,
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: data.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            transition: 'all 0.3s ease',
            opacity: data.length === 0 ? 0.5 : 1,
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseOver={(e) => {
            if (data.length > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.35)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)';
          }}
        >
          <Download size={18} />
          <span>📤 Export Data</span>
        </button>

        {/* Generate Accounts Button */}
        {onGenerateAccounts && (
          <button
            onClick={onGenerateAccounts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.3s ease',
              fontFamily: "'Poppins', sans-serif"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.25)';
            }}
          >
            <Settings size={18} />
            <span>⚙️ Generate Akun Otomatis</span>
          </button>
        )}

        {/* Add Button (Custom) */}
        {showAddButton && onAddClick && (
          <button
            onClick={onAddClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
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
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            fontFamily: "'Poppins', sans-serif"
          }}>
            {/* Ornamen Islami */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '80px',
              height: '80px',
              background: `radial-gradient(circle, ${colors.emerald[100]} 0%, transparent 70%)`,
              opacity: 0.4,
              borderRadius: '50%',
              pointerEvents: 'none'
            }}></div>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.gray[600],
                margin: 0
              }}>
                Import Data {kategoriDisplay}
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportResult(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: colors.gray[400],
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.gray[600]}
                onMouseOut={(e) => e.currentTarget.style.color = colors.gray[400]}
              >
                <X size={24} />
              </button>
            </div>

            {/* File Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.gray[600],
                marginBottom: '8px'
              }}>
                File Excel (.xlsx, .csv)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: "'Poppins', sans-serif",
                  cursor: 'pointer'
                }}
              />
              {selectedFile && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: colors.emerald[600],
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle size={14} />
                  {selectedFile.name}
                </p>
              )}
            </div>

            {/* Checkbox */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: colors.gray[600]
              }}>
                <input
                  type="checkbox"
                  checked={autoCreateAccount}
                  onChange={(e) => setAutoCreateAccount(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span>Buat akun otomatis setelah import</span>
              </label>
            </div>

            {/* Import Result */}
            {importResult && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                borderRadius: '12px',
                background: importResult.success ? colors.emerald[50] : '#FEE2E2',
                border: `2px solid ${importResult.success ? colors.emerald[200] : '#FCA5A5'}`,
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
              }}>
                {importResult.success ? (
                  <CheckCircle size={20} color={colors.emerald[600]} />
                ) : (
                  <AlertCircle size={20} color="#DC2626" />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: importResult.success ? colors.emerald[700] : '#DC2626'
                  }}>
                    {importResult.message}
                  </p>
                  {importResult.stats && (
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '12px',
                      color: colors.gray[600]
                    }}>
                      Berhasil: {importResult.stats.success} | Gagal: {importResult.stats.failed}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {importing && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: colors.gray[200],
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, ${colors.emerald[500]}, ${colors.emerald[600]})`,
                    animation: 'progress 1.5s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            )}

            {/* Buttons */}
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
                  padding: '12px',
                  background: colors.gray[100],
                  color: colors.gray[600],
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: importing ? 'not-allowed' : 'pointer',
                  opacity: importing ? 0.5 : 1,
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: (!selectedFile || importing)
                    ? colors.gray[200]
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
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                {importing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Mengimport...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>

            {/* Style for progress animation */}
            <style jsx>{`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}
