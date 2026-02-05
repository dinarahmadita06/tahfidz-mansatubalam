export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import SiswaDashboardClient from './SiswaDashboardClient';


export default async function DashboardSiswa() {
  const session = await auth();
  
  // Don't fetch on server-side in production due to Vercel deployment protection
  // Let the client component fetch the data instead (client has auth bypass)
  return (
    <SiswaDashboardClient initialData={null} session={session} />
  );
}