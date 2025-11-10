'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import { ArrowLeft, Save, Loader2, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PencatatanTahsinPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [guruData, setGuruData] = useState(null);
  const [tahsinList, setTahsinList] = useState([]);

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

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, kelasId]);

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
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/guru/tahsin"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Kelas</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Pencatatan Tahsin
              </h1>
              <p className="text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {kelas?.nama || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            style={{ borderRadius: '16px' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Nama Guru (Read-only) */}
              <div>
                <label
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Nama Guru
                </label>
                <input
                  type="text"
                  value={guruData?.user?.name || 'Loading...'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  style={{ borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}
                />
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
            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100" style={{ borderRadius: '16px' }}>
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
        </div>
      </div>
    </GuruLayout>
  );
}
