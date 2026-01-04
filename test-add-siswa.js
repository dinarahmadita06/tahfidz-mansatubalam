import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulate adding a siswa and check activity logging
(async () => {
  try {
    console.log('🧪 Testing siswa creation with activity logging...\n');

    // First, get an admin session (we'll need one for the API call)
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true }
    });

    if (!admin) {
      console.error('❌ No admin found in database');
      process.exit(1);
    }

    console.log(`✅ Found admin: ${admin.name} (${admin.id})\n`);

    // Get a kelas
    const kelas = await prisma.kelas.findFirst({
      select: { id: true, nama: true }
    });

    if (!kelas) {
      console.error('❌ No kelas found in database');
      process.exit(1);
    }

    console.log(`✅ Found kelas: ${kelas.nama} (${kelas.id})\n`);

    // Make API call to add siswa
    const testSiswaName = `Test_Siswa_${Date.now()}`;
    const testNIS = `999${Math.random().toString().slice(2, 8)}`;

    console.log(`📝 Creating siswa: ${testSiswaName} (NIS: ${testNIS})\n`);

    const response = await fetch('http://localhost:3001/api/admin/siswa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy` // This will be handled by auth middleware
      },
      body: JSON.stringify({
        name: testSiswaName,
        password: 'Password123!',
        nis: testNIS,
        kelasId: kelas.id,
        jenisKelamin: 'LAKI_LAKI',
        tanggalLahir: '2010-01-01',
        alamat: 'Test Address',
        noTelepon: '081234567890'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', response.status, data);
      process.exit(1);
    }

    console.log('✅ Siswa created successfully\n');
    console.log('Response:', JSON.stringify(data, null, 2));

    // Wait a moment for async activity logging
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now check if activity was logged
    console.log('\n📊 Checking activity logs...\n');

    const recentActivities = await prisma.activityLog.findMany({
      where: { 
        action: 'ADMIN_TAMBAH_SISWA',
        actorId: admin.id
      },
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        createdAt: true,
        metadata: true
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    if (recentActivities.length === 0) {
      console.error('❌ No ADMIN_TAMBAH_SISWA activity found!');
      process.exit(1);
    }

    console.log('✅ Activity found!\n');
    console.log(JSON.stringify(recentActivities[0], null, 2));

    console.log('\n✅ TEST PASSED: Activity logging is working!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
