#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking current user and guru records...\n');
    
    // Find logged-in user (look for most recent guru-role users)
    const users = await prisma.user.findMany({
      where: { role: 'GURU' },
      include: { guru: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📋 Found ${users.length} GURU users:`);
    users.forEach(u => {
      console.log(`  - ${u.email}: guru=${u.guru ? 'YES' : 'NO'}`);
    });
    
    if (users.length === 0) {
      console.log('\n❌ No GURU users found in database!');
      return;
    }
    
    // Check the first guru user
    const targetUser = users[0];
    console.log(`\n📌 Checking target user: ${targetUser.email}`);
    console.log(`   UserId: ${targetUser.id}`);
    console.log(`   Has Guru Record: ${targetUser.guru ? 'YES' : 'NO'}`);
    
    if (!targetUser.guru) {
      console.log('\n❌ Guru record missing! Need to create one.');
      return;
    }
    
    const guru = targetUser.guru;
    console.log(`\n✅ Guru record found:`);
    console.log(`   GuruId: ${guru.id}`);
    
    // Check guru's classes
    const guruKelas = await prisma.guruKelas.findMany({
      where: { guruId: guru.id },
      include: {
        kelas: {
          include: { tahunAjaran: true }
        }
      }
    });
    
    console.log(`\n📚 GuruKelas records: ${guruKelas.length}`);
    guruKelas.forEach(gk => {
      console.log(`   - ${gk.kelas.nama} (Status: ${gk.kelas.status}, Active: ${gk.isActive})`);
    });
    
    // Check for AKTIF classes
    const aktifKelas = guruKelas.filter(gk => gk.kelas.status === 'AKTIF' && gk.isActive);
    console.log(`\n✓ AKTIF Classes: ${aktifKelas.length}`);
    aktifKelas.forEach(gk => {
      console.log(`   - ${gk.kelas.nama}`);
    });
    
    if (aktifKelas.length === 0) {
      console.log('\n⚠️  Guru has no AKTIF classes! Need to create or update kelas status.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
