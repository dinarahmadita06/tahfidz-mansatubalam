'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import Link from 'next/link';
import { BookOpen, Search, ChevronDown, ChevronUp, AlertCircle, Users } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// HeaderSection Component
function HeaderSection() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Penilaian Hafalan
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-1">
            Pilih kelas untuk melihat dan menilai hafalan siswa
          </p>
        </div>
      </div>
    </div>
  );
}

// SectionTitle Component
function SectionTitle({ children, description, badge }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-slate-800">
          {children}
        </h2>
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

// ClassCard Component
function ClassCard({ kelas, onClick }) {
  return (
    <Link
      href={`/guru/penilaian-hafalan/${kelas.id}`}
      onClick={(e) => onClick && onClick(e, kelas)}
      className="block"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100 transition-all duration-200 cursor-pointer p-5 text-center group">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 group-hover:scale-105 transition-all">
          <BookOpen size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 break-words">
          {kelas.nama}
        </h3>
        {kelas._count?.siswa !== undefined && (
          <div className="flex items-center justify-center gap-1 text-slate-600 mb-3">
            <Users size={14} />
            <span className="text-xs font-medium">{kelas._count.siswa} Siswa</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
          Lihat Kelas →
        </div>
      </div>
    </Link>
  );
}

// SearchBar Component
function SearchBar({ value, onChange, placeholder = "Cari kelas..." }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
      />
    </div>
  );
}

// ToggleSection Component
function ToggleSection({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-2xl border border-emerald-200 border-l-4 border-l-emerald-500 p-4 transition-all text-left ${
        isOpen ? 'bg-emerald-50 shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isOpen ? (
            <ChevronUp size={20} className="text-emerald-600 shrink-0" />
          ) : (
            <ChevronDown size={20} className="text-emerald-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-700">
              {isOpen ? 'Sembunyikan' : 'Tampilkan'} Semua Kelas
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Untuk menggantikan guru lain atau mengisi kelas di luar kelas binaan
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// SectionWrapper Component
function SectionWrapper({ children, highlight = false }) {
  if (!highlight) return <div>{children}</div>;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
      {children}
    </div>
  );
}

// TipsAlert Component
function TipsAlert({ children }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-emerald-800 text-sm flex items-start gap-3">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}

// EmptyState Component
function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
      <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
}

// ConfirmationModal Component
function ConfirmationModal({ isOpen, kelas, onClose, onConfirm }) {
  if (!isOpen || !kelas) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={24} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Konfirmasi Akses Kelas
            </h3>
            <p className="text-slate-600 text-sm">
              <span className="font-semibold text-slate-900">{kelas.nama}</span> bukan kelas binaan yang telah ditetapkan oleh Admin.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
              <p className="text-amber-800 text-sm">
                Pastikan Anda sedang bertugas menggantikan guru kelas tersebut sebelum melanjutkan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <Link href={`/guru/penilaian-hafalan/${kelas.id}`}>
            <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-semibold rounded-xl hover:brightness-105 transition-all shadow-md">
              Ya, Lanjutkan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function PenilaianHafalanIndexPage() {
  const [kelasBinaan, setKelasBinaan] = useState([]);
  const [semuaKelas, setSemuaKelas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllKelas, setShowAllKelas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch kelas binaan dan semua kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setLoading(true);

        // Fetch kelas binaan dari /api/guru/kelas
        const resBinaan = await fetch('/api/guru/kelas');
        const dataBinaan = await resBinaan.json();
        setKelasBinaan(dataBinaan.kelas || []);

        // Fetch semua kelas dari /api/kelas?showAll=true
        const resAll = await fetch('/api/kelas?showAll=true');
        const dataAll = await resAll.json();
        setSemuaKelas(dataAll || []);
      } catch (error) {
        console.error('Error fetching kelas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, []);

  // Filter kelas non-binaan berdasarkan search query
  const filteredSemuaKelas = semuaKelas.filter(kelas =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if kelas is in kelasBinaan
  const isKelasBinaan = (kelasId) => {
    return kelasBinaan.some(k => k.id === kelasId);
  };

  // Handle kelas click
  const handleKelasClick = (e, kelas) => {
    if (!isKelasBinaan(kelas.id)) {
      e.preventDefault();
      setSelectedKelas(kelas);
      setShowConfirmation(true);
    }
  };

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 space-y-6 w-full">
        {/* Header */}
        <HeaderSection />

        {loading ? (
          <LoadingIndicator text="Memuat data kelas..." />
        ) : (
          <>
            {/* Section 1: Kelas Binaan */}
            <SectionWrapper highlight={true}>
              <SectionTitle
                description="Kelas yang telah ditetapkan oleh Admin untuk Anda"
                badge="Kelas utama yang Anda bimbing"
              >
                Kelas Binaan Saya
              </SectionTitle>

              {kelasBinaan.length === 0 ? (
                <EmptyState message="Anda belum memiliki kelas binaan" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {kelasBinaan.map((kelas) => (
                    <ClassCard key={kelas.id} kelas={kelas} />
                  ))}
                </div>
              )}
            </SectionWrapper>

            {/* Divider */}
            <div className="border-t border-emerald-100 my-6"></div>

            {/* Toggle Section */}
            <ToggleSection
              isOpen={showAllKelas}
              onToggle={() => setShowAllKelas(!showAllKelas)}
            />

            {/* Section 2: Semua Kelas (Collapsible) */}
            {showAllKelas && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <SectionTitle>Semua Kelas</SectionTitle>
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {filteredSemuaKelas.length === 0 ? (
                  <EmptyState message="Tidak ada kelas yang ditemukan" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSemuaKelas.map((kelas) => (
                      <ClassCard
                        key={kelas.id}
                        kelas={kelas}
                        onClick={handleKelasClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <TipsAlert>
              <strong>Tips:</strong> Kelas binaan adalah kelas yang telah ditetapkan oleh Admin untuk Anda.
            </TipsAlert>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        kelas={selectedKelas}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {}}
      />
    </GuruLayout>
  );
}
