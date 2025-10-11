import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkGuru() {
  console.log('🔍 Checking Guru user in database...\n');

  try {
    // Find guru user
    const guruUser = await prisma.user.findUnique({
      where: { email: 'guru@tahfidz.sch.id' },
      include: { guru: true },
    });

    if (!guruUser) {
      console.log('❌ Guru user NOT FOUND in database!');
      console.log('Email yang dicari: guru@tahfidz.sch.id');
      return;
    }

    console.log('✅ Guru user FOUND!');
    console.log('\n📋 User Details:');
    console.log('   Email:', guruUser.email);
    console.log('   Name:', guruUser.name);
    console.log('   Role:', guruUser.role);
    console.log('   isActive:', guruUser.isActive);
    console.log('   Has guru relation:', !!guruUser.guru);

    if (guruUser.guru) {
      console.log('\n👨‍🏫 Guru Details:');
      console.log('   ID:', guruUser.guru.id);
      console.log('   NIP:', guruUser.guru.nip);
      console.log('   Jenis Kelamin:', guruUser.guru.jenisKelamin);
    }

    // Test password
    console.log('\n🔐 Testing Password:');
    const testPassword = 'guru123';
    const isPasswordValid = await bcrypt.compare(testPassword, guruUser.password);

    if (isPasswordValid) {
      console.log('   ✅ Password "guru123" is CORRECT');
    } else {
      console.log('   ❌ Password "guru123" is WRONG');
      console.log('   Stored hash:', guruUser.password);

      // Try to create correct hash
      const correctHash = await bcrypt.hash('guru123', 10);
      console.log('\n   🔧 Correct hash should be similar to:', correctHash);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error checking guru:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGuru();
