import prisma from '@/lib/prisma';
import PengumumanClient from './PengumumanClient';

export async function ListSection() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const announcements = await prisma.pengumuman.findMany({
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
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit for performance
  });

  return <PengumumanClient initialPengumuman={announcements} />;
}
