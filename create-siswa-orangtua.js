import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createProfiles() {
  try {
    console.log('🔧 Creating Siswa and OrangTua profiles...\n');

    // Find or create Siswa record for siswa user
    const siswaUser = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
    });

    if (siswaUser) {
      const existingSiswa = await prisma.siswa.findUnique({
        where: { userId: siswaUser.id },
      });

      if (!existingSiswa) {
        const newSiswa = await prisma.siswa.create({
          data: {
            userId: siswaUser.id,
            nis: 'NIS-' + siswaUser.id.substring(0, 8),
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved', // Auto-approved
          },
        });
        console.log(`✅ Created Siswa profile for ${siswaUser.email}`);
      } else {
        // Update to approved
        await prisma.siswa.update({
          where: { userId: siswaUser.id },
          data: { status: 'approved' },
        });
        console.log(`✅ Updated existing Siswa profile to approved`);
      }
    }

    // Find or create OrangTua record for orang tua user
    const orangtuaUser = await prisma.user.findFirst({
      where: { role: 'ORANG_TUA' },
    });

    if (orangtuaUser) {
      const existingOrangTua = await prisma.orangTua.findUnique({
        where: { userId: orangtuaUser.id },
      });

      if (!existingOrangTua) {
        const newOrangTua = await prisma.orangTua.create({
          data: {
            userId: orangtuaUser.id,
            nik: 'NIK-' + orangtuaUser.id.substring(0, 8),
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved', // Auto-approved
          },
        });
        console.log(`✅ Created OrangTua profile for ${orangtuaUser.email}`);
      } else {
        // Update to approved
        await prisma.orangTua.update({
          where: { userId: orangtuaUser.id },
          data: { status: 'approved' },
        });
        console.log(`✅ Updated existing OrangTua profile to approved`);
      }
    }

    console.log('\n✅ Done! Siswa and OrangTua profiles are now created/updated and approved.');
    console.log('🔐 Try logging in now with:');
    console.log('   Email: abdullah.rahman@siswa.tahfidz.sch.id');
    console.log('   Email: ortu.24001@parent.tahfidz.sch.id');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createProfiles();
