'use client';

import { useState, useEffect } from 'react';
import { 
  Award, 
  FileText, 
  Settings, 
  Search, 
  Filter, 
  RefreshCw,
  Plus,
  BookCheck,
  Trophy,
  Layout
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import NonAwardTab from '@/components/admin/sertifikat/NonAwardTab';
import AwardTab from '@/components/admin/sertifikat/AwardTab';
import TemplateTab from '@/components/admin/sertifikat/TemplateTab';

export default function SertifikatPage() {
  const [activeTab, setActiveTab] = useState('non-award');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Read tab from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['non-award', 'award', 'templates'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  if (!mounted) return null;

  // Helper function untuk styling tab yang konsisten
  const getTabClass = (isActive) => {
    const base = 'h-10 px-4 gap-2 inline-flex items-center rounded-xl text-sm font-semibold transition duration-200';
    if (isActive) {
      return `${base} bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-white border border-transparent shadow-sm`;
    }
    return `${base} bg-white text-slate-700 border border-slate-200/70 hover:bg-emerald-50/60 hover:text-emerald-700 hover:border-emerald-200/70`;
  };

  const tabs = [
    { id: 'non-award', label: 'Data Sertifikat', icon: FileText },
    { id: 'award', label: 'Award Wisuda', icon: Trophy, hidden: true },
    { id: 'templates', label: 'Template Sertifikat', icon: Layout },
  ];

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Hero Header with Green Gradient */}
        <div className="relative z-20 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 py-8 rounded-3xl shadow-lg px-6 mt-4 overflow-hidden">
          {/* Decorative Blur Circles */}
          <div className="absolute top-0 -right-16 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-full relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/30">
                  <Award size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Sertifikat Tasmi</h1>
                  <p className="text-white/90 text-sm mt-1 font-medium">Kelola dan generate sertifikat kelulusan & penghargaan wisuda</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-100 shadow-sm flex overflow-x-auto no-scrollbar gap-1">
          {tabs.filter(tab => !tab.hidden).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={getTabClass(isActive)}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'non-award' && <NonAwardTab />}
          {activeTab === 'award' && <AwardTab />}
          {activeTab === 'templates' && <TemplateTab />}
        </div>
      </div>
    </AdminLayout>
  );
}
