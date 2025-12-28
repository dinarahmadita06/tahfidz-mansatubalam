export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import dynamicImport from 'next/dynamic';

// Import dashboard client dengan ssr: false DAN loading fallback yang static
const DashboardClient = dynamicImport(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat Dashboard v4 (Fresh Build)...</p>
      </div>
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
