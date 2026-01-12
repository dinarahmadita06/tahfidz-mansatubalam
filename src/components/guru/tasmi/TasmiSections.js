import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { TasmiStats, TasmiTableSection } from './TasmiClient';

async function getGuruData(userId) {
  return await prisma.guru.findUnique({
    where: { userId },
    include: {
      guruKelas: {
        where: { isActive: true },
        include: {
          kelas: true
        }
      }
    }
  });
}

export async function StatsSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const guru = await getGuruData(userId);
  if (!guru) return <TasmiStats tasmiList={[]} />;

  // Filter based on guruPengampuId (the chosen teacher)
  const tasmiList = await prisma.tasmi.findMany({
    where: {
      guruPengampuId: guru.id
    }
  });

  console.log(`[DEBUG/TASMI] Guru ${guru.id} Stats: ${tasmiList.length} records found`);

  return <TasmiStats tasmiList={tasmiList} />;
}

export async function TableSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const guru = await getGuruData(userId);
  if (!guru) return <TasmiTableSection initialTasmi={[]} guruKelas={[]} />;

  // Filter based on guruPengampuId (the chosen teacher)
  const tasmiList = await prisma.tasmi.findMany({
    where: {
      guruPengampuId: guru.id
    },
    include: {
      siswa: {
        include: {
          user: {
            select: { name: true, email: true }
          },
          kelas: { select: { nama: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`[DEBUG/TASMI] Guru ${guru.id} Table: ${tasmiList.length} records found`);

  const guruKelas = guru?.guruKelas?.map(gk => ({
    id: gk.kelas.id,
    nama: gk.kelas.nama
  })) || [];

  return <TasmiTableSection initialTasmi={tasmiList} guruKelas={guruKelas} />;
}
