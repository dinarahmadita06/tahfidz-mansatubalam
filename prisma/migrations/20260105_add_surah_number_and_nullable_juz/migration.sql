-- AlterTable: Add surahNumber column and make juz nullable
ALTER TABLE "Hafalan" ADD COLUMN "surahNumber" INTEGER;
ALTER TABLE "Hafalan" ALTER COLUMN "juz" DROP NOT NULL;

-- AddIndex: For query optimization
CREATE INDEX "Hafalan_surahNumber_idx" ON "Hafalan"("surahNumber");
CREATE INDEX "Hafalan_juz_idx" ON "Hafalan"("juz");
