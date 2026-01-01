'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, Plus, Edit, Trash2, Shield, ShieldCheck,
  ArrowRight, Search, Download, BookOpen, GraduationCap,
  UserCheck, Clock, MoreVertical, X
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

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
    soft: '#C7F2C3', // Custom untuk kelas aktif
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
    soft: '#FFE6A7', // Custom untuk kelas nonaktif
  },
  gold: {
    500: '#EAB308',
    600: '#CA8A04',
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

// Komponen Dropdown Menu dengan Portal
function DropdownMenu({ buttonRef, onEdit, onToggleStatus, onDelete, isActive, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 150, // Align to right edge, offset by dropdown width
      });
    }
  }, [buttonRef]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [buttonRef, onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        minWidth: '150px',
        width: 'max-content',
        zIndex: 9999,
        animation: 'fadeSlideIn 0.2s ease-out',
        border: `1px solid ${colors.gray[200]}`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
          fontSize: '14px',
          fontWeight: 500,
          color: colors.text.primary,
          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = colors.emerald[50]}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Edit size={16} color={colors.emerald[600]} style={{ flexShrink: 0 }} />
        <span>Edit Kelas</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus();
          onClose();
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
          fontSize: '14px',
          fontWeight: 500,
          color: colors.text.primary,
          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = colors.amber[50]}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <ShieldCheck size={16} color={colors.amber[600]} style={{ flexShrink: 0 }} />
        <span>{isActive ? 'Nonaktifkan Kelas' : 'Aktifkan Kelas'}</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
          fontSize: '14px',
          fontWeight: 500,
          color: colors.text.primary,
          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Trash2 size={16} color="#DC2626" style={{ flexShrink: 0 }} />
        <span>Hapus Kelas</span>
      </button>
    </div>,
    document.body
  );
}

// Modern Stat Card - Pastel Solid (Tasmi Design System)
function StatCard({ icon: Icon, title, value, subtitle, theme = 'emerald' }) {
  const themeConfig = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-2 border-emerald-200',
      titleColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      subtitleColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-2 border-amber-200',
      titleColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      subtitleColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-2 border-blue-200',
      titleColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      subtitleColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${config.valueColor} text-3xl font-bold`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`${config.subtitleColor} text-xs font-medium mt-2`}>{subtitle}</p>
          )}
        </div>
        <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
          <Icon size={28} className={config.iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export default function AdminKelasPage() {
  const router = useRouter();
  const [kelas, setKelas] = useState([]);
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGuru, setFilterGuru] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [showInactiveKelas, setShowInactiveKelas] = useState(false); // Toggle untuk tampil kelas nonaktif
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [editingKelas, setEditingKelas] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which card menu is open
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const buttonRefs = useRef({});
  const [kelasFormData, setKelasFormData] = useState({
    nama: '', // Menggunakan field 'nama' sesuai schema
    tahunAjaranId: '',
    targetJuz: 1,
    guruUtamaId: '', // Guru utama/wali kelas
    guruPendampingIds: [], // Array ID guru pendamping
  });

  useEffect(() => {
    fetchKelas();
    fetchTahunAjaran();
    fetchGuruList();
  }, []);

  // Watch for editingKelas changes and sync form data
  useEffect(() => {
    if (editingKelas && showKelasModal) {
      console.log('SYNC EFFECT - editingKelas changed, syncing form data');
      const guruUtama = editingKelas.guruKelas?.find(kg => kg.peran === 'utama');
      const guruPendamping = editingKelas.guruKelas?.filter(kg => kg.peran === 'pendamping') || [];
      const tahunAjaranId = String(editingKelas.tahunAjaranId);
      
      const newFormData = {
        nama: editingKelas.nama,
        tahunAjaranId: tahunAjaranId,
        targetJuz: editingKelas.targetJuz || 1,
        guruUtamaId: guruUtama ? String(guruUtama.guruId) : '',
        guruPendampingIds: guruPendamping.map(gp => String(gp.guruId)),
      };
      console.log('SYNC EFFECT - Setting form data:', newFormData);
      setKelasFormData(newFormData);
    }
  }, [editingKelas, showKelasModal]);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/tahun-ajaran');
      const data = await response.json();
      // IDs are CUIDs (strings), don't convert to numbers
      setTahunAjaran(data);
      console.log('Tahun Ajaran data loaded:', data);
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    }
  };

  const fetchGuruList = async () => {
    try {
      const response = await fetch('/api/guru');
      const data = await response.json();
      setGuruList(data);
    } catch (error) {
      console.error('Error fetching guru:', error);
    }
  };

  const handleKelasSubmit = async (e, forceSubmit = false) => {
    e.preventDefault();

    try {
      // Log current state BEFORE validation
      console.log('SUBMIT - Current form state:', kelasFormData);
      console.log('SUBMIT - tahunAjaranId value:', kelasFormData.tahunAjaranId);
      console.log('SUBMIT - tahunAjaranId type:', typeof kelasFormData.tahunAjaranId);
      console.log('SUBMIT - forceSubmit:', forceSubmit);

      // Validate data before sending
      if (!kelasFormData.nama || !kelasFormData.tahunAjaranId) {
        alert('Nama kelas dan Tahun Ajaran harus diisi');
        console.log('Validation failed - nama or tahunAjaranId empty');
        return;
      }

      // tahunAjaranId is a STRING (CUID), not a number - DON'T parseInt!
      const submitData = {
        ...kelasFormData,
        // Keep tahunAjaranId as string (it's a CUID in database)
        targetJuz: kelasFormData.targetJuz ? parseInt(kelasFormData.targetJuz) : null,
        guruUtamaId: kelasFormData.guruUtamaId && kelasFormData.guruUtamaId.trim() ? kelasFormData.guruUtamaId : null,
        guruPendampingIds: kelasFormData.guruPendampingIds?.length > 0
          ? kelasFormData.guruPendampingIds.filter(id => id && id.trim())
          : [],
      };

      // Add force flag if this is a confirmed submission
      if (forceSubmit) {
        if (editingKelas) {
          submitData.forceUpdate = true;
        } else {
          submitData.forceCreate = true;
        }
      }

      console.log('Submitting kelas data:', submitData);

      const url = editingKelas ? `/api/admin/kelas/${editingKelas.id}` : '/api/admin/kelas';
      const method = editingKelas ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingKelas ? 'Kelas berhasil diupdate' : 'Kelas berhasil ditambahkan');
        setShowKelasModal(false);
        resetKelasForm();
        fetchKelas();
      } else if (response.status === 409 && data.requiresConfirmation) {
        // Guru sudah memiliki kelas lain, tampilkan konfirmasi
        setConfirmationData(data);
        setShowConfirmationModal(true);
      } else {
        console.error('API Error response:', data);
        alert(data.error || 'Gagal menyimpan data kelas');
      }
    } catch (error) {
      console.error('Error saving kelas:', error);
      alert('Gagal menyimpan data kelas: ' + error.message);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmationModal(false);
    // Re-submit with force flag
    const fakeEvent = { preventDefault: () => {} };
    await handleKelasSubmit(fakeEvent, true);
  };

  const handleEditKelas = (kelasItem) => {
    console.log('EDIT KELAS - kelasItem received:', kelasItem);
    console.log('EDIT KELAS - tahunAjaranId:', kelasItem.tahunAjaranId, 'type:', typeof kelasItem.tahunAjaranId);
    
    setEditingKelas(kelasItem);

    // Extract guru utama dan pendamping dari kelasGuru
    const guruUtama = kelasItem.guruKelas?.find(kg => kg.peran === 'utama');
    const guruPendamping = kelasItem.guruKelas?.filter(kg => kg.peran === 'pendamping') || [];

    // tahunAjaranId is already a string (CUID), use as-is
    const tahunAjaranId = kelasItem.tahunAjaranId || '';

    console.log('EDIT KELAS - Setting form data with tahunAjaranId:', tahunAjaranId);

    setKelasFormData(prevState => {
      const newState = {
        nama: kelasItem.nama,
        tahunAjaranId: tahunAjaranId,
        targetJuz: kelasItem.targetJuz || 1,
        guruUtamaId: guruUtama ? guruUtama.guruId.toString() : '',
        guruPendampingIds: guruPendamping.map(gp => gp.guruId.toString()),
      };
      console.log('EDIT KELAS - Form state updated to:', newState);
      return newState;
    });
    
    setShowKelasModal(true);
  };

  const handleDeleteKelas = (kelasItem) => {
    setKelasToDelete(kelasItem);
    setShowDeleteModal(true);
    setOpenMenuId(null); // Close dropdown
  };

  const confirmDeleteKelas = async () => {
    if (!kelasToDelete) {
      console.error('confirmDeleteKelas - No kelas to delete');
      return;
    }

    console.log('confirmDeleteKelas - Deleting kelas:', {
      id: kelasToDelete.id,
      nama: kelasToDelete.nama
    });

    try {
      const response = await fetch(`/api/admin/kelas/${kelasToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('confirmDeleteKelas - Response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (response.ok) {
        const kelasNama = kelasToDelete.nama;
        alert(`Kelas "${kelasNama}" berhasil dihapus`);
        fetchKelas();
        setShowDeleteModal(false);
        setKelasToDelete(null);
      } else {
        // Display detailed error message from server
        let errorMessage = data.error || 'Gagal menghapus kelas';

        // Add details if available
        if (data.details) {
          errorMessage += `\n\nDetail: ${data.details}`;
        }

        if (data.code) {
          errorMessage += `\n\nKode Error: ${data.code}`;
        }

        console.error('confirmDeleteKelas - Error response:', {
          status: response.status,
          error: data.error,
          details: data.details,
          code: data.code
        });

        alert(errorMessage);
      }
    } catch (error) {
      console.error('confirmDeleteKelas - Exception:', error);
      alert(`Terjadi kesalahan saat menghapus kelas.\n\nError: ${error.message}`);
    }
  };

  const handleToggleStatusKelas = async (kelasItem) => {
    if (!kelasItem) {
      console.error('handleToggleStatusKelas - No kelas provided');
      return;
    }

    console.log('handleToggleStatusKelas - Toggling status for kelas:', {
      id: kelasItem.id,
      nama: kelasItem.nama,
      currentStatus: kelasItem.status
    });

    try {
      // Toggle status: AKTIF <-> NONAKTIF
      const currentStatus = kelasItem.status || 'AKTIF';
      const newStatus = currentStatus === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';

      console.log('handleToggleStatusKelas - New status:', newStatus);

      const response = await fetch(`/api/admin/kelas/${kelasItem.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      console.log('handleToggleStatusKelas - Response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (response.ok) {
        const statusText = newStatus === 'AKTIF' ? 'Aktif' : 'Nonaktif';
        alert(`Kelas "${kelasItem.nama}" berhasil diubah menjadi ${statusText}`);
        fetchKelas(); // Refresh kelas list
        setOpenMenuId(null); // Close dropdown
      } else {
        let errorMessage = data.error || 'Gagal mengubah status kelas';

        if (data.details) {
          errorMessage += `\n\nDetail: ${data.details}`;
        }

        if (data.code) {
          errorMessage += `\n\nKode Error: ${data.code}`;
        }

        console.error('handleToggleStatusKelas - Error response:', {
          status: response.status,
          error: data.error,
          details: data.details,
          code: data.code
        });

        alert(errorMessage);
      }
    } catch (error) {
      console.error('handleToggleStatusKelas - Exception:', error);
      alert(`Terjadi kesalahan saat mengubah status kelas.\n\nError: ${error.message}`);
    }
  };

  const handleViewDetail = (kelasItem) => {
    setSelectedKelas(kelasItem);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Nama Kelas', 'Tahun Ajaran', 'Guru Tahfidz', 'Jumlah Siswa'],
      ...filteredKelas.map(k => [
        k.nama,
        k.tahunAjaran?.nama || '-',
        k.guruKelas?.filter(kg => kg.peran === 'utama').map(kg => kg.guru.user.name).join(', ') || '-',
        k._count?.siswa || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data-kelas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const resetKelasForm = () => {
    setKelasFormData({
      nama: '',
      tahunAjaranId: '',
      targetJuz: 1,
      guruUtamaId: '',
      guruPendampingIds: [],
    });
    setEditingKelas(null);
  };

  // Filter data - pisahkan aktif dan nonaktif
  const activeKelas = Array.isArray(kelas) ? kelas.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = k.status === 'AKTIF';
    const hasGuru = k.guruKelas && k.guruKelas.length > 0;
    const matchGuru = filterGuru === 'all' ||
      (hasGuru && k.guruKelas.some(kg => kg.guruId.toString() === filterGuru));

    return matchSearch && matchGuru && matchStatus;
  }) : [];

  const inactiveKelas = Array.isArray(kelas) ? kelas.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = k.status !== 'AKTIF';
    const hasGuru = k.guruKelas && k.guruKelas.length > 0;
    const matchGuru = filterGuru === 'all' ||
      (hasGuru && k.guruKelas.some(kg => kg.guruId.toString() === filterGuru));

    return matchSearch && matchGuru && matchStatus;
  }) : [];

  // Untuk backward compatibility dengan display
  const filteredKelas = filterStatus === 'all' ? [...activeKelas, ...inactiveKelas] :
    filterStatus === 'active' ? activeKelas : inactiveKelas;

  // Statistics - updated untuk gunakan real status field
  const stats = {
    total: Array.isArray(kelas) ? kelas.length : 0,
    active: activeKelas.length,
    inactive: inactiveKelas.length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Section */}
          <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Manajemen Kelas</h1>
                <p className="text-green-50 text-sm sm:text-sm">Kelola kelas tahfidz, wali kelas, dan siswa dengan mudah</p>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 h-11 px-4 py-3 bg-white/15 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Download size={18} />
                  <span>Unduh Template</span>
                </button>
                <button
                  onClick={() => {
                    resetKelasForm();
                    setShowKelasModal(true);
                  }}
                  className="flex items-center justify-center gap-2 h-11 px-4 py-3 bg-white text-emerald-700 hover:bg-white/90 rounded-xl font-semibold transition-all duration-300"
                >
                  <Plus size={18} />
                  <span>Tambah Kelas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards - Pastel Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={BookOpen}
              title="Total Kelas"
              value={stats.total}
              subtitle="Semua kelas terdaftar"
              theme="blue"
            />
            <StatCard
              icon={GraduationCap}
              title="Aktif"
              value={stats.active}
              subtitle="Kelas yang sedang berjalan"
              theme="emerald"
            />
            <StatCard
              icon={Clock}
              title="Tidak Aktif"
              value={stats.inactive}
              subtitle="Kelas nonaktif"
              theme="amber"
            />
          </div>

          {/* Filter Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md shadow-emerald-100/30 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Cari Kelas
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 flex-shrink-0"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama kelas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-base"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Filter Guru
                </label>
                <select
                  value={filterGuru}
                  onChange={(e) => setFilterGuru(e.target.value)}
                  className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer text-sm appearance-none bg-white"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23333%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="all">Semua Guru</option>
                  {guruList.map(g => (
                    <option key={g.id} value={g.id}>{g.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer text-sm appearance-none bg-white"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23333%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Cards - Kelas Aktif */}
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.text.primary,
              marginBottom: '16px',
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
            }}>
              ✅ Kelas Aktif
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeKelas.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">Tidak ada kelas aktif yang ditemukan</p>
                </div>
              ) : (
                activeKelas.map((kelasItem, index) => {
                  const isActive = true; // Selalu true untuk active section
                  const guruUtama = kelasItem.guruKelas?.find(kg => kg.peran === 'utama');
                  const jumlahSiswa = kelasItem._count?.siswa || 0;

                  return (
                    <div
                      key={kelasItem.id}
                      onClick={() => handleViewDetail(kelasItem)}
                      style={{
                        background: isActive ?
                          `linear-gradient(135deg, ${colors.emerald.soft}40 0%, ${colors.emerald.soft}80 100%)` :
                          `linear-gradient(135deg, ${colors.amber.soft}40 0%, ${colors.amber.soft}80 100%)`,
                        borderRadius: '20px',
                        padding: '24px',
                        border: `2px solid ${isActive ? colors.emerald.soft : colors.amber.soft}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        animation: `slideUp 0.4s ease-out ${0.3 + (index * 0.05)}s both`,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                      className="kelas-card"
                    >
                      {/* Icon Background */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: isActive ?
                          `${colors.emerald[500]}15` :
                          `${colors.amber[500]}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 0,
                      }}>
                        <GraduationCap size={50} color={isActive ? colors.emerald[300] : colors.amber[300]} />
                      </div>

                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '16px',
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: colors.text.primary,
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            marginBottom: '4px',
                          }}>
                            {kelasItem.nama}
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: colors.text.tertiary,
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                          }}>
                            Tingkat {kelasItem.tingkat} • {kelasItem.tahunAjaran?.nama || 'Belum ada tahun ajaran'}
                          </p>
                        </div>
                        {/* Three-dot menu */}
                        <button
                          ref={(el) => {
                            if (el) buttonRefs.current[kelasItem.id] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === kelasItem.id ? null : kelasItem.id);
                          }}
                          style={{
                            padding: '8px',
                            borderRadius: '10px',
                            border: 'none',
                            background: openMenuId === kelasItem.id ? colors.gray[100] : 'transparent',
                            color: colors.gray[600],
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          title="Opsi"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>

                      {/* Guru Tahfidz */}
                      <div style={{
                        background: colors.white,
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}>
                          <ShieldCheck size={16} color={colors.emerald[600]} />
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: colors.text.tertiary,
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            Guru Tahfidz
                          </span>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        }}>
                          {guruUtama ? guruUtama.guru.user.name : 'Belum ada guru'}
                        </p>
                      </div>

                      {/* Stats Row */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <div style={{
                          background: colors.white,
                          borderRadius: '12px',
                          padding: '12px',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}>
                            <Users size={16} color={colors.emerald[600]} />
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: colors.text.tertiary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              textTransform: 'uppercase',
                            }}>
                              Siswa
                            </span>
                          </div>
                          <p style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: colors.text.primary,
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                          }}>
                            {jumlahSiswa}
                          </p>
                        </div>

                        <div style={{
                          background: colors.white,
                          borderRadius: '12px',
                          padding: '12px',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}>
                            <UserCheck size={16} color={isActive ? colors.emerald[600] : colors.amber[600]} />
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: colors.text.tertiary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              textTransform: 'uppercase',
                            }}>
                              Status
                            </span>
                          </div>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isActive ? colors.emerald[700] : colors.amber[700],
                            fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                          }}>
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/kelas/${kelasItem.id}`);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300 relative z-1"
                      >
                        Kelola Siswa →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Toggle & Kelas Nonaktif Section */}
          <div>
            <button
              onClick={() => setShowInactiveKelas(!showInactiveKelas)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                background: colors.white,
                border: `2px solid ${colors.gray[200]}`,
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.gray[50];
                e.currentTarget.style.borderColor = colors.emerald[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.white;
                e.currentTarget.style.borderColor = colors.gray[200];
              }}
            >
              <span>{showInactiveKelas ? '⬇️' : '⬆️'}</span>
              <span>
                Kelas Nonaktif ({inactiveKelas.length})
              </span>
            </button>

            {/* Kelas Nonaktif - Collapsed by default */}
            {showInactiveKelas && (
              <div style={{
                animation: 'slideDown 0.3s ease-out',
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.amber[700],
                  marginBottom: '16px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  ⏸️ Kelas Nonaktif
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inactiveKelas.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
                      <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 font-medium">Tidak ada kelas nonaktif yang ditemukan</p>
                    </div>
                  ) : (
                    inactiveKelas.map((kelasItem, index) => {
                      const isActive = false; // Selalu false untuk inactive section
                      const guruUtama = kelasItem.guruKelas?.find(kg => kg.peran === 'utama');
                      const jumlahSiswa = kelasItem._count?.siswa || 0;

                      return (
                        <div
                          key={kelasItem.id}
                          onClick={() => handleViewDetail(kelasItem)}
                          style={{
                            background: `linear-gradient(135deg, ${colors.amber.soft}40 0%, ${colors.amber.soft}80 100%)`,
                            borderRadius: '20px',
                            padding: '24px',
                            border: `2px solid ${colors.amber.soft}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            animation: `slideUp 0.4s ease-out ${0.3 + (index * 0.05)}s both`,
                            position: 'relative',
                            overflow: 'visible',
                          }}
                          className="kelas-card"
                        >
                          {/* Icon Background */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: `${colors.amber[500]}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 0,
                          }}>
                            <GraduationCap size={50} color={colors.amber[300]} />
                          </div>

                          {/* Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '16px',
                            position: 'relative',
                            zIndex: 1,
                          }}>
                            <div>
                              <h3 style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: colors.text.primary,
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                marginBottom: '4px',
                              }}>
                                {kelasItem.nama}
                              </h3>
                              <p style={{
                                fontSize: '12px',
                                color: colors.text.tertiary,
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              }}>
                                Tingkat {kelasItem.tingkat} • {kelasItem.tahunAjaran?.nama || 'Belum ada tahun ajaran'}
                              </p>
                            </div>
                            {/* Three-dot menu */}
                            <button
                              ref={(el) => {
                                if (el) buttonRefs.current[kelasItem.id] = el;
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === kelasItem.id ? null : kelasItem.id);
                              }}
                              style={{
                                padding: '8px',
                                borderRadius: '10px',
                                border: 'none',
                                background: openMenuId === kelasItem.id ? colors.gray[100] : 'transparent',
                                color: colors.gray[600],
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              title="Opsi"
                            >
                              <MoreVertical size={20} />
                            </button>
                          </div>

                          {/* Guru Tahfidz */}
                          <div style={{
                            background: colors.white,
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            position: 'relative',
                            zIndex: 1,
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px',
                            }}>
                              <ShieldCheck size={16} color={colors.amber[600]} />
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: colors.text.tertiary,
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}>
                                Guru Tahfidz
                              </span>
                            </div>
                            <p style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: colors.text.primary,
                              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                            }}>
                              {guruUtama ? guruUtama.guru.user.name : 'Belum ada guru'}
                            </p>
                          </div>

                          {/* Stats Row */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                            position: 'relative',
                            zIndex: 1,
                          }}>
                            <div style={{
                              background: colors.white,
                              borderRadius: '12px',
                              padding: '12px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}>
                                <Users size={16} color={colors.amber[600]} />
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: colors.text.tertiary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                  textTransform: 'uppercase',
                                }}>
                                  Siswa
                                </span>
                              </div>
                              <p style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: colors.text.primary,
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              }}>
                                {jumlahSiswa}
                              </p>
                            </div>

                            <div style={{
                              background: colors.white,
                              borderRadius: '12px',
                              padding: '12px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}>
                                <UserCheck size={16} color={colors.amber[600]} />
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: colors.text.tertiary,
                                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                                  textTransform: 'uppercase',
                                }}>
                                  Status
                                </span>
                              </div>
                              <p style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: colors.amber[700],
                                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                              }}>
                                Nonaktif
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/kelas/${kelasItem.id}`);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300 relative z-1"
                          >
                            Lihat Detail →
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu dengan Portal */}
      {openMenuId && buttonRefs.current[openMenuId] && (() => {
        const kelasItem = kelas.find(k => k.id === openMenuId);
        // Check status kelas, default to AKTIF if not set
        const isActive = kelasItem && (kelasItem.status === 'AKTIF' || !kelasItem.status);
        return (
          <DropdownMenu
            buttonRef={{ current: buttonRefs.current[openMenuId] }}
            onEdit={() => {
              if (kelasItem) handleEditKelas(kelasItem);
            }}
            onToggleStatus={() => {
              if (kelasItem) handleToggleStatusKelas(kelasItem);
            }}
            onDelete={() => {
              if (kelasItem) handleDeleteKelas(kelasItem);
            }}
            isActive={isActive}
            onClose={() => setOpenMenuId(null)}
          />
        );
      })()}

      {/* Modal Detail Kelas */}
      {showDetailModal && selectedKelas && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.emerald[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                Detail Kelas
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: colors.text.tertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'all 0.2s ease',
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Nama Kelas
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedKelas.nama}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Tingkat
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  Tingkat {selectedKelas.tingkat}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Tahun Ajaran
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedKelas.tahunAjaran?.nama || '-'}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Target Juz
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedKelas.targetJuz || 1} Juz
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Jumlah Siswa
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedKelas._count?.siswa || 0} Siswa
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '4px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Status
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: selectedKelas.isActive !== false ? colors.emerald[700] : colors.amber[700],
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  {selectedKelas.isActive !== false ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  Guru Pengampu
                </label>
                {selectedKelas.kelasGuru && selectedKelas.kelasGuru.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedKelas.kelasGuru.map(kg => (
                      <div key={kg.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: colors.gray[50],
                        borderRadius: '8px',
                      }}>
                        {kg.peran === 'utama' ? (
                          <ShieldCheck size={16} color={colors.emerald[600]} />
                        ) : (
                          <Shield size={16} color={colors.gray[400]} />
                        )}
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text.primary,
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        }}>
                          {kg.guru.user.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: colors.text.tertiary,
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                        }}>
                          ({kg.peran})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '14px',
                    color: colors.text.tertiary,
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  }}>
                    Belum ada guru pengampu
                  </p>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '12px 24px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  router.push(`/admin/kelas/${selectedKelas.id}`);
                }}
                style={{
                  padding: '12px 24px',
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
                className="submit-btn"
              >
                Kelola Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Kelas */}
      {showKelasModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.emerald[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              }}>
                {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowKelasModal(false);
                  resetKelasForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: colors.text.tertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'all 0.2s ease',
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKelasSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 1A"
                  value={kelasFormData.nama}
                  onChange={(e) => setKelasFormData({ ...kelasFormData, nama: e.target.value })}
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

              {/* Target Juz & Tahun Ajaran - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Juz - Read Only */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Target Juz
                  </label>
                  <input
                    type="number"
                    disabled
                    readOnly
                    value={kelasFormData.targetJuz || ''}
                    className="w-full h-12 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 text-sm cursor-not-allowed transition-all duration-300"
                  />
                </div>

                {/* Tahun Ajaran */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Tahun Ajaran *
                  </label>
                  <select
                    required
                    value={kelasFormData.tahunAjaranId}
                    onChange={(e) => {
                      const selectedTA = tahunAjaran.find(ta => ta.id === e.target.value);
                      setKelasFormData({
                        ...kelasFormData,
                        tahunAjaranId: e.target.value,
                        targetJuz: selectedTA?.targetHafalan || 1,
                      });
                    }}
                    className="w-full h-12 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 text-slate-700 text-sm cursor-pointer bg-white transition-all duration-300 appearance-none"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath fill=%27none%27 stroke=%27%23374151%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M2 5l6 6 6-6%27/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    {tahunAjaran.length === 0 ? (
                      <option disabled>Tidak ada tahun ajaran tersedia</option>
                    ) : (
                      tahunAjaran.map((ta) => (
                        <option key={ta.id} value={ta.id}>
                          {ta.nama} - Semester {ta.semester} {ta.isActive && '(Aktif)'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Guru Utama */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  Guru Utama (Wali Kelas)
                </label>
                <select
                  value={kelasFormData.guruUtamaId}
                  onChange={(e) => setKelasFormData({ ...kelasFormData, guruUtamaId: e.target.value })}
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
                  }}
                  className="form-input"
                >
                  <option value="">Pilih Guru Utama (Opsional)</option>
                  {guruList.map((guru) => (
                    <option key={guru.id} value={guru.id.toString()}>
                      {guru.user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru Pendamping */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                }}>
                  Guru Pendamping (Opsional)
                </label>
                <div style={{
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  padding: '12px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {guruList.length > 0 ? (
                    guruList.map((guru) => (
                      <div key={guru.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        marginBottom: '4px',
                      }}>
                        <input
                          type="checkbox"
                          id={`guru-${guru.id}`}
                          checked={kelasFormData.guruPendampingIds.includes(guru.id.toString())}
                          disabled={kelasFormData.guruUtamaId === guru.id.toString()}
                          onChange={(e) => {
                            const guruId = guru.id.toString();
                            if (e.target.checked) {
                              setKelasFormData({
                                ...kelasFormData,
                                guruPendampingIds: [...kelasFormData.guruPendampingIds, guruId]
                              });
                            } else {
                              setKelasFormData({
                                ...kelasFormData,
                                guruPendampingIds: kelasFormData.guruPendampingIds.filter(id => id !== guruId)
                              });
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor={`guru-${guru.id}`} style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: kelasFormData.guruUtamaId === guru.id.toString() ? colors.text.tertiary : colors.text.secondary,
                          fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                          cursor: 'pointer',
                        }}>
                          {guru.user.name}
                          {kelasFormData.guruUtamaId === guru.id.toString() && ' (Guru Utama)'}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{
                      fontSize: '13px',
                      color: colors.text.tertiary,
                      fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                      textAlign: 'center',
                      padding: '8px',
                    }}>
                      Tidak ada guru tersedia
                    </p>
                  )}
                </div>
                <p style={{
                  fontSize: '11px',
                  color: colors.text.tertiary,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  marginTop: '6px',
                }}>
                  Pilih guru pendamping jika diperlukan (bisa lebih dari 1)
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowKelasModal(false);
                    resetKelasForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    border: `2px solid ${colors.gray[300]}`,
                    borderRadius: '12px',
                    background: colors.white,
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  className="cancel-btn"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
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
                  className="submit-btn"
                >
                  {editingKelas ? 'Update Kelas' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guru Confirmation Modal */}
      {showConfirmationModal && confirmationData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 60,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.amber[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `${colors.amber[100]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UserCheck size={28} color={colors.amber[600]} />
              </div>
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              textAlign: 'center',
              marginBottom: '12px',
            }}>
              Konfirmasi Penugasan Guru
            </h2>

            <p style={{
              fontSize: '14px',
              color: colors.text.secondary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              {confirmationData.message}
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setConfirmationData(null);
                }}
                style={{
                  padding: '12px 28px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                style={{
                  padding: '12px 28px',
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
                className="submit-btn"
              >
                Ya, Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && kelasToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 60,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${colors.amber[100]}`,
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trash2 size={28} color="#DC2626" />
              </div>
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              textAlign: 'center',
              marginBottom: '12px',
            }}>
              Hapus Kelas?
            </h2>

            <p style={{
              fontSize: '14px',
              color: colors.text.secondary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '8px',
            }}>
              Apakah Anda yakin ingin menghapus kelas <strong>{kelasToDelete.nama}</strong>?
            </p>

            <p style={{
              fontSize: '13px',
              color: colors.text.tertiary,
              fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              Data siswa tidak akan terhapus.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setKelasToDelete(null);
                }}
                style={{
                  padding: '12px 28px',
                  border: `2px solid ${colors.gray[300]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                className="cancel-btn"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteKelas}
                style={{
                  padding: '12px 28px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#DC2626',
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", "Nunito", system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                }}
                className="delete-confirm-btn"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Keyframe Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }

        /* Stats Card Hover */
        .stats-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        /* Kelas Card Hover with Golden-Green Glow */
        .kelas-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(26, 147, 111, 0.2), 0 0 30px rgba(234, 179, 8, 0.15);
          border-color: ${colors.emerald[400]} !important;
        }

        /* Button Hover Effects */
        .export-btn:hover {
          background: ${colors.emerald[50]} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.15) !important;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 147, 111, 0.3) !important;
        }

        /* Input Focus */
        .search-input:focus,
        .filter-select:focus,
        .form-input:focus {
          border-color: ${colors.emerald[500]} !important;
          box-shadow: 0 0 0 3px ${colors.emerald[500]}20 !important;
        }

        /* Action Button Hover */
        .action-btn-edit:hover {
          background: ${colors.emerald[500]}30 !important;
          transform: scale(1.1);
        }

        .action-btn-delete:hover {
          background: #FEE2E2 !important;
          transform: scale(1.1);
        }

        .view-detail-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }

        /* Modal Close Button Hover */
        .close-btn:hover {
          color: ${colors.text.primary} !important;
          transform: rotate(90deg);
        }

        /* Form Button Hover */
        .cancel-btn:hover {
          background: ${colors.gray[50]} !important;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 147, 111, 0.3) !important;
        }

        .delete-confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3) !important;
          background: #B91C1C !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
          
          .page-header {
            padding: 24px 16px 20px !important;
          }
          
          .page-main-content {
            padding: 24px 16px 32px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
