import { prisma } from './src/lib/prisma.js';

async function checkDemoAccounts() {
  const demoEmails = [
    'admin@tahfidz.sch.id',
    'ahmad.fauzi@tahfidz.sch.id',
    'abdullah.rahman@siswa.tahfidz.sch.id',
    'ortu.24001@parent.tahfidz.sch.id'
  ];

  console.log('\n🔍 Checking Demo Accounts...\n');

  for (const email of demoEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { guru: true, siswa: true, orangTua: true }
    });

    console.log(`=== ${email} ===`);
    if (!user) {
      console.log('❌ NOT FOUND\n');
      continue;
    }

    console.log(`✅ Found: ${user.name} (Role: ${user.role})`);

    if (user.role === 'GURU') {
      if (user.guru) {
        console.log(`✅ Guru Profile: YES`);
      } else {
        console.log(`❌ Guru Profile: MISSING!`);
      }
    }

    if (user.role === 'SISWA') {
      if (user.siswa) {
        console.log(`✅ Siswa Profile: YES (status: ${user.siswa.status})`);
      } else {
        console.log(`❌ Siswa Profile: MISSING!`);
      }
    }

    if (user.role === 'ORANG_TUA') {
      if (user.orangTua) {
        console.log(`✅ OrangTua Profile: YES (status: ${user.orangTua.status})`);
      } else {
        console.log(`❌ OrangTua Profile: MISSING!`);
      }
    }

    console.log();
  }

  process.exit(0);
}

checkDemoAccounts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
