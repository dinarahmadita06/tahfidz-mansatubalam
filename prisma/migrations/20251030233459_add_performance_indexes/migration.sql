-- CreateIndex
CREATE INDEX "BukuDigital_guruId_idx" ON "BukuDigital"("guruId");

-- CreateIndex
CREATE INDEX "BukuDigital_kategori_idx" ON "BukuDigital"("kategori");

-- CreateIndex
CREATE INDEX "BukuDigital_createdAt_idx" ON "BukuDigital"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "GuruKelas_guruId_idx" ON "GuruKelas"("guruId");

-- CreateIndex
CREATE INDEX "GuruKelas_kelasId_idx" ON "GuruKelas"("kelasId");

-- CreateIndex
CREATE INDEX "GuruKelas_isActive_idx" ON "GuruKelas"("isActive");

-- CreateIndex
CREATE INDEX "Kelas_status_idx" ON "Kelas"("status");

-- CreateIndex
CREATE INDEX "Kelas_tahunAjaranId_idx" ON "Kelas"("tahunAjaranId");

-- CreateIndex
CREATE INDEX "LogActivity_userId_idx" ON "LogActivity"("userId");

-- CreateIndex
CREATE INDEX "LogActivity_createdAt_idx" ON "LogActivity"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "LogActivity_aktivitas_idx" ON "LogActivity"("aktivitas");

-- CreateIndex
CREATE INDEX "Motivasi_isActive_idx" ON "Motivasi"("isActive");

-- CreateIndex
CREATE INDEX "OrangTua_status_idx" ON "OrangTua"("status");

-- CreateIndex
CREATE INDEX "OrangTuaSiswa_orangTuaId_idx" ON "OrangTuaSiswa"("orangTuaId");

-- CreateIndex
CREATE INDEX "OrangTuaSiswa_siswaId_idx" ON "OrangTuaSiswa"("siswaId");

-- CreateIndex
CREATE INDEX "Pengumuman_isPinned_idx" ON "Pengumuman"("isPinned");

-- CreateIndex
CREATE INDEX "Pengumuman_tanggalMulai_idx" ON "Pengumuman"("tanggalMulai" DESC);

-- CreateIndex
CREATE INDEX "Pengumuman_kategori_idx" ON "Pengumuman"("kategori");
