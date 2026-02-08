'use client';

import { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Eye, ArrowRight, FileSpreadsheet, Users } from 'lucide-react';
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
    500: '#6B7280',
    600: '#4B5563',
  },
};

// Smart column mapping patterns
// STRICT column aliases - tidak ada tumpang tindih
const COLUMN_ALIASES = {
  siswa: {
    nama: ['nama', 'nama siswa', 'nama lengkap siswa'],
    nisn: ['nisn'],
    nis: ['nis lokal', 'nis'],
    jenisKelamin: ['jenis kelamin', 'jk'], // Untuk siswa, tanpa kata "wali"
    tanggalLahir: ['tgl lahir', 'tanggal lahir'],
    tempatLahir: ['tempat lahir'],
    alamat: ['alamat siswa', 'alamat'],
    kelas: ['kelas saat ini', 'kelas'],
    kelasAngkatan: ['diterima di kelas', 'kelas angkatan'],
    tahunAjaranMasuk: ['tahun ajaran masuk', 'ta masuk'],
  },
  namaAyah: ['nama ayah'],
  namaIbu: ['nama ibu'],
  namaWali: ['nama wali'],
  jenisKelaminWali: ['jenis kelamin wali', 'jk wali'],
  guru: {
    kodeGuru: ['kode guru', 'kode guru / username', 'username', 'kode', 'user'],
    nama: ['nama lengkap', 'nama guru', 'nama'],
    nip: ['nip'],
    jenisKelamin: ['jenis kelamin', 'jk'],
    tanggalLahir: ['tanggal lahir', 'tgl lahir'],
    kelasBinaan: ['kelas binaan'],
  }
};

export default function SmartImport({ onSuccess, onClose, type = 'siswa' }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Processing, 4: Result
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headerIndexMap, setHeaderIndexMap] = useState({}); // NEW: strict header mapping
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [newAccounts, setNewAccounts] = useState([]);
  const fileInputRef = useRef(null);

  // Normalize header: lowercase, trim, hapus karakter non-alfanumerik kecuali spasi
  const normalizeHeader = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces jadi satu
      .replace(/[^a-z0-9\s]/g, ''); // Hapus non-alfanumerik kecuali spasi
  };

  // Build header index map dari baris pertama Excel
  const buildHeaderIndexMap = (headers) => {
    const map = {};
    const normalizedHeaders = [];
    
    headers.forEach((header, index) => {
      const normalized = normalizeHeader(header);
      normalizedHeaders.push(normalized);
      map[normalized] = index;
    });

    console.log('📋 Headers Normalized:', normalizedHeaders);
    console.log('📋 Header Index Map:', map);
    
    return map;
  };

  // Helper untuk ambil cell value berdasarkan aliases
  const getCellValue = (row, headerMap, aliases) => {
    for (const alias of aliases) {
      const normalized = normalizeHeader(alias);
      const colIndex = headerMap[normalized];
      if (colIndex !== undefined && row[colIndex] !== undefined && row[colIndex] !== '') {
        return row[colIndex];
      }
    }
    return undefined;
  };

  // Smart column detection with improved normalization
  const detectColumns = (headers) => {
    // TIDAK DIGUNAKAN LAGI - Sekarang pakai buildHeaderIndexMap + getCellValue
    return {};
  };

  // Handle file upload
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('File harus berformat .xlsx atau .csv');
      return;
    }

    setFile(selectedFile);

    // Read and parse file
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Parse sebagai array of arrays (bukan object) untuk akses berdasarkan index
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // Parse sebagai array of arrays
        defval: "", // Empty cells jadi empty string
        raw: false // Semua nilai jadi string
      });

      if (rawData.length < 2) {
        alert('File Excel harus memiliki minimal 1 baris header dan 1 baris data');
        return;
      }

      // Baris pertama = headers
      const headers = rawData[0];
      
      // Build header index map
      const headerMap = buildHeaderIndexMap(headers);
      
      // Data mulai dari baris kedua
      const dataRows = rawData.slice(1);

      setParsedData(dataRows);
      setHeaderIndexMap(headerMap);
      setPreviewData(dataRows.slice(0, 5)); // Preview 5 baris pertama
      setStep(2);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Gagal membaca file Excel');
    }
  };

  // Handle import
  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    setProgress(0);

    try {
      // Process data menggunakan strict mapping
      const processedData = parsedData.map((row, index) => {
        if (type === 'guru') {
          const guruData = {
            kodeGuru: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.kodeGuru),
            nama: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.nama),
            nip: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.nip),
            jenisKelamin: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.jenisKelamin),
            tanggalLahir: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.tanggalLahir),
            kelasBinaan: getCellValue(row, headerIndexMap, COLUMN_ALIASES.guru.kelasBinaan),
          };
          
          // Debug log untuk baris pertama
          if (index === 0) {
            console.log('🔍 Guru Row 1 Mapped:', guruData);
          }
          
          return { guru: guruData };
        }

        // Untuk siswa
        const siswaData = {
          nama: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.nama),
          nisn: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.nisn),
          nis: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.nis),
          jenisKelamin: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.jenisKelamin),
          tanggalLahir: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.tanggalLahir),
          tempatLahir: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.tempatLahir),
          alamat: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.alamat),
          kelas: getCellValue(row, headerIndexMap, COLUMN_ALIASES.siswa.kelas),
        };

        // Untuk orang tua - Support dua format:
        // Format 1: Nama Ayah & Nama Ibu (terpisah)
        const namaAyah = getCellValue(row, headerIndexMap, COLUMN_ALIASES.namaAyah);
        const namaIbu = getCellValue(row, headerIndexMap, COLUMN_ALIASES.namaIbu);
        
        // Format 2: Nama Wali + Jenis Kelamin Wali (generic)
        const namaWali = getCellValue(row, headerIndexMap, COLUMN_ALIASES.namaWali);
        const jenisKelaminWali = getCellValue(row, headerIndexMap, COLUMN_ALIASES.jenisKelaminWali);

        // Debug log untuk baris pertama
        if (index === 0) {
          console.log('🔍 Siswa Row 1 Mapped:', {
            nisn: siswaData.nisn,
            nis: siswaData.nis,
            jenisKelamin: siswaData.jenisKelamin,
            tanggalLahir: siswaData.tanggalLahir,
          });
          console.log('🔍 Orangtua Row 1 Mapped:', {
            namaAyah: namaAyah,
            namaIbu: namaIbu,
            namaWali: namaWali,
            jenisKelaminWali: jenisKelaminWali,
          });
        }

        return { siswa: siswaData, namaAyah, namaIbu, namaWali, jenisKelaminWali };
      });

      console.log('Total rows to import:', processedData.length);

      // Send to API
      const endpoint = type === 'guru' ? '/api/admin/guru/smart-import' : '/api/admin/siswa/smart-import';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: processedData,
          autoCreateAccount: true,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult(result);
        setNewAccounts(result.newAccounts || []);
        setStep(4);
      } else {
        throw new Error(result.error || 'Import gagal');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Gagal import data: ' + error.message);
      setStep(2);
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  // Export new accounts
  const handleExportAccounts = () => {
    if (newAccounts.length === 0) {
      alert('Tidak ada akun baru untuk di-export');
      return;
    }

    try {
      const exportData = newAccounts.map(acc => ({
        'Nama': acc.nama,
        'Role': acc.role,
        'Username': acc.username,
        'Password': acc.password,
        'Keterangan': acc.keterangan || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Akun Baru');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Akun_Baru_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export akun');
    }
  };

  // Reset
  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setHeaderIndexMap({});
    setPreviewData([]);
    setResult(null);
    setNewAccounts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: colors.white,
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        border: `2px solid ${colors.emerald[100]}`,
        fontFamily: "'Poppins', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Ornamen Islami */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle, ${colors.emerald[100]} 0%, transparent 70%)`,
        opacity: 0.4,
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      {/* Header */}
      <div style={{ padding: '32px 32px 0', marginBottom: '24px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: `linear-gradient(135deg, ${colors.emerald[500]}, ${colors.emerald[600]})`,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(26, 147, 111, 0.25)'
            }}>
              <FileSpreadsheet size={24} color={colors.white} />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.gray[600],
                margin: 0
              }}>
                Smart Import Excel
              </h2>
              <p style={{
                fontSize: '14px',
                color: colors.gray[400],
                margin: 0
              }}>
                Import data {type === 'guru' ? 'guru' : 'siswa & orang tua'} otomatis dengan deteksi kolom pintar
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: colors.gray[400],
                cursor: 'pointer',
                padding: '4px',
                transition: 'all 0.2s ease',
                lineHeight: 1
              }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.gray[600]}
              onMouseOut={(e) => e.currentTarget.style.color = colors.gray[400]}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 32px 24px',
        marginBottom: 0,
        position: 'relative',
        flexShrink: 0
      }}>
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Preview Data' },
          { num: 3, label: 'Processing' },
          { num: 4, label: 'Selesai' }
        ].map((item, index) => (
          <div key={item.num} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {index < 3 && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                width: '100%',
                height: '2px',
                background: step > item.num ? colors.emerald[500] : colors.gray[200],
                zIndex: 0
              }}></div>
            )}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= item.num
                ? `linear-gradient(135deg, ${colors.emerald[500]}, ${colors.emerald[600]})`
                : colors.gray[200],
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              zIndex: 1,
              position: 'relative'
            }}>
              {step > item.num ? <CheckCircle size={18} /> : item.num}
            </div>
            <span style={{
              fontSize: '12px',
              color: step >= item.num ? colors.emerald[700] : colors.gray[400],
              fontWeight: step === item.num ? 600 : 400,
              textAlign: 'center'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 32px 32px',
        minHeight: 0
      }}>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <div>
          <div style={{
            border: `2px dashed ${colors.emerald[200]}`,
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => fileInputRef.current?.click()}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = colors.emerald[500];
            e.currentTarget.style.background = `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.amber[100]} 100%)`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = colors.emerald[200];
            e.currentTarget.style.background = `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`;
          }}
          >
            <Upload size={48} color={colors.emerald[500]} style={{ marginBottom: '16px' }} />
            <p style={{
              fontSize: '18px',
              fontWeight: 600,
              color: colors.gray[600],
              marginBottom: '8px'
            }}>
              Klik untuk upload file Excel
            </p>
            <p style={{
              fontSize: '14px',
              color: colors.gray[400],
              marginBottom: '16px'
            }}>
              Format: .xlsx atau .csv
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Step 2: Preview & Mapping */}
      {step === 2 && (
        <div>
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: colors.amber[50],
            borderRadius: '12px',
            border: `1px solid ${colors.amber[100]}`
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.amber[700],
              marginBottom: '8px'
            }}>
              📋 File: {file?.name}
            </p>
            <p style={{
              fontSize: '13px',
              color: colors.gray[600]
            }}>
              Total data: {parsedData.length} baris
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.gray[600],
              marginBottom: '12px'
            }}>
              Kolom Terdeteksi:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {Object.keys(headerIndexMap)
                .sort((a, b) => headerIndexMap[a] - headerIndexMap[b])
                .map((header) => (
                  <div key={header} style={{
                    padding: '12px',
                    background: colors.emerald[50],
                    borderRadius: '8px',
                    border: `1px solid ${colors.emerald[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} color={colors.emerald[600]} />
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: colors.gray[400],
                        margin: 0
                      }}>
                        Kolom {headerIndexMap[header] + 1}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.emerald[700],
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {header}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.gray[600],
              marginBottom: '12px'
            }}>
              Preview Data (5 baris pertama) - Hanya kolom yang digunakan:
            </h3>
            <div style={{
              overflowX: 'auto',
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: '12px'
            }}>
              <table style={{
                width: '100%',
                fontSize: '13px',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: colors.gray[100] }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: colors.gray[600],
                      borderBottom: `2px solid ${colors.gray[200]}`,
                      minWidth: '50px'
                    }}>
                      No
                    </th>
                    {/* Tampilkan header dinamis sesuai yang terdeteksi */}
                    {Object.keys(headerIndexMap)
                      .sort((a, b) => headerIndexMap[a] - headerIndexMap[b])
                      .map((header) => (
                        <th key={header} style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: colors.gray[600],
                          borderBottom: `2px solid ${colors.gray[200]}`,
                          minWidth: '120px',
                          textTransform: 'capitalize'
                        }}>
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: `1px solid ${colors.gray[100]}`
                    }}>
                      <td style={{
                        padding: '12px',
                        color: colors.gray[600],
                        fontWeight: 600
                      }}>
                        {idx + 1}
                      </td>
                      {/* Tampilkan data sesuai urutan kolom */}
                      {Object.keys(headerIndexMap)
                        .sort((a, b) => headerIndexMap[a] - headerIndexMap[b])
                        .map((header) => {
                          const colIndex = headerIndexMap[header];
                          const value = row[colIndex];
                          return (
                            <td key={header} style={{
                              padding: '12px',
                              color: colors.gray[600]
                            }}>
                              {value || '-'}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '14px',
                background: colors.gray[100],
                color: colors.gray[600],
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Kembali
            </button>
            <button
              onClick={handleImport}
              style={{
                flex: 2,
                padding: '14px',
                background: `linear-gradient(135deg, ${colors.emerald[500]}, ${colors.emerald[600]})`,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              <ArrowRight size={18} />
              Mulai Import ({parsedData.length} data)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <LoadingIndicator text="Sedang memproses data..." size="large" />
          <p style={{
            fontSize: '14px',
            color: colors.gray[400],
            marginTop: '24px',
            marginBottom: '24px'
          }}>
            Mohon tunggu, jangan tutup halaman ini
          </p>
          <div style={{
            width: '100%',
            height: '8px',
            background: colors.gray[100],
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${colors.emerald[500]}, ${colors.emerald[600]})`,
              transition: 'width 0.3s ease',
              animation: 'shimmer 2s infinite'
            }}></div>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && result && (
        <div>
          <div style={{
            padding: '24px',
            background: `linear-gradient(135deg, ${colors.emerald[50]}, ${colors.amber[50]})`,
            borderRadius: '16px',
            marginBottom: '24px',
            border: `2px solid ${colors.emerald[100]}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <CheckCircle size={32} color={colors.emerald[600]} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.emerald[700],
                margin: 0
              }}>
                Import Berhasil!
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginTop: '16px'
            }}>
              <div style={{
                padding: '16px',
                background: colors.white,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.emerald[600],
                  margin: 0
                }}>
                  {result.stats?.success || 0}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: colors.gray[500],
                  margin: '4px 0 0 0'
                }}>
                  Berhasil
                </p>
              </div>
              <div style={{
                padding: '16px',
                background: colors.white,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#EF4444',
                  margin: 0
                }}>
                  {result.stats?.failed || 0}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: colors.gray[500],
                  margin: '4px 0 0 0'
                }}>
                  Gagal
                </p>
              </div>
              <div style={{
                padding: '16px',
                background: colors.white,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.amber[600],
                  margin: 0
                }}>
                  {result.stats?.duplicate || 0}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: colors.gray[500],
                  margin: '4px 0 0 0'
                }}>
                  Duplikat
                </p>
              </div>
            </div>
          </div>

          {newAccounts.length > 0 && (
            <div style={{
              padding: '20px',
              background: colors.amber[50],
              borderRadius: '12px',
              border: `1px solid ${colors.amber[100]}`,
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.amber[700],
                    margin: 0
                  }}>
                    🔑 {newAccounts.length} Akun Baru Dibuat
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: colors.gray[500],
                    margin: '4px 0 0 0'
                  }}>
                    Username dan password telah dibuat otomatis
                  </p>
                </div>
                <button
                  onClick={handleExportAccounts}
                  style={{
                    padding: '10px 20px',
                    background: `linear-gradient(135deg, ${colors.amber[400]}, ${colors.amber[500]})`,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  <Download size={16} />
                  Export Akun Baru
                </button>
              </div>
            </div>
          )}

          {/* Error Messages - Only show if there are actual errors */}
          {result?.errors && result.errors.length > 0 && (
            <div style={{
              padding: '20px',
              background: '#FEF2F2',
              borderRadius: '12px',
              border: '1px solid #FECACA',
              marginBottom: '24px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#DC2626',
                margin: '0 0 12px 0'
              }}>
                ⚠️ Detail Error ({result.errors.length} pesan)
              </p>
              {result.errors.map((error, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: colors.gray[600],
                  fontFamily: 'monospace'
                }}>
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Success Details - Optional, show if user wants to see details */}
          {result?.successDetails && result.successDetails.length > 0 && (
            <details style={{ marginBottom: '24px' }}>
              <summary style={{
                cursor: 'pointer',
                padding: '12px',
                background: colors.emerald[50],
                borderRadius: '8px',
                border: `1px solid ${colors.emerald[100]}`,
                fontSize: '14px',
                fontWeight: 600,
                color: colors.emerald[700]
              }}>
                ✅ Lihat Detail Berhasil ({result.successDetails.length} baris)
              </summary>
              <div style={{
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '8px'
              }}>
                {result.successDetails.map((detail, index) => (
                  <div key={index} style={{
                    padding: '6px 10px',
                    background: 'white',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: colors.gray[600],
                    fontFamily: 'monospace',
                    border: `1px solid ${colors.emerald[100]}`
                  }}>
                    {detail}
                  </div>
                ))}
              </div>
            </details>
          )}

          <button
            onClick={handleReset}
            style={{
              width: '100%',
              padding: '14px',
              background: `linear-gradient(135deg, ${colors.emerald[500]}, ${colors.emerald[600]})`,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            Selesai
          </button>
        </div>
      )}

      </div>

    </div>
    </div>
  );
}
