#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📚 Creating test kelas and assigning to guru...\n');
    
    // Get the guru
    const guru = await prisma.guru.findFirst({
      where: { user: { email: 'guru.dina@tahfidz.sch.id' } }
    });
    
    if (!guru) {
      console.log('❌ Guru not found!');
      return;
    }
    
    console.log(`✅ Found guru: ${guru.id}`);
    
    // Get or create tahun ajaran
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!tahunAjaran) {
      console.log('\n📝 Creating tahun ajaran...');
      tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          nama: '2025/2026',
          tanggalMulai: new Date('2025-07-01'),
          tanggalSelesai: new Date('2026-06-30'),
          isActive: true,
          targetHafalan: 30,
          semester: 1
        }
      });
      console.log(`✅ Created tahun ajaran: ${tahunAjaran.nama}`);
    } else {
      console.log(`✅ Found tahun ajaran: ${tahunAjaran.nama}`);
      // Make sure it's AKTIF
      if (!tahunAjaran.isActive) {
        tahunAjaran = await prisma.tahunAjaran.update({
          where: { id: tahunAjaran.id },
          data: { isActive: true }
        });
      }
    }
    
    // Create test kelas
    const klasData = [
      { nama: 'Kelas X A3', kapasitas: 30 },
      { nama: 'Kelas XI A1', kapasitas: 32 }
    ];
    
    const createdKelas = [];
    for (const k of klasData) {
      let kelas = await prisma.kelas.findFirst({
        where: { 
          nama: k.nama,
          tahunAjaranId: tahunAjaran.id
        }
      });
      
      if (!kelas) {
        console.log(`\n📝 Creating kelas: ${k.nama}...`);
        kelas = await prisma.kelas.create({
          data: {
            nama: k.nama,
            tahunAjaranId: tahunAjaran.id,
            kapasitas: k.kapasitas,
            targetJuz: 5,
            status: 'AKTIF'
          }
        });
        console.log(`✅ Created: ${kelas.nama}`);
      } else {
        console.log(`✅ Found existing: ${kelas.nama}`);
        // Make sure it's AKTIF
        await prisma.kelas.update({
          where: { id: kelas.id },
          data: { status: 'AKTIF' }
        });
      }
      createdKelas.push(kelas);
    }
    
    console.log(`\n✨ Created/Updated ${createdKelas.length} kelas`);
    
    // Assign kelas to guru
    for (const kelas of createdKelas) {
      const existing = await prisma.guruKelas.findUnique({
        where: {
          guruId_kelasId: {
            guruId: guru.id,
            kelasId: kelas.id
          }
        }
      });
      
      if (!existing) {
        console.log(`\n🔗 Assigning ${kelas.nama} to guru...`);
        await prisma.guruKelas.create({
          data: {
            guruId: guru.id,
            kelasId: kelas.id,
            peran: 'utama',
            isActive: true,
            tanggalMulai: new Date()
          }
        });
        console.log(`✅ Assigned ${kelas.nama}`);
      } else {
        console.log(`✅ ${kelas.nama} already assigned`);
        // Make sure it's active
        await prisma.guruKelas.update({
          where: {
            guruId_kelasId: {
              guruId: guru.id,
              kelasId: kelas.id
            }
          },
          data: { isActive: true }
        });
      }
    }
    
    console.log('\n✨ Done! Kelas created and assigned to guru.');
    console.log(`\n🔍 Summary:`);
    console.log(`   Guru: guru.dina@tahfidz.sch.id`);
    console.log(`   Tahun Ajaran: ${tahunAjaran.nama}`);
    console.log(`   Kelas: ${createdKelas.map(k => k.nama).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
