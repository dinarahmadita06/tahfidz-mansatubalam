-- Add missing PeranGuru enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "PeranGuru" AS ENUM ('utama', 'pendamping');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add peran column to GuruKelas
ALTER TABLE "GuruKelas" ADD COLUMN IF NOT EXISTS "peran" "PeranGuru" NOT NULL DEFAULT 'pendamping';

-- Add StatusTasmi enum if missing
DO $$ BEGIN
    CREATE TYPE "StatusTasmi" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add StatusSiswa enum if missing  
DO $$ BEGIN
    CREATE TYPE "StatusSiswa" AS ENUM ('AKTIF', 'LULUS', 'PINDAH', 'KELUAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing fields to TahunAjaran if they don't exist
ALTER TABLE "TahunAjaran" ADD COLUMN IF NOT EXISTS "targetHafalan" INTEGER;
ALTER TABLE "TahunAjaran" ADD COLUMN IF NOT EXISTS "semester" INTEGER;

-- Add missing fields to Siswa if they don't exist
ALTER TABLE "Siswa" ADD COLUMN IF NOT EXISTS "nisn" TEXT;
ALTER TABLE "Siswa" ADD COLUMN IF NOT EXISTS "tempatLahir" TEXT;
ALTER TABLE "Siswa" ADD COLUMN IF NOT EXISTS "statusSiswa" "StatusSiswa" NOT NULL DEFAULT 'AKTIF';
ALTER TABLE "Siswa" ADD COLUMN IF NOT EXISTS "tanggalKeluar" TIMESTAMP(3);

-- Add missing fields to Guru if they don't exist
ALTER TABLE "Guru" ADD COLUMN IF NOT EXISTS "tandaTangan" TEXT;

-- Add resetToken fields to User if missing
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "GuruKelas_peran_idx" ON "GuruKelas"("peran");
CREATE INDEX IF NOT EXISTS "TahunAjaran_isActive_idx" ON "TahunAjaran"("isActive");
CREATE INDEX IF NOT EXISTS "Siswa_statusSiswa_idx" ON "Siswa"("statusSiswa");
