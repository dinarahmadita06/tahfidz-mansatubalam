const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check Reno's account status
    const user = await prisma.user.findUnique({
      where: { email: 'reno@test.local' },
      include: {
        siswa: {
          select: {
            id: true,
            statusSiswa: true,
            lulusAt: true
          }
        }
      }
    });

    if (!user) {
      console.log('✗ User not found');
      return;
    }

    console.log('Account Status:');
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  isActive:', user.isActive);
    console.log('  Status Siswa:', user.siswa?.statusSiswa);
    console.log('  Lulus At:', user.siswa?.lulusAt);
    
    if (!user.isActive && user.siswa?.statusSiswa === 'LULUS') {
      console.log('\n✓ Account successfully deactivated due to graduation');
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
