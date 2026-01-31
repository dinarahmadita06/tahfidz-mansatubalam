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
  
  // Delete template
  const handleDelete = async (templateId) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Sertifikat</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload dan kelola template sertifikat
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
      
      {/* Active Template Card */}
      {activeTemplate && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="badge badge-success">Template Aktif</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTemplate.nama}
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ukuran:</span>
                  <p className="font-medium">{activeTemplate.width} × {activeTemplate.height} px</p>
                </div>
                <div>
                  <span className="text-gray-600">Diupload:</span>
                  <p className="font-medium">
                    {new Date(activeTemplate.uploadedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600">Aktif</p>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="ml-4">
              <img
                src={activeTemplate.filepath}
                alt={activeTemplate.nama}
                className="w-48 h-32 object-cover rounded border-2 border-green-500 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* No Active Template Warning */}
      {!activeTemplate && !loading && (
        <div className="alert alert-warning">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Tidak ada template aktif. Silakan upload template terlebih dahulu.</span>
        </div>
      )}
      
      {/* All Templates Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Semua Template ({templates.length})</h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 mb-4">Belum ada template tersimpan</p>
            <p className="text-sm text-gray-500">Upload template pertama Anda untuk mulai membuat sertifikat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`card bg-base-100 shadow-lg border-2 ${
                  template.isActive ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                {/* Preview Image */}
                <figure className="px-4 pt-4">
                  <img
                    src={template.filepath}
                    alt={template.nama}
                    className="rounded-lg h-40 w-full object-cover"
                  />
                </figure>
                
                {/* Card Body */}
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="card-title text-sm line-clamp-1">{template.nama}</h3>
                    {template.isActive && (
                      <span className="badge badge-success badge-sm">Aktif</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Ukuran: {template.width} × {template.height} px</p>
                    <p>Upload: {new Date(template.uploadedAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="card-actions justify-end mt-4">
                    {!template.isActive && (
                      <>
                        <button
                          onClick={() => handleSetActive(template.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Aktifkan
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="btn btn-sm btn-error"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                    {template.isActive && (
                      <span className="text-xs text-green-600 font-medium">
                        Template ini sedang digunakan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi Template</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Format: PNG atau JPG</li>
          <li>• Ukuran maksimal: 5MB</li>
          <li>• Orientasi: Landscape (horizontal)</li>
          <li>• Ukuran rekomendasi: 932 × 661 pixels</li>
          <li>• Hanya satu template yang bisa aktif pada satu waktu</li>
          <li>• Template aktif akan digunakan untuk semua sertifikat</li>
        </ul>
      </div>
    </div>
  );
}
