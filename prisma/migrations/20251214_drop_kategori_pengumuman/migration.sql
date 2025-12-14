-- Drop kategori column from Pengumuman table
ALTER TABLE "Pengumuman" DROP COLUMN IF EXISTS "kategori";

-- Drop the enum type if it exists and is not used elsewhere
DROP TYPE IF EXISTS "KategoriPengumuman";
