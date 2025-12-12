/*
  Warnings:

  - Added the required column `bulan` to the `TargetHafalan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `TargetHafalan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusTasmi" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "LevelTahsin" AS ENUM ('DASAR', 'MENENGAH', 'LANJUTAN');

-- CreateEnum
CREATE TYPE "StatusPembelajaran" AS ENUM ('LANJUT', 'PERBAIKI');

-- CreateEnum
CREATE TYPE "JenisMateri" AS ENUM ('PDF', 'YOUTUBE', 'VIDEO');

-- AlterTable
ALTER TABLE "Guru" ADD COLUMN     "tandaTangan" TEXT;

-- AlterTable
ALTER TABLE "TargetHafalan" ADD COLUMN     "bulan" INTEGER NOT NULL,
ADD COLUMN     "tahun" INTEGER NOT NULL,
ALTER COLUMN "siswaId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Tahsin" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LevelTahsin" NOT NULL,
    "materiHariIni" TEXT NOT NULL,
    "bacaanDipraktikkan" TEXT NOT NULL,
    "catatan" TEXT,
    "statusPembelajaran" "StatusPembelajaran" NOT NULL,
    "surah" TEXT,
    "ayatAwal" INTEGER,
    "ayatAkhir" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tahsin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MateriTahsin" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "kelasId" TEXT,
    "judul" TEXT NOT NULL,
    "jenisMateri" "JenisMateri" NOT NULL,
    "fileUrl" TEXT,
    "youtubeUrl" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MateriTahsin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengumumanRead" (
    "id" TEXT NOT NULL,
    "pengumumanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengumumanRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "kelasId" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktuMulai" TEXT NOT NULL,
    "waktuSelesai" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasmi" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "jumlahHafalan" INTEGER NOT NULL,
    "juzYangDitasmi" TEXT NOT NULL,
    "jamTasmi" TEXT,
    "tanggalTasmi" TIMESTAMP(3),
    "guruPengampuId" TEXT,
    "statusPendaftaran" "StatusTasmi" NOT NULL DEFAULT 'MENUNGGU',
    "catatanPenolakan" TEXT,
    "catatan" TEXT,
    "tanggalDaftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalUjian" TIMESTAMP(3),
    "guruVerifikasiId" TEXT,
    "guruPengujiId" TEXT,
    "nilaiKelancaran" INTEGER,
    "nilaiTajwid" INTEGER,
    "nilaiAdab" INTEGER,
    "nilaiIrama" INTEGER,
    "nilaiAkhir" DOUBLE PRECISION,
    "predikat" TEXT,
    "catatanPenguji" TEXT,
    "pdfUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tasmi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tahsin_siswaId_idx" ON "Tahsin"("siswaId");

-- CreateIndex
CREATE INDEX "Tahsin_guruId_idx" ON "Tahsin"("guruId");

-- CreateIndex
CREATE INDEX "Tahsin_tanggal_idx" ON "Tahsin"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "Tahsin_level_idx" ON "Tahsin"("level");

-- CreateIndex
CREATE INDEX "Tahsin_statusPembelajaran_idx" ON "Tahsin"("statusPembelajaran");

-- CreateIndex
CREATE INDEX "MateriTahsin_guruId_idx" ON "MateriTahsin"("guruId");

-- CreateIndex
CREATE INDEX "MateriTahsin_kelasId_idx" ON "MateriTahsin"("kelasId");

-- CreateIndex
CREATE INDEX "MateriTahsin_jenisMateri_idx" ON "MateriTahsin"("jenisMateri");

-- CreateIndex
CREATE INDEX "MateriTahsin_createdAt_idx" ON "MateriTahsin"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "PengumumanRead_userId_idx" ON "PengumumanRead"("userId");

-- CreateIndex
CREATE INDEX "PengumumanRead_pengumumanId_idx" ON "PengumumanRead"("pengumumanId");

-- CreateIndex
CREATE INDEX "PengumumanRead_closedAt_idx" ON "PengumumanRead"("closedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PengumumanRead_pengumumanId_userId_key" ON "PengumumanRead"("pengumumanId", "userId");

-- CreateIndex
CREATE INDEX "Agenda_guruId_idx" ON "Agenda"("guruId");

-- CreateIndex
CREATE INDEX "Agenda_kelasId_idx" ON "Agenda"("kelasId");

-- CreateIndex
CREATE INDEX "Agenda_tanggal_idx" ON "Agenda"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "Tasmi_siswaId_idx" ON "Tasmi"("siswaId");

-- CreateIndex
CREATE INDEX "Tasmi_statusPendaftaran_idx" ON "Tasmi"("statusPendaftaran");

-- CreateIndex
CREATE INDEX "Tasmi_tanggalUjian_idx" ON "Tasmi"("tanggalUjian");

-- CreateIndex
CREATE INDEX "Tasmi_tanggalTasmi_idx" ON "Tasmi"("tanggalTasmi");

-- CreateIndex
CREATE INDEX "Tasmi_guruPengampuId_idx" ON "Tasmi"("guruPengampuId");

-- AddForeignKey
ALTER TABLE "Tahsin" ADD CONSTRAINT "Tahsin_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tahsin" ADD CONSTRAINT "Tahsin_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriTahsin" ADD CONSTRAINT "MateriTahsin_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumumanRead" ADD CONSTRAINT "PengumumanRead_pengumumanId_fkey" FOREIGN KEY ("pengumumanId") REFERENCES "Pengumuman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengumumanRead" ADD CONSTRAINT "PengumumanRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasmi" ADD CONSTRAINT "Tasmi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasmi" ADD CONSTRAINT "Tasmi_guruPengampuId_fkey" FOREIGN KEY ("guruPengampuId") REFERENCES "Guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasmi" ADD CONSTRAINT "Tasmi_guruVerifikasiId_fkey" FOREIGN KEY ("guruVerifikasiId") REFERENCES "Guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasmi" ADD CONSTRAINT "Tasmi_guruPengujiId_fkey" FOREIGN KEY ("guruPengujiId") REFERENCES "Guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;
