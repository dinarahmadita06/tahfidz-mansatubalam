const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Normalizing orang tua usernames (removing _WALI/_wali suffix)...\n');

  // Get all orang tua users
  const orangTuaUsers = await prisma.user.findMany({
    where: {
      role: 'ORANG_TUA'
    },
    include: {
      orangTua: {
        include: {
          orangTuaSiswa: {
            include: {
              siswa: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${orangTuaUsers.length} orang tua users\n`);

  let updatedCount = 0;

  for (const user of orangTuaUsers) {
    const oldUsername = user.username;
    
    // Remove _WALI or _wali suffix
    let newUsername = oldUsername;
    if (newUsername.endsWith('_WALI')) {
      newUsername = newUsername.replace(/_WALI$/, '');
    } else if (newUsername.endsWith('_wali')) {
      newUsername = newUsername.replace(/_wali$/, '');
    }

    if (newUsername !== oldUsername) {
      console.log(`Updating: "${oldUsername}" → "${newUsername}"`);
      
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername }
        });
        updatedCount++;
        console.log(`  ✅ Updated successfully`);
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
      }
    } else {
      console.log(`Skipping: "${oldUsername}" (no suffix to remove)`);
    }
  }

  console.log(`\n✅ Normalization complete! Updated ${updatedCount} usernames\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
