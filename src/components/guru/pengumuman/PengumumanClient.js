'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Megaphone, X, Calendar, Plus, Paperclip, Upload, File, Trash, Loader, AlertCircle, CheckCircle, FileText, Edit } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import AnnouncementCard from '@/components/shared/AnnouncementCard';
import AnnouncementDetailModal from '@/components/shared/AnnouncementDetailModal';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// EmptyState Component
function AnnouncementEmptyState({ isSearch }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-emerald-50 rounded-full">
          {isSearch ? <FileText className="text-gray-400" size={48} /> : <Megaphone className="text-emerald-600" size={48} />}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        {isSearch ? 'Tidak Ada Hasil' : 'Belum Ada Pengumuman'}
      </h3>
      <p className="text-gray-500">
        {isSearch 
          ? 'Tidak ditemukan pengumuman yang sesuai dengan pencarian Anda' 
          : 'Nantikan kabar terbaru di sini'}
      </p>
    </div>
  );
}

export default function PengumumanClient({ initialPengumuman }) {
  const { data: session } = useSession();
  const [pengumumanList, setPengumumanList] = useState(initialPengumuman);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Management State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    tanggalBerlaku: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentSize: 0
  });

  const canManage = session?.user?.role === 'GURU' || session?.user?.role === 'ADMIN';

  const filteredPengumuman = useMemo(() => {
    if (!searchQuery.trim()) return pengumumanList;
    
    const query = searchQuery.toLowerCase();
    return pengumumanList.filter(p => 
      p.judul.toLowerCase().includes(query) || 
      p.isi.toLowerCase().includes(query)
    );
  }, [pengumumanList, searchQuery]);

  const fetchPengumuman = async () => {
    try {
      const res = await fetch('/api/pengumuman?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPengumumanList(data.pengumuman || []);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diperbolehkan');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 10MB');
      return;
    }

    try {
      setError('');
      setIsUploading(true);
      setUploadProgress(10);

      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('folder', 'announcements');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fileData
      });

      const data = await res.json();

      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          attachmentUrl: data.url,
          attachmentName: file.name,
          attachmentSize: file.size
        }));
        setUploadProgress(100);
        toast.success('File berhasil diunggah');
      } else {
        toast.error(data.message || 'Gagal mengunggah file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Terjadi kesalahan saat mengunggah file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: 0
    }));
    setUploadProgress(0);
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      isi: '',
      tanggalBerlaku: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: 0
    });
    setEditingId(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isUploading) return;
    
    setSubmitting(true);
    setError('');

    try {
      const url = editingId ? `/api/admin/pengumuman?id=${editingId}` : '/api/admin/pengumuman';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? 'Pengumuman diperbarui' : 'Pengumuman dipublikasikan');
        setShowModal(false);
        resetForm();
        fetchPengumuman();
      } else {
        setError(data.error || 'Gagal menyimpan pengumuman');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      judul: announcement.judul,
      isi: announcement.isi,
      tanggalBerlaku: announcement.tanggalSelesai ? new Date(announcement.tanggalSelesai).toISOString().split('T')[0] : '',
      attachmentUrl: announcement.attachmentUrl || '',
      attachmentName: announcement.attachmentName || '',
      attachmentSize: announcement.attachmentSize || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    try {
      const res = await fetch(`/api/admin/pengumuman?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Pengumuman dihapus');
        setPengumumanList(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error('Gagal menghapus pengumuman');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailOpen(true);

    // Log activity: Lihat Detail Pengumuman
    try {
      fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GURU_BUKA_PENGUMUMAN',
          title: 'Melihat Detail Pengumuman',
          description: `Anda melihat detail pengumuman: ${announcement.judul}`,
          metadata: { pengumumanId: announcement.id, judul: announcement.judul }
        })
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 200);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              Cari Pengumuman
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik judul atau isi pengumuman..."
                className="w-full pl-10 pr-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          {canManage && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} />
              Buat Pengumuman
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout or Empty State */}
      {filteredPengumuman.length === 0 ? (
        <AnnouncementEmptyState isSearch={initialPengumuman.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPengumuman.map((announcement) => (
            <div key={announcement.id} className="relative group">
              <AnnouncementCard 
                announcement={announcement}
                onClick={() => handleCardClick(announcement)}
              />
              
              {canManage && (
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(announcement); }}
                    className="p-2 bg-white/90 backdrop-blur shadow-sm border border-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(announcement.id); }}
                    className="p-2 bg-white/90 backdrop-blur shadow-sm border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {filteredPengumuman.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <p className="text-sm text-emerald-800">
            Menampilkan <span className="font-bold">{filteredPengumuman.length}</span> pengumuman
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AnnouncementDetailModal 
        announcement={selectedAnnouncement}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      {/* Management Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h2>
                <p className="text-xs text-white/80 mt-1">Lengkapi informasi pengumuman di bawah ini</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Judul Pengumuman</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Contoh: Libur Semester Ganjil"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Isi Pengumuman</label>
                <textarea
                  rows={5}
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  placeholder="Tuliskan detail pengumuman di sini..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Berakhir (Opsional)</label>
                  <input
                    type="date"
                    value={formData.tanggalBerlaku}
                    onChange={(e) => setFormData({ ...formData, tanggalBerlaku: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* PDF Attachment UI */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Paperclip size={14} className="text-emerald-600" />
                  Lampiran PDF (Opsional)
                </label>

                {!formData.attachmentUrl ? (
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 ${isUploading ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}
                    onClick={() => document.getElementById('guru-file-upload').click()}
                  >
                    <input 
                      id="guru-file-upload" 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
                        <p className="text-xs font-bold text-emerald-600 italic">Mengunggah... {uploadProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-emerald-400 mb-2" />
                        <p className="text-sm font-bold text-gray-700">Klik untuk upload PDF</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Maksimal 10MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl group">
                    <div className="w-10 h-10 bg-white rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{formData.attachmentName}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{(formData.attachmentSize / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploading}
                  className="flex-[2] px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <LoadingIndicator inline size="small" color="white" /> : (editingId ? 'Simpan Perubahan' : 'Publikasikan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
