import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSiswaStatus() {
  try {
    console.log('🔍 Checking for siswa with status "active"...');

    const activeSiswa = await prisma.siswa.findMany({
      where: { status: 'active' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (activeSiswa.length === 0) {
      console.log('✅ No siswa found with status "active". All good!');
    } else {
      console.log(`📝 Found ${activeSiswa.length} siswa with status "active":`);
      activeSiswa.forEach(s => {
        console.log(`   - ${s.user.name} (${s.user.email})`);
      });

      console.log('');
      console.log('🔄 Updating status from "active" to "approved"...');

      const result = await prisma.siswa.updateMany({
        where: { status: 'active' },
        data: { status: 'approved' }
      });

      console.log(`✅ Updated ${result.count} siswa records from "active" to "approved"`);
    }

    // Also check OrangTua
    console.log('');
    console.log('🔍 Checking for orang tua with status "active"...');

    const activeOrangTua = await prisma.orangTua.findMany({
      where: { status: 'active' }
    });

    if (activeOrangTua.length === 0) {
      console.log('✅ No orang tua found with status "active". All good!');
    } else {
      console.log(`📝 Found ${activeOrangTua.length} orang tua with status "active"`);

      const result = await prisma.orangTua.updateMany({
        where: { status: 'active' },
        data: { status: 'approved' }
      });

      console.log(`✅ Updated ${result.count} orang tua records from "active" to "approved"`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixSiswaStatus();
