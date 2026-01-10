import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import LaporanClient from './LaporanClient';

export async function FilterSection() {
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
              tahunAjaran: true
            }
          }
        }
      }
    }
  });

  const classes = guru?.guruKelas?.map(gk => gk.kelas) || [];
  
  return <LaporanClient initialKelas={classes} />;
}
