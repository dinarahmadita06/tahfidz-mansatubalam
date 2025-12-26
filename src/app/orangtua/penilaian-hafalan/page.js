'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import {
  BookOpen,
  Clock,
  Download,
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

// ===== CONSTANTS - SIMTAQ BASELINE =====
const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// ===== HELPER FUNCTIONS =====

// Map assessment data to table row format
const mapAssessmentToRow = (assessment) => {
  if (!assessment) return null;

  const { tajwid = 0, kelancaran = 0, makhraj = 0, implementasi = 0 } = assessment;
  const avgScore = tajwid && kelancaran && makhraj && implementasi
    ? Math.round((tajwid + kelancaran + makhraj + implementasi) / 4)
    : 0;

  return {
    id: assessment.id,
    tanggal: assessment.tanggal || '-',
    surah: assessment.surah || '-',
    ayat: assessment.ayat || '-',
    tajwid: tajwid || 0,
    kelancaran: kelancaran || 0,
    makhraj: makhraj || 0,
    implementasi: implementasi || 0,
    rataRata: avgScore,
    status: assessment.status || 'belum',
    catatan: assessment.catatan || '-',
    guru: assessment.guru || '-',
  };
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
  const numScore = parseInt(score) || 0;

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

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => hasMultipleChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg transition-all duration-300 ${
          hasMultipleChildren ? 'hover:shadow-xl cursor-pointer' : 'cursor-default'
        }`}
      >
        <User size={20} className="text-emerald-600 flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm text-gray-600">Anak Aktif</p>
          <p className="font-semibold text-gray-900">{selectedChild?.name || 'Pilih Anak'}</p>
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
            {children.map((child, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectChild(child);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                }`}
              >
                <User size={20} className="text-emerald-600" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-600">Kelas {child.kelas}</p>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Modal Detail Catatan Guru - SIMTAQ Glass Style
const CatatanGuruModal = ({ isOpen, onClose, catatan }) => {
  if (!isOpen || !catatan) return null;

  // Check if note is recent (< 7 days)
  const isRecentNote = () => {
    if (!catatan.tanggal || catatan.tanggal === '-') return false;

    try {
      const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
        'Jul': 6, 'Agt': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
      };

      const parts = catatan.tanggal.split(' ');
      if (parts.length !== 3) return false;

      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);

      if (isNaN(day) || month === undefined || isNaN(year)) return false;

      const noteDate = new Date(year, month, day);
      const today = new Date();
      const diffTime = Math.abs(today - noteDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 7;
    } catch (error) {
      return false;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/80 backdrop-blur rounded-2xl border border-white/20 shadow-xl shadow-green-500/10 p-5 sm:p-6 max-w-lg w-full"
      >
        {/* Header dengan icon dan subtitle */}
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

          {/* Icon button close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/70 rounded-xl transition-all duration-200 hover:shadow-md group"
          >
            <X className="text-gray-500 group-hover:text-gray-700" size={20} />
          </button>
        </div>

        {/* Badge "Catatan terbaru" (opsional) */}
        {isRecentNote() && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Clock size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Catatan terbaru</span>
            </span>
          </div>
        )}

        {/* Body - Info blocks */}
        <div className="space-y-4">
          {/* Info blocks untuk Guru dan Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Guru Pengajar" value={catatan.guru} />
            <InfoRow label="Tanggal Setor" value={catatan.tanggal} />
          </div>

          {/* Catatan utama dengan highlight dan green accent */}
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
export default function PenilaianHafalanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedCatatan, setSelectedCatatan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Mock data - replace with real API
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B' },
  ];

  // Mock penilaian data - akan diganti dengan API real
  const assessmentsData = [
    {
      id: 1,
      tanggal: '15 Okt 2025',
      surah: 'Al-Fatihah',
      ayat: '1-7',
      tajwid: 95,
      kelancaran: 92,
      makhraj: 90,
      implementasi: 93,
      status: 'lulus',
      catatan: 'Tajwid sangat baik, bacaan lancar dan fasih. Makhraj huruf sudah tepat.',
      guru: 'Ustadz Yusuf',
    },
    {
      id: 2,
      tanggal: '28 Okt 2025',
      surah: 'Al-Baqarah',
      ayat: '1-10',
      tajwid: 85,
      kelancaran: 80,
      makhraj: 90,
      implementasi: 85,
      status: 'revisi',
      catatan: 'Kurang jelas pada ayat 5, perlu perbaikan mad dan qalqalah. Kelancaran masih tersendat di beberapa ayat.',
      guru: 'Ustadz Ahmad',
    },
    {
      id: 3,
      tanggal: '20 Okt 2025',
      surah: 'Ali Imran',
      ayat: '1-20',
      tajwid: 92,
      kelancaran: 88,
      makhraj: 95,
      implementasi: 90,
      status: 'lulus',
      catatan: 'Sangat baik, muroja\'ah juga lancar. Penguasaan makharijul huruf sempurna.',
      guru: 'Ustadzah Aisyah',
    },
  ];

  // Map assessments to table rows
  const penilaianRows = assessmentsData.map(mapAssessmentToRow);

  // Calculate stats (default to 0 if no data)
  const stats = {
    totalPenilaian: penilaianRows.length || 0,
    rataRataNilai: penilaianRows.length > 0
      ? Math.round(penilaianRows.reduce((sum, row) => sum + row.rataRata, 0) / penilaianRows.length)
      : 0,
    penilaianTerakhir: penilaianRows.length > 0
      ? {
          surah: penilaianRows[0].surah,
          ayat: penilaianRows[0].ayat,
          tanggal: penilaianRows[0].tanggal,
        }
      : {
          surah: '-',
          ayat: '-',
          tanggal: '-',
        },
  };

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, []);

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

  const handleOpenCatatan = (row) => {
    if (row.status !== 'belum') {
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
          {/* Header - Green SIMTAQ Style */}
          <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                  <BookMarked className="text-white" size={32} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words">
                    Penilaian Hafalan
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1">
                    Lihat hasil penilaian hafalan anak dari guru
                  </p>
                </div>
              </div>

              {/* Child Selector Dropdown */}
              {selectedChild && (
                <ChildSelector
                  children={children}
                  selectedChild={selectedChild}
                  onSelectChild={setSelectedChild}
                />
              )}
            </div>
          </div>

          {/* Summary Cards - 3 Columns (Compact & Bright Pastel) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Award}
              title="Total Penilaian Masuk"
              value={stats.totalPenilaian}
              subtitle="Penilaian dari guru"
              variant="emerald"
            />
            <StatCard
              icon={TrendingUp}
              title="Rata-rata Nilai Keseluruhan"
              value={stats.rataRataNilai}
              subtitle="Dari 100"
              variant="amber"
            />
            <StatCard
              icon={Clock}
              title="Penilaian Terakhir"
              value={<span className="text-xl">{stats.penilaianTerakhir.surah}</span>}
              subtitle={stats.penilaianTerakhir.tanggal !== '-' ? `Ayat ${stats.penilaianTerakhir.ayat} • ${stats.penilaianTerakhir.tanggal}` : 'Belum ada penilaian'}
              variant="sky"
            />
          </div>

          {/* Tabel Penilaian */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <BookOpen className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daftar Penilaian Hafalan</h2>
                  <p className="text-sm text-gray-600">Riwayat penilaian dari guru</p>
                </div>
              </div>

              {/* Download Button - Green Theme */}
              {penilaianRows.length > 0 && (
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                  <Download size={18} />
                  <span className="font-semibold text-sm">Unduh Penilaian</span>
                </button>
              )}
            </div>

            {/* Desktop Table or Empty State */}
            {penilaianRows.length > 0 ? (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-emerald-50/60 backdrop-blur">
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800 rounded-tl-xl">
                        Tanggal
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">
                        Surah/Ayat
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">
                        Tajwid
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">
                        Kelancaran
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">
                        Makhraj
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">
                        Implementasi
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-emerald-800">
                        Rata-rata
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-emerald-800 rounded-tr-xl">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {penilaianRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-100 hover:bg-emerald-50/30 transition-colors ${
                          index % 2 === 0 ? 'bg-white/70' : 'bg-white/40'
                        }`}
                      >
                        <td className="py-4 px-4 text-sm text-gray-700">{row.tanggal}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{row.surah}</p>
                            <p className="text-xs text-gray-600">Ayat {row.ayat}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ScoreBadge score={row.tajwid} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ScoreBadge score={row.kelancaran} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ScoreBadge score={row.makhraj} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ScoreBadge score={row.implementasi} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-700 text-base">
                            {row.rataRata}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-4 px-4">
                          {row.status !== 'belum' ? (
                            <button
                              onClick={() => handleOpenCatatan(row)}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                            >
                              <Info size={18} />
                              <span className="text-sm">Lihat</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Belum Ada Penilaian Hafalan"
                description="Penilaian dari guru akan muncul di sini setelah anak menyelesaikan setoran hafalan."
              />
            )}

            {/* Mobile Cards */}
            {penilaianRows.length > 0 && (
              <div className="md:hidden space-y-4">
                {penilaianRows.map((row) => (
                  <div
                    key={row.id}
                    className="bg-white/70 rounded-xl p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{row.surah}</h3>
                        <p className="text-sm text-gray-600">Ayat {row.ayat}</p>
                        <p className="text-xs text-gray-500 mt-1">{row.tanggal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{row.rataRata}</p>
                        <p className="text-xs text-gray-600">Rata-rata</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                        <ScoreBadge score={row.tajwid} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                        <ScoreBadge score={row.kelancaran} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Makhraj</p>
                        <ScoreBadge score={row.makhraj} />
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Implementasi</p>
                        <ScoreBadge score={row.implementasi} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={row.status} />
                    </div>

                    {row.status !== 'belum' && (
                      <button
                        onClick={() => handleOpenCatatan(row)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Info size={16} />
                        <span className="text-sm font-medium">Lihat Catatan Guru</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Catatan Guru */}
      <CatatanGuruModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        catatan={selectedCatatan}
      />
    </OrangtuaLayout>
  );
}
