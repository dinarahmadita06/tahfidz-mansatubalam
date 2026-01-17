const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🧹 Cleaning up orphan orang tua...\n');

  // Find all orang tua without children
  const orphanOrangTua = await prisma.orangTua.findMany({
    where: {
      orangTuaSiswa: {
        none: {}
      }
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true
        }
      }
    }
  });

  if (orphanOrangTua.length === 0) {
    console.log('✅ Tidak ada orang tua orphan (tanpa anak)\n');
    return;
  }

  console.log(`Found ${orphanOrangTua.length} orphan orang tua:\n`);
  
  orphanOrangTua.forEach((ot, index) => {
    console.log(`${index + 1}. Username: ${ot.user.username}, Nama: ${ot.user.name}`);
  });

  console.log('\n🗑️  Deleting orphan orang tua...\n');

  for (const ot of orphanOrangTua) {
    // Delete OrangTua record
    await prisma.orangTua.delete({
      where: { id: ot.id }
    });

    // Delete User account
    await prisma.user.delete({
      where: { id: ot.userId }
    });

    console.log(`✅ Deleted: ${ot.user.username} - ${ot.user.name}`);
  }

  console.log(`\n✅ Cleanup complete! Deleted ${orphanOrangTua.length} orphan orang tua\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
