'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import AktivitasTerkiniWidget from '@/components/siswa/AktivitasTerkiniWidget';
import StudentDashboardContent from '@/components/dashboard/StudentDashboardContent';
import {
  BookMarked,
  Target,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';

const BANNER_GRADIENT = 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500';

// ===== HELPER FUNCTIONS =====
// Extract first name from full name
const getFirstName = (fullName) => {
  if (!fullName) return 'Siswa';
  return fullName.split(' ')[0];
};

// ===== MAIN COMPONENT =====
export default function DashboardSiswa() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [siswaId, setSiswaId] = useState(null);
  const [stats, setStats] = useState({
    hafalanSelesai: 0,
    totalHafalan: 0,
    rataRataNilai: 0,
    kehadiran: 0,
    totalHari: 0,
    catatanGuru: 0,
  });

  // Greeting and time setup
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

  // Get siswaId and stats
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/siswa/dashboard')
        .then(r => r.json())
        .then(data => {
          if (data.siswaId) {
            setSiswaId(data.siswaId);
          }
          // Also set stats for banner display
          if (data.stats) {
            setStats({
              hafalanSelesai: data.stats.hafalanSelesai || 0,
              totalHafalan: data.stats.totalHafalan || 0,
              rataRataNilai: data.stats.rataRataNilai || 0,
              kehadiran: data.stats.kehadiran || 0,
              totalHari: data.stats.totalHari || 0,
              catatanGuru: data.stats.catatanGuru || 0,
            });
          }
        })
        .catch(e => console.error(e));
    }
  }, [session?.user?.id]);

  return (
    <SiswaLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 xl:px-8 py-6 space-y-6">
        {/* Banner Header - Hijau SIMTAQ Style */}
        <div className={`${BANNER_GRADIENT} rounded-2xl shadow-lg p-4 lg:p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 lg:p-4 rounded-2xl flex-shrink-0">
                <BookMarked className="text-white" size={28} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold break-words leading-tight" suppressHydrationWarning>
                  {isHydrated ? `${greeting}, ${getFirstName(session?.user?.name)}! 👋` : '👋'}
                </h1>
                <p className="text-green-50 text-sm sm:text-base mt-1 whitespace-normal opacity-90" suppressHydrationWarning>
                  {isHydrated ? currentTime : ''}
                </p>
              </div>
            </div>
          </div>
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
        </div>

        {/* Dashboard Content - Including Activity Widget in 2-column grid */}
        {siswaId && (
          <StudentDashboardContent 
            targetSiswaId={siswaId} 
            roleContext="SISWA"
            activityWidget={<AktivitasTerkiniWidget />}
          />
        )}
      </div>
    </SiswaLayout>
  );
}