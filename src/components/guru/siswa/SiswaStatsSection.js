import React from 'react';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

function StatCard({ icon: Icon, title, value, theme = 'emerald' }) {
  const themeConfig = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-2 border-emerald-200',
      titleColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-2 border-amber-200',
      titleColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-red-50',
      border: 'border-2 border-orange-200',
      titleColor: 'text-orange-600',
      valueColor: 'text-orange-700',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  };

  const config = themeConfig[theme] || themeConfig.emerald;

  return (
    <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <h3 className={`${config.valueColor} text-3xl font-bold`}>
            {value}
          </h3>
        </div>
        <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
          <Icon size={28} className={config.iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

export async function SiswaStatsSection({ userId }) {
  console.time(`SiswaStats-${userId}`);
  
  const [totalSiswa, siswaAktif, menungguValidasi] = await Promise.all([
    prisma.siswa.count({
      where: { kelas: { guruKelas: { some: { guru: { userId: userId }, isActive: true } } } }
    }),
    prisma.siswa.count({
      where: { 
        status: 'approved',
        kelas: { guruKelas: { some: { guru: { userId: userId }, isActive: true } } } 
      }
    }),
    prisma.siswa.count({
      where: { 
        status: { not: 'approved' },
        kelas: { guruKelas: { some: { guru: { userId: userId }, isActive: true } } } 
      }
    })
  ]);

  console.timeEnd(`SiswaStats-${userId}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard icon={Users} title="Total Siswa" value={totalSiswa} theme="amber" />
      <StatCard icon={CheckCircle} title="Siswa Aktif" value={siswaAktif} theme="emerald" />
      <StatCard icon={AlertCircle} title="Menunggu Validasi" value={menungguValidasi} theme="orange" />
    </div>
  );
}
