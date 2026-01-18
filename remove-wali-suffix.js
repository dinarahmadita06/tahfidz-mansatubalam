import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeWaliSuffix() {
  try {
    console.log('\n🔧 Removing _WALI suffix from all parent usernames\n');

    // Get all parent users with _WALI suffix
    const parents = await prisma.user.findMany({
      where: { 
        role: 'ORANG_TUA',
        username: { endsWith: '_WALI' }
      }
    });

    console.log(`✅ Found ${parents.length} parent accounts with _WALI suffix\n`);

    if (parents.length === 0) {
      console.log('✅ No parents to update. All done!');
      return;
    }

    // Update each parent
    for (const parent of parents) {
      const oldUsername = parent.username;
      const newUsername = oldUsername.replace('_WALI', '');

      console.log(`🔄 Updating: ${oldUsername} → ${newUsername}`);

      await prisma.user.update({
        where: { id: parent.id },
        data: { username: newUsername }
      });

      console.log(`   ✅ Updated successfully`);
    }

    console.log(`\n✅ Migration completed! Updated ${parents.length} parent accounts`);
    console.log('\n📋 Now parents can login with:');
    console.log('   - Username: NIS (same as their child)');
    console.log('   - Password: DDMMYYYY (from child birth date)');
    console.log('\n💡 The system will differentiate between SISWA and ORANG_TUA by password format:');
    console.log('   - Siswa password: YYYY-MM-DD');
    console.log('   - Orang tua password: DDMMYYYY');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

removeWaliSuffix();
