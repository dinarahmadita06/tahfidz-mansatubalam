-- Add surahTambahan field to Hafalan model
-- This field stores array of additional surahs in JSON format
-- Example: [{"surah":"Al-Baqarah","ayatMulai":1,"ayatSelesai":20},{"surah":"Ali Imran","ayatMulai":1,"ayatSelesai":10}]
ALTER TABLE "Hafalan" ADD COLUMN "surahTambahan" JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance when filtering by surahTambahan
CREATE INDEX "Hafalan_surahTambahan_idx" ON "Hafalan" USING GIN ("surahTambahan");
