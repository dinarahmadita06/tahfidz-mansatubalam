import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TahunAjaranClient from '@/components/admin/tahun-ajaran/TahunAjaranClient';
import { getCachedData, setCachedData } from '@/lib/cache';

// Optimasi TTFB: Server Component dengan Parallel Data Fetching & Caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminTahunAjaranPage() {
  console.time('AdminTahunAjaranPage: Total');
  
  // 1. Audit Auth Duration
  console.time('AdminTahunAjaranPage: auth()');
  const session = await auth();
  console.timeEnd('AdminTahunAjaranPage: auth()');

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // 2. Parallel Data Fetching & Prisma Optimization
  console.time('AdminTahunAjaranPage: Parallel Fetch');
  
  // Cache key for stats (30s) and list (60s)
  const CACHE_KEY_LIST = 'admin-tahun-ajaran-list';
  const CACHE_KEY_SUMMARY = 'admin-tahun-ajaran-summary';

  try {
    const [tahunAjaran, summaryData] = await Promise.all([
      // Fetch Tahun Ajaran List
      (async () => {
        const cached = getCachedData(CACHE_KEY_LIST);
        if (cached) return cached;

        console.time('Prisma: findMany(tahunAjaran)');
        const data = await prisma.tahunAjaran.findMany({
          select: {
            id: true,
            nama: true,
            semester: true,
            isActive: true,
            tanggalMulai: true,
            tanggalSelesai: true,
            targetHafalan: true
          },
          orderBy: [
            { isActive: 'desc' },
            { tanggalMulai: 'desc' }
          ]
        });
        console.timeEnd('Prisma: findMany(tahunAjaran)');
        
        setCachedData(CACHE_KEY_LIST, data, 60); // 60s cache
        return data;
      })(),

      // Fetch Summary Data
      (async () => {
        const cached = getCachedData(CACHE_KEY_SUMMARY);
        if (cached) return cached;

        console.time('Prisma: Summary Aggregate');
        const activeTA = await prisma.tahunAjaran.findFirst({
          where: { isActive: true },
          select: { id: true }
        });

        if (!activeTA) return { jumlahKelas: 0, jumlahSiswa: 0 };

        // Optimization: Parallel sub-queries
        const [kelasCount, siswaCount] = await Promise.all([
          prisma.kelas.count({ where: { tahunAjaranId: activeTA.id } }),
          prisma.siswa.count({ where: { kelas: { tahunAjaranId: activeTA.id } } })
        ]);
        console.timeEnd('Prisma: Summary Aggregate');

        const result = { jumlahKelas: kelasCount, jumlahSiswa: siswaCount };
        setCachedData(CACHE_KEY_SUMMARY, result, 30); // 30s cache
        return result;
      })()
    ]);
    
    console.timeEnd('AdminTahunAjaranPage: Parallel Fetch');
    console.timeEnd('AdminTahunAjaranPage: Total');

    return (
      <TahunAjaranClient 
        initialData={tahunAjaran} 
        initialSummary={summaryData} 
      />
    );
  } catch (error) {
    console.error('Error in AdminTahunAjaranPage Server Render:', error);
    // Return empty state if error happens
    return <TahunAjaranClient initialData={[]} initialSummary={{ jumlahKelas: 0, jumlahSiswa: 0 }} />;
  }
}
