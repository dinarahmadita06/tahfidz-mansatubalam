// File: tahfidz/src/app/admin/sertifikat/page.js (atau path yang sesuai)
'use client';

import { useState } from 'react';
import TemplateManager from '@/components/admin/sertifikat/TemplateManager';

export default function SertifikatPage() {
  const [activeTab, setActiveTab] = useState('non-award');
  
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Sertifikat Tasmi</h1>
        <p className="text-green-50">
          Kelola dan generate sertifikat kelulusan & penghargaan wisuda
        </p>
      </div>
      
      {/* Tabs */}
      <div className="tabs tabs-boxed bg-white shadow-sm mb-6">
        <button 
          className={`tab ${activeTab === 'non-award' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('non-award')}
        >
          📄 Non-Award (Lulus Tasmi)
        </button>
        <button 
          className={`tab ${activeTab === 'award' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('award')}
        >
          🏆 Award Wisuda
        </button>
        <button 
          className={`tab ${activeTab === 'template' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('template')}
        >
          🎨 Template Sertifikat
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'non-award' && (
          <div>
            {/* Existing Non-Award content */}
            <h2>Non-Award Content</h2>
          </div>
        )}
        
        {activeTab === 'award' && (
          <div>
            {/* Existing Award content */}
            <h2>Award Content</h2>
          </div>
        )}
        
        {activeTab === 'template' && (
          <TemplateManager />
        )}
      </div>
    </div>
  );
}
