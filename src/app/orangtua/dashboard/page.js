'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookMarked, ChevronDown, Target, CalendarCheck } from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import StudentDashboardContent from '@/components/dashboard/StudentDashboardContent';
import OrangtuaActivityWidget from '@/components/orangtua/OrangtuaActivityWidget';
import IconHint from '@/components/shared/IconHint';

const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';
const CONTAINER = 'w-full max-w-none';

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
        className="flex items-center gap-2.5 lg:gap-3 px-3.5 py-2 lg:px-5 lg:py-2.5 bg-white/90 backdrop-blur rounded-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label={`${isOpen ? 'Tutup' : 'Buka'} pemilih anak - ${selectedChild?.namaLengkap || 'Tidak dipilih'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-sm">
          {selectedChild?.namaLengkap?.[0] || '?'}
        </div>
        <div className="text-left">
          <p className="text-[10px] lg:text-xs text-gray-500 leading-tight">Pilih Anak</p>
          <p className="text-xs lg:text-sm font-bold text-gray-900 leading-tight">{selectedChild?.namaLengkap || 'Tidak dipilih'}</p>
        </div>
        <IconHint label="Buka daftar anak" placement="bottom">
          <ChevronDown
            className={`text-gray-600 transition-transform duration-300 w-4 h-4 lg:w-[18px] lg:h-[18px] ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </IconHint>
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {child.namaLengkap?.[0] || '?'}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{child.namaLengkap}</p>
                  <p className="text-[10px] lg:text-xs text-gray-600 truncate">{child.kelas || 'N/A'}</p>
                </div>
                {selectedChild?.id === child.id && (
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
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

    const updateTime = async () => {
      try {
        const res = await fetch('/api/time');
        const data = await res.json();
        setGreeting(data.greeting);
        setCurrentTime(data.date);
      } catch (error) {
        console.error('Failed to fetch time:', error);
        // Fallback ke client-side dengan explicit WIB timezone
        const now = new Date();
        const hour = parseInt(new Intl.DateTimeFormat('id-ID', {
          hour: 'numeric',
          timeZone: 'Asia/Jakarta',
          hour12: false
        }).format(now));
        
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');
        
        const dateString = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Jakarta'
        }).format(now);
        setCurrentTime(dateString);
      }
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
          action: 'ORANGTUA_PILIH_ANAK',
          title: 'Mengganti Anak Aktif',
          description: `Anda memilih anak: ${child.namaLengkap}`,
          metadata: { siswaId: child.id, nama: child.namaLengkap }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return (
    <OrangtuaLayout>
      <div className="w-full space-y-4 lg:space-y-6">
        {/* Banner Header */}
        <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-5 lg:p-6 text-white`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 lg:p-3.5 rounded-xl lg:rounded-2xl flex-shrink-0">
                <BookMarked className="text-white w-[22px] h-[22px] lg:w-[26px] lg:h-[26px]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl xl:text-2xl font-bold break-words leading-tight" suppressHydrationWarning>
                  {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                </h1>
                <p className="text-green-50 text-xs sm:text-sm mt-0.5 whitespace-normal opacity-90" suppressHydrationWarning>
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
                <IconHint label="Target hafalan" placement="bottom" showLabel={false}>
                  <Target className="text-white flex-shrink-0" size={18} aria-hidden="true" />
                </IconHint>
                <span className="text-white font-semibold text-sm whitespace-nowrap" role="status">
                  {stats.hafalanSelesai} / {stats.totalHafalan > 0 ? stats.totalHafalan : '-'} Hafalan
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-full">
                <IconHint label="Kehadiran anak" placement="bottom" showLabel={false}>
                  <CalendarCheck className="text-white flex-shrink-0" size={18} aria-hidden="true" />
                </IconHint>
                <span className="text-white font-semibold text-sm whitespace-nowrap" role="status">
                  Kehadiran {stats.kehadiran}/{stats.totalHari > 0 ? stats.totalHari : '-'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-4 lg:space-y-6">
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
            <div className="space-y-4 lg:space-y-6">
              <StudentDashboardContent 
                targetSiswaId={selectedChild.id} 
                roleContext="ORANG_TUA"
                activityWidget={<OrangtuaActivityWidget />}
              />
            </div>
          </>
        ) : null}
        </div>
      </div>
    </OrangtuaLayout>
  );
}
