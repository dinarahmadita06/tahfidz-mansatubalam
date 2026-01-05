/**
 * Migration Script: Sync Parent Account Status
 * 
 * RULE FINAL: Parent account status NO LONGER depends on orangTua.status field.
 * Instead, parent login validation checks connected student status (siswa.status).
 * 
 * This script:
 * 1. Sets all orangTua.status = 'approved' (retroactive fix)
 * 2. Ensures no parent is stuck in 'pending' state
 * 3. Parent activation will be auto-managed by siswa approval process
 * 
 * Run: node scripts/sync-parent-status-migration.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateParentStatus() {
  try {
    console.log('📋 Starting Parent Account Status Migration...\n');

    // Step 1: Count current pending parents
    const pendingCount = await prisma.orangTua.count({
      where: { status: 'pending' },
    });

    console.log(`📊 Current status breakdown:`);
    const statuses = await prisma.orangTua.groupBy({
      by: ['status'],
      _count: true,
    });
    statuses.forEach(s => {
      console.log(`   • ${s.status}: ${s._count}`);
    });

    if (pendingCount === 0) {
      console.log('\n✅ No pending parents found. Migration already complete.');
      return;
    }

    console.log(`\n🔄 Setting ${pendingCount} pending parents to 'approved' status...\n`);

    // Step 2: Update all pending parents to approved
    const result = await prisma.orangTua.updateMany({
      where: { status: 'pending' },
      data: { status: 'approved' },
    });

    console.log(`✅ Updated ${result.count} parent records\n`);

    // Step 3: Show updated status breakdown
    console.log(`📊 New status breakdown:`);
    const newStatuses = await prisma.orangTua.groupBy({
      by: ['status'],
      _count: true,
    });
    newStatuses.forEach(s => {
      console.log(`   • ${s.status}: ${s._count}`);
    });

    // Step 4: Verify no 'pending' status remains
    const verifyPending = await prisma.orangTua.count({
      where: { status: 'pending' },
    });

    if (verifyPending === 0) {
      console.log('\n✅ Verification successful: No pending parents remain\n');
      console.log('📝 NOTE: Parent login validation now checks connected student status:');
      console.log('   • If siswa.status = "pending" → parent login BLOCKED');
      console.log('   • If siswa.status = "approved" → parent login ALLOWED');
      console.log('   • Parent user.isActive auto-managed by siswa approval process\n');
    } else {
      console.log(`\n⚠️  Warning: ${verifyPending} pending parents still exist!`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

migrateParentStatus();
