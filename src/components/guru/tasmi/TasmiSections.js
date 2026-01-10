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
  const kelasIds = guru?.guruKelas?.map(gk => gk.kelasId) || [];

  const tasmiList = await prisma.tasmi.findMany({
    where: {
      siswa: {
        kelasId: { in: kelasIds },
        kelas: {
          tahunAjaran: { isActive: true }
        }
      }
    }
  });

  return <TasmiStats tasmiList={tasmiList} />;
}

export async function TableSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const guru = await getGuruData(userId);
  const kelasIds = guru?.guruKelas?.map(gk => gk.kelasId) || [];

  const tasmiList = await prisma.tasmi.findMany({
    where: {
      siswa: {
        kelasId: { in: kelasIds },
        kelas: {
          tahunAjaran: { isActive: true }
        }
      }
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

  const guruKelas = guru?.guruKelas?.map(gk => ({
    id: gk.kelas.id,
    nama: gk.kelas.nama
  })) || [];

  return <TasmiTableSection initialTasmi={tasmiList} guruKelas={guruKelas} />;
}
