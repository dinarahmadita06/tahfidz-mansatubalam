'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import { ArrowLeft, Save, Loader2, BookOpen, FileText, Plus, Trash2, Eye, Youtube, FileVideo, Upload, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TahsinDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const kelasId = params.id;

  const [activeTab, setActiveTab] = useState('pencatatan'); // 'pencatatan' or 'materi'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [guruData, setGuruData] = useState(null);
  const [tahsinList, setTahsinList] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [showMateriModal, setShowMateriModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

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
        // Only load draft if it's from today
        const draftDate = new Date(draft.tanggal).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        if (draftDate === today) {
          setFormData(draft);
        } else {
          // Clear old draft
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
    // Only save if there's meaningful data
    if (formData.siswaId || formData.materiHariIni || formData.bacaanDipraktikkan || formData.catatan) {
      const draftKey = `tahsin-draft-${kelasId}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, kelasId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch kelas detail
      const kelasRes = await fetch(`/api/guru/kelas/${kelasId}`);
      if (kelasRes.ok) {
        const kelasData = await kelasRes.json();
        setKelas(kelasData.kelas);
        setSiswaList(kelasData.kelas.siswa || []);
      }

      // Fetch guru data
      const guruRes = await fetch('/api/guru/profile');
      if (guruRes.ok) {
        const guruData = await guruRes.json();
        setGuruData(guruData.guru);
      }

      // Fetch tahsin data
      const tahsinRes = await fetch(`/api/guru/tahsin?kelasId=${kelasId}`);
      if (tahsinRes.ok) {
        const tahsinData = await tahsinRes.json();
        setTahsinList(tahsinData.tahsin || []);
      }

      // Fetch materi tahsin data
      const materiRes = await fetch(`/api/guru/materi-tahsin?kelasId=${kelasId}`);
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
        // Clear draft from localStorage
        const draftKey = `tahsin-draft-${kelasId}`;
        localStorage.removeItem(draftKey);
        resetForm();
        fetchData();
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
        resetMateriForm();
        setShowMateriModal(false);
        fetchData();
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
        fetchData();
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

    // Validate file type
    const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan PDF atau video (MP4, WebM, OGG)');
      return;
    }

    // Validate file size (max 50MB)
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
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white/80 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                PENCATATAN TAHSIN
              </p>
              <p className="text-white text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {siswaList.length} Siswa
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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
        <div className="max-w-6xl mx-auto">
          {activeTab === 'pencatatan' ? (
            /* PENCATATAN TAB */
            <>
              {/* Form Card */}
              <div
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                style={{ borderRadius: '16px' }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info Guru - Static Display */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {guruData?.user?.name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Guru Pengajar
                        </p>
                        <p className="text-sm font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {guruData?.user?.name || 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout for Siswa, Tanggal, Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Siswa */}
                    <div>
                      <label
                        className="block text-sm font-semibold text-slate-700 mb-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
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
                      <label
                        className="block text-sm font-semibold text-slate-700 mb-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
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
                  </div>

                  {/* Level / Tahap */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700 mb-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
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

                  {/* Materi Hari Ini */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700 mb-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
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
                    <label
                      className="block text-sm font-semibold text-slate-700 mb-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Bacaan yang Dipraktikkan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bacaanDipraktikkan"
                      value={formData.bacaanDipraktikkan}
                      onChange={handleInputChange}
                      placeholder="Contoh: Surah Al-Baqarah ayat 1-5 atau Iqra' jilid 3 halaman 12"
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
                    <label
                      className="block text-sm font-semibold text-slate-700 mb-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Catatan Kesalahan / Evaluasi Bacaan
                    </label>
                    <textarea
                      name="catatan"
                      value={formData.catatan}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Tuliskan catatan kesalahan bacaan, perbaikan yang diperlukan, atau evaluasi progres siswa..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                      style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>

                  {/* Status Pembelajaran */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700 mb-3"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
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
                        <span className="text-slate-700 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                        <span className="text-slate-700 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Perbaiki
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: '10px',
                        fontFamily: 'Poppins, sans-serif',
                        backgroundColor: '#059669',
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = '#059669';
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
                          <span>Simpan Progres</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Riwayat Pencatatan */}
              {tahsinList.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100" style={{ borderRadius: '16px' }}>
                  <h2
                    className="text-xl font-semibold text-slate-800 mb-6"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Riwayat Pencatatan
                  </h2>
                  <div className="space-y-4">
                    {tahsinList.slice(0, 10).map((tahsin) => (
                      <div
                        key={tahsin.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition"
                        style={{ borderRadius: '10px' }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.siswa?.user?.name}
                            </h3>
                            <p className="text-sm text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {new Date(tahsin.tanggal).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tahsin.statusPembelajaran === 'LANJUT'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            {tahsin.statusPembelajaran === 'LANJUT' ? 'Lanjut' : 'Perbaiki'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Level:</p>
                            <p className="text-slate-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.level === 'DASAR' ? 'Dasar' : tahsin.level === 'MENENGAH' ? 'Menengah' : 'Lanjutan'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Materi:</p>
                            <p className="text-slate-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.materiHariIni}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-slate-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Bacaan:</p>
                          <p className="text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {tahsin.bacaanDipraktikkan}
                          </p>
                        </div>
                        {tahsin.catatan && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-slate-500 text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Catatan Evaluasi:
                            </p>
                            <p className="text-slate-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {tahsin.catatan}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* MATERI TAB */
            <>
              {/* Header dengan Tombol Tambah Materi */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Daftar Materi Tahsin
                </h2>
                <button
                  onClick={() => setShowMateriModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition shadow-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {materiList.map((materi) => (
                    <div
                      key={materi.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-300 transition"
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
                        <p className="text-sm text-slate-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                {/* Judul Materi */}
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

                {/* Jenis Materi */}
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

                {/* Conditional Input based on Jenis Materi */}
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

                {/* Deskripsi */}
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

                {/* Buttons */}
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
      </div>
    </GuruLayout>
  );
}
