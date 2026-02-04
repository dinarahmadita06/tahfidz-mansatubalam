'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Template Manager Component
 * Allows admin to upload, view, activate, and delete certificate templates
 */
export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  
  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);
  
  // Load all templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        const active = data.templates.find(t => t.isActive);
        setActiveTemplate(active);
      }
    } catch (error) {
      toast.error('Gagal memuat template');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Validate image dimensions (landscape orientation)
  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        const isLandscape = img.width > img.height;
        resolve({
          valid: isLandscape,
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, width: 0, height: 0 });
      };
      
      img.src = url;
    });
  };
  
  // Upload new template
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 1. Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file harus PNG atau JPG');
      event.target.value = '';
      return;
    }
    
    // 2. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      event.target.value = '';
      return;
    }
    
    // 3. Validate image dimensions (landscape)
    const dimensions = await validateImageDimensions(file);
    if (!dimensions.valid) {
      toast.error('Template harus landscape (horizontal). Lebar harus lebih besar dari tinggi.');
      event.target.value = '';
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData with correct field name
      const formData = new FormData();
      formData.append('template', file);
      
      // Don't set Content-Type header - let browser set it with boundary
      const response = await fetch('/api/admin/templates/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Template berhasil diupload (${dimensions.width}×${dimensions.height}px)`);
        await loadTemplates(); // Auto refresh template list
      } else {
        // Show specific error from backend
        const errorMessage = data.error || data.message || 'Gagal upload template';
        toast.error(errorMessage);
        console.error('Upload error:', data);
      }
    } catch (error) {
      // Network or unexpected errors
      toast.error('Gagal upload template. Pastikan format PNG/JPG dan ukuran maksimal 5MB.');
      console.error('Upload exception:', error);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };
  
  // Set template as active
  const handleSetActive = async (templateId) => {
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Template berhasil diaktifkan');
        await loadTemplates(); // Auto refresh
      } else {
        const errorMessage = data.error || data.message || 'Gagal mengaktifkan template';
        toast.error(errorMessage);
        console.error('Activate error:', data);
      }
    } catch (error) {
      toast.error('Gagal mengaktifkan template');
      console.error('Activate exception:', error);
    }
  };

  // Toggle template status (activate/deactivate)
  const handleToggleStatus = async (template) => {
    if (template.isActive) {
      // Cannot deactivate the only active template
      toast.error('Tidak dapat menonaktifkan template yang sedang digunakan. Aktifkan template lain terlebih dahulu.');
      return;
    }
    
    // If not active, activate it
    await handleSetActive(template.id);
  };
  
  // Delete template
  const handleDelete = async (templateId, isActive) => {
    if (isActive) {
      toast.error('Template sedang digunakan. Nonaktifkan terlebih dahulu sebelum menghapus.');
      return;
    }

    if (!confirm('Yakin ingin menghapus template ini?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/templates?id=${templateId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Template berhasil dihapus');
        await loadTemplates(); // Auto refresh
      } else {
        const errorMessage = data.error || data.message || 'Gagal menghapus template';
        toast.error(errorMessage);
        console.error('Delete error:', data);
      }
    } catch (error) {
      toast.error('Gagal menghapus template');
      console.error('Delete exception:', error);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Sertifikat</h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola template untuk sertifikat Tasmi
          </p>
        </div>
        
        {/* Upload Button */}
        <label className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Template</span>
            </>
          )}
        </label>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {/* Template Aktif (Featured Section) */}
          {activeTemplate ? (
            <div className="bg-gradient-to-br from-emerald-50/40 to-green-50/30 border-2 border-emerald-200/60 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Template Aktif</h3>
              </div>
              
              <div className="flex gap-6">
                {/* Preview Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={activeTemplate.filepath}
                    alt={activeTemplate.nama}
                    className="w-56 h-36 object-cover rounded-lg border-2 border-emerald-300/60 shadow-md"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-1">
                    {activeTemplate.nama}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Ukuran:</span>
                      <p className="font-semibold text-gray-900">
                        {activeTemplate.width} × {activeTemplate.height} px
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Diupload:</span>
                      <p className="font-semibold text-gray-900">
                        {new Date(activeTemplate.uploadedAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Badge & Action Buttons (Vertikal) */}
                <div className="flex flex-col gap-3 items-stretch min-w-[160px]">
                  {/* Badge - Hanya 1x di atas */}
                  <span className="px-4 py-2 bg-emerald-100/70 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200/60 text-center">
                    SEDANG DIGUNAKAN
                  </span>
                  
                  {/* Tombol Status */}
                  <button
                    disabled
                    className="w-full h-10 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100/60 text-emerald-800 text-sm font-medium rounded-lg border border-emerald-200/60 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Aktif
                  </button>
                  
                  {/* Tombol Hapus */}
                  <button
                    disabled
                    className="w-full h-10 flex items-center justify-center gap-2 px-4 py-2 bg-rose-100/50 text-rose-700 text-sm font-medium rounded-lg border border-rose-200/60 cursor-not-allowed"
                    title="Nonaktifkan template terlebih dahulu untuk menghapus"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-900">Belum Ada Template Aktif</p>
                  <p className="text-sm text-amber-700">Upload dan aktifkan template untuk mulai membuat sertifikat</p>
                </div>
              </div>
            </div>
          )}
      
          {/* All Templates Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Semua Template
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {templates.length} Template
              </span>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-700 font-medium mb-2">Belum Ada Template Tersimpan</p>
                <p className="text-sm text-gray-500">Klik tombol "Upload Template" untuk menambahkan template pertama</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`group relative bg-white/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 ${
                      template.isActive 
                        ? 'border-emerald-200/60' 
                        : 'border-gray-200/60 hover:border-emerald-200/60'
                    }`}
                  >
                    {/* Preview Image */}
                    <div className="relative">
                      <img
                        src={template.filepath}
                        alt={template.nama}
                        className="w-full h-40 object-cover"
                      />
                      
                      {/* Hover Overlay - Action Icons (Pojok Kanan Atas) */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1.5 shadow-md border border-gray-200/40">
                          {/* Icon Nonaktifkan (hanya untuk template aktif) */}
                          {template.isActive ? (
                            <button
                              disabled
                              className="p-1.5 bg-gray-100/80 rounded-md cursor-not-allowed opacity-60"
                              title="Template sedang digunakan"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(template)}
                              className="p-1.5 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-md transition-colors"
                              title="Aktifkan template"
                            >
                              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          
                          {/* Icon Hapus */}
                          <button
                            onClick={() => handleDelete(template.id, template.isActive)}
                            disabled={template.isActive}
                            className={`p-1.5 rounded-md transition-colors ${
                              template.isActive
                                ? 'bg-gray-100/80 cursor-not-allowed opacity-60'
                                : 'bg-rose-100/80 hover:bg-rose-200/80'
                            }`}
                            title={template.isActive ? 'Nonaktifkan terlebih dahulu untuk menghapus' : 'Hapus template'}
                          >
                            <svg className={`w-4 h-4 ${template.isActive ? 'text-gray-600' : 'text-rose-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-1" title={template.nama}>
                        {template.nama}
                      </h4>
                      
                      {/* Meta Info */}
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{template.width} × {template.height} px</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(template.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge Full Width */}
                      {template.isActive ? (
                        <div className="w-full text-center rounded-md py-2 text-sm font-medium bg-emerald-100/50 text-emerald-800 border border-emerald-200/60">
                          Aktif
                        </div>
                      ) : (
                        <div className="w-full text-center rounded-md py-2 text-sm font-medium bg-gray-100/50 text-gray-600 border border-gray-200/60">
                          Nonaktif
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
