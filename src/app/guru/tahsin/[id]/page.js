'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  ArrowLeft, Save, Loader2, BookOpen, FileText, Plus, Trash2,
  Eye, Youtube, FileVideo, X, Filter, Search, Calendar, User,
  ClipboardList, CheckCircle, AlertCircle, Lightbulb, PlayCircle, Download
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
  const [dataLoaded, setDataLoaded] = useState(false);

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
    jenisMateri: '',
    fileUrl: '',
    youtubeUrl: '',
    deskripsi: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [materiErrors, setMateriErrors] = useState({});

  // Search & Filter states for Materi Tahsin
  const [materiSearchQuery, setMateriSearchQuery] = useState('');
  const [materiSortBy, setMateriSortBy] = useState('terbaru'); // 'terbaru' | 'terlama'
  const [materiTypeFilter, setMateriTypeFilter] = useState('ALL'); // 'ALL' | 'PDF' | 'YOUTUBE'

  // Selected siswa for header display
  const selectedSiswa = useMemo(() => {
    return siswaList.find(s => s.id === formData.siswaId);
  }, [siswaList, formData.siswaId]);

  // Filtered and sorted materi list
  const filteredMateriList = useMemo(() => {
    let filtered = materiList.filter((materi) => {
      // Filter by search query
      const matchesSearch =
        materi.judul.toLowerCase().includes(materiSearchQuery.toLowerCase()) ||
        (materi.deskripsi && materi.deskripsi.toLowerCase().includes(materiSearchQuery.toLowerCase()));
      
      // Filter by type
      const matchesType = materiTypeFilter === 'ALL' || materi.jenisMateri === materiTypeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return materiSortBy === 'terbaru' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [materiList, materiSearchQuery, materiSortBy, materiTypeFilter]);

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

    // Validate based on type
    if (materiFormData.jenisMateri === 'YOUTUBE') {
      if (!materiFormData.youtubeUrl.trim()) {
        newErrors.youtubeUrl = 'URL YouTube wajib diisi';
      }
    } else if (materiFormData.jenisMateri === 'PDF') {
      if (!selectedFile) {
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
      let fileUrl = null;

      // Upload file first if not YouTube
      if (materiFormData.jenisMateri !== 'YOUTUBE' && selectedFile) {
        setUploadingFile(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('folder', 'materi-tahsin');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Gagal mengunggah file');
        }

        fileUrl = uploadData.url;
        setUploadingFile(false);
      }

      // Submit materi data
      const payload = {
        guruId: guruData.id,
        kelasId: kelasId,
        judul: materiFormData.judul.trim(),
        jenisMateri: materiFormData.jenisMateri,
        fileUrl: materiFormData.jenisMateri === 'YOUTUBE' ? null : fileUrl,
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
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan materi');
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan PDF atau video (MP4, WebM, OGG)');
      e.target.value = ''; // Reset input
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 50MB');
      e.target.value = ''; // Reset input
      return;
    }

    // Save file to state and clear error
    setSelectedFile(file);
    if (materiErrors.fileUrl) {
      setMateriErrors((prev) => ({ ...prev, fileUrl: '' }));
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
      jenisMateri: '',
      fileUrl: '',
      youtubeUrl: '',
      deskripsi: '',
    });
    setSelectedFile(null);
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            <div className="bg-white/20 rounded-xl px-4 py-3 w-full sm:w-auto max-[380px]:flex max-[380px]:items-center max-[380px]:justify-center max-[380px]:gap-2 max-[380px]:text-center">
              <p className="text-[10px] font-semibold tracking-wide text-white/90 uppercase max-[380px]:inline">
                Total Siswa
              </p>
              <span className="hidden max-[380px]:inline text-white/90 font-bold">:</span>
              <p className="text-xl font-bold text-white max-[380px]:inline max-[380px]:text-base">
                {siswaList.length}
              </p>
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
            <button
              onClick={() => setActiveTab('materi')}
              className={`shrink-0 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                activeTab === 'materi'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-md border-transparent'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
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
            /* MATERI TAB - Clean Design */
            <div className="space-y-6">
              {/* Simple Section Title */}
              <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Materi Tahsin
                  </h2>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Kumpulan materi pembelajaran tahsin untuk {kelas?.nama}
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl shadow-sm">
                  <p className="text-xs text-emerald-700/80 font-semibold uppercase tracking-wide">
                    Total Materi
                  </p>
                  <p className="text-3xl text-emerald-700 font-bold">
                    {materiList.length}
                  </p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Cari materi tahsin..."
                      value={materiSearchQuery}
                      onChange={(e) => setMateriSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all bg-white shadow-sm hover:shadow-md"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>

                  {/* Type Filter - Segmented Button */}
                  <div className="flex gap-2 items-center bg-white border-2 border-gray-200 rounded-xl p-2 shadow-sm">
                    {['ALL', 'PDF', 'YOUTUBE'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setMateriTypeFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          materiTypeFilter === type
                            ? type === 'PDF'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : type === 'YOUTUBE'
                              ? 'bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {type === 'ALL' ? 'Semua' : type}
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative min-w-[160px]">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={materiSortBy}
                      onChange={(e) => setMateriSortBy(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none appearance-none bg-white cursor-pointer shadow-sm hover:shadow-md transition-all font-medium"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="terlama">Terlama</option>
                    </select>
                  </div>
                </div>

                {/* Tambah Materi Button */}
                <button
                  onClick={() => setShowMateriModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:brightness-105 text-white font-semibold rounded-xl shadow-md transition-all"
                >
                  <Plus size={20} />
                  <span>Tambah Materi</span>
                </button>
              </div>

              {/* Grid Cards or Empty State */}
              {filteredMateriList.length === 0 ? (
                <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 shadow-sm">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-20"></div>
                      <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full shadow-sm">
                        <FileText className="text-gray-400" size={56} />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {materiSearchQuery
                      ? 'Tidak ada materi yang sesuai'
                      : 'Belum ada materi Tahsin'}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {materiSearchQuery
                      ? 'Coba gunakan kata kunci yang berbeda'
                      : 'Tambahkan materi tahsin pertama untuk membantu siswa belajar dengan lebih baik.'}
                  </p>
                  {!materiSearchQuery && (
                    <button
                      onClick={() => setShowMateriModal(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:brightness-105 text-white font-semibold rounded-xl shadow-md transition-all"
                    >
                      <Plus size={22} />
                      <span>Tambah Materi Pertama</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMateriList.map((materi) => {
                    const isYoutube = materi.jenisMateri === 'YOUTUBE';
                    const isPdf = materi.jenisMateri === 'PDF';
                    const borderColor = isPdf ? 'border-amber-200' : isYoutube ? 'border-rose-200' : 'border-gray-100';
                    const badgeBg = isPdf ? 'bg-amber-50 text-amber-700 border border-amber-200' : isYoutube ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-700';
                    const thumbnailBg = isPdf ? 'from-amber-50 to-white' : isYoutube ? 'from-rose-50 to-white' : 'from-gray-50 to-gray-100';
                    const actionBg = isPdf ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200' : isYoutube ? 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200';
                    const downloadBg = 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
                    
                    return (
                    <div
                      key={materi.id}
                      className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${borderColor}"
                    >
                        {/* Thumbnail Area with Type-Specific Background */}
                        <div className={`h-40 bg-gradient-to-br ${thumbnailBg} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
                        {isPdf && (
                          <FileText className="relative z-10 text-amber-400" size={72} />
                        )}
                        {materi.jenisMateri === 'VIDEO' && (
                          <PlayCircle className="text-gray-300 relative z-10" size={72} />
                        )}
                        {isYoutube && (
                          <Youtube className="relative z-10 text-rose-400" size={72} />
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 ${badgeBg} text-xs font-bold rounded-full border`}>
                            {materi.jenisMateri}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteMateri(materi.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-lg flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {materi.judul}
                        </h3>

                        {materi.deskripsi && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {materi.deskripsi}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <Calendar size={14} />
                          <span>{new Date(materi.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <a
                            href={materi.jenisMateri === 'YOUTUBE' ? materi.youtubeUrl : materi.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${actionBg} text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            <Eye size={16} />
                            <span>Lihat</span>
                          </a>

                          {isPdf && (
                            <a
                              href={materi.fileUrl}
                              download
                              className={`flex items-center justify-center px-3 py-2.5 ${downloadBg} text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md`}
                            >
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                    <option value="">-- Pilih Jenis Materi --</option>
                    <option value="PDF">PDF</option>
                    <option value="YOUTUBE">YouTube</option>
                  </select>
                  {materiErrors.jenisMateri && (
                    <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {materiErrors.jenisMateri}
                    </p>
                  )}
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
                      disabled={uploadingFile || submitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                        materiErrors.fileUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    />
                    {selectedFile && !uploadingFile && (
                      <p className="text-emerald-600 text-sm mt-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </p>
                    )}
                    {uploadingFile && (
                      <p className="text-blue-600 text-sm mt-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Mengunggah file...</span>
                      </p>
                    )}
                    {materiErrors.fileUrl && !selectedFile && (
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
