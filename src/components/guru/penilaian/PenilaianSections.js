import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { PenilaianBinaanSection, PenilaianSemuaClient } from './PenilaianClient';

export async function BinaanSection() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Profil guru untuk mendapatkan kelas binaan
  const guru = await prisma.guru.findUnique({
    where: { userId },
    include: {
      guruKelas: {
        where: { isActive: true },
        include: {
          kelas: {
            include: {
              _count: {
                select: { siswa: true }
              }
            }
          }
        }
      }
    }
  });

  const classes = guru?.guruKelas?.map(gk => gk.kelas) || [];
  
  return <PenilaianBinaanSection classes={classes} />;
}

export async function SemuaSection() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch all classes
  const allClasses = await prisma.kelas.findMany({
    where: {
      status: 'AKTIF',
      tahunAjaran: {
        isActive: true
      }
    },
    include: {
      _count: {
        select: { siswa: true }
      }
    },
    orderBy: { nama: 'asc' }
  });

  // Fetch binaan IDs to check permission in client
  const guru = await prisma.guru.findUnique({
    where: { userId },
    include: {
      guruKelas: {
        where: { isActive: true },
        select: { kelasId: true }
      }
    }
  });

  const binaanIds = guru?.guruKelas?.map(gk => gk.kelasId) || [];

  return <PenilaianSemuaClient allClasses={allClasses} binaanIds={binaanIds} />;
}
