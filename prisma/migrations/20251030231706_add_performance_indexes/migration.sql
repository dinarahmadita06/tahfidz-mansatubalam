-- CreateIndex
CREATE INDEX "Hafalan_siswaId_idx" ON "Hafalan"("siswaId");

-- CreateIndex
CREATE INDEX "Hafalan_tanggal_idx" ON "Hafalan"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "Hafalan_guruId_idx" ON "Hafalan"("guruId");

-- CreateIndex
CREATE INDEX "Penilaian_siswaId_idx" ON "Penilaian"("siswaId");

-- CreateIndex
CREATE INDEX "Penilaian_guruId_idx" ON "Penilaian"("guruId");

-- CreateIndex
CREATE INDEX "Penilaian_hafalanId_idx" ON "Penilaian"("hafalanId");

-- CreateIndex
CREATE INDEX "Presensi_tanggal_idx" ON "Presensi"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "Presensi_status_idx" ON "Presensi"("status");

-- CreateIndex
CREATE INDEX "Siswa_status_idx" ON "Siswa"("status");

-- CreateIndex
CREATE INDEX "Siswa_kelasId_idx" ON "Siswa"("kelasId");

-- CreateIndex
CREATE INDEX "TahunAjaran_isActive_idx" ON "TahunAjaran"("isActive");

-- CreateIndex
CREATE INDEX "TargetHafalan_siswaId_idx" ON "TargetHafalan"("siswaId");

-- CreateIndex
CREATE INDEX "TargetHafalan_kelasId_idx" ON "TargetHafalan"("kelasId");

-- CreateIndex
CREATE INDEX "TargetHafalan_deadline_idx" ON "TargetHafalan"("deadline");
