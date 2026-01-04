#!/usr/bin/env node

/**
 * Migration Script: Convert MateriTahsin to BukuDigital
 * 
 * This script migrates all MateriTahsin records to BukuDigital with kategori='TAHSIN'
 * Run: node migrate-materi-tahsin-to-buku-digital.js
 * 
 * Safety features:
 * - Dry-run mode to preview changes before executing
 * - Prevents duplicate migrations
 * - Preserves original data
 * - Detailed logging
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

const log = (message, isVerbose = false) => {
  if (!isVerbose || VERBOSE) {
    console.log(message);
  }
};

const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(`  [DEBUG] ${message}`);
  }
};

async function migrateMaterial(materiTahsin) {
  try {
    // Ensure kategori is uppercase for enum
    const kategoriValue = 'TAHSIN';
    
    // Check if this material was already migrated by checking exact match
    const existingBuku = await prisma.bukuDigital.findFirst({
      where: {
        guruId: materiTahsin.guruId,
        judul: materiTahsin.judul,
      },
    });

    if (existingBuku) {
      logVerbose(`Already migrated: ${materiTahsin.judul} (ID: ${existingBuku.id})`);
      return { skipped: true, reason: 'Already migrated' };
    }

    // Prepare BukuDigital record
    const bukuDigitalData = {
      guruId: materiTahsin.guruId,
      judul: materiTahsin.judul || 'Untitled',
      deskripsi: materiTahsin.deskripsi || materiTahsin.konten || '',
      kategori: kategoriValue,
      fileUrl: materiTahsin.fileUrl || '',
      fileName: materiTahsin.fileName || '',
      fileSize: materiTahsin.fileSize || 0,
      createdAt: materiTahsin.createdAt || new Date(),
      updatedAt: materiTahsin.updatedAt || new Date(),
    };

    if (DRY_RUN) {
      logVerbose(`Would create: ${bukuDigitalData.judul}`);
      return { skipped: false, dryRun: true, data: bukuDigitalData };
    }

    // Create BukuDigital record
    const bukuDigital = await prisma.bukuDigital.create({
      data: bukuDigitalData,
    });

    logVerbose(`Migrated: ${bukuDigital.judul} (ID: ${bukuDigital.id})`);
    return { success: true, id: bukuDigital.id };
  } catch (error) {
    logVerbose(`Error migrating material: ${error.message}`);
    return { error: true, message: error.message };
  }
}

async function main() {
  console.log('====================================');
  console.log('MateriTahsin → BukuDigital Migration');
  console.log('====================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (data will be created)'}`);
  console.log('');

  try {
    // Fetch all MateriTahsin records
    const materiTahsinList = await prisma.materiTahsin.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (materiTahsinList.length === 0) {
      console.log('✓ No MateriTahsin records found - migration complete!');
      return;
    }

    console.log(`Found ${materiTahsinList.length} MateriTahsin records to migrate\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Migrate each record
    for (const materi of materiTahsinList) {
      const result = await migrateMaterial(materi);

      if (result.success || result.dryRun) {
        successCount++;
        log(`✓ ${materi.judul}`);
      } else if (result.skipped) {
        skippedCount++;
        log(`⊘ ${materi.judul} (${result.reason})`);
      } else if (result.error) {
        errorCount++;
        log(`✗ ${materi.judul} - ${result.message}`);
      }
    }

    console.log('\n====================================');
    console.log('Migration Summary:');
    console.log(`  Migrated: ${successCount}`);
    console.log(`  Skipped:  ${skippedCount}`);
    console.log(`  Errors:   ${errorCount}`);
    console.log('====================================\n');

    if (DRY_RUN) {
      console.log('This was a DRY RUN. To execute the migration, run:');
      console.log('  node migrate-materi-tahsin-to-buku-digital.js\n');
    } else {
      console.log('✓ Migration completed successfully!');
      console.log('  MateriTahsin data is now available in BukuDigital system\n');
    }
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
