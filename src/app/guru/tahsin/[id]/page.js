'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {
  ArrowLeft, Save, BookOpen, Plus, Trash2,
  Eye, X, Filter, Search, Calendar, User, Users,
  ClipboardList, CheckCircle, AlertCircle, Lightbulb, PlayCircle, Download
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// StatCard Component
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm text-white`}>
          {(() => {
            if (!icon) return null;
            if (React.isValidElement(icon)) return icon;
            
            const isComponent = 
              typeof icon === 'function' || 
              (typeof icon === 'object' && icon !== null && (
                icon.$$typeof === Symbol.for('react.forward_ref') || 
                icon.$$typeof === Symbol.for('react.memo') ||
                icon.render || 
                icon.displayName
              ));

            if (isComponent) {
              const IconComp = icon;
              return <IconComp size={24} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

export default function TahsinDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const kelasId = params.id;

  // Tab state - now with 2 tabs
  const [activeTab, setActiveTab] = useState('pencatatan');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Data states
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [guruData, setGuruData] = useState(null);
  const [tahsinList, setTahsinList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTahsin, setSelectedTahsin] = useState(null);

  // Filter states for Riwayat tab
  const [filterSiswa, setFilterSiswa] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    siswaId: '',
    tanggal: new Date().toISOString().split('T')[0],
    level: 'DASAR',
    materiHariIni: '',
    bacaanDipraktikkan: '',
    catatan: '',
    statusPembelajaran: 'LANJUT',
  });

  const [errors, setErrors] = useState({});

  // Selected siswa for header display
  const selectedSiswa = useMemo(() => {
    return siswaList.find(s => s.id === formData.siswaId);
  }, [siswaList, formData.siswaId]);

  // Filtered tahsin list based on filter
  const filteredTahsinList = useMemo(() => {
    let filtered = [...tahsinList];

    // Filter by siswa
    if (filterSiswa) {
      filtered = filtered.filter(t => t.siswaId === filterSiswa);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.siswa?.user?.name?.toLowerCase().includes(query) ||
        t.materiHariIni?.toLowerCase().includes(query) ||
        t.bacaanDipraktikkan?.toLowerCase().includes(query) ||
        t.catatan?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tahsinList, filterSiswa, searchQuery]);

  // Fetch data on mount - only once, prevent refetch on tab focus
  useEffect(() => {
    if (session && !dataLoaded) {
      fetchData();
    }
  }, [session, kelasId]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draftKey = `tahsin-draft-${kelasId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const draftDate = new Date(draft.tanggal).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        if (draftDate === today) {
          setFormData(draft);
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [kelasId]);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    if (formData.siswaId || formData.materiHariIni || formData.bacaanDipraktikkan || formData.catatan) {
      const draftKey = `tahsin-draft-${kelasId}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, kelasId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [kelasRes, guruRes, tahsinRes] = await Promise.all([
        fetch(`/api/guru/kelas/${kelasId}`),
        fetch('/api/guru/profile'),
        fetch(`/api/guru/tahsin?kelasId=${kelasId}`)
      ]);

      if (kelasRes.ok) {
        const kelasData = await kelasRes.json();
        setKelas(kelasData.kelas);
        setSiswaList(kelasData.kelas.siswa || []);
      }

      if (guruRes.ok) {
        const guruData = await guruRes.json();
        setGuruData(guruData);
      }

      if (tahsinRes.ok) {
        const tahsinData = await tahsinRes.json();
        setTahsinList(tahsinData.tahsin || []);
      }

      // Mark data as loaded to prevent refetch on tab focus
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };



  const handleRadioChange = (value) => {
    setFormData((prev) => ({ ...prev, statusPembelajaran: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.siswaId) newErrors.siswaId = 'Pilih siswa';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.level) newErrors.level = 'Pilih level';
    if (!formData.materiHariIni.trim()) newErrors.materiHariIni = 'Materi hari ini wajib diisi';
    if (!formData.bacaanDipraktikkan.trim()) newErrors.bacaanDipraktikkan = 'Bacaan yang dipraktikkan wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!guruData?.id) {
      toast.error('Data guru tidak ditemukan');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        siswaId: formData.siswaId,
        guruId: guruData.id,
        tanggal: new Date(formData.tanggal).toISOString(),
        level: formData.level,
        materiHariIni: formData.materiHariIni.trim(),
        bacaanDipraktikkan: formData.bacaanDipraktikkan.trim(),
        catatan: formData.catatan.trim() || null,
        statusPembelajaran: formData.statusPembelajaran,
      };

      const response = await fetch('/api/guru/tahsin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pencatatan tahsin berhasil disimpan');

        // Optimistic update - add new record to list
        const newTahsin = {
          ...data.tahsin,
          siswa: siswaList.find(s => s.id === formData.siswaId),
        };
        setTahsinList(prev => [newTahsin, ...prev]);

        // Clear draft from localStorage
        const draftKey = `tahsin-draft-${kelasId}`;
        localStorage.removeItem(draftKey);

        // Reset form
        resetForm();

        // Auto switch to Riwayat tab to show the result
        setTimeout(() => setActiveTab('riwayat'), 500);
      } else {
        toast.error(data.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      siswaId: '',
      tanggal: new Date().toISOString().split('T')[0],
      level: 'DASAR',
      materiHariIni: '',
      bacaanDipraktikkan: '',
      catatan: '',
      statusPembelajaran: 'LANJUT',
    });
    setErrors({});
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 'DASAR':
        return 'Dasar';
      case 'MENENGAH':
        return 'Menengah';
      case 'LANJUTAN':
        return 'Lanjutan';
      default:
        return level;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'LANJUT') {
      return 'bg-emerald-100 text-emerald-700';
    } else {
      return 'bg-amber-100 text-amber-700';
    }
  };

  const openDetailModal = (tahsin) => {
    setSelectedTahsin(tahsin);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <GuruLayout>
        <LoadingIndicator fullPage text="Memuat data tahsin..." />
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 space-y-6">
        {/* Header Card with Gradient - Tasmi Style */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Icon + Title */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-1 sm:mb-2 whitespace-normal break-words">
                  Tahsin Al-Qur'an
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/90 text-sm sm:text-base lg:text-lg font-medium break-words">
                    {kelas?.nama || 'Loading...'}
                  </span>
                  {selectedSiswa && activeTab === 'pencatatan' && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-white/80 text-xs sm:text-sm break-words">
                        {selectedSiswa.user?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Badge Total Siswa */}
            <div className="w-full sm:w-64">
              <StatCard
                label="Total Siswa"
                value={siswaList.length}
                icon={<Users size={24} />}
                color="bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Responsive Scroll Horizontal */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="bg-white rounded-xl p-2 shadow-sm inline-flex gap-3 flex-wrap sm:flex-nowrap min-w-max">
            <button
              onClick={() => setActiveTab('pencatatan')}
              className={`shrink-0 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                activeTab === 'pencatatan'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-md border-transparent'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Pencatatan Tahsin</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`shrink-0 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-md border-transparent'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <ClipboardList size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Riwayat/Hasil</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="w-full">
          {activeTab === 'pencatatan' && (
            /* PENCATATAN TAB */
            <>
              {/* Info Guru - Static Display */}
              <div className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl ring-4 ring-emerald-100">
                    {guruData?.user?.name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold">
                      Guru Pengajar
                    </p>
                    <p className="text-base font-bold text-slate-800">
                      {guruData?.user?.name || 'Memuat...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Card with 2-Column Layout */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Metadata */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <User size={20} className="text-emerald-600" />
                        Informasi Siswa
                      </h3>

                      {/* Nama Siswa */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Nama Siswa <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="siswaId"
                          value={formData.siswaId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                            errors.siswaId ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        >
                          <option value="">-- Pilih Siswa --</option>
                          {siswaList.map((siswa) => (
                            <option key={siswa.id} value={siswa.id}>
                              {siswa.user.name}
                            </option>
                          ))}
                        </select>
                        {errors.siswaId && (
                          <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.siswaId}
                          </p>
                        )}
                      </div>

                      {/* Tanggal */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Tanggal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="tanggal"
                          value={formData.tanggal}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                            errors.tanggal ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.tanggal && (
                          <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.tanggal}
                          </p>
                        )}
                      </div>

                      {/* Level / Tahap */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Level / Tahap <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                            errors.level ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        >
                          <option value="DASAR">Dasar</option>
                          <option value="MENENGAH">Menengah</option>
                          <option value="LANJUTAN">Lanjutan</option>
                        </select>
                        {errors.level && (
                          <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.level}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <BookOpen size={20} className="text-emerald-600" />
                        Materi & Evaluasi
                      </h3>

                      {/* Materi Hari Ini */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Materi Hari Ini <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="materiHariIni"
                          value={formData.materiHariIni}
                          onChange={handleInputChange}
                          placeholder="Contoh: Hukum nun mati/tanwin"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                            errors.materiHariIni ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.materiHariIni && (
                          <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.materiHariIni}
                          </p>
                        )}
                      </div>

                      {/* Bacaan yang Dipraktikkan */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Bacaan yang Dipraktikkan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="bacaanDipraktikkan"
                          value={formData.bacaanDipraktikkan}
                          onChange={handleInputChange}
                          placeholder="Contoh: Surah Al-Baqarah ayat 1-5"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                            errors.bacaanDipraktikkan ? 'border-red-500' : 'border-gray-300'
                          }`}
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.bacaanDipraktikkan && (
                          <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.bacaanDipraktikkan}
                          </p>
                        )}
                      </div>

                      {/* Catatan Kesalahan / Evaluasi Bacaan */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Catatan Kesalahan / Evaluasi Bacaan
                        </label>
                        <textarea
                          name="catatan"
                          value={formData.catatan}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Tuliskan catatan kesalahan bacaan, perbaikan yang diperlukan..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                          style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                        />
                      </div>

                      {/* Status Pembelajaran */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Status Pembelajaran <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="statusPembelajaran"
                              value="LANJUT"
                              checked={formData.statusPembelajaran === 'LANJUT'}
                              onChange={() => handleRadioChange('LANJUT')}
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-700 font-medium flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <CheckCircle size={18} className="text-emerald-600" />
                              Lanjut
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="statusPembelajaran"
                              value="PERBAIKI"
                              checked={formData.statusPembelajaran === 'PERBAIKI'}
                              onChange={() => handleRadioChange('PERBAIKI')}
                              className="w-5 h-5 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-slate-700 font-medium flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <AlertCircle size={18} className="text-amber-600" />
                              Perbaiki
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-semibold py-3 shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <LoadingIndicator size="small" text="Menyimpan..." inline className="text-white" />
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Simpan Progres Tahsin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === 'riwayat' && (
            /* RIWAYAT/HASIL TAB */
            <>
              {/* Filter Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filter by Siswa */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Filter size={16} className="inline mr-2" />
                      Filter Siswa
                    </label>
                    <select
                      value={filterSiswa}
                      onChange={(e) => setFilterSiswa(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    >
                      <option value="">Semua Siswa</option>
                      {siswaList.map((siswa) => (
                        <option key={siswa.id} value={siswa.id}>
                          {siswa.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Search size={16} className="inline mr-2" />
                      Cari
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, materi, bacaan..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                </div>
              </div>

              {/* Riwayat Table/Cards */}
              {filteredTahsinList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {tahsinList.length === 0
                      ? 'Belum ada riwayat pencatatan tahsin.'
                      : 'Tidak ada hasil yang sesuai dengan filter.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Riwayat Pencatatan Tahsin
                    </h2>
                    <span className="text-sm text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {filteredTahsinList.length} Record
                    </span>
                  </div>

                  <div className="space-y-4">
                    {filteredTahsinList.map((tahsin) => (
                      <div
                        key={tahsin.id}
                        className="border border-gray-200 rounded-lg p-5 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                        style={{ borderRadius: '10px' }}
                        onClick={() => openDetailModal(tahsin)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.siswa?.user?.name}
                            </h3>
                            <p className="text-sm text-slate-600 flex items-center gap-2 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <Calendar size={14} />
                              {new Date(tahsin.tanggal).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tahsin.statusPembelajaran)}`}
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              {tahsin.statusPembelajaran === 'LANJUT' ? 'Lanjut' : 'Perbaiki'}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {getLevelLabel(tahsin.level)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm border-t border-gray-100 pt-3">
                          <div>
                            <p className="text-slate-500 text-xs mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Materi:</p>
                            <p className="text-slate-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.materiHariIni}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Bacaan:</p>
                            <p className="text-slate-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.bacaanDipraktikkan}
                            </p>
                          </div>
                        </div>

                        {tahsin.catatan && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <p className="text-amber-900 text-xs mb-1 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Catatan Evaluasi:
                            </p>
                            <p className="text-amber-800 text-sm line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.catatan}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(tahsin);
                            }}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Eye size={16} />
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Detail Tahsin */}
        {showDetailModal && selectedTahsin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Detail Pencatatan Tahsin
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Siswa Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {selectedTahsin.siswa?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Siswa
                      </p>
                      <p className="text-base font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {selectedTahsin.siswa?.user?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Tanggal
                    </label>
                    <p className="text-sm text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {new Date(selectedTahsin.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Level / Tahap
                    </label>
                    <p className="text-sm text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {getLevelLabel(selectedTahsin.level)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 font-semibold mb-1 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Status Pembelajaran
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedTahsin.statusPembelajaran)}`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {selectedTahsin.statusPembelajaran === 'LANJUT' ? 'Lanjut' : 'Perbaiki'}
                    </span>
                  </div>
                </div>

                {/* Materi Section */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="text-xs text-slate-500 font-semibold mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Materi Hari Ini
                  </label>
                  <p className="text-base text-slate-800 bg-gray-50 p-4 rounded-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {selectedTahsin.materiHariIni}
                  </p>
                </div>

                {/* Bacaan Section */}
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Bacaan yang Dipraktikkan
                  </label>
                  <p className="text-base text-slate-800 bg-gray-50 p-4 rounded-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {selectedTahsin.bacaanDipraktikkan}
                  </p>
                </div>

                {/* Catatan Section */}
                {selectedTahsin.catatan && (
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-2 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Catatan Kesalahan / Evaluasi Bacaan
                    </label>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <p className="text-base text-amber-900 whitespace-pre-wrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {selectedTahsin.catatan}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
