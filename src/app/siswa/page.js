export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import SiswaDashboardClient from './SiswaDashboardClient';
import { headers } from 'next/headers';


export default async function DashboardSiswa() {
  const session = await auth();
  
  // Fetch consolidated dashboard data on the server
  // We use the absolute URL for server-side fetch in Next.js
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let initialData = null;
  try {
    const res = await fetch(`${baseUrl}/api/siswa/dashboard/summary`, {
      headers: {
        cookie: headers().get('cookie') || '',
      },
      next: { revalidate: 30 }
    });
    
    if (res.ok) {
      initialData = await res.json();
    }
  } catch (error) {
    console.error('Error fetching initial dashboard data:', error);
  }

  return (
    <SiswaDashboardClient initialData={initialData} session={session} />
  );
}