"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { X, BookOpen, Star, MessageSquare, Save } from 'lucide-react';

// Status hafalan options
const STATUS_HAFALAN_OPTIONS = [
  { id: 'hafal', label: 'Hafal', color: 'green', description: 'Siswa hafal dengan lancar dan benar' },
  { id: 'kurang_hafal', label: 'Kurang Hafal', color: 'yellow', description: 'Siswa masih perlu latihan' },
  { id: 'tidak_hafal', label: 'Tidak Hafal', color: 'red', description: 'Siswa belum menguasai materi' }
];

// Daftar surah untuk autocomplete suggestions
const SURAH_SUGGESTIONS = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah', 'Al-Anam',
  'Al-Araf', 'Al-Anfal', 'At-Taubah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Rad',
  'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan', 'Ash-Shuara',
  'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajdah',
  'Al-Ahzab', 'Saba', 'Fatir', 'Yasin', 'As-Saffat', 'Sad', 'Az-Zumar',
  'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat',
  'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqiah', 'Al-Hadid',
  'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah', 'As-Saff', 'Al-Jumuah',
  'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam',
  'Al-Haqqah', 'Al-Maarij', 'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir'
];

export default function FormPenilaianModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  siswaData, 
  tanggal,
  initialData = null 
}) {
  // Form state
  const [formData, setFormData] = useState({
    surah: '',
    rentangAyat: '',
    statusHafalan: '',
    nilaiKelancaran: '',
    nilaiTajwid: '',
    catatan: ''
  });

  // Character counter for catatan
  const MAX_CATATAN_LENGTH = 500;

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [surahSuggestions, setSurahSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form when opening new assessment
      setFormData({
        surah: '',
        rentangAyat: '',
        statusHafalan: 'hafal',
        nilaiKelancaran: '',
        nilaiTajwid: '',
        catatan: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle surah input change and suggestions
  const handleSurahChange = (value) => {
    setFormData(prev => ({ ...prev, surah: value }));
    
    if (value.length > 0) {
      const filtered = SURAH_SUGGESTIONS.filter(surah =>
        surah.toLowerCase().includes(value.toLowerCase())
      );
      setSurahSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select surah from suggestions
  const selectSurah = (surah) => {
    setFormData(prev => ({ ...prev, surah }));
    setShowSuggestions(false);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.surah.trim()) {
      newErrors.surah = 'Surah wajib diisi';
    }
    
    if (!formData.rentangAyat.trim()) {
      newErrors.rentangAyat = 'Rentang ayat wajib diisi';
    }
    
    if (!formData.statusHafalan) {
      newErrors.statusHafalan = 'Status hafalan wajib dipilih';
    }
    
    if (!formData.nilaiKelancaran || formData.nilaiKelancaran < 1 || formData.nilaiKelancaran > 100) {
      newErrors.nilaiKelancaran = 'Nilai kelancaran harus antara 1-100';
    }
    
    if (!formData.nilaiTajwid || formData.nilaiTajwid < 1 || formData.nilaiTajwid > 100) {
      newErrors.nilaiTajwid = 'Nilai tajwid harus antara 1-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        siswaId: siswaData?.id,
        tanggal: tanggal,
        timestamp: new Date().toISOString()
      };
      
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  // Get status hafalan color classes
  const getStatusColor = (status) => {
    const option = STATUS_HAFALAN_OPTIONS.find(opt => opt.id === status);
    switch (option?.color) {
      case 'green': return 'border-green-200 bg-green-50 text-green-800';
      case 'yellow': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'red': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Form Penilaian Hafalan
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {siswaData?.nama} • {new Date(tanggal).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Surah dan Rentang Ayat */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Surah */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.surah}
                        onChange={(e) => handleSurahChange(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onFocus={() => formData.surah && setShowSuggestions(true)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.surah ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ketik nama surah..."
                      />
                      {errors.surah && (
                        <p className="mt-1 text-sm text-red-600">{errors.surah}</p>
                      )}
                      
                      {/* Surah Suggestions */}
                      {showSuggestions && surahSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {surahSuggestions.map((surah) => (
                            <button
                              key={surah}
                              type="button"
                              onClick={() => selectSurah(surah)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {surah}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rentang Ayat */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rentang Ayat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.rentangAyat}
                        onChange={(e) => handleInputChange('rentangAyat', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rentangAyat ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Contoh: 1-15 atau 20-30"
                      />
                      {errors.rentangAyat && (
                        <p className="mt-1 text-sm text-red-600">{errors.rentangAyat}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Hafalan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Status Hafalan <span className="text-red-500">*</span>
                    </label>
                    <RadioGroup value={formData.statusHafalan} onChange={(value) => handleInputChange('statusHafalan', value)}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {STATUS_HAFALAN_OPTIONS.map((option) => (
                          <RadioGroup.Option
                            key={option.id}
                            value={option.id}
                            className={({ checked }) =>
                              `${checked ? getStatusColor(option.id) : 'border-gray-200 bg-white text-gray-900'}
                              relative rounded-lg px-4 py-3 cursor-pointer border-2 focus:outline-none focus:ring-2 focus:ring-blue-500`
                            }
                          >
                            {({ checked }) => (
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <RadioGroup.Label as="p" className="font-medium">
                                      {option.label}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description as="span" className="text-xs opacity-75">
                                      {option.description}
                                    </RadioGroup.Description>
                                  </div>
                                </div>
                                {checked && (
                                  <div className="ml-auto">
                                    <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                    {errors.statusHafalan && (
                      <p className="mt-1 text-sm text-red-600">{errors.statusHafalan}</p>
                    )}
                  </div>

                  {/* Nilai Kelancaran dan Tajwid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nilai Kelancaran */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Nilai Kelancaran (1-100) <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.nilaiKelancaran}
                        onChange={(e) => handleInputChange('nilaiKelancaran', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.nilaiKelancaran ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="85"
                      />
                      {errors.nilaiKelancaran && (
                        <p className="mt-1 text-sm text-red-600">{errors.nilaiKelancaran}</p>
                      )}
                    </div>

                    {/* Nilai Tajwid */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Nilai Tajwid (1-100) <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.nilaiTajwid}
                        onChange={(e) => handleInputChange('nilaiTajwid', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.nilaiTajwid ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="90"
                      />
                      {errors.nilaiTajwid && (
                        <p className="mt-1 text-sm text-red-600">{errors.nilaiTajwid}</p>
                      )}
                    </div>
                  </div>

                  {/* Catatan */}
                  <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Catatan (Opsional)
                        </div>
                        <span className={`text-xs font-medium ${
                          formData.catatan.length > MAX_CATATAN_LENGTH
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          {formData.catatan.length}/{MAX_CATATAN_LENGTH}
                        </span>
                      </div>
                    </label>
                    <textarea
                      value={formData.catatan}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_CATATAN_LENGTH) {
                          handleInputChange('catatan', value);
                        }
                      }}
                      rows={4}
                      maxLength={MAX_CATATAN_LENGTH}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                      placeholder="Tulis catatan evaluasi bacaan, koreksi tajwid/makhraj, atau arahan perbaikan untuk siswa..."
                    />
                    <p className="mt-2 text-xs text-gray-600 italic">
                      💡 Tips: Berikan feedback konstruktif untuk membantu siswa meningkatkan kualitas hafalannya
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Penilaian
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}