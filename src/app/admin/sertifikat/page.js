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
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: 'non-award', label: 'Non-Award (Lulus Tasmi)', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'award', label: 'Award Wisuda', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'templates', label: 'Template Sertifikat', icon: Layout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

        {/* Tabs Navigation - Modern Style */}
        <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-100 shadow-sm inline-flex w-full sm:w-auto overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive 
                    ? `bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow` 
                    : 'bg-white/60 text-slate-600 hover:bg-white/80'
                }`}
              >
                <tab.icon size={18} className={isActive ? 'text-white' : tab.color} />
                {tab.label}
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
