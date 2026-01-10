import prisma from '@/lib/prisma';
import PengumumanClient from './PengumumanClient';

export async function ListSection() {
  const announcements = await prisma.pengumuman.findMany({
    where: {
      OR: [
        { tanggalSelesai: null },
        { tanggalSelesai: { gte: new Date() } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit for performance
  });

  return <PengumumanClient initialPengumuman={announcements} />;
}
