import { prisma } from '@/lib/db';

/**
 * sendMonthlyReportToParents()
 * 
 * Logic:
 * 1. Loop semua orang tua yang punya anak aktif.
 * 2. Tentukan periode bulan lalu.
 * 3. Log hasil output: parentName, childName, month-year, pdfUrl.
 * 
 * Note: PDF Generation logic is currently in /api/reports/monthly.
 * In a real production environment, this would call a shared PDF generator service
 * and upload the file to a storage (S3/Vercel Blob) to get a pdfUrl.
 */
export async function sendMonthlyReportToParents() {
  console.log('--- STARTING MONTHLY REPORT SCHEDULER ---');
  
  try {
    // 1. Tentukan bulan lalu
    const now = new Date();
    let month = now.getMonth() - 1; // 0-indexed
    let year = now.getFullYear();
    
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month, 1));
    console.log(`Target Periode: ${monthName} ${year}`);

    // 2. Ambil semua relasi OrangTua -> Siswa Aktif
    const relations = await prisma.orangTuaSiswa.findMany({
      where: {
        siswa: {
          statusSiswa: 'AKTIF'
        }
      },
      include: {
        orangTua: {
          include: {
            user: { select: { name: true } }
          }
        },
        siswa: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    console.log(`Ditemukan ${relations.length} anak aktif yang terhubung dengan orang tua.`);

    const results = [];

    // 3. Iterasi dan "Generate" Laporan
    for (const rel of relations) {
      const parentName = rel.orangTua?.user?.name || 'Unknown Parent';
      const childName = rel.siswa?.user?.name || 'Unknown Child';
      const childId = rel.siswaId;
      
      // Simpan placeholder pdfUrl (nanti akan diintegrasikan dengan storage & WA API)
      const pdfUrl = `/api/reports/monthly?childId=${childId}&month=${month}&year=${year}`;
      
      const logEntry = {
        parentName,
        childName,
        period: `${monthName} ${year}`,
        pdfUrl,
        timestamp: new Date().toISOString()
      };
      
      console.log(`[GENERATED] Parent: ${parentName} | Child: ${childName} | URL: ${pdfUrl}`);
      results.push(logEntry);
    }

    console.log('--- MONTHLY REPORT SCHEDULER COMPLETED ---');
    return {
      success: true,
      count: results.length,
      data: results
    };

  } catch (error) {
    console.error('Error in sendMonthlyReportToParents:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
