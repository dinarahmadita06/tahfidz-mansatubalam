'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  Save, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  Gift,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AwardCategoryModal({ isOpen, onClose, onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    categoryName: '',
    groupName: '',
    reward: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/awards/categories/all');
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (err) {
      toast.error('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryName) return toast.error('Nama kategori wajib diisi');

    setSubmitting(true);
    try {
      const url = editId 
        ? `/api/admin/awards/categories/${editId}` 
        : '/api/admin/awards/categories';
      
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editId ? 'Kategori diperbarui' : 'Kategori ditambahkan');
        setFormData({ categoryName: '', groupName: '', reward: '' });
        setEditId(null);
        fetchCategories();
        onUpdate(); // Trigger refetch in main tab
      } else {
        const data = await res.json();
        toast.error(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setFormData({
      categoryName: cat.categoryName,
      groupName: cat.groupName || '',
      reward: cat.reward || ''
    });
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await fetch(`/api/admin/awards/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive })
      });

      if (res.ok) {
        toast.success(cat.isActive ? 'Kategori dinonaktifkan' : 'Kategori diaktifkan');
        fetchCategories();
        onUpdate();
      }
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Tag size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Kelola Kategori Award</h2>
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Pengaturan Penghargaan Wisuda</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Form Section */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              {editId ? <Edit2 size={14} /> : <Plus size={14} />}
              {editId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Terbaik Wisuda"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Group (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Wisuda Ke-1"
                  value={formData.groupName}
                  onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Reward (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Uang 50K / Sertifikat"
                  value={formData.reward}
                  onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold transition-all"
                />
              </div>
              <div className="md:col-span-2 pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (editId ? <Save size={18} /> : <Plus size={18} />)}
                  {editId ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setFormData({ categoryName: '', groupName: '', reward: '' });
                    }}
                    className="px-6 py-3.5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Layers size={14} /> Kategori Terdaftar
            </h3>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <p className="text-xs font-bold italic">Memuat data kategori...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 italic">Belum ada kategori award</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Group/Reward</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {categories.map((cat) => (
                      <tr key={cat.id} className={`hover:bg-slate-50/50 transition-colors ${!cat.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-800">{cat.categoryName}</p>
                        </td>
                        <td className="px-4 py-4 space-y-1">
                          {cat.groupName && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                              <Layers size={12} /> {cat.groupName}
                            </div>
                          )}
                          {cat.reward && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                              <Gift size={12} /> {cat.reward}
                            </div>
                          )}
                          {!cat.groupName && !cat.reward && <span className="text-[10px] text-slate-300 font-black italic">No info</span>}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => handleToggleActive(cat)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                              cat.isActive 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {cat.isActive ? <ToggleRight size={14} strokeWidth={2.5} /> : <ToggleLeft size={14} strokeWidth={2.5} />}
                            {cat.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 italic">* Soft delete: nonaktifkan kategori yang tidak dipakai</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
