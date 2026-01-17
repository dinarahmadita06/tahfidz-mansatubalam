const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Standardizing orang tua username suffix to uppercase _WALI...\n');

  // Get all orang tua users with lowercase _wali suffix
  const orangTuaUsers = await prisma.user.findMany({
    where: {
      role: 'ORANG_TUA',
      username: {
        endsWith: '_wali'
      }
    }
  });

  if (orangTuaUsers.length === 0) {
    console.log('✅ All orang tua usernames already use _WALI (uppercase)\n');
    return;
  }

  console.log(`Found ${orangTuaUsers.length} usernames with lowercase _wali\n`);

  let updatedCount = 0;

  for (const user of orangTuaUsers) {
    const oldUsername = user.username;
    const newUsername = oldUsername.replace(/_wali$/, '_WALI');

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
  }

  console.log(`\n✅ Standardization complete! Updated ${updatedCount} usernames\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
