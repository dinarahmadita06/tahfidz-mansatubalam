export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import SiswaSidebarClient from '@/components/layout/SiswaSidebarClient';

export default async function SiswaAppLayout({ children }) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SISWA') {
    return children; // Auth check usually handled by middleware, but safe to keep
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cream-50 to-amber-50/30">
      <SiswaSidebarClient userName={session?.user?.name || "Siswa"} />

      {/* Main Content Area */}
      <div className="lg:ml-[240px] xl:ml-[260px] transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-emerald-100/50">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex justify-end h-8 lg:h-9">
              {/* Header content if any */}
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-10 pt-4 pb-8">
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
