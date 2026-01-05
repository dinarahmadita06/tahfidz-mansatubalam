'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookMarked, ChevronDown, Target, CalendarCheck } from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import StudentDashboardContent from '@/components/dashboard/StudentDashboardContent';
import OrangtuaActivityWidget from '@/components/orangtua/OrangtuaActivityWidget';

const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CONTAINER = 'w-full max-w-none px-4 sm:px-6 lg:px-8';

// Child Selector Dropdown Component
function ChildSelector({ children, selectedChild, onSelectChild }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
          {selectedChild?.namaLengkap?.[0] || '?'}
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">Pilih Anak</p>
          <p className="font-semibold text-gray-900">{selectedChild?.namaLengkap || 'Tidak dipilih'}</p>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[999] max-h-[300px] overflow-y-auto">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  onSelectChild(child);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {child.namaLengkap?.[0] || '?'}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{child.namaLengkap}</p>
                  <p className="text-xs text-gray-600">{child.kelas || 'N/A'}</p>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Get first name
const getFirstName = (fullName) => {
  if (!fullName) return 'Orang Tua';
  return fullName.split(' ')[0];
};

export default function OrangtuaDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hafalanSelesai: 0,
    totalHafalan: 0,
    kehadiran: 0,
    totalHari: 0,
  });

  // Initialize hydration and time
  useEffect(() => {
    setIsHydrated(true);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
  }, []);

  // Fetch parent profile and children
  useEffect(() => {
    const fetchParentProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orangtua/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch parent profile');
        }

        const data = await response.json();
        
        if (data.children && data.children.length > 0) {
          setChildren(data.children);
          // Select first child by default
          setSelectedChild(data.children[0]);
        } else {
          setSelectedChild(null);
        }
      } catch (error) {
        console.error('Error fetching parent profile:', error);
        setChildren([]);
        setSelectedChild(null);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchParentProfile();
    }
  }, [session?.user?.id]);

  // Update stats when selected child changes
  useEffect(() => {
    if (!selectedChild?.id) {
      console.log('⏳ Waiting for selectedChild...');
      return;
    }

    console.log(`🎯 Fetching dashboard for child: ${selectedChild.namaLengkap} (ID: ${selectedChild.id})`);
    
    const fetchStats = async () => {
      try {
        const url = `/api/dashboard/siswa/${selectedChild.id}/summary`;
        console.log(`📡 Calling API: ${url}`);
        
        const response = await fetch(url);
        console.log(`📩 Response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`❌ API error: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log('📊 Data received:', data);

        if (data.stats) {
          console.log(`✅ Stats: Hafalan=${data.stats.hafalanSelesai}, Nilai=${data.stats.rataRataNilai}, Kehadiran=${data.stats.kehadiran}`);
          setStats({
            hafalanSelesai: data.stats.hafalanSelesai || 0,
            totalHafalan: data.stats.totalHafalan || 0,
            kehadiran: data.stats.kehadiran || 0,
            totalHari: data.stats.totalHari || 0,
          });
        } else {
          console.warn('⚠️ No stats in response');
        }
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, [selectedChild?.id]);

  // Handle child selection
  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    
    // Log activity for parent changing child
    try {
      await fetch('/api/orangtua/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ORTU_GANTI_ANAK',
          title: `Mengganti anak ke ${child.namaLengkap}`,
          description: `Orang tua mengganti monitoring ke ${child.namaLengkap}`,
          metadata: { childId: child.id, childName: child.namaLengkap }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={`${CONTAINER} py-6 space-y-6`}>
        {/* Banner Header */}
        <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <BookMarked className="text-white" size={32} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words" suppressHydrationWarning>
                  {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                </h1>
                <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal" suppressHydrationWarning>
                  {isHydrated ? currentTime : ''}
                </p>
              </div>
            </div>

            {/* Child Selector Dropdown */}
            <ChildSelector
              children={children}
              selectedChild={selectedChild}
              onSelectChild={handleSelectChild}
            />
          </div>

          {/* Quick Stats */}
          {selectedChild && (
            <div className="flex flex-wrap gap-3 items-center mt-5">
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <Target className="text-white flex-shrink-0" size={18} />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {stats.hafalanSelesai} / {stats.totalHafalan > 0 ? stats.totalHafalan : '-'} Hafalan
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <CalendarCheck className="text-white flex-shrink-0" size={18} />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  Kehadiran {stats.kehadiran}/{stats.totalHari > 0 ? stats.totalHari : '-'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 text-center">
            <p className="text-gray-600">Belum ada anak yang terhubung dengan akun Anda.</p>
            <p className="text-sm text-gray-500 mt-2">Hubungi admin untuk menghubungkan anak Anda.</p>
          </div>
        ) : selectedChild ? (
          <>
            {/* Shared Dashboard Content dengan Progress + Aktivitas dalam grid */}
            <StudentDashboardContent 
              targetSiswaId={selectedChild.id} 
              roleContext="ORANG_TUA"
              activityWidget={<OrangtuaActivityWidget />}
            />
          </>
        ) : null}
        </div>
      </div>
    </OrangtuaLayout>
  );
}
