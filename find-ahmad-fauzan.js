import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: { name: 'Ahmad Fauzan' }
      },
      include: { user: { select: { id: true, email: true } } }
    });

    if (!siswa) {
      console.log('Siswa not found');
      return;
    }

    console.log('Ahmad Fauzan');
    console.log('User ID:', siswa.user.id);
    console.log('Email:', siswa.user.email);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
