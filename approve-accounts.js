import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveAccounts() {
  try {
    console.log('📋 Approving pending siswa and orang tua accounts...\n');

    // Approve all pending siswa
    const siswaResult = await prisma.siswa.updateMany({
      where: { status: 'pending' },
      data: { status: 'approved' },
    });
    console.log(`✅ Approved ${siswaResult.count} siswa accounts`);

    // Approve all pending orang tua
    const orangtuaResult = await prisma.orangTua.updateMany({
      where: { status: 'pending' },
      data: { status: 'approved' },
    });
    console.log(`✅ Approved ${orangtuaResult.count} orang tua accounts\n`);

    // Show updated accounts
    const approvedSiswa = await prisma.siswa.findMany({
      where: { status: 'approved' },
      include: { user: { select: { email: true } } },
    });

    const approvedOrangTua = await prisma.orangTua.findMany({
      where: { status: 'approved' },
      include: { user: { select: { email: true } } },
    });

    console.log('📊 Approved Siswa:');
    approvedSiswa.forEach(s => console.log(`  • ${s.user.email}`));

    console.log('\n📊 Approved Orang Tua:');
    approvedOrangTua.forEach(o => console.log(`  • ${o.user.email}`));

    console.log('\n✅ All done! Now you can try logging in with siswa and orang tua accounts.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

approveAccounts();
