import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrangTuaData() {
  try {
    console.log('🔍 Mengecek data di database...\n');

    // Count siswa
    const siswaCount = await prisma.siswa.count();
    console.log(`📊 Total Siswa: ${siswaCount}`);

    // Count orang tua
    const orangTuaCount = await prisma.orangTua.count();
    console.log(`👨‍👩‍👧 Total Orang Tua: ${orangTuaCount}`);

    // Count relasi
    const orangTuaSiswaCount = await prisma.orangTuaSiswa.count();
    console.log(`🔗 Total Relasi Siswa-OrangTua: ${orangTuaSiswaCount}\n`);

    // Get siswa yang belum punya orang tua
    const siswaWithOrangTua = await prisma.siswa.findMany({
      include: {
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const siswaTanpaOrangTua = siswaWithOrangTua.filter(s => s.orangTuaSiswa.length === 0);
    const siswaDenganOrangTua = siswaWithOrangTua.filter(s => s.orangTuaSiswa.length > 0);

    console.log(`✅ Siswa yang sudah punya orang tua: ${siswaDenganOrangTua.length}`);
    console.log(`❌ Siswa yang belum punya orang tua: ${siswaTanpaOrangTua.length}\n`);

    if (siswaTanpaOrangTua.length > 0) {
      console.log('📋 Daftar siswa yang belum punya orang tua:');
      siswaTanpaOrangTua.forEach((siswa, index) => {
        console.log(`   ${index + 1}. ${siswa.user.name} (NIS: ${siswa.nis})`);
      });
      console.log('');
    }

    if (siswaDenganOrangTua.length > 0) {
      console.log('📋 Daftar siswa yang sudah punya orang tua:');
      siswaDenganOrangTua.forEach((siswa, index) => {
        const orangTuaNames = siswa.orangTuaSiswa.map(ots =>
          `${ots.orangTua.user.name} (${ots.hubungan})`
        ).join(', ');
        console.log(`   ${index + 1}. ${siswa.user.name} → ${orangTuaNames}`);
      });
      console.log('');
    }

    // Summary
    console.log('📊 RINGKASAN:');
    console.log(`   - Perlu membuat ${siswaTanpaOrangTua.length} akun orang tua`);
    console.log(`   - Sudah ada ${orangTuaCount} akun orang tua di database`);
    console.log(`   - Sudah ada ${orangTuaSiswaCount} relasi siswa-orangtua\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrangTuaData();
