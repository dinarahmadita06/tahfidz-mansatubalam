export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// Import dashboard client dengan ssr: false DAN loading fallback yang static
const DashboardClient = dynamicImport(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingIndicator text="Memuat Dashboard v4 (Fresh Build)..." />
    </div>
  ),
});

export default function Page() {
  return (
    <>
      <meta name="build-version" content={`PROD-BUILD-V4-${new Date().getTime()}`} />
      <DashboardClient />
    </>
  );
}
