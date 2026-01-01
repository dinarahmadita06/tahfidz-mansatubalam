require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    // User ID from logs: cmj5dphvd000sjp048kh09rxb (Dina Rahma)
    const userId = 'cmj5dphvd000sjp048kh09rxb';
    
    console.log('\n=== TEST: /api/guru/siswa LOGIC ===\n');
    console.log('Simulating user login:', userId);
    
    // Step 1: Get guru from user ID
    const guru = await prisma.guru.findUnique({
      where: { userId }
    });
    console.log('\n1. Guru found:', guru ? { id: guru.id } : 'NOT_FOUND');
    
    if (!guru) {
      console.log('❌ Guru not found - would return empty array');
      return;
    }
    
    // Step 2: Get guruKelas
    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
        isActive: true,
        kelas: { status: 'AKTIF' }
      },
      select: { kelasId: true }
    });
    console.log('\n2. GuruKelas found (AKTIF):', guruKelas.length, guruKelas.map(g => g.kelasId));
    
    if (guruKelas.length === 0) {
      console.log('❌ No active kelas - would return empty array');
      return;
    }
    
    // Step 3: Query siswa from those classes
    const aktivKelasIds = guruKelas.map(g => g.kelasId);
    const siswaCount = await prisma.siswa.count({
      where: { kelasId: { in: aktivKelasIds } }
    });
    console.log('\n3. Siswa count in target kelas:', siswaCount);
    
    // Step 4: Get actual siswa
    const siswa = await prisma.siswa.findMany({
      where: { kelasId: { in: aktivKelasIds } },
      select: {
        id: true,
        nis: true,
        status: true,
        user: { select: { name: true } },
        kelas: { select: { nama: true } }
      }
    });
    
    console.log('\n4. Siswa fetched:', siswa.length);
    siswa.forEach(s => {
      console.log(`   - ${s.user.name} (${s.nis}) - Status: ${s.status} - Kelas: ${s.kelas.nama}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
