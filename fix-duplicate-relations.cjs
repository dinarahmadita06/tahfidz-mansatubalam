const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateRelations() {
  console.log('🔧 Fixing duplicate relations...\n');

  // Cek relasi duplicate (orangTuaId + siswaId sama)
  const relations = await prisma.orangTuaSiswa.findMany({
    include: {
      orangTua: {
        include: {
          user: true
        }
      },
      siswa: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc' // Keep the oldest
    }
  });

  const relationMap = {};
  const toDelete = [];

  relations.forEach(rel => {
    const key = `${rel.orangTuaId}-${rel.siswaId}`;
    if (!relationMap[key]) {
      relationMap[key] = rel; // Keep first (oldest)
    } else {
      // Mark for deletion
      toDelete.push(rel);
    }
  });

  if (toDelete.length === 0) {
    console.log('✅ Tidak ada duplicate relation yang perlu dihapus\n');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${toDelete.length} duplicate relations to delete:\n`);
  toDelete.forEach(rel => {
    console.log(`  ❌ Delete: ${rel.orangTua.user.name} → ${rel.siswa.user.name} (ID: ${rel.id})`);
  });

  console.log('\nDeleting...');
  for (const rel of toDelete) {
    await prisma.orangTuaSiswa.delete({
      where: { id: rel.id }
    });
    console.log(`  ✅ Deleted relation ID: ${rel.id}`);
  }

  console.log(`\n✅ Done! Deleted ${toDelete.length} duplicate relations\n`);

  await prisma.$disconnect();
}

fixDuplicateRelations().catch(console.error);
