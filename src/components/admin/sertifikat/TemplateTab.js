'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Save, 
  Code,
  Layout,
  Settings,
  Search,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/shared/EmptyState';

export default function TemplateTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'NON_AWARD',
    htmlTemplate: '',
    isDefault: false,
    isActive: true,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/certificate-templates');
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates);
      }
    } catch (error) {
      toast.error('Gagal mengambil data template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        htmlTemplate: template.htmlTemplate,
        isDefault: template.isDefault,
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        type: 'NON_AWARD',
        htmlTemplate: getDefaultHTML('NON_AWARD'),
        isDefault: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingTemplate ? 'PUT' : 'POST';
    const url = editingTemplate 
      ? `/api/admin/certificate-templates/${editingTemplate.id}` 
      : '/api/admin/certificate-templates';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingTemplate ? 'Template diperbarui' : 'Template dibuat');
        setIsModalOpen(false);
        fetchTemplates();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Gagal menyimpan template');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return;

    try {
      const res = await fetch(`/api/admin/certificate-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Template dihapus');
        fetchTemplates();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Gagal menghapus template');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  function getDefaultHTML(type) {
    if (type === 'NON_AWARD') {
      return `
<div style="width: 100%; height: 100%; padding: 40px; box-sizing: border-box; border: 10px solid #10b981; background: #fff; text-align: center; position: relative;">
  <div style="border: 2px solid #10b981; height: 100%; padding: 20px;">
    <h1 style="font-size: 48px; color: #065f46; margin-bottom: 10px;">SERTIFIKAT TASMI</h1>
    <p style="font-size: 20px; color: #374151;">Diberikan Kepada:</p>
    <h2 style="font-size: 36px; color: #10b981; margin: 20px 0; border-bottom: 2px solid #eee; display: inline-block; padding: 0 50px;">{{nama}}</h2>
    <p style="font-size: 18px; color: #374151;">Siswa Kelas: <strong>{{kelas}}</strong></p>
    <p style="font-size: 18px; color: #374151; margin-top: 30px;">Telah menyelesaikan ujian Tasmi Al-Qur'an:</p>
    <h3 style="font-size: 28px; color: #065f46; margin: 10px 0;">{{juz}}</h3>
    <p style="font-size: 18px; color: #374151;">Dengan Predikat: <span style="color: #10b981; font-weight: bold;">{{predicate}}</span></p>
    
    <div style="margin-top: 50px; display: flex; justify-content: space-between; padding: 0 40px;">
      <div style="text-align: center;">
        <p style="margin-bottom: 60px;">Penguji</p>
        <p><strong>{{penguji}}</strong></p>
      </div>
      <div style="text-align: center;">
        <p style="margin-bottom: 60px;">Bandar Lampung, {{tanggalUjian}}</p>
        <p><strong>Koordinator Tahfidz</strong></p>
      </div>
    </div>
    
    <p style="position: absolute; bottom: 30px; left: 0; right: 0; font-size: 12px; color: #9ca3af;">No: {{certificateNumber}}</p>
  </div>
</div>`;
    }
    return `
<div style="width: 100%; height: 100%; padding: 40px; box-sizing: border-box; border: 10px solid #f59e0b; background: #fff; text-align: center; position: relative;">
  <div style="border: 2px solid #f59e0b; height: 100%; padding: 20px;">
    <h1 style="font-size: 48px; color: #92400e; margin-bottom: 10px;">SERTIFIKAT PENGHARGAAN</h1>
    <p style="font-size: 20px; color: #374151;">Diberikan Kepada:</p>
    <h2 style="font-size: 36px; color: #f59e0b; margin: 20px 0; border-bottom: 2px solid #eee; display: inline-block; padding: 0 50px;">{{nama}}</h2>
    <p style="font-size: 18px; color: #374151;">Sebagai:</p>
    <h3 style="font-size: 28px; color: #92400e; margin: 10px 0;">{{categoryAward}}</h3>
    <p style="font-size: 18px; color: #374151;">{{groupAward}}</p>
    <p style="font-size: 18px; color: #374151; margin-top: 20px;">Pada Acara: <strong>{{eventName}}</strong></p>
    
    <div style="margin-top: 50px; display: flex; justify-content: center; gap: 100px;">
      <div style="text-align: center;">
        <p style="margin-bottom: 60px;">Bandar Lampung, {{eventDate}}</p>
        <p><strong>Kepala Madrasah</strong></p>
      </div>
    </div>
    
    <p style="position: absolute; bottom: 30px; left: 0; right: 0; font-size: 12px; color: #9ca3af;">No: {{certificateNumber}}</p>
  </div>
</div>`;
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions - Modern Glass Style */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-emerald-100/60 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Template</h3>
            <p className="text-xs text-slate-500 font-medium italic">Kustomisasi layout HTML sertifikat Anda</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchTemplates}
            disabled={loading}
            className="p-2.5 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl hover:bg-emerald-100 hover:border-emerald-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Tambah Template</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-md border border-emerald-100/40 rounded-2xl p-6 h-48 animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-12 shadow-sm">
          <EmptyState
            title="Belum ada template sertifikat"
            description="Silakan buat template baru untuk mulai menerbitkan sertifikat tasmi atau wisuda."
            icon={Layout}
            actionLabel="Tambah Template"
            onAction={() => handleOpenModal()}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`group bg-white/70 backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                template.isDefault 
                  ? 'border-emerald-200 ring-1 ring-emerald-500/20' 
                  : 'border-emerald-100/60'
              }`}
            >
              {template.isDefault && (
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                    Default
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    template.type === 'NON_AWARD' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    <Code size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base line-clamp-1">{template.name}</h4>
                    <span className={`inline-block mt-0.5 text-[10px] font-black uppercase tracking-widest ${
                      template.type === 'NON_AWARD' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {template.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-1.5 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100/30">
                  <div className={`h-full ${template.isActive ? 'bg-emerald-500' : 'bg-slate-300'} w-full transition-all`}></div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${template.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-emerald-50/50">
                <span className="text-[10px] font-bold text-slate-400">
                  Updated: {new Date(template.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(template)}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 active:scale-90"
                    title="Edit Template"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                    title="Hapus Template"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Modal - Enhanced Modern Look */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                    {editingTemplate ? 'Edit Template' : 'Template Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sertifikat Tasmi & Wisuda</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 active:scale-90"
              >
                <Plus size={24} className="rotate-45" strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Form Side */}
              <div className="p-8 space-y-6 lg:w-1/3 border-r border-emerald-50 overflow-y-auto no-scrollbar bg-slate-50/30">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Template</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700"
                    placeholder="Contoh: Sertifikat Reguler v1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipe Sertifikat</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, htmlTemplate: getDefaultHTML(e.target.value) })}
                    className="w-full px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                    required
                  >
                    <option value="NON_AWARD">Non-Award (Lulus Tasmi)</option>
                    <option value="AWARD">Award (Wisuda/Penghargaan)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Default</span>
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold leading-tight">Gunakan sebagai template utama</span>
                  </label>

                  <label className="flex flex-col gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aktif</span>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold leading-tight">Template dapat digunakan</span>
                  </label>
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-100">
                  <h5 className="text-[10px] font-black text-white uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <Code size={14} strokeWidth={3} /> Placeholder:
                  </h5>
                  <div className="text-[10px] text-white/90 grid grid-cols-2 gap-x-3 gap-y-2 font-bold font-mono">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{nama}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{kelas}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{nisn}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{tanggalUjian}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{penguji}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{juz}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{predicate}}`}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{`{{certificateNumber}}`}</span>
                    {formData.type === 'AWARD' && (
                      <>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded col-span-2">{`{{eventName}}`}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded col-span-2">{`{{eventDate}}`}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded col-span-2">{`{{groupAward}}`}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded col-span-2">{`{{categoryAward}}`}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded col-span-2">{`{{reward}}`}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor Side */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-l border-slate-800">
                <div className="px-6 py-4 bg-slate-800/50 text-slate-400 text-[10px] font-black flex justify-between items-center tracking-widest">
                  <span className="flex items-center gap-2">
                    <Code size={14} /> HTML ENGINE V1.0
                  </span>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, htmlTemplate: getDefaultHTML(formData.type) })}
                    className="text-white hover:text-emerald-400 transition-colors uppercase"
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  value={formData.htmlTemplate}
                  onChange={(e) => setFormData({ ...formData, htmlTemplate: e.target.value })}
                  className="flex-1 p-8 font-mono text-sm bg-transparent text-emerald-400 outline-none resize-none overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700"
                  spellCheck="false"
                  required
                />
              </div>
            </form>

            <div className="p-8 border-t border-emerald-50 flex justify-end gap-4 bg-emerald-50/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 transform active:scale-95"
              >
                <Save size={18} />
                <span>Simpan Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
