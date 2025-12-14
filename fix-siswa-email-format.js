import { PrismaClient } from '@prisma/client';
import { generateSiswaEmail } from './src/lib/siswaUtils.js';

const prisma = new PrismaClient();

async function fixSiswaEmailFormat() {
  try {
    console.log('🔧 Memperbaiki format email siswa...\n');

    // Get all siswa with their user data
    const siswaList = await prisma.siswa.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 Total siswa ditemukan: ${siswaList.length}\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const updates = [];

    for (const siswa of siswaList) {
      try {
        // Generate correct email format
        const correctEmail = generateSiswaEmail(siswa.user.name, siswa.nis);
        const currentEmail = siswa.user.email;

        if (currentEmail === correctEmail) {
          console.log(`✓ Skip: ${siswa.user.name} (${siswa.nis}) - Email sudah benar: ${currentEmail}`);
          skippedCount++;
          continue;
        }

        // Check if new email already exists (to avoid duplicates)
        const existingEmail = await prisma.user.findFirst({
          where: {
            email: correctEmail,
            id: { not: siswa.user.id }
          }
        });

        if (existingEmail) {
          console.log(`⚠️  Warning: ${siswa.user.name} (${siswa.nis}) - Email ${correctEmail} sudah digunakan user lain, skip...`);
          errorCount++;
          continue;
        }

        // Update email
        await prisma.user.update({
          where: { id: siswa.user.id },
          data: { email: correctEmail }
        });

        console.log(`✅ Update: ${siswa.user.name} (${siswa.nis})`);
        console.log(`   Old: ${currentEmail}`);
        console.log(`   New: ${correctEmail}\n`);

        updates.push({
          nama: siswa.user.name,
          nis: siswa.nis,
          oldEmail: currentEmail,
          newEmail: correctEmail
        });

        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating ${siswa.user.name} (${siswa.nis}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 RINGKASAN:');
    console.log(`   ✅ Berhasil diupdate: ${updatedCount}`);
    console.log(`   ✓  Sudah benar (skip): ${skippedCount}`);
    console.log(`   ❌ Error/Conflict: ${errorCount}`);
    console.log(`   📋 Total siswa: ${siswaList.length}\n`);

    if (updates.length > 0) {
      // Save update log to file
      const fs = await import('fs');
      const timestamp = new Date().toISOString().split('T')[0];
      const logContent = JSON.stringify(updates, null, 2);
      fs.writeFileSync(`email-update-log-${timestamp}.json`, logContent);
      console.log(`📁 Log update disimpan di: email-update-log-${timestamp}.json\n`);
    }

    console.log('✅ Selesai!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixSiswaEmailFormat();
