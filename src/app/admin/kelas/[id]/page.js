'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  UserPlus, Edit, Trash2, Search, ArrowLeft, Upload, Download,
  Users, Link as LinkIcon, X, MoreVertical, GraduationCap
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import PasswordField from '@/components/admin/PasswordField';
import ParentLinkSection from '@/components/admin/ParentLinkSection';
import AccountSuccessModal from '@/components/admin/AccountSuccessModal';
import StudentCreateModal from '@/components/admin/StudentCreateModal';
import * as XLSX from 'xlsx';
import {
  generateSiswaEmail,
  normalizeGender,
  formatGender,
  validateNISN,
  validateNIS,
  matchesSearch
} from '@/lib/siswaUtils';
import { generateParentEmail } from '@/lib/passwordUtils';

// Modern Pastel Color Palette (SIMTAQ Style)
const colors = {
  emerald: { 50: '#ECFDF5', 100: '#D1FAE5', 500: '#10B981', 600: '#059669', 700: '#047857' },
  amber: { 50: '#FEF3C7', 100: '#FDE68A', 500: '#F59E0B', 600: '#D97706' },
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 400: '#9CA3AF', 600: '#4B5563', 900: '#111827' },
  white: '#FFFFFF',
  red: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' }
};

// Table Header Style
const tableHeaderStyle = {
  padding: '16px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '700',
  color: colors.emerald[700],
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

// Table Cell Style
const tableCellStyle = {
  padding: '16px 12px',
  fontSize: '14px',
  color: colors.gray[700]
};

// Enhanced Action Dropdown Component
function ActionDropdown({ 
  siswaId, 
  siswa,
  onViewDetail,
  onEdit, 
  onDelete, 
  onLinkParent,
  onChangeClass,
  buttonRef,
  hasParent 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (buttonRef?.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 200;
      
      let left = rect.right - dropdownWidth;
      
      // Auto-position if goes off-screen
      if (left + dropdownWidth > viewportWidth - 16) {
        left = viewportWidth - dropdownWidth - 16;
      }
      if (left < 16) {
        left = rect.left;
      }
      
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(16, left),
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef?.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, buttonRef]);

  if (typeof window === 'undefined') return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Opsi"
        style={{
          padding: '8px 10px',
          borderRadius: '8px',
          border: 'none',
          background: isOpen ? colors.gray[100] : 'transparent',
          color: colors.gray[600],
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = colors.gray[50];
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent';
        }}
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            background: colors.white,
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            minWidth: '200px',
            zIndex: 9999,
            border: `1px solid ${colors.gray[200]}`,
            animation: 'dropdownFadeScale 0.15s ease-out',
          }}
        >
          {/* Detail Siswa */}
          <DropdownItem
            icon={<Users size={16} />}
            label="Detail Siswa"
            color={colors.emerald[600]}
            bgHover={colors.emerald[50]}
            onClick={() => {
              onViewDetail();
              setIsOpen(false);
            }}
          />

          {/* Edit Data */}
          <DropdownItem
            icon={<Edit size={16} />}
            label="Edit Data"
            color={colors.emerald[600]}
            bgHover={colors.emerald[50]}
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
          />

          {/* Hubungkan Orang Tua - Conditional */}
          {!hasParent && (
            <DropdownItem
              icon={<LinkIcon size={16} />}
              label="Hubungkan Orang Tua"
              color={colors.amber[600]}
              bgHover={colors.amber[50]}
              onClick={() => {
                onLinkParent();
                setIsOpen(false);
              }}
            />
          )}

          {/* Pindahkan Kelas */}
          <DropdownItem
            icon={<Users size={16} />}
            label="Pindahkan Kelas"
            color={colors.blue[600]}
            bgHover={colors.blue[50]}
            onClick={() => {
              onChangeClass();
              setIsOpen(false);
            }}
          />

          {/* Divider */}
          <div style={{
            height: '1px',
            background: colors.gray[200],
            margin: '6px 0'
          }} />

          {/* Hapus Siswa - Dangerous Action */}
          <DropdownItem
            icon={<Trash2 size={16} />}
            label="Hapus Siswa"
            color={colors.red[600]}
            bgHover={colors.red[50]}
            isDangerous={true}
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
          />
        </div>,
        document.body
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes dropdownFadeScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

// Reusable Dropdown Item Component
function DropdownItem({ icon, label, color, bgHover, isDangerous, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        border: 'none',
        background: 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: 500,
        color: isDangerous ? colors.red[600] : colors.gray[900],
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bgHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ color: isDangerous ? colors.red[600] : color, flexShrink: 0 }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function KelolaSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  // ============ STATE ============
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState(null);
  const [showChangeClassModal, setShowChangeClassModal] = useState(false);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [selectedNewClass, setSelectedNewClass] = useState(null);
  // Debounce search term (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (kelasId) {
      fetchKelasDetail();
      fetchSiswa();
    }
  }, [kelasId]);

  // ============ DATA FETCHING ============
  const fetchKelasDetail = async () => {
    try {
      const response = await fetch(`/api/kelas/${kelasId}`);
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchSiswa = async () => {
    try {
      // Only set loading=true on initial load (when siswaList is empty)
      if (siswaList.length === 0) {
        setLoading(true);
      } else {
        setIsReloading(true);
      }
      
      console.log('🔄 Fetching siswa for kelasId:', kelasId);
      const response = await fetch(`/api/admin/siswa?kelasId=${kelasId}&limit=1000&nocache=${Date.now()}`);
      const result = await response.json();
      
      console.log('📦 API response:', result);
      const data = Array.isArray(result) ? result : (result.data || []);
      console.log('✅ Extracted data array, length:', data.length);
      
      if (data.length === 0 && siswaList.length > 0) {
        console.warn('⚠️ WARNING: API returned empty data but siswaList has', siswaList.length, 'items');
      }
      
      setSiswaList(data);
    } catch (error) {
      console.error('❌ Error fetching siswa:', error);
      // Keep showing old data if fetch fails
      if (siswaList.length === 0) {
        setSiswaList([]);
      }
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  };

  const handleEdit = (siswa) => {
    console.log('✏️ Editing siswa:', siswa.id);
    setEditingSiswa(siswa);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      const response = await fetch(`/api/admin/siswa/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Siswa berhasil dihapus');
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus siswa');
      }
    } catch (error) {
      console.error('Error deleting siswa:', error);
      alert('Gagal menghapus siswa');
    }
  };

  const resetForm = () => {
    setEditingSiswa(null);
  };

  // ============ EXCEL IMPORT ============
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        // Helper untuk normalize header keys
        const normalizeRow = (row) => {
          const normalized = {};
          for (const [key, value] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, ' ');
            normalized[normalizedKey] = value;
          }
          return normalized;
        };

        // Helper: Convert DD-MM-YYYY or various formats to YYYY-MM-DD
        const normalizeDateFormat = (dateStr) => {
          if (!dateStr) return '';
          dateStr = String(dateStr).trim();
          
          // Try DD-MM-YYYY format (most common in Excel)
          const ddmmyyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
          const ddmmyyMatch = dateStr.match(ddmmyyRegex);
          if (ddmmyyMatch) {
            const [, day, month, year] = ddmmyyMatch;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
          
          // Already YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          
          // Try parsing as date object
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              return `${y}-${m}-${d}`;
            }
          } catch (e) {
            // Ignore
          }
          
          return dateStr; // Return as-is if can't parse
        };

        const transformedData = data.map((row, rowIdx) => {
          const normalized = normalizeRow(row);
          
          // Debug: log semua keys di row pertama
          if (rowIdx === 0) {
            console.log('🔍 Excel headers (normalized):', Object.keys(normalized));
            console.log('📝 First row raw:', row);
          }
          
          // Extract nama siswa
          const name = normalized['nama lengkap siswa'] || 
                      normalized['nama siswa'] || 
                      normalized['nama'] || 
                      normalized['full name'] || 
                      normalized['name'] || '';
          
          // Extract NIS
          let nis = normalized['nis'] || 
                   normalized['nis lokal'] || 
                   normalized['nis sekolah'] ||
                   normalized['no induk sekolah'] || '';
          
          if (!nis) {
            for (const key of Object.keys(normalized)) {
              if (key.includes('nis') && !key.includes('nisn')) {
                nis = normalized[key];
                break;
              }
            }
          }
          
          // Extract NISN
          const nisn = String(normalized['nisn'] || '').trim();
          
          // Extract Jenis Kelamin
          const rawGender = normalized['jenis kelamin'] || 
                          normalized['l/p'] || 
                          normalized['gender'] || 'L';

          // Extract Tanggal Lahir - PENTING!
          // PENTING: Ambil TANGGAL LAHIR, BUKAN TEMPAT LAHIR!
          let tanggalLahir = normalized['tanggal lahir'] || 
                            normalized['tgl lahir'] || 
                            normalized['tanggal lahir siswa'] ||
                            normalized['birth date'] ||
                            normalized['dob'] || '';
          
          // Cari header TANGGAL LAHIR - tapi SKIP jika key mengandung "tempat"
          if (!tanggalLahir) {
            for (const key of Object.keys(normalized)) {
              // Pastikan key adalah TANGGAL LAHIR bukan TEMPAT LAHIR
              if (!key.includes('tempat') && (key.includes('tgl') || (key.includes('lahir') && key.includes('tanggal')) || key.includes('birth') || key.includes('dob'))) {
                tanggalLahir = normalized[key];
                break;
              }
            }
          }

          // Extract Nama Ayah - PENTING!
          let namaAyah = normalized['nama ayah'] || 
                        normalized['nama bapak'] || 
                        normalized['ayah'] || '';
          
          // Extract Nama Ibu - PENTING!
          let namaIbu = normalized['nama ibu'] || 
                       normalized['nama ibunda'] || 
                       normalized['ibu'] || '';
          
          // Jika masih kosong, cari header yang hanya mengandung "ibu"
          if (!namaIbu) {
            for (const key of Object.keys(normalized)) {
              if (key.includes('ibu') && !key.includes('ayah')) {
                namaIbu = normalized[key];
                break;
              }
            }
          }

          // Extract No HP (untuk wali)
          let noHPWali = normalized['no hp orang tua'] || 
                        normalized['no hp wali'] ||
                        normalized['no hp'] || 
                        normalized['nomor telepon'] ||
                        normalized['nomor whatsapp'] || '';

          // Tentukan jenis wali (AYAH atau IBU) dan nama wali
          let jenisWali = 'LAKI_LAKI';  // Default
          let namaWali = '';
          
          if (namaAyah && namaAyah.trim() && namaAyah !== '-') {
            // Jika ada nama ayah, gunakan sebagai wali utama
            namaWali = namaAyah;
            jenisWali = 'LAKI_LAKI';
          } else if (namaIbu && namaIbu.trim() && namaIbu !== '-') {
            // Kalau tidak ada ayah, gunakan ibu
            namaWali = namaIbu;
            jenisWali = 'PEREMPUAN';
          }

          // Extract tahun ajaran masuk (untuk tahun akademik saat ini)
          // Bisa dari Excel atau gunakan tahun ajaran yang sedang aktif
          let tahunAjaranMasuk = normalized['tahun ajaran masuk'] || 
                                normalized['tahun ajaran'] || 
                                normalized['ta'] || '';

          if (rowIdx === 0) {
            console.log('🔍 Extracted first row:', { 
              name, nisn, nis, rawGender, tanggalLahir, namaAyah, namaIbu, noHPWali, jenisWali, namaWali 
            });
          }

          return {
            // FIELD UNTUK DISPLAY PREVIEW
            name: name.trim(),
            nisn: nisn.trim(),
            nis: String(nis).trim(),
            jenisKelamin: normalizeGender(rawGender),
            tanggalLahir: String(tanggalLahir).trim(),
            namaAyah: String(namaAyah).trim(),
            namaIbu: String(namaIbu).trim(),
            
            // FIELD UNTUK BACKEND API (sesuai format yang diharapkan)
            'Nama Siswa': name.trim(),
            'NISN': nisn.trim(),
            'NIS': String(nis).trim(),
            'Kelas Saat Ini': kelasId,
            'Jenis Kelamin': normalizeGender(rawGender),
            'Tanggal Lahir': normalizeDateFormat(tanggalLahir),  // Normalize tanggal ke YYYY-MM-DD
            'Jenis Wali': jenisWali,
            'Nama Wali': namaWali,
            'Jenis Kelamin Wali': jenisWali,
            'No HP Wali': noHPWali.trim(),  // Kosong jika tidak ada di Excel
            'Tahun Ajaran Masuk': tahunAjaranMasuk || '2025/2026',  // Default ke tahun terbaru
            
            // FIELD TAMBAHAN (untuk backward compatibility)
            email: generateSiswaEmail(name, nis),
            alamat: normalized['alamat'] || '',
            kelasId,
            namaOrtu: namaWali,
            noHPOrtu: noHPWali.trim()
          };
        });

        console.log('📊 Transformed data:', transformedData);
        setPreviewData(transformedData);
        setShowPreviewModal(true);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Gagal membaca file Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (previewData.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }

    console.log('📤 [IMPORT START] Mengirim', previewData.length, 'siswa');
    console.log('📦 [IMPORT DATA SAMPLE]', previewData[0]); // Show first siswa structure

    setIsImporting(true);

    try {
      const response = await fetch('/api/admin/siswa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswaData: previewData }),
      });

      const result = await response.json();
      console.log('📥 [IMPORT RESPONSE]', result);
      
      setShowPreviewModal(false);
      setImportResults(result);
      setShowImportModal(true);
      await fetchSiswa();
      setPreviewData([]);
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Gagal mengimport data siswa');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Simplified template with 7 required columns
    const template = [{
      'Nama Lengkap Siswa': 'Abdullah Rahman',
      'NISN': '0012345678',
      'NIS': '24001',
      'Tanggal Lahir': '2010-05-15',
      'Jenis Kelamin': 'L',
      'Nama Wali': 'Ahmad Rahman',
      'Jenis Kelamin Wali': 'L'
    },
    {
      'Nama Lengkap Siswa': 'Fatimah Azzahra',
      'NISN': '0012345679',
      'NIS': '24002',
      'Tanggal Lahir': '2010-08-22',
      'Jenis Kelamin': 'P',
      'Nama Wali': 'Siti Aminah',
      'Jenis Kelamin Wali': 'P'
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 25 }, // Nama Lengkap Siswa
      { wch: 15 }, // NISN
      { wch: 12 }, // NIS
      { wch: 15 }, // Tanggal Lahir
      { wch: 15 }, // Jenis Kelamin
      { wch: 25 }, // Nama Wali
      { wch: 15 }  // Jenis Kelamin Wali
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Template_Import_Siswa_SIMTAQ.xlsx`);
  };

  // ============ FILTERING ============
  const filteredSiswa = siswaList.filter(siswa => {
    const matchSearch = matchesSearch(siswa, debouncedSearchTerm);
    const matchGender = filterGender === 'all' || siswa.jenisKelamin === filterGender;
    return matchSearch && matchGender;
  });

  // ============ ACTION HANDLERS ============
  const handleViewDetail = (siswa) => {
    setDetailSiswa(siswa);
    setShowDetailModal(true);
  };

  const handleChangeClass = (siswa) => {
    setDetailSiswa(siswa);
    setShowChangeClassModal(true);
  };

  const confirmChangeClass = async () => {
    if (!selectedNewClass) {
      alert('Pilih kelas tujuan terlebih dahulu');
      return;
    }

    try {
      // API call to move student to new class
      // await fetch(`/api/admin/siswa/${detailSiswa.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ kelasId: selectedNewClass })
      // });
      
      alert(`Siswa berhasil dipindahkan ke kelas baru`);
      setShowChangeClassModal(false);
      setSelectedNewClass(null);
      fetchSiswa();
    } catch (error) {
      console.error('Error changing class:', error);
      alert('Gagal memindahkan siswa ke kelas lain');
    }
  };

  // Fetch all classes for class change modal
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const response = await fetch(`/api/kelas`);
        const data = await response.json();
        setKelasOptions(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    
    if (showChangeClassModal) {
      fetchAllClasses();
    }
  }, [showChangeClassModal]);

  // ============ RENDER ============
  return (
    <AdminLayout>
      <div className="min-h-screen bg-white relative overflow-x-hidden">
        {/* Hero Header with Green Gradient */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 py-10 rounded-[2.5rem] shadow-lg mt-6 overflow-hidden mx-4 sm:mx-6 lg:mx-8">
          {/* Decorative Blur Circles */}
          <div className="absolute top-0 -right-16 -top-20 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-full px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center gap-5 sm:gap-7">
                {/* Icon Container (SIMTAQ Header Style) */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xl border border-white/30 animate-in zoom-in-95 duration-500">
                  <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <button 
                      onClick={() => router.back()}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-all text-white/80 hover:text-white"
                      title="Kembali"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">Kelola Siswa</h1>
                  </div>
                  <p className="text-white/90 text-sm sm:text-lg font-medium flex items-center gap-2 pl-1">
                    <span className="opacity-75">Kelas:</span>
                    <span className="bg-white/20 px-3 py-0.5 rounded-lg backdrop-blur-sm border border-white/10 text-white">
                      {kelas?.nama || '...'}
                    </span>
                    <span className="hidden sm:inline opacity-50 text-xs">•</span>
                    <span className="hidden sm:inline opacity-75 text-sm italic">Th. Ajaran {kelas?.tahunAjaran?.nama}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                {/* Reload Button with Loading Indicator */}
                <button
                  onClick={async () => await fetchSiswa()}
                  disabled={isReloading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm hover:bg-white/30 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data siswa"
                >
                  {isReloading ? (
                    <LoadingIndicator size="small" text="Memuat..." inline className="text-white" />
                  ) : (
                    <>
                      <Users size={18} />
                      <span>Refresh</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadTemplate()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <Download size={18} />
                  <span>Template</span>
                </button>
                <label
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl font-semibold text-sm hover:bg-white/30 backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Upload size={18} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all"
                >
                  <UserPlus size={18} />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Search & Filter - Horizontal Split Layout */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Search Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">
                    Cari Siswa
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Nama, NIS, NISN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/50 hover:bg-white/70"
                    />
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">
                    Filter Jenis Kelamin
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-emerald-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer bg-white/50 hover:bg-white/70"
                  >
                    <option value="all">Semua</option>
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
              </div>
              
              {/* Info Text with Loading Indicator */}
              <div className="mt-4 text-xs text-gray-600 font-medium">
                {isReloading ? (
                  <LoadingIndicator size="small" text="Memperbarui data..." inline />
                ) : (
                  <>Menampilkan {filteredSiswa.length} dari {siswaList.length} siswa</>
                )}
              </div>
            </div>
          </div>

          {/* ============ TABLE SECTION ============ */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm relative">
            {/* Loading Overlay */}
            {isReloading && (
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-40 flex items-center justify-center rounded-2xl pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <LoadingIndicator size="small" text="Memperbarui..." inline />
                </div>
              </div>
            )}

            {/* Table Header Card */}
            <div className="px-6 py-4 border-b border-slate-200/60">
              <h2 className="text-lg font-bold text-gray-900 m-0">
                Daftar Siswa {kelas?.nama}
              </h2>
            </div>

            {/* Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-slate-200/60">
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">NO</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">NAMA SISWA</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">NIS</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">NISN</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">JENIS KELAMIN</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">ORANG TUA</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loading Skeleton Rows - Show during initial load */}
                  {loading && siswaList.length === 0 ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-b border-slate-200/60">
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                        <td className="px-6 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                        <td className="px-6 py-3 text-center"><div className="h-4 bg-gray-200 rounded animate-pulse w-10 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredSiswa.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-400 text-sm">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="m-0 text-base font-medium">{loading ? 'Memuat data siswa...' : 'Tidak ada data siswa'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSiswa.map((siswa, index) => {
                      const parentName = siswa.orangTuaSiswa?.[0]?.orangTua?.user?.name || '-';

                      return (
                        <tr
                          key={siswa.id}
                          className="border-b border-slate-200/60 hover:bg-white/50 transition-colors"
                        >
                          <td className="px-6 py-3 text-sm text-gray-700">{index + 1}</td>
                          <td className="px-6 py-3">
                            <div className="font-semibold text-gray-900">{siswa.user.name}</div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-semibold text-emerald-700 text-sm">{siswa.nis}</span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">{siswa.nisn || '-'}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              siswa.jenisKelamin === 'LAKI_LAKI'
                                ? 'bg-blue-100/70 text-blue-700 border border-blue-200'
                                : 'bg-amber-100/70 text-amber-700 border border-amber-200'
                            }`}>
                              {formatGender(siswa.jenisKelamin)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">{parentName}</td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex justify-center">
                              <ActionDropdown
                                siswaId={siswa.id}
                                siswa={siswa}
                                buttonRef={{
                                  current: document.getElementById(`action-btn-${siswa.id}`)
                                }}
                                hasParent={siswa.orangTuaSiswa?.length > 0}
                                onViewDetail={() => handleViewDetail(siswa)}
                                onEdit={() => handleEdit(siswa)}
                                onDelete={() => handleDelete(siswa.id)}
                                onLinkParent={() => {
                                  setShowModal(true);
                                }}
                                onChangeClass={() => handleChangeClass(siswa)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Student Modal */}
      <StudentCreateModal
        isOpen={showModal}
        onClose={() => { 
          setShowModal(false);
          setEditingSiswa(null);
        }}
        onSuccess={fetchSiswa}
        userRole="ADMIN"
        initialKelasId={kelasId}
        editingSiswa={editingSiswa}
      />

      {/* Detail Siswa Modal */}
      {showDetailModal && detailSiswa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: colors.white, borderRadius: '24px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.gray[900] }}>
                Detail Siswa
              </h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[600], marginBottom: '6px', display: 'block' }}>Nama Siswa</label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: colors.gray[900] }}>{detailSiswa.user?.name}</p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[600], marginBottom: '6px', display: 'block' }}>NIS</label>
                <p style={{ fontSize: '15px', fontWeight: '600', color: colors.emerald[700] }}>{detailSiswa.nis}</p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[600], marginBottom: '6px', display: 'block' }}>NISN</label>
                <p style={{ fontSize: '16px', fontWeight: '600', color: colors.gray[900] }}>{detailSiswa.nisn || '-'}</p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[600], marginBottom: '6px', display: 'block' }}>Jenis Kelamin</label>
                <p style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{formatGender(detailSiswa.jenisKelamin)}</p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.gray[600], marginBottom: '6px', display: 'block' }}>Orang Tua</label>
                <p style={{ fontSize: '15px', fontWeight: '600', color: colors.gray[900] }}>{detailSiswa.orangTuaSiswa?.[0]?.orangTua?.user?.name || 'Belum terhubung'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: colors.emerald[500],
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.emerald[600]}
              onMouseLeave={(e) => e.currentTarget.style.background = colors.emerald[500]}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Change Class Modal */}
      {showChangeClassModal && detailSiswa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: colors.white, borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.gray[900] }}>
                Pindahkan Kelas
              </h2>
              <button onClick={() => { setShowChangeClassModal(false); setSelectedNewClass(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: colors.gray[600], marginBottom: '16px' }}>
                Pindahkan <strong>{detailSiswa.user?.name}</strong> ke kelas mana?
              </p>

              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: colors.gray[900] }}>Pilih Kelas Baru *</label>
              <select
                value={selectedNewClass || ''}
                onChange={(e) => setSelectedNewClass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasOptions.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.tahunAjaran?.nama})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowChangeClassModal(false); setSelectedNewClass(null); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.gray[700],
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmChangeClass}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: colors.emerald[500],
                  color: colors.white,
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.emerald[600]}
                onMouseLeave={(e) => e.currentTarget.style.background = colors.emerald[500]}
              >
                Pindahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewData.length > 0 && (
        <ModalPreviewExcel
          data={previewData}
          onImport={handleConfirmImport}
          onClose={() => { setShowPreviewModal(false); setPreviewData([]); }}
          isImporting={isImporting}
        />
      )}

      {showImportModal && importResults && (
        <ModalImportResults
          results={importResults}
          onClose={() => { setShowImportModal(false); setImportResults(null); }}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .kelas-detail-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

// ============ SUB-COMPONENTS ============
function ModalPreviewExcel({ data, onImport, onClose, isImporting }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: colors.white, borderRadius: '24px', padding: '32px', maxWidth: '1000px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.gray[900], marginBottom: '4px' }}>
              Preview Data Import
            </h2>
            <p style={{ fontSize: '14px', color: colors.gray[600] }}>
              {data.length} siswa akan diimport
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', marginBottom: '24px', border: `1px solid ${colors.gray[200]}`, borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead style={{ background: colors.emerald[50], position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ ...tableHeaderStyle, width: '40px' }}>No</th>
                <th style={tableHeaderStyle}>Nama Siswa</th>
                <th style={{ ...tableHeaderStyle, width: '120px' }}>NISN</th>
                <th style={{ ...tableHeaderStyle, width: '120px' }}>NIS</th>
                <th style={{ ...tableHeaderStyle, width: '100px' }}>JK</th>
                <th style={{ ...tableHeaderStyle, width: '120px' }}>Tgl Lahir</th>
                <th style={tableHeaderStyle}>Nama Ayah</th>
                <th style={tableHeaderStyle}>Nama Ibu</th>
              </tr>
            </thead>
            <tbody>
              {data.map((siswa, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                  <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                  <td style={tableCellStyle}>{siswa.name}</td>
                  <td style={tableCellStyle}>{siswa.nisn || '-'}</td>
                  <td style={tableCellStyle}>{siswa.nis}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[100] : colors.amber[100],
                      color: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[700] : colors.amber[700]
                    }}>
                      {siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{siswa.tanggalLahir || '-'}</td>
                  <td style={tableCellStyle}>{siswa.namaAyah || '-'}</td>
                  <td style={tableCellStyle}>{siswa.namaIbu || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            style={{
              padding: '12px 28px',
              border: `2px solid ${colors.gray[300]}`,
              borderRadius: '12px',
              background: colors.white,
              color: colors.gray[700],
              fontSize: '14px',
              fontWeight: '600',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              opacity: isImporting ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={isImporting}
            style={{
              padding: '12px 28px',
              border: 'none',
              borderRadius: '12px',
              background: colors.emerald[500],
              color: colors.white,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              opacity: isImporting ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isImporting ? 'Mengimport...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalImportResults({ results, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: colors.white, borderRadius: '24px', padding: '32px', maxWidth: '700px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.gray[900], marginBottom: '16px' }}>
          Hasil Import
        </h2>

        <div style={{ background: colors.emerald[50], padding: '16px', borderRadius: '12px', marginBottom: '16px', border: `1px solid ${colors.emerald[200]}` }}>
          <p style={{ margin: '8px 0', fontSize: '14px', color: colors.emerald[900] }}>
            ✓ Berhasil: {results.success || 0} siswa
          </p>
          {results.failed > 0 && (
            <p style={{ margin: '8px 0', fontSize: '14px', color: colors.red[600] }}>
              ✗ Gagal: {results.failed} siswa
            </p>
          )}
        </div>

        {results.errors && results.errors.length > 0 && (
          <div style={{ background: colors.red[50], padding: '16px', borderRadius: '12px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto', border: `1px solid ${colors.red[200]}` }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: colors.red[900], marginBottom: '8px' }}>Pesan Error:</p>
            {results.errors.map((err, i) => (
              <p key={i} style={{ fontSize: '12px', color: colors.red[800], margin: '4px 0' }}>
                • {err}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            background: colors.emerald[500],
            color: colors.white,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
