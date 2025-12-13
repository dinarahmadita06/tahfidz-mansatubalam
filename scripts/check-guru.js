import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGuru() {
  try {
    console.log('📊 Checking guru data in database...\n');

    // Count total users with GURU role
    const totalGuruUsers = await prisma.user.count({
      where: { role: 'GURU' }
    });
    console.log(`👥 Total User dengan role GURU: ${totalGuruUsers}`);

    // Count total guru records
    const totalGuru = await prisma.guru.count();
    console.log(`📝 Total Guru records: ${totalGuru}\n`);

    // Get all guru with user details
    const allGuru = await prisma.guru.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        guruKelas: {
          include: {
            kelas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (allGuru.length === 0) {
      console.log('❌ Tidak ada data guru di database\n');
    } else {
      console.log('✅ Data Guru di Database:\n');
      console.log('═══════════════════════════════════════════════════════════════');

      allGuru.forEach((guru, index) => {
        console.log(`${index + 1}. ${guru.user.name}`);
        console.log(`   Email: ${guru.user.email}`);
        console.log(`   NIP: ${guru.nip || '(kosong)'}`);
        console.log(`   Jenis Kelamin: ${guru.jenisKelamin}`);
        console.log(`   Bidang Keahlian: ${guru.bidangKeahlian || '-'}`);
        console.log(`   User ID: ${guru.userId}`);
        console.log(`   Guru ID: ${guru.id}`);
        console.log(`   Kelas Binaan: ${guru.guruKelas?.length || 0} kelas`);
        console.log(`   Created: ${guru.createdAt}`);
        console.log('───────────────────────────────────────────────────────────────');
      });
    }

    // Check for orphaned users (GURU role but no guru record)
    const orphanedUsers = await prisma.user.findMany({
      where: {
        role: 'GURU',
        guru: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (orphanedUsers.length > 0) {
      console.log('\n⚠️  ORPHANED USERS (User GURU tanpa record Guru):');
      orphanedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGuru();
