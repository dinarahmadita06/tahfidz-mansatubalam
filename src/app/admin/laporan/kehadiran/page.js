import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import KehadiranClient from './KehadiranClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LaporanKehadiranPage() {
  const startTotal = performance.now();
  console.log('--- [RSC LAPORAN KEHADIRAN] RENDER START ---');

  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[RSC LAPORAN KEHADIRAN] Auth duration: ${(endAuth - startAuth).toFixed(2)}ms`);

    if (!session || session.user.role !== 'ADMIN') {
      redirect('/login');
    }

    const startData = performance.now();
    // Fetch kelas list on the server
    const kelasList = await prisma.kelas.findMany({
      where: { status: 'AKTIF' },
      select: {
        id: true,
        nama: true,
      },
      orderBy: { nama: 'asc' }
    });
    const endData = performance.now();
    console.log(`[RSC LAPORAN KEHADIRAN] Data fetch duration: ${(endData - startData).toFixed(2)}ms`);

    const endTotal = performance.now();
    console.log(`[RSC LAPORAN KEHADIRAN] Total render duration: ${(endTotal - startTotal).toFixed(2)}ms`);
    console.log('--- [RSC LAPORAN KEHADIRAN] RENDER END ---');

    return <KehadiranClient initialKelasList={kelasList} />;
  } catch (error) {
    console.error('Error in LaporanKehadiranPage RSC:', error);
    // Return UI consistent with the rest of the app if possible, or simple error
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h1>
        <p className="text-gray-600 mt-2">Gagal memuat data laporan. Silakan coba lagi nanti.</p>
      </div>
    );
  }
}
