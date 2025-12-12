'use client';

import { useState, useEffect } from 'react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
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
  const [showFilter, setShowFilter] = useState(true);

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
    <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-400 via-mint-300 to-amber-200 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-white/90 p-3 rounded-xl">
              <Megaphone className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">Pengumuman Tahfidz</h1>
              <p className="text-emerald-700 text-sm mt-1">
                Pantau kabar terbaru seputar kegiatan hafalan dan acara sekolah.
              </p>
            </div>
          </div>

          {/* Card Motivasi */}
          <div className="bg-amber-100 border-l-4 border-amber-400 text-amber-700 italic rounded-xl px-4 py-3 mt-4">
            <p className="text-sm leading-relaxed">
              "Barang siapa memudahkan urusan saudaranya, maka Allah akan memudahkan urusannya di dunia dan akhirat."
            </p>
            <p className="text-xs mt-1 font-semibold">— HR. Muslim</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="md:hidden mb-3 flex items-center gap-2 text-emerald-600 font-medium"
          >
            <Filter className="w-5 h-5" />
            {showFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </button>

          <div
            className={`bg-white border border-mint-200 rounded-xl p-4 transition-all duration-300 ${
              showFilter ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mint-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                />
              </div>

              {/* Kategori */}
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="px-4 py-2 border border-mint-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white"
              >
                <option value="semua">Semua Kategori</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="penilaian">Penilaian</option>
                <option value="informasi">Informasi</option>
                <option value="wisuda">Wisuda</option>
              </select>

              {/* Periode */}
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-4 py-2 border border-mint-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white"
              >
                <option value="semua">Semua Periode</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="semester_ini">Semester Ini</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Pengumuman */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredPengumuman.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 italic text-lg">Belum ada pengumuman saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPengumuman.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-emerald-100 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-emerald-700 font-semibold text-lg">
                        {item.judul}
                      </h3>
                      {item.isBaru && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                          🆕 Baru
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${getKategoriColor(item.kategori)}`}>
                        {item.kategori}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatTanggal(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{item.pengirim?.name || 'Admin'}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {truncateText(item.konten)}
                    </p>
                  </div>

                  <button
                    onClick={() => openDetail(item)}
                    className="bg-amber-400 hover:bg-amber-500 text-white text-sm px-4 py-2 rounded-md transition-colors duration-200 whitespace-nowrap self-start md:self-center"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Detail */}
        {showModal && selectedPengumuman && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-emerald-700 pr-8">
                  {selectedPengumuman.judul}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${getKategoriColor(selectedPengumuman.kategori)}`}>
                  {selectedPengumuman.kategori}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTanggal(selectedPengumuman.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedPengumuman.pengirim?.name || 'Admin'}</span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPengumuman.konten}
                </p>
              </div>

              {/* Lampiran (jika ada) */}
              {selectedPengumuman.lampiran && (
                <div className="bg-mint-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Lampiran tersedia
                      </span>
                    </div>
                    <a
                      href={selectedPengumuman.lampiran}
                      download
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Lampiran
                    </a>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <button
                onClick={closeModal}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali ke daftar
              </button>
            </div>
          </div>
        )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
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
