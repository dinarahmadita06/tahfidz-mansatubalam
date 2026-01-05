'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import {
  CalendarCheck,
  User,
  ChevronDown,
  CheckCircle,
  Download,
  XCircle,
  Calendar,
  Clock,
  AlertCircle,
  UserCheck,
  ChevronRight,
  BookOpen,
  MessageSquare,
  X,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';
import {
  safeNumber,
  formatTanggal,
  mergeAttendanceWithAssessmentsByDate,
} from '@/lib/utils/penilaianHelpers';

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';

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

// ===== HELPER FUNCTIONS =====
const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return { year, month, formatted: `${year}-${month}` };
};

// ===== REUSABLE COMPONENTS =====

// Status Badge Component
const AttendanceStatusBadge = ({ status }) => {
  const statusConfig = {
    HADIR: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Hadir',
    },
    IZIN: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Izin',
    },
    SAKIT: {
      icon: AlertCircle,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      label: 'Sakit',
    },
    ALFA: {
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      label: 'Alfa',
    },
  };

  const config = statusConfig[status] || statusConfig.ALFA;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.border} border rounded-lg`}>
      <Icon size={16} className={config.color} />
      <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
};

// Assessment Status Badge
const AssessmentStatusBadge = ({ hasAssessment }) => {
  if (hasAssessment) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border-emerald-200 border rounded-lg">
        <CheckCircle size={16} className="text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-600">Dinilai</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-gray-200 border rounded-lg">
      <XCircle size={16} className="text-gray-500" />
      <span className="text-sm font-semibold text-gray-500">Belum Dinilai</span>
    </div>
  );
};

// Score Badge Component
const ScoreBadge = ({ score }) => {
  const numScore = safeNumber(score, 0);

  const getScoreConfig = (score) => {
    if (score >= 90) {
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    } else if (score >= 75) {
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    } else if (score >= 60) {
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    } else if (score > 0) {
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    } else {
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500' };
    }
  };

  const config = getScoreConfig(numScore);

  return (
    <span className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-1 ${config.bg} ${config.border} border rounded-lg font-bold ${config.text} text-sm`}>
      {numScore > 0 ? numScore : '-'}
    </span>
  );
};

// Empty State Component
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

  return (
    <div className="relative w-full">
      <button
        onClick={() => hasMultipleChildren && setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg transition-all duration-300 ${
          hasMultipleChildren ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
        }`}
      >
        <User size={18} className="text-emerald-600 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600">Anak Aktif</p>
          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{selectedChild?.nama || 'Pilih Anak'}</p>
        </div>
        {hasMultipleChildren && (
          <ChevronDown
            size={18}
            className={`text-gray-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
            {children.map((child, index) => (
              <button
                key={child.id || index}
                onClick={() => {
                  onSelectChild(child);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                }`}
              >
                <User size={18} className="text-emerald-600 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{child.nama || child.namaLengkap}</p>
                  <p className="text-xs text-gray-600">Kelas {child.kelas || child.kelas?.namaKelas}</p>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Summary Stat Card
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
        <p className={`text-3xl font-bold ${styles.textValue}`}>{value}</p>
        <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>
      </div>
    </div>
  );
};

// Expandable Row Component
const ExpandableRow = ({ row, onOpenNoteModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors cursor-pointer"
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <ChevronRight
              size={20}
              className={`text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
            <span className="font-medium text-gray-900">{formatTanggal(row.tanggal)}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <AttendanceStatusBadge status={row.status} />
        </td>
        <td className="py-4 px-4">
          <span className="text-sm text-gray-700">{row.kegiatan}</span>
        </td>
        <td className="py-4 px-4 text-center">
          <AssessmentStatusBadge hasAssessment={row.hasAssessment} />
        </td>
      </tr>

      {/* Expanded Assessment Details */}
      {isExpanded && (
        <tr className="bg-emerald-50/20">
          <td colSpan="4" className="px-4 py-4">
            {row.hasAssessment && row.assessments.length > 0 ? (
              <div className="space-y-4">
                {row.assessments.map((assessment, idx) => (
                  <div key={assessment.id || idx} className="bg-white/70 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {assessment.surah} - Ayat {assessment.ayat}
                        </h4>
                        <p className="text-sm text-gray-600">Guru: {assessment.guru}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{assessment.nilaiAkhir}</p>
                        <p className="text-xs text-gray-600">Nilai Akhir</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                        <ScoreBadge score={assessment.tajwid} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                        <ScoreBadge score={assessment.kelancaran} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Makhraj</p>
                        <ScoreBadge score={assessment.makhraj} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Implementasi</p>
                        <ScoreBadge score={assessment.implementasi} />
                      </div>
                    </div>

                    {assessment.catatan && assessment.catatan !== '' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNoteModal(assessment);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare size={16} />
                        <span className="text-sm font-medium">Lihat Catatan Guru</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Belum ada penilaian pada hari ini</p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

// Mobile Expandable Card
const MobileExpandableCard = ({ row, onOpenNoteModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-gray-200">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight
                size={20}
                className={`text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
              <h3 className="font-bold text-gray-900">{formatTanggal(row.tanggal)}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{row.kegiatan}</p>
            <div className="flex flex-wrap gap-2">
              <AttendanceStatusBadge status={row.status} />
              <AssessmentStatusBadge hasAssessment={row.hasAssessment} />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Assessment Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {row.hasAssessment && row.assessments.length > 0 ? (
            <div className="space-y-4">
              {row.assessments.map((assessment, idx) => (
                <div key={assessment.id || idx} className="bg-emerald-50/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {assessment.surah} - Ayat {assessment.ayat}
                      </h4>
                      <p className="text-xs text-gray-600">Guru: {assessment.guru}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">{assessment.nilaiAkhir}</p>
                      <p className="text-xs text-gray-600">Nilai</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                      <ScoreBadge score={assessment.tajwid} />
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                      <ScoreBadge score={assessment.kelancaran} />
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Makhraj</p>
                      <ScoreBadge score={assessment.makhraj} />
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Implementasi</p>
                      <ScoreBadge score={assessment.implementasi} />
                    </div>
                  </div>

                  {assessment.catatan && assessment.catatan !== '' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNoteModal(assessment);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span className="text-xs font-medium">Lihat Catatan</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Belum ada penilaian</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modal Catatan Guru
const NoteModal = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

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
            <div className="bg-gray-50/70 border border-gray-200/50 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Guru Pengajar</p>
              <p className="text-sm font-semibold text-gray-900">{note.guru}</p>
            </div>
            <div className="bg-gray-50/70 border border-gray-200/50 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Surah/Ayat</p>
              <p className="text-sm font-semibold text-gray-900">{note.surah} - {note.ayat}</p>
            </div>
          </div>

          <div className="border-l-4 border-emerald-500 bg-emerald-50/60 rounded-r-xl p-4">
            <p className="text-xs font-medium text-emerald-700 mb-2">Catatan Penilaian</p>
            <p className="text-sm text-gray-900 leading-relaxed">{note.catatan}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export default function RiwayatPerkembanganHarianPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch children list
  const { data: childrenData, error: childrenError } = useSWR(
    status === 'authenticated' ? '/api/orangtua/presensi' : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  // Fetch presensi + penilaian data for selected child
  const { data: progressData, error: progressError, mutate } = useSWR(
    selectedChild?.id
      ? `/api/orangtua/presensi?siswaId=${selectedChild.id}&bulan=${selectedMonth.month}&tahun=${selectedMonth.year}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
    }
  );

  // Set initial selected child when children data loads
  useEffect(() => {
    if (childrenData?.children && childrenData.children.length > 0 && !selectedChild) {
      const firstChild = childrenData.children[0];
      setSelectedChild({
        id: firstChild.id,
        nama: firstChild.namaLengkap,
        kelas: firstChild.kelas?.namaKelas || '-',
      });
    }
  }, [childrenData, selectedChild]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Merge presensi and penilaian data
  const mergedProgressData = mergeAttendanceWithAssessmentsByDate(
    progressData?.presensiList || [],
    progressData?.penilaianList || []
  );

  // Calculate stats with safe fallbacks
  const stats = {
    totalHadir: safeNumber(progressData?.statistics?.totalHadir, 0),
    totalIzin: safeNumber(progressData?.statistics?.totalIzin, 0),
    totalSakit: safeNumber(progressData?.statistics?.totalSakit, 0),
    totalAlfa: safeNumber(progressData?.statistics?.totalAlfa, 0),
    totalHari: safeNumber(progressData?.statistics?.totalHari, 0),
    persentaseKehadiran: safeNumber(progressData?.statistics?.persentaseKehadiran, 0),
    rataRataNilai: safeNumber(progressData?.statistics?.rataRataNilai, 0),
    totalPenilaian: safeNumber(progressData?.statistics?.totalPenilaian, 0),
  };

  const handleOpenNoteModal = (note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDownloadReport = () => {
    if (mergedProgressData.length === 0) {
      alert('Belum ada data untuk diunduh');
      return;
    }
    // TODO: Implement download functionality
    alert('Fitur unduh laporan akan segera tersedia');
  };

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header - Green SIMTAQ Style (Responsive) */}
          <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white w-full`}>
            <div className="flex flex-col gap-4 w-full">
              {/* Top Section: Icon + Title + Description */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
                <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
                  {/* Icon + Title Row */}
                  <div className="flex items-start gap-3 w-full">
                    <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl flex-shrink-0">
                      <CalendarCheck className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight break-words">
                        Riwayat Perkembangan Harian
                      </h1>
                      <p className="text-green-50 text-sm sm:text-base mt-1 leading-snug break-words">
                        Pantau presensi dan penilaian anak setiap hari
                      </p>
                    </div>
                  </div>

                  {/* Month Badge & Target Summary */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit max-w-full">
                      <Calendar size={14} className="text-white flex-shrink-0" />
                      <span className="text-white text-xs sm:text-sm font-medium truncate">
                        {new Date(selectedMonth.formatted).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                      <Target size={14} className="text-white flex-shrink-0" />
                      <span className="text-white text-xs sm:text-sm font-medium">
                        Target: <span className="font-bold">3 Juz</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Child Selector Dropdown */}
                {childrenData?.children && selectedChild && (
                  <div className="w-full sm:w-auto">
                    <ChildSelector
                      children={childrenData.children.map((c) => ({
                        id: c.id,
                        nama: c.namaLengkap,
                        kelas: c.kelas?.namaKelas || '-',
                      }))}
                      selectedChild={selectedChild}
                      onSelectChild={setSelectedChild}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards - 5 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={CheckCircle}
              title="Hadir"
              value={stats.totalHadir}
              subtitle="Hari"
              variant="emerald"
            />
            <StatCard
              icon={AlertCircle}
              title="Izin"
              value={stats.totalIzin}
              subtitle="Hari"
              variant="amber"
            />
            <StatCard
              icon={AlertCircle}
              title="Sakit"
              value={stats.totalSakit}
              subtitle="Hari"
              variant="sky"
            />
            <StatCard
              icon={XCircle}
              title="Alfa"
              value={stats.totalAlfa}
              subtitle="Hari"
              variant="rose"
            />
            <StatCard
              icon={TrendingUp}
              title="Rata-rata Nilai"
              value={stats.rataRataNilai}
              subtitle="Dari 100"
              variant="emerald"
            />
          </div>

          {/* Progress Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <UserCheck className="text-emerald-600" size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hari Belajar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalHari} Hari</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Award className="text-emerald-600" size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Persentase Kehadiran</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-emerald-600">
                      {stats.persentaseKehadiran}%
                    </span>
                    {stats.persentaseKehadiran >= 80 && (
                      <span className="bg-emerald-100 text-emerald-800 font-semibold rounded-full px-3 py-1 text-sm">
                        Sangat Baik
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Riwayat Perkembangan */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <BookOpen className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Riwayat Harian</h2>
                  <p className="text-sm text-gray-600">Presensi & penilaian per hari</p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadReport}
                disabled={mergedProgressData.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md ${
                  mergedProgressData.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:shadow-lg'
                }`}
                title={mergedProgressData.length === 0 ? 'Belum ada data untuk diunduh' : 'Unduh Laporan'}
              >
                <Download size={18} />
                <span className="font-semibold text-sm">Unduh Laporan</span>
              </button>
            </div>

            {/* Show loading state while fetching */}
            {!progressData && !progressError && selectedChild && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data perkembangan...</p>
                </div>
              </div>
            )}

            {/* Desktop Table or Empty State */}
            {mergedProgressData.length > 0 ? (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-emerald-50/60 backdrop-blur">
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800 rounded-tl-xl">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">
                        Presensi
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">
                        Kegiatan
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800 rounded-tr-xl">
                        Status Penilaian
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergedProgressData.map((row) => (
                      <ExpandableRow
                        key={row.id}
                        row={row}
                        onOpenNoteModal={handleOpenNoteModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : progressData && mergedProgressData.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="Belum Ada Data"
                description="Belum ada data presensi & penilaian pada periode ini. Data akan muncul setelah anak mengikuti kegiatan."
              />
            ) : null}

            {/* Mobile Cards */}
            {mergedProgressData.length > 0 && (
              <div className="md:hidden space-y-4">
                {mergedProgressData.map((row) => (
                  <MobileExpandableCard
                    key={row.id}
                    row={row}
                    onOpenNoteModal={handleOpenNoteModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Catatan Guru */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={selectedNote}
      />
    </OrangtuaLayout>
  );
}
