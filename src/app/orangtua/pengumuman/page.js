'use client';

import { useState, useEffect } from 'react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import MotivationalCard from '@/components/MotivationalCard';
import { Megaphone, Filter, Search, Calendar, User, FileText, X, Download, ChevronLeft } from 'lucide-react';

function PengumumanContent() {
  const [pengumuman, setPengumuman] = useState([]);
  const [filteredPengumuman, setFilteredPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [selectedPeriode, setSelectedPeriode] = useState('semua');

  useEffect(() => {
    fetchPengumuman();
  }, [selectedKategori, selectedPeriode]);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        kategori: selectedKategori,
        periode: selectedPeriode,
      });

      const response = await fetch(`/api/orangtua/pengumuman?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPengumuman(data);
        setFilteredPengumuman(data);
      }
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPengumuman();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatTanggal = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getKategoriColor = (kategori) => {
    const colors = {
      kegiatan: 'bg-emerald-100 text-emerald-700',
      wisuda: 'bg-amber-100 text-amber-700',
      informasi: 'bg-purple-100 text-purple-700',
      penilaian: 'bg-blue-100 text-blue-700',
    };
    return colors[kategori.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const openDetail = (item) => {
    setSelectedPengumuman(item);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPengumuman(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SECTION 1: Page Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-mint-50 to-cyan-50 border-b-2 border-emerald-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-sm">
              <Megaphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Pengumuman Tahfidz</h1>
              <p className="text-sm text-emerald-700 mt-1 font-medium">Pantau kabar terbaru seputar kegiatan hafalan</p>
            </div>
          </div>
        </div>
      </div>

       <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Motivational Card Slider */}
        <MotivationalCard theme="emerald" />

        {/* SECTION 2: Search & Filter Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-shadow">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Filter className="w-5 h-5 text-emerald-600" />
              </div>
              Cari & Filter Pengumuman
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Pengumuman</label>
              <div className="relative">
                <Search className="w-5 h-5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik judul atau isi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 bg-white transition-all text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
            </div>

            {/* Kategori Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 bg-white transition-all text-gray-900 font-medium"
              >
                <option value="semua">Semua Kategori</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="penilaian">Penilaian</option>
                <option value="informasi">Informasi</option>
                <option value="wisuda">Wisuda</option>
              </select>
            </div>

            {/* Periode Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Periode</label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 bg-white transition-all text-gray-900 font-medium"
              >
                <option value="semua">Semua Periode</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="semester_ini">Semester Ini</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Daftar Pengumuman */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
              </div>
              <p className="text-gray-600 text-sm font-medium">Memuat pengumuman...</p>
            </div>
          </div>
        ) : filteredPengumuman.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-md border-2 border-blue-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-blue-900 font-bold text-lg">Belum ada pengumuman saat ini.</p>
            <p className="text-blue-700 text-sm mt-2">Periksa kembali nanti untuk kabar terbaru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPengumuman.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-emerald-100 hover:shadow-lg hover:border-emerald-300 hover:translate-y-[-2px] transition-all duration-200 p-5"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 50}ms forwards`,
                  opacity: 0,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title & Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-emerald-900 font-bold text-base leading-tight">
                        {item.judul}
                      </h3>
                      {item.isBaru && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 shadow-sm">
                          🆕 Baru
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${getKategoriColor(item.kategori)}`}>
                        {item.kategori}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-700 mb-3 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        <span>{formatTanggal(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        <span>{item.pengirim?.name || 'Admin'}</span>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 font-medium">
                      {truncateText(item.konten)}
                    </p>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => openDetail(item)}
                    className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg hover:translate-y-[-2px]"
                  >
                    Baca Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showModal && selectedPengumuman && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
                  {selectedPengumuman.judul}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm ${getKategoriColor(selectedPengumuman.kategori)}`}>
                    {selectedPengumuman.kategori}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{formatTanggal(selectedPengumuman.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{selectedPengumuman.pengirim?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-emerald-200 mb-6"></div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base font-medium">
                {selectedPengumuman.konten}
              </p>
            </div>

            {/* Lampiran (jika ada) */}
            {selectedPengumuman.lampiran && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Lampiran tersedia
                    </span>
                  </div>
                  <a
                    href={selectedPengumuman.lampiran}
                    download
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Unduh
                  </a>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <button
              onClick={closeModal}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function PengumumanPage() {
  return (
    <OrangtuaLayout>
      <PengumumanContent />
    </OrangtuaLayout>
  );
}
