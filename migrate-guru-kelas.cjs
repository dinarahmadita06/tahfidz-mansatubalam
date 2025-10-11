const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateGuruKelas() {
  try {
    console.log('Starting migration: Moving guruId to GuruKelas table...');

    // Get all kelas with their guruId
    const kelasList = await prisma.$queryRaw`
      SELECT id, "guruId" FROM kelas WHERE "guruId" IS NOT NULL
    `;

    console.log(`Found ${kelasList.length} kelas with assigned guru`);

    // Create GuruKelas table if not exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS guru_kelas (
        id TEXT PRIMARY KEY,
        "guruId" TEXT NOT NULL,
        "kelasId" TEXT NOT NULL,
        peran TEXT NOT NULL DEFAULT 'utama',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "tanggalMulai" TIMESTAMP NOT NULL DEFAULT NOW(),
        "tanggalSelesai" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "guru_kelas_guruId_kelasId_key" UNIQUE ("guruId", "kelasId"),
        CONSTRAINT "guru_kelas_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES guru(id) ON DELETE CASCADE,
        CONSTRAINT "guru_kelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES kelas(id) ON DELETE CASCADE
      )
    `;

    // Insert data into GuruKelas for each existing kelas
    for (const kelas of kelasList) {
      const id = `guru_kelas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await prisma.$executeRaw`
        INSERT INTO guru_kelas (id, "guruId", "kelasId", peran, "isActive", "tanggalMulai", "createdAt", "updatedAt")
        VALUES (${id}, ${kelas.guruId}, ${kelas.id}, 'utama', true, NOW(), NOW(), NOW())
        ON CONFLICT ("guruId", "kelasId") DO NOTHING
      `;

      console.log(`Migrated kelas ${kelas.id} with guru ${kelas.guruId}`);
    }

    console.log('Migration completed successfully!');
    console.log('You can now run: npx prisma db push --accept-data-loss');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateGuruKelas();
