export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import SiswaDashboardClient from './SiswaDashboardClient';
import { headers } from 'next/headers';


export default async function DashboardSiswa() {
  const session = await auth();
  
  console.log('[SISWA PAGE] Starting server-side fetch for dashboard data');
  console.log('[SISWA PAGE] Session:', { 
    exists: !!session, 
    role: session?.user?.role,
    userId: session?.user?.id 
  });
  
  // Fetch consolidated dashboard data on the server
  // Use VERCEL_URL for deployment, localhost for dev
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  console.log('[SISWA PAGE] Fetching from baseUrl:', baseUrl);
  
  let initialData = null;
  try {
    const fetchUrl = `${baseUrl}/api/siswa/dashboard/summary`;
    console.log('[SISWA PAGE] Fetch URL:', fetchUrl);
    
    const res = await fetch(fetchUrl, {
      headers: {
        cookie: headers().get('cookie') || '',
      },
      next: { revalidate: 30 },
      cache: 'no-store'
    });
    
    console.log('[SISWA PAGE] Fetch response:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    });
    
    if (res.ok) {
      initialData = await res.json();
      console.log('[SISWA PAGE] Data fetched successfully:', {
        hasStats: !!initialData?.stats,
        hasJuzProgress: !!initialData?.juzProgress,
        siswaId: initialData?.siswaId
      });
    } else {
      const errorText = await res.text();
      console.error('[SISWA PAGE] Fetch failed:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
    }
  } catch (error) {
    console.error('[SISWA PAGE] Error fetching initial dashboard data:', error);
    console.error('[SISWA PAGE] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }

  console.log('[SISWA PAGE] Rendering with initialData:', !!initialData);

  return (
    <SiswaDashboardClient initialData={initialData} session={session} />
  );
}