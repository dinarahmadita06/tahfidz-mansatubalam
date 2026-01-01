#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📚 Creating test siswa data...\n');
    
    // Get kelas
    const kelas = await prisma.kelas.findMany({
      where: {
        nama: { in: ['Kelas X A3', 'Kelas XI A1'] }
      }
    });
    
    if (kelas.length === 0) {
      console.log('❌ Kelas not found! Run create-kelas-for-guru.js first');
      return;
    }
    
    console.log(`✅ Found ${kelas.length} kelas`);
    kelas.forEach(k => console.log(`   - ${k.nama}`));
    
    // Create 10 test siswa across both kelas
    const siswaData = [
      // Kelas X A3
      { nama: 'Ahmad Fauzan', nis: '2024001', kelasIndex: 0, statusApproval: 'approved' },
      { nama: 'Budi Santoso', nis: '2024002', kelasIndex: 0, statusApproval: 'approved' },
      { nama: 'Citra Dewi', nis: '2024003', kelasIndex: 0, statusApproval: 'pending' },
      { nama: 'Dina Rahma', nis: '2024004', kelasIndex: 0, statusApproval: 'approved' },
      { nama: 'Eka Putri', nis: '2024005', kelasIndex: 0, statusApproval: 'approved' },
      // Kelas XI A1
      { nama: 'Farah Hasna', nis: '2023001', kelasIndex: 1, statusApproval: 'approved' },
      { nama: 'Guru Wijaya', nis: '2023002', kelasIndex: 1, statusApproval: 'approved' },
      { nama: 'Hana Mira', nis: '2023003', kelasIndex: 1, statusApproval: 'approved' },
      { nama: 'Ilham Pratama', nis: '2023004', kelasIndex: 1, statusApproval: 'pending' },
      { nama: 'Juno Anwar', nis: '2023005', kelasIndex: 1, statusApproval: 'approved' }
    ];
    
    console.log(`\n📝 Creating ${siswaData.length} siswa...\n`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const data of siswaData) {
      try {
        // Check if siswa already exists
        const existing = await prisma.siswa.findFirst({
          where: { nis: data.nis }
        });
        
        if (existing) {
          console.log(`⏭️  ${data.nama} (${data.nis}) - already exists`);
          skippedCount++;
          continue;
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash('password123', 10);
        
        // Create user
        const user = await prisma.user.create({
          data: {
            name: data.nama,
            email: `${data.nis}@student.tahfidz.sch.id`.toLowerCase(),
            password: passwordHash,
            role: 'SISWA',
            isActive: true
          }
        });
        
        // Create siswa
        const siswa = await prisma.siswa.create({
          data: {
            userId: user.id,
            nis: data.nis,
            nisn: `0000${data.nis}`,
            kelasId: kelas[data.kelasIndex].id,
            jenisKelamin: Math.random() > 0.5 ? 'LAKI_LAKI' : 'PEREMPUAN',
            status: data.statusApproval,  // pending or approved
            statusSiswa: 'AKTIF'
          }
        });
        
        console.log(`✅ ${data.nama} (${data.nis}) - ${data.statusApproval}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating ${data.nama}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${createdCount} siswa`);
    console.log(`   Skipped: ${skippedCount} siswa (already exist)`);
    
    // Verify
    console.log(`\n✔️ Verifying data...`);
    for (const k of kelas) {
      const count = await prisma.siswa.count({
        where: { kelasId: k.id }
      });
      console.log(`   ${k.nama}: ${count} siswa`);
    }
    
    console.log(`\n✨ Done!`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
