-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GURU', 'SISWA', 'ORANG_TUA');

-- CreateEnum
CREATE TYPE "StatusAkun" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusPresensi" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALFA');

-- CreateEnum
CREATE TYPE "KategoriPengumuman" AS ENUM ('UMUM', 'AKADEMIK', 'KEGIATAN', 'PENTING');

-- CreateEnum
CREATE TYPE "KategoriBuku" AS ENUM ('TAJWID', 'TAFSIR', 'HADITS', 'FIQIH', 'AKHLAK', 'UMUM');

-- CreateEnum
CREATE TYPE "JenisAktivitas" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "StatusKelas" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guru" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "jabatan" TEXT,
    "bidangKeahlian" TEXT,
    "alamat" TEXT,
    "noTelepon" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "kelasId" TEXT,
    "alamat" TEXT,
    "noTelepon" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "status" "StatusAkun" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrangTua" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "pekerjaan" TEXT,
    "alamat" TEXT,
    "noTelepon" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "status" "StatusAkun" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrangTua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrangTuaSiswa" (
    "id" TEXT NOT NULL,
    "orangTuaId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "hubungan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrangTuaSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TahunAjaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TahunAjaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahunAjaranId" TEXT NOT NULL,
    "kapasitas" INTEGER,
    "targetJuz" INTEGER,
    "status" "StatusKelas" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuruKelas" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalSelesai" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuruKelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetHafalan" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "kelasId" TEXT,
    "tahunAjaranId" TEXT,
    "targetJuz" INTEGER NOT NULL,
    "targetSurah" TEXT,
    "targetAyat" TEXT,
    "deadline" TIMESTAMP(3),
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetHafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hafalan" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "juz" INTEGER NOT NULL,
    "surah" TEXT NOT NULL,
    "ayatMulai" INTEGER NOT NULL,
    "ayatSelesai" INTEGER NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penilaian" (
    "id" TEXT NOT NULL,
    "hafalanId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "tajwid" INTEGER NOT NULL,
    "kelancaran" INTEGER NOT NULL,
    "makhraj" INTEGER NOT NULL,
    "adab" INTEGER NOT NULL,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPresensi" NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" "KategoriPengumuman" NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalSelesai" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BukuDigital" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" "KategoriBuku" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BukuDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "aktivitas" "JenisAktivitas" NOT NULL,
    "modul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "ipAddress" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motivasi" (
    "id" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motivasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guru_userId_key" ON "Guru"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guru_nip_key" ON "Guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_userId_key" ON "Siswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nis_key" ON "Siswa"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "OrangTua_userId_key" ON "OrangTua"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrangTua_nik_key" ON "OrangTua"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "OrangTuaSiswa_orangTuaId_siswaId_key" ON "OrangTuaSiswa"("orangTuaId", "siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "GuruKelas_guruId_kelasId_key" ON "GuruKelas"("guruId", "kelasId");

-- CreateIndex
CREATE UNIQUE INDEX "Presensi_siswaId_tanggal_key" ON "Presensi"("siswaId", "tanggal");

-- AddForeignKey
ALTER TABLE "Guru" ADD CONSTRAINT "Guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrangTua" ADD CONSTRAINT "OrangTua_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrangTuaSiswa" ADD CONSTRAINT "OrangTuaSiswa_orangTuaId_fkey" FOREIGN KEY ("orangTuaId") REFERENCES "OrangTua"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrangTuaSiswa" ADD CONSTRAINT "OrangTuaSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruKelas" ADD CONSTRAINT "GuruKelas_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruKelas" ADD CONSTRAINT "GuruKelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetHafalan" ADD CONSTRAINT "TargetHafalan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetHafalan" ADD CONSTRAINT "TargetHafalan_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetHafalan" ADD CONSTRAINT "TargetHafalan_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "TahunAjaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hafalan" ADD CONSTRAINT "Hafalan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hafalan" ADD CONSTRAINT "Hafalan_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_hafalanId_fkey" FOREIGN KEY ("hafalanId") REFERENCES "Hafalan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengumuman" ADD CONSTRAINT "Pengumuman_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BukuDigital" ADD CONSTRAINT "BukuDigital_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogActivity" ADD CONSTRAINT "LogActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
