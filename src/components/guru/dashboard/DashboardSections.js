import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, FileText, ChevronRight, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import ActivityList from '@/components/guru/ActivityList';
import AnnouncementSlider from '@/components/AnnouncementSlider';
import EmptyState from '@/components/shared/EmptyState';

// ===== HELPER UI COMPONENTS =====

export function StatCard({ label, value, icon, theme = 'emerald' }) {
  const themes = {
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      shadow: 'shadow-emerald-500/10',
      hoverShadow: 'hover:shadow-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      shadow: 'shadow-blue-500/10',
      hoverShadow: 'hover:shadow-blue-500/20'
    },
    violet: {
      bg: 'bg-violet-50/70',
      border: 'border-violet-100',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      titleColor: 'text-violet-600',
      valueColor: 'text-violet-700',
      shadow: 'shadow-violet-500/10',
      hoverShadow: 'hover:shadow-violet-500/20'
    }
  };

  const config = themes[theme] || themes.emerald;

  return (
    <div className={`${config.bg} backdrop-blur-md p-5 rounded-2xl border ${config.border} shadow-md ${config.shadow} hover:-translate-y-0.5 ${config.hoverShadow} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-[10px] font-bold uppercase tracking-wider mb-1`}>{label}</p>
          <p className={`text-2xl font-bold ${config.valueColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center shadow-sm ${config.iconColor}`}>
          {(() => {
            if (!icon) return null;
            if (React.isValidElement(icon)) return icon;
            
            const isComponent = 
              typeof icon === 'function' || 
              (typeof icon === 'object' && icon !== null && (
                icon.$$typeof === Symbol.for('react.forward_ref') || 
                icon.$$typeof === Symbol.for('react.memo') ||
                icon.render || 
                icon.displayName
              ));

            if (isComponent) {
              const IconComp = icon;
              return <IconComp size={24} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

export function MotivationCard() {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm p-4 lg:p-5">
      <div className="flex items-start gap-3 lg:gap-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] lg:text-sm font-semibold italic leading-relaxed mb-1 lg:mb-2">
            "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
          </p>
          <p className="text-[11px] lg:text-xs font-medium text-blue-700 opacity-80">
            — HR. Bukhari
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== DATA SECTIONS (SERVER COMPONENTS) =====

export async function StatsSection({ userId }) {
  console.time(`StatsSection-${userId}`);
  
  // Parallel fetching of stats components using nested filters for Guru via User ID
  const [kelasList, totalSiswaCount, avgProgressData] = await Promise.all([
    prisma.kelas.findMany({
      where: { 
        guruKelas: { 
          some: { 
            guru: { userId: userId },
            isActive: true 
          } 
        } 
      },
      select: { id: true } // Only need ID for length
    }),
    prisma.siswa.count({
      where: { 
        kelas: { 
          guruKelas: { 
            some: { 
              guru: { userId: userId },
              isActive: true 
            } 
          } 
        } 
      }
    }),
    prisma.siswa.aggregate({
      where: {
        kelas: { 
          guruKelas: { 
            some: { 
              guru: { userId: userId },
              isActive: true 
            } 
          } 
        }
      },
      _avg: {
        latestJuzAchieved: true
      }
    })
  ]);

  const avgJuz = avgProgressData._avg.latestJuzAchieved || 0;
  const avgProgress = (avgJuz / 30) * 100;

  console.timeEnd(`StatsSection-${userId}`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        label="Kelas Diampu"
        value={kelasList.length}
        icon={<BookOpen size={24} />}
        theme="emerald"
      />
      <StatCard
        label="Jumlah Siswa"
        value={totalSiswaCount}
        icon={<Users size={24} />}
        theme="blue"
      />
      <StatCard
        label="Progress Rata-rata"
        value={`${avgProgress.toFixed(1)}%`}
        icon={<TrendingUp size={24} />}
        theme="violet"
      />
    </div>
  );
}

export async function AnnouncementSection() {
  console.time('AnnouncementSection');
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const announcements = await prisma.pengumuman.findMany({
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 5,
    where: {
      AND: [
        { tanggalMulai: { lte: now } },
        {
          OR: [
            { tanggalSelesai: null },
            { tanggalSelesai: { gte: todayStart } }
          ]
        },
        { isPublished: true },
        { deletedAt: null },
        {
          OR: [
            { audience: 'ALL' },
            { audience: 'GURU' }
          ]
        }
      ]
    },
    select: {
      id: true,
      judul: true,
      isi: true,
      createdAt: true,
    }
  });
  console.timeEnd('AnnouncementSection');

  return <AnnouncementSlider announcements={announcements} loading={false} variant="guru" />;
}

export async function ClassManagementSection({ userId }) {
  console.time(`ClassManagementSection-${userId}`);
  const kelasList = await prisma.kelas.findMany({
    where: { 
      guruKelas: { 
        some: { 
          guru: { userId: userId },
          isActive: true 
        } 
      } 
    },
    select: {
      id: true,
      nama: true,
      _count: { select: { siswa: true } }
    },
    orderBy: { nama: 'asc' }
  });
  console.timeEnd(`ClassManagementSection-${userId}`);

  return (
    <div className="rounded-2xl backdrop-blur-md border shadow-md p-4 lg:p-5 bg-emerald-50/70 border-emerald-100 shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3 lg:mb-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
          <BookOpen className="text-emerald-600 w-5 h-5 lg:w-[22px] lg:h-[22px]" />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-emerald-800">Kelola Kelas</h3>
      </div>

      {kelasList.length === 0 ? (
        <EmptyState
          title="Belum ada kelas yang diampu"
          description="Anda belum memiliki daftar kelas binaan saat ini."
          icon={<BookOpen size={28} />}
          className="py-6"
        />
      ) : (
        <div className="space-y-2.5 lg:space-y-3">
          {kelasList.map((kelas) => (
            <Link
              key={kelas.id}
              href={`/guru/penilaian-hafalan/${kelas.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 lg:p-4 rounded-xl border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <BookOpen className="text-emerald-600 w-[18px] h-[18px] lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm lg:text-base leading-tight">{kelas.nama}</h4>
                    <p className="text-[11px] lg:text-sm text-slate-600 mt-0.5 opacity-80">
                      {kelas._count?.siswa || 0} siswa
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-xs lg:text-sm font-bold uppercase tracking-wider">Lihat</span>
                  <ChevronRight className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export async function RecentActivitySection({ userId }) {
  console.time(`RecentActivitySection-${userId}`);
  
  // Calculate 24 hours ago for backend filtering (optional optimization)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const rawActivities = await prisma.activityLog.findMany({
    where: { 
        actorId: userId,
        actorRole: 'GURU',
        createdAt: {
          gte: twentyFourHoursAgo // Only fetch activities from last 24 hours
        }
    },
    select: {
      id: true,
      action: true,
      title: true,
      description: true,
      createdAt: true,
      metadata: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20 // Fetch more to allow client-side filtering
  });

  // Filtering: Prioritize non-auth actions and limit login/logout to max 1 total
  const filteredActivities = [];
  let authCount = 0;
  for (const activity of rawActivities) {
    const isAuth = activity.action?.includes('LOGIN') || activity.action?.includes('LOGOUT');
    if (isAuth) {
      if (authCount < 1) {
        filteredActivities.push(activity);
        authCount++;
      }
    } else {
      filteredActivities.push(activity);
    }
    if (filteredActivities.length >= 5) break;
  }

  console.timeEnd(`RecentActivitySection-${userId}`);

  return (
    <div className="rounded-2xl backdrop-blur-md border shadow-md p-4 lg:p-5 bg-blue-50/70 border-blue-100 shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3 lg:mb-4">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-blue-100 flex items-center justify-center">
          <FileText className="text-blue-600 w-5 h-5 lg:w-[22px] lg:h-[22px]" />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-blue-800">Aktivitas Terbaru</h3>
      </div>

      <ActivityList activities={filteredActivities} />
    </div>
  );
}
