import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { TasmiStats, TasmiWrapper } from './TasmiClient';

async function getGuruData(userId) {
  return await prisma.guru.findUnique({
    where: { userId },
    include: {
      guruKelas: {
        where: { isActive: true },
        include: {
          kelas: true
        }
      }
    }
  });
}

export async function StatsSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const guru = await getGuruData(userId);
  if (!guru) return <TasmiStats tasmiList={[]} />;

  // Filter based on guruPengampuId (the chosen teacher)
  const tasmiList = await prisma.tasmi.findMany({
    where: {
      guruPengampuId: guru.id
    }
  });

  console.log(`[DEBUG/TASMI] Guru ${guru.id} Stats: ${tasmiList.length} records found`);

  return <TasmiStats tasmiList={tasmiList} />;
}

export async function KelasSelectionAndTableSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const guru = await getGuruData(userId);
  if (!guru) return <TasmiWrapper guruKelas={[]} guruId={null} />;

  // Get summary per kelas
  const kelasList = guru?.guruKelas?.map(gk => gk.kelas) || [];
  
  // For each kelas, count tasmi statistics
  const summaryPromises = kelasList.map(async (kelas) => {
    const tasmiRecords = await prisma.tasmi.findMany({
      where: {
        guruPengampuId: guru.id,
        siswa: {
          kelasId: kelas.id
        }
      },
      select: {
        id: true,
        statusPendaftaran: true,
        nilaiAkhir: true,
        tanggalUjian: true
      }
    });

    const totalPengajuan = tasmiRecords.length;
    const menungguJadwal = tasmiRecords.filter(t => t.statusPendaftaran === 'MENUNGGU').length;
    const perluDinilai = tasmiRecords.filter(t => t.statusPendaftaran === 'DISETUJUI' && !t.nilaiAkhir && t.tanggalUjian).length;
    const selesai = tasmiRecords.filter(t => t.statusPendaftaran === 'SELESAI').length;
    const dibatalkan = tasmiRecords.filter(t => t.statusPendaftaran === 'DIBATALKAN').length;
    const butuhAksi = menungguJadwal + perluDinilai;

    // Count students in this kelas
    const jumlahSiswa = await prisma.siswa.count({
      where: { 
        kelasId: kelas.id,
        statusSiswa: 'AKTIF'
      }
    });

    return {
      kelasId: kelas.id,
      kelasNama: kelas.nama,
      jumlahSiswa,
      totalPengajuan,
      menungguJadwal,
      perluDinilai,
      selesai,
      dibatalkan,
      butuhAksi
    };
  });

  const summary = await Promise.all(summaryPromises);

  // Sort: butuh aksi first, then has submissions, then empty
  summary.sort((a, b) => {
    if (a.butuhAksi !== b.butuhAksi) return b.butuhAksi - a.butuhAksi;
    if (a.totalPengajuan !== b.totalPengajuan) return b.totalPengajuan - a.totalPengajuan;
    return a.kelasNama.localeCompare(b.kelasNama);
  });

  const guruKelas = guru?.guruKelas?.map(gk => ({
    id: gk.kelas.id,
    nama: gk.kelas.nama
  })) || [];

  return <TasmiWrapper guruKelas={guruKelas} guruId={guru.id} summary={summary} />;
}
