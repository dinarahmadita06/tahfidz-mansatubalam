'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  ArrowLeft, Save, Loader2, BookOpen, FileText, Plus, Trash2,
  Eye, Youtube, FileVideo, X, Filter, Search, Calendar, User,
  ClipboardList, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TahsinDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const kelasId = params.id;

  // Tab state - now with 3 tabs
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
  const [materiList, setMateriList] = useState([]);

  // Modal states
  const [showMateriModal, setShowMateriModal] = useState(false);
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

  const [materiFormData, setMateriFormData] = useState({
    judul: '',
    jenisMateri: 'PDF',
    fileUrl: '',
    youtubeUrl: '',
    deskripsi: '',
  });

  const [errors, setErrors] = useState({});
  const [materiErrors, setMateriErrors] = useState({});

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

  // Fetch data on mount - only once
  useEffect(() => {
    if (session) {
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

      const [kelasRes, guruRes, tahsinRes, materiRes] = await Promise.all([
        fetch(`/api/guru/kelas/${kelasId}`),
        fetch('/api/guru/profile'),
        fetch(`/api/guru/tahsin?kelasId=${kelasId}`),
        fetch(`/api/guru/materi-tahsin?kelasId=${kelasId}`)
      ]);

      if (kelasRes.ok) {
        const kelasData = await kelasRes.json();
        setKelas(kelasData.kelas);
        setSiswaList(kelasData.kelas.siswa || []);
      }

      if (guruRes.ok) {
        const guruData = await guruRes.json();
        setGuruData(guruData.guru);
      }

      if (tahsinRes.ok) {
        const tahsinData = await tahsinRes.json();
        setTahsinList(tahsinData.tahsin || []);
      }

      if (materiRes.ok) {
        const materiData = await materiRes.json();
        setMateriList(materiData.materi || []);
      }
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

  const handleMateriInputChange = (e) => {
    const { name, value } = e.target;
    setMateriFormData((prev) => ({ ...prev, [name]: value }));
    if (materiErrors[name]) {
      setMateriErrors((prev) => ({ ...prev, [name]: '' }));
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

  const validateMateriForm = () => {
    const newErrors = {};
    if (!materiFormData.judul.trim()) newErrors.judul = 'Judul materi wajib diisi';
    if (!materiFormData.jenisMateri) newErrors.jenisMateri = 'Pilih jenis materi';

    if (materiFormData.jenisMateri === 'YOUTUBE') {
      if (!materiFormData.youtubeUrl.trim()) {
        newErrors.youtubeUrl = 'URL YouTube wajib diisi';
      }
    } else {
      if (!materiFormData.fileUrl.trim()) {
        newErrors.fileUrl = 'File wajib diunggah';
      }
    }

    setMateriErrors(newErrors);
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

  const handleMateriSubmit = async (e) => {
    e.preventDefault();

    if (!validateMateriForm()) {
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
        guruId: guruData.id,
        kelasId: kelasId,
        judul: materiFormData.judul.trim(),
        jenisMateri: materiFormData.jenisMateri,
        fileUrl: materiFormData.jenisMateri !== 'YOUTUBE' ? materiFormData.fileUrl : null,
        youtubeUrl: materiFormData.jenisMateri === 'YOUTUBE' ? materiFormData.youtubeUrl.trim() : null,
        deskripsi: materiFormData.deskripsi.trim() || null,
      };

      const response = await fetch('/api/guru/materi-tahsin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Materi tahsin berhasil ditambahkan');

        // Optimistic update
        setMateriList(prev => [data.materi, ...prev]);

        resetMateriForm();
        setShowMateriModal(false);
      } else {
        toast.error(data.message || 'Gagal menyimpan materi');
      }
    } catch (error) {
      console.error('Error submitting materi:', error);
      toast.error('Terjadi kesalahan saat menyimpan materi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMateri = async (materiId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;

    try {
      const response = await fetch(`/api/guru/materi-tahsin/${materiId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Materi berhasil dihapus');
        // Optimistic update
        setMateriList(prev => prev.filter(m => m.id !== materiId));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menghapus materi');
      }
    } catch (error) {
      console.error('Error deleting materi:', error);
      toast.error('Terjadi kesalahan saat menghapus materi');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan PDF atau video (MP4, WebM, OGG)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 50MB');
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'materi-tahsin');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMateriFormData((prev) => ({ ...prev, fileUrl: data.url }));
        toast.success('File berhasil diunggah');
      } else {
        toast.error(data.message || 'Gagal mengunggah file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Terjadi kesalahan saat mengunggah file');
    } finally {
      setUploadingFile(false);
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

  const resetMateriForm = () => {
    setMateriFormData({
      judul: '',
      jenisMateri: 'PDF',
      fileUrl: '',
      youtubeUrl: '',
      deskripsi: '',
    });
    setMateriErrors({});
  };

  const getJenisMateriIcon = (jenis) => {
    switch (jenis) {
      case 'PDF':
        return <FileText size={20} className="text-red-500" />;
      case 'YOUTUBE':
        return <Youtube size={20} className="text-red-600" />;
      case 'VIDEO':
        return <FileVideo size={20} className="text-blue-600" />;
      default:
        return <FileText size={20} />;
    }
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50" style={{ margin: '-32px', padding: '32px', backgroundColor: '#f9fafb' }}>
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/guru/tahsin"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Link>
        </div>

        {/* Header Card with Gradient */}
        <div className="mb-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tahsin Al-Qur'an
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-50 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {kelas?.nama || 'Loading...'}
                  </span>
                  {selectedSiswa && activeTab === 'pencatatan' && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90 text-sm">
                        {selectedSiswa.user?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white/80 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                TOTAL SISWA
              </p>
              <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {siswaList.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Now with 3 tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-2 shadow-sm inline-flex gap-2">
            <button
              onClick={() => setActiveTab('pencatatan')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'pencatatan'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span>Pencatatan Tahsin</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="flex items-center gap-2">
                <ClipboardList size={18} />
                <span>Riwayat/Hasil</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('materi')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'materi'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span>Materi Tahsin</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'pencatatan' && (
            /* PENCATATAN TAB */
            <>
              {/* Info Guru - Static Display */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {guruData?.user?.name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Guru Pengajar
                    </p>
                    <p className="text-base font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      style={{
                        borderRadius: '10px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Menyimpan...</span>
                        </>
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

          {activeTab === 'materi' && (
            /* MATERI TAB */
            <>
              {/* Header dengan Tombol Tambah Materi */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Daftar Materi Tahsin
                </h2>
                <button
                  onClick={() => setShowMateriModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-semibold transition shadow-sm hover:shadow-md"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <Plus size={20} />
                  <span>Tambah Materi</span>
                </button>
              </div>

              {/* Table/Card Materi */}
              {materiList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Belum ada materi tahsin. Klik "Tambah Materi" untuk mengunggah materi baru.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materiList.map((materi) => (
                    <div
                      key={materi.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {getJenisMateriIcon(materi.jenisMateri)}
                          <div>
                            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {materi.judul}
                            </h3>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMateri(materi.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {materi.deskripsi && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {materi.deskripsi}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {materi.jenisMateri === 'YOUTUBE' ? (
                          <a
                            href={materi.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            <Eye size={18} />
                            <span>Lihat Video</span>
                          </a>
                        ) : (
                          <a
                            href={materi.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            <Eye size={18} />
                            <span>Lihat File</span>
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Ditambahkan: {new Date(materi.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Tambah Materi */}
        {showMateriModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tambah Materi Tahsin
                </h2>
                <button
                  onClick={() => {
                    setShowMateriModal(false);
                    resetMateriForm();
                  }}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleMateriSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={materiFormData.judul}
                    onChange={handleMateriInputChange}
                    placeholder="Contoh: Hukum Tajwid Nun Mati dan Tanwin"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                      materiErrors.judul ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                  />
                  {materiErrors.judul && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {materiErrors.judul}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Jenis Materi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenisMateri"
                    value={materiFormData.jenisMateri}
                    onChange={handleMateriInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                  >
                    <option value="PDF">PDF</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>

                {materiFormData.jenisMateri === 'YOUTUBE' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      URL YouTube <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={materiFormData.youtubeUrl}
                      onChange={handleMateriInputChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                        materiErrors.youtubeUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    />
                    {materiErrors.youtubeUrl && (
                      <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {materiErrors.youtubeUrl}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Upload File {materiFormData.jenisMateri === 'PDF' ? 'PDF' : 'Video'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept={materiFormData.jenisMateri === 'PDF' ? 'application/pdf' : 'video/*'}
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    />
                    {uploadingFile && (
                      <p className="text-emerald-600 text-sm mt-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Mengunggah file...</span>
                      </p>
                    )}
                    {materiFormData.fileUrl && (
                      <p className="text-emerald-600 text-sm mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ✓ File berhasil diunggah
                      </p>
                    )}
                    {materiErrors.fileUrl && (
                      <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {materiErrors.fileUrl}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    name="deskripsi"
                    value={materiFormData.deskripsi}
                    onChange={handleMateriInputChange}
                    rows="3"
                    placeholder="Deskripsi singkat tentang materi ini..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                    style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMateriModal(false);
                      resetMateriForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingFile}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Materi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
