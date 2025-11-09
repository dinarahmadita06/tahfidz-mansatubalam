import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFatimahGuru() {
  try {
    // Get Fatimah data with kelas and guru
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true,
        kelas: {
          include: {
            guruKelas: {
              where: {
                isActive: true
              },
              include: {
                guru: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!siswa) {
      console.log('❌ Siswa Fatimah tidak ditemukan');
      return;
    }

    console.log('👤 Siswa:', siswa.user.name);
    console.log('📧 Email:', siswa.user.email);
    console.log('🏫 Kelas:', siswa.kelas?.nama || 'Belum ada kelas');
    console.log('');

    if (siswa.kelas?.guruKelas && siswa.kelas.guruKelas.length > 0) {
      console.log('👨‍🏫 Guru Pengampu:');
      siswa.kelas.guruKelas.forEach(gk => {
        console.log(`  - Nama: ${gk.guru.user.name}`);
        console.log(`    Email: ${gk.guru.user.email}`);
        console.log(`    NIP: ${gk.guru.nip}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Belum ada guru pengampu untuk kelas ini');
    }

    // Get all guru accounts
    console.log('📋 Semua Akun Guru:');
    const allGuru = await prisma.guru.findMany({
      include: {
        user: true
      },
      take: 10
    });

    allGuru.forEach(guru => {
      console.log(`  - ${guru.user.name} (${guru.user.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFatimahGuru();
