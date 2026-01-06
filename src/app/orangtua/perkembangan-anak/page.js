'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import MonthlyPeriodFilter from '@/components/penilaian/MonthlyPeriodFilter';
import { calculateMonthRange, getCurrentMonthYear, formatMonthYear } from '@/lib/utils/dateRangeHelpers';
import {
  BookOpen,
  Clock,
  Info,
  ChevronDown,
  User,
  CheckCircle,
  AlertCircle,
  BookMarked,
  MessageSquare,
  X,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  safeNumber,
  mapAssessmentToRow,
  formatTanggal,
} from '@/lib/utils/penilaianHelpers';
import { getStatusBadgeConfig } from '@/lib/helpers/statusHelpers';

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// ===== DATA FETCHER =====
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// ===== REUSABLE COMPONENTS =====

// InfoRow component untuk modal detail
const InfoRow = ({ label, value }) => {
  return (
    <div className="bg-gray-50/70 border border-gray-200/50 rounded-xl px-4 py-3">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
};

// StatCard - Compact & Bright Pastel with Glow (SIMTAQ baseline)
const StatCard = ({ icon: Icon, title, value, subtitle, variant = 'emerald' }) => {
  const variantConfig = {
    emerald: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-300/60',
      ring: 'ring-emerald-500/20',
      shadow: 'shadow-emerald-500/15',
      textValue: 'text-emerald-600',
      iconBg: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-300/60',
      ring: 'ring-amber-500/20',
      shadow: 'shadow-amber-500/15',
      textValue: 'text-amber-600',
      iconBg: 'bg-amber-500',
    },
    sky: {
      bg: 'bg-sky-50/80',
      border: 'border-sky-300/60',
      ring: 'ring-sky-500/20',
      shadow: 'shadow-sky-500/15',
      textValue: 'text-sky-600',
      iconBg: 'bg-sky-500',
    },
    rose: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-300/60',
      ring: 'ring-rose-500/20',
      shadow: 'shadow-rose-500/15',
      textValue: 'text-rose-600',
      iconBg: 'bg-rose-500',
    },
  };

  const styles = variantConfig[variant];

  return (
    <div className={`${styles.bg} border ${styles.border} ring-1 ${styles.ring} backdrop-blur-sm rounded-2xl p-4 shadow-lg ${styles.shadow} hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${styles.iconBg} rounded-xl shadow-md flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="mt-3">
        <div className={`text-3xl font-bold ${styles.textValue}`}>{value}</div>
        <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    lulus: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Lulus',
    },
    revisi: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Revisi',
    },
    belum: {
      icon: Clock,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      label: 'Belum Dinilai',
    },
  };

  const config = statusConfig[status] || statusConfig.belum;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.border} border rounded-lg`}>
      <Icon size={16} className={config.color} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
};

// ScoreBadge Component - untuk nilai dengan warna berdasarkan range
const ScoreBadge = ({ score }) => {
  const numScore = safeNumber(score, 0);

  const getScoreConfig = (score) => {
    if (score >= 90) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
      };
    } else if (score >= 75) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
      };
    } else if (score > 0) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
      };
    } else {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-500',
      };
    }
  };

  const config = getScoreConfig(numScore);

  return (
    <span className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 ${config.bg} ${config.border} border rounded-lg font-bold ${config.text} text-sm`}>
      {numScore > 0 ? numScore : '-'}
    </span>
  );
};

// Attendance Badge Component
const AttendanceBadge = ({ status }) => {
  const configs = {
    HADIR: { label: 'Hadir', emoji: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    IZIN: { label: 'Izin', emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    SAKIT: { label: 'Sakit', emoji: '🔵', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    ALFA: { label: 'Alfa', emoji: '🔴', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const config = configs[status];

  if (!config) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
        <span className="text-xs font-bold text-gray-400">-</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} ${config.border} border rounded-full shadow-sm`}>
      <span className="text-xs">{config.emoji}</span>
      <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
    </div>
  );
};

// EmptyState Component
const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="text-gray-400" size={40} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md">{description}</p>
    </div>
  );
};

// Child Selector Dropdown
const ChildSelector = ({ children, selectedChild, onSelectChild }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!children || children.length === 0) return null;

  const hasMultipleChildren = children.length > 1;
  const selectedStatusBadge = getStatusBadgeConfig(selectedChild?.statusSiswa || 'AKTIF');

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => hasMultipleChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg transition-all duration-300 ${
          hasMultipleChildren ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
        }`}
      >
        <User size={20} className="text-emerald-600 flex-shrink-0" />
        <div className="text-left flex-1">
          <p className="text-sm text-gray-600">Anak yang Dipilih</p>
          <p className="font-semibold text-gray-900">{selectedChild?.nama || 'Pilih Anak'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${selectedStatusBadge.bgColor} ${selectedStatusBadge.textColor} ${selectedStatusBadge.borderColor}`}>
              {selectedStatusBadge.emoji} {selectedStatusBadge.label}
            </span>
          </div>
        </div>
        {hasMultipleChildren && (
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && hasMultipleChildren && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[999] max-h-[300px] overflow-y-auto">
            {children.map((child, index) => {
              const statusBadge = getStatusBadgeConfig(child.statusSiswa || 'AKTIF');
              return (
                <button
                  key={child.id || index}
                  onClick={() => {
                    onSelectChild({
                      ...child,
                      nama: child.nama || child.namaLengkap,
                      statusSiswa: child.statusSiswa || 'AKTIF',
                    });
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                    selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <User size={20} className="text-emerald-600 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">{child.nama || child.namaLengkap}</p>
                    <p className="text-xs text-gray-600">Kelas {child.kelas || child.kelas?.namaKelas}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border mt-1 ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                      {statusBadge.emoji} {statusBadge.label}
                    </span>
                  </div>
                  {selectedChild?.id === child.id && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Modal Detail Catatan Guru - SIMTAQ Glass Style
const CatatanGuruModal = ({ isOpen, onClose, catatan }) => {
  if (!isOpen || !catatan) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/80 backdrop-blur rounded-2xl border border-white/20 shadow-xl shadow-green-500/10 p-5 sm:p-6 max-w-lg w-full"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Catatan Guru</h3>
              <p className="text-sm text-gray-600 mt-1">Feedback dari guru</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/70 rounded-xl transition-all duration-200 hover:shadow-md group"
          >
            <X className="text-gray-500 group-hover:text-gray-700" size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Guru Pengajar" value={catatan.guru} />
            <InfoRow label="Tanggal Setor" value={catatan.tanggal} />
          </div>

          <div className="border-l-4 border-emerald-500 bg-emerald-50/60 rounded-r-xl p-4">
            <p className="text-xs font-medium text-emerald-700 mb-2">Catatan Penilaian</p>
            <p className="text-sm text-gray-900 leading-relaxed">{catatan.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export default function PerkembanganAnakPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedCatatan, setSelectedCatatan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month/Year filter state
  const currentDate = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month);
  const [selectedYear, setSelectedYear] = useState(currentDate.year);

  // Fetch children list
  const { data: childrenData } = useSWR(
    status === 'authenticated' ? '/api/orangtua/penilaian-hafalan' : null,
    fetcher
  );

  // Set initial selected child when children data loads
  useEffect(() => {
    if (childrenData?.children && childrenData.children.length > 0 && !selectedChild) {
      const firstChild = childrenData.children[0];
      setSelectedChild({
        id: firstChild.id,
        nama: firstChild.namaLengkap,
        kelas: firstChild.kelas?.namaKelas || '-',
        statusSiswa: firstChild.statusSiswa || 'AKTIF',
      });
    }
  }, [childrenData, selectedChild]);

  // Fetch penilaian data for selected child and month range
  const { data: penilaianData, error: penilaianError } = useSWR(
    selectedChild?.id ? (() => {
      const { startDateStr, endDateStr } = calculateMonthRange(selectedMonth, selectedYear);
      return `/api/orangtua/penilaian-hafalan?siswaId=${selectedChild.id}&startDate=${startDateStr}&endDate=${endDateStr}`;
    })() : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingIndicator text="Memuat sistem..." size="large" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleMonthYearChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const penilaianRows = penilaianData?.penilaianData
    ? penilaianData.penilaianData.map((assessment) => {
        const mapped = mapAssessmentToRow(assessment);
        return {
          ...mapped,
          tanggal: formatTanggal(assessment.tanggal),
          attendanceStatus: assessment.attendanceStatus
        };
      })
    : [];

  const periodText = formatMonthYear(selectedMonth, selectedYear);
  const penilaianCount = penilaianRows.length;

  // Stats calculation
  const stats = {
    hadir: safeNumber(penilaianData?.statistics?.hadir, 0),
    izin: safeNumber(penilaianData?.statistics?.izin, 0),
    sakit: safeNumber(penilaianData?.statistics?.sakit, 0),
    alfa: safeNumber(penilaianData?.statistics?.alfa, 0),
    rataRataNilai: safeNumber(penilaianData?.statistics?.rataRataNilai, 0),
  };

  const handleOpenCatatan = (row) => {
    if (row.status !== 'belum' && row.catatan && row.catatan !== '-') {
      setSelectedCatatan({
        text: row.catatan,
        guru: row.guru,
        tanggal: row.tanggal,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={`${CONTAINER} py-6 space-y-6`}>
          {/* Header */}
          <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                  <BookMarked className="text-white" size={32} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words">
                    Perkembangan Anak
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1">
                    Pantau presensi & hasil hafalan anak dari guru
                  </p>
                </div>
              </div>

              {childrenData?.children && selectedChild && (
                <ChildSelector
                  children={childrenData.children.map((c) => ({
                    id: c.id,
                    nama: c.namaLengkap,
                    kelas: c.kelas?.namaKelas || '-',
                    statusSiswa: c.statusSiswa,
                  }))}
                  selectedChild={selectedChild}
                  onSelectChild={setSelectedChild}
                />
              )}
            </div>
          </div>

          {/* Summary Cards - 5 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={CheckCircle}
              title="Hadir"
              value={stats.hadir}
              subtitle="Hari"
              variant="emerald"
            />
            <StatCard
              icon={AlertCircle}
              title="Izin"
              value={stats.izin}
              subtitle="Hari"
              variant="amber"
            />
            <StatCard
              icon={Clock}
              title="Sakit"
              value={stats.sakit}
              subtitle="Hari"
              variant="sky"
            />
            <StatCard
              icon={X}
              title="Alfa"
              value={stats.alfa}
              subtitle="Hari"
              variant="rose"
            />
            <StatCard
              icon={TrendingUp}
              title="Rata-rata"
              value={stats.rataRataNilai}
              subtitle={
                penilaianData?.statistics?.lastAssessment 
                  ? `${penilaianData.statistics.lastAssessment.surah} (${penilaianData.statistics.lastAssessment.nilai})`
                  : "Belum ada penilaian pada periode ini"
              }
              variant="emerald"
            />
          </div>

          {/* Filter Component */}
          <MonthlyPeriodFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthYearChange={handleMonthYearChange}
          />

          <div className="text-sm text-gray-600 -mt-4 ml-0.5 font-medium">
            {penilaianCount > 0 
              ? `Menampilkan ${penilaianCount} penilaian pada ${periodText}`
              : `Tidak ada penilaian hafalan pada periode ${periodText}`
            }
          </div>

          {/* Content Table */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <BookOpen className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Daftar Perkembangan Hafalan</h2>
                <p className="text-sm text-gray-600">Riwayat penilaian dari guru</p>
              </div>
            </div>

            {!penilaianData && !penilaianError && (
              <div className="py-16">
                <LoadingIndicator text="Memuat data penilaian..." />
              </div>
            )}

            {penilaianRows.length > 0 ? (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-emerald-50/60 backdrop-blur">
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800 rounded-tl-xl">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">Kehadiran</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">Surah/Ayat</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">Tajwid</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">Kelancaran</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">Makhraj</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">Implementasi</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">Rata-rata</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800 rounded-tr-xl">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penilaianRows.map((row, index) => (
                      <tr key={row.id} className={`border-b border-gray-100 hover:bg-emerald-50/30 transition-colors ${index % 2 === 0 ? 'bg-white/70' : 'bg-white/40'}`}>
                        <td className="py-4 px-4 text-sm text-gray-700 font-medium">{row.tanggal}</td>
                        <td className="py-4 px-4">
                          <AttendanceBadge status={row.attendanceStatus} />
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{row.surah}</p>
                            <p className="text-xs text-gray-600">Ayat {row.ayat}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center"><ScoreBadge score={row.tajwid} /></td>
                        <td className="py-4 px-4 text-center"><ScoreBadge score={row.kelancaran} /></td>
                        <td className="py-4 px-4 text-center"><ScoreBadge score={row.makhraj} /></td>
                        <td className="py-4 px-4 text-center"><ScoreBadge score={row.implementasi} /></td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-700 text-base">
                            {row.rataRata}
                          </span>
                        </td>
                        <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                        <td className="py-4 px-4">
                          {row.catatan && row.catatan !== '-' ? (
                            <button onClick={() => handleOpenCatatan(row)} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium">
                              <Info size={18} />
                              <span className="text-sm">Lihat</span>
                            </button>
                          ) : <span className="text-gray-400 text-sm">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : penilaianData && (
              <EmptyState
                icon={BookOpen}
                title="Belum Ada Perkembangan Hafalan"
                description="Penilaian dari guru akan muncul di sini setelah anak menyelesaikan setoran hafalan dan dinilai oleh guru."
              />
            )}

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {penilaianRows.map((row) => (
                <div key={row.id} className="bg-white/70 rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{row.surah}</h3>
                      <p className="text-sm text-gray-600">Ayat {row.ayat}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs text-gray-500">{row.tanggal}</p>
                        <AttendanceBadge status={row.attendanceStatus} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{row.rataRata}</p>
                      <p className="text-xs text-gray-600">Rata-rata</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['tajwid', 'kelancaran', 'makhraj', 'implementasi'].map((aspek) => (
                      <div key={aspek} className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1 capitalize">{aspek}</p>
                        <ScoreBadge score={row[aspek]} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={row.status} />
                  </div>
                  {row.catatan && row.catatan !== '-' && (
                    <button onClick={() => handleOpenCatatan(row)} className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Info size={16} />
                      <span className="text-sm font-medium">Lihat Catatan Guru</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CatatanGuruModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        catatan={selectedCatatan}
      />
    </OrangtuaLayout>
  );
}
