import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import dynamicImport from 'next/dynamic';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DashboardClient = dynamicImport(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingIndicator text="Memuat Dashboard..." />
    </div>
  ),
});

export default async function Page() {
  const startTotal = performance.now();
  
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch summary data directly on the server to eliminate "double fetch"
  // This replaces multiple client-side API calls
  const summaryRes = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/dashboard/summary`, {
    headers: {
      cookie: (await import('next/headers')).headers().get('cookie') || '',
    },
    next: { revalidate: 30 }
  });

  let initialData = null;
  if (summaryRes.ok) {
    initialData = await summaryRes.json();
  }

  const endTotal = performance.now();
  console.log(`[RSC DASHBOARD] total: ${(endTotal - startTotal).toFixed(2)} ms`);

  return (
    <>
      <meta name="build-version" content={`PROD-V5-${new Date().getTime()}`} />
      <DashboardClient initialData={initialData} />
    </>
  );
}
