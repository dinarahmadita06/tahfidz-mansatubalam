import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import TahsinClient from './TahsinClient';

export async function TahsinGridSection() {
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
              },
              tahunAjaran: {
                select: { nama: true }
              }
            }
          }
        }
      }
    }
  });

  const classes = guru?.guruKelas?.map(gk => gk.kelas) || [];
  
  return <TahsinClient initialClasses={classes} />;
}
