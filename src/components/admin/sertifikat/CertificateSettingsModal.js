'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload,
  User,
  ShieldCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificateSettingsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signers, setSigners] = useState([
    { type: 'SIGNER_1', jabatan: '', nama: '', signatureData: '', capData: '', capOpacity: 0.4, capScale: 1.0, capOffsetX: 0, capOffsetY: 0 },
    { type: 'SIGNER_2', jabatan: '', nama: '', signatureData: '', capData: '', capOpacity: 0.4, capScale: 1.0, capOffsetX: 0, capOffsetY: 0 }
  ]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', field: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchSigners();
  }, [isOpen]);

  const fetchSigners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/certificates/signers');
      const data = await res.json();
      if (res.ok && data.signers.length > 0) {
        // Merge fetched data into default state
        const newSigners = signers.map(s => {
          const found = data.signers.find(f => f.type === s.type);
          return found ? found : s;
        });
        setSigners(newSigners);
      }
    } catch (err) {
      toast.error('Gagal mengambil data penandatangan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (type, field, value) => {
    setSigners(prev => prev.map(s => s.type === type ? { ...s, [field]: value } : s));
  };

  const handleFileUpload = (type, field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      return toast.error('Ukuran file maksimal 1MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(type, field, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSignature = async () => {
    const { type, field } = deleteConfirm;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/certificates/signers?type=${type}&field=${field}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Update local state
        handleInputChange(type, field, '');
        toast.success('Tanda tangan berhasil dihapus');
        setDeleteConfirm({ show: false, type: '', field: '' });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menghapus tanda tangan. Coba lagi.');
      }
    } catch (err) {
      toast.error('Gagal menghapus tanda tangan. Coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Clean up data before sending
      const cleanedSigners = signers.map(s => ({
        type: s.type,
        jabatan: s.jabatan || '',
        nama: s.nama || '',
        signatureData: s.signatureData || '',
        capData: s.capData || '',
        capOpacity: s.capOpacity !== undefined ? s.capOpacity : 0.4,
        capScale: s.capScale !== undefined ? s.capScale : 1.0,
        capOffsetX: s.capOffsetX !== undefined ? s.capOffsetX : 0,
        capOffsetY: s.capOffsetY !== undefined ? s.capOffsetY : 0
      }));

      const res = await fetch('/api/admin/certificates/signers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signers: cleanedSigners })
      });

      if (res.ok) {
        toast.success('Pengaturan TTD berhasil disimpan');
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menyimpan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Pengaturan Sertifikat</h2>
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Kelola Penandatangan & TTD Digital</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 size={40} className="animate-spin text-emerald-500" />
              <p className="text-sm font-bold italic">Memuat data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {signers.map((signer, idx) => (
                <div key={signer.type} className="space-y-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Penandatangan {idx + 1}</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Jabatan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kepala Tahfidz"
                      value={signer.jabatan || ''}
                      onChange={(e) => handleInputChange(signer.type, 'jabatan', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Nama Beserta Gelar"
                      value={signer.nama || ''}
                      onChange={(e) => handleInputChange(signer.type, 'nama', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tanda Tangan Digital</label>
                    {signer.signatureData ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-32 bg-white rounded-xl border-2 border-dashed border-emerald-200 flex items-center justify-center overflow-hidden">
                          <img src={signer.signatureData} alt="TTD" className="max-h-full object-contain p-2" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-md shadow">
                            Tanda Tangan Aktif
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                            <Upload size={16} />
                            Ganti
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(signer.type, 'signatureData', e)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ show: true, type: signer.type, field: 'signatureData' })}
                            className="flex-1 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all">
                          <Upload className="text-slate-400" size={24} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Upload TTD (PNG/JPG)</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(signer.type, 'signatureData', e)}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 italic text-center">Belum ada tanda tangan</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Cap Digital (Stempel)</label>
                    {signer.capData ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-32 bg-white rounded-xl border-2 border-dashed border-amber-200 flex items-center justify-center overflow-hidden">
                          <img src={signer.capData} alt="Cap" className="max-h-full object-contain p-2" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-md shadow">
                            Cap Aktif
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                            <Upload size={16} />
                            Ganti
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/png"
                              onChange={(e) => handleFileUpload(signer.type, 'capData', e)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ show: true, type: signer.type, field: 'capData' })}
                            className="flex-1 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                          <Upload className="text-slate-400" size={24} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Upload Cap (PNG)</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/png"
                            onChange={(e) => handleFileUpload(signer.type, 'capData', e)}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 italic text-center">Belum ada cap</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 italic max-w-sm">
            * Tanda tangan akan muncul otomatis di setiap cetakan sertifikat
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Hapus Tanda Tangan?
                    </h3>
                    <p className="text-emerald-50 text-sm mt-1">
                      Tindakan ini tidak dapat dibatalkan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !deleting && setDeleteConfirm({ show: false, type: '', field: '' })}
                  disabled={deleting}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Tutup modal"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 leading-relaxed">
                  {deleteConfirm.field === 'signatureData' ? 'Tanda tangan' : 'Cap'} akan dihapus dan <b>tidak akan tampil di laporan</b>. Anda bisa upload lagi kapan saja.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, type: '', field: '' })}
                  disabled={deleting}
                  autoFocus
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSignature}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
