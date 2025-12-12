'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Star,
  Book,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  UserCircle,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  Target,
  LogOut,
  Award,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/siswa',
    description: 'Ringkasan hafalan & nilai',
    color: 'emerald'
  },
  {
    title: 'Penilaian Hafalan',
    icon: Star,
    href: '/siswa/penilaian-hafalan',
    description: 'Lihat nilai dari guru',
    color: 'amber'
  },
  {
    title: 'Tasmi\'',
    icon: Award,
    href: '/siswa/tasmi',
    description: 'Daftar ujian hafalan',
    color: 'purple'
  },
  {
    title: 'Buku Digital',
    icon: Book,
    href: '/siswa/buku-digital',
    description: 'Materi pembelajaran',
    color: 'sky'
  },
  {
    title: 'Referensi Al-Qur\'an',
    icon: BookOpen,
    href: '/siswa/referensi',
    description: 'Baca & dengar Qur\'an',
    color: 'emerald'
  },
  {
    title: 'Presensi',
    icon: CalendarCheck,
    href: '/siswa/presensi',
    description: 'Riwayat kehadiran',
    color: 'sky'
  },
  {
    title: 'Target Hafalanku',
    icon: Target,
    href: '/siswa/target-hafalan',
    description: 'Target & capaian pribadi',
    color: 'amber'
  },
  {
    title: 'Laporan Hafalan',
    icon: TrendingUp,
    href: '/siswa/laporan',
    description: 'Progress & statistik',
    color: 'amber'
  },
  {
    title: 'Profil',
    icon: UserCircle,
    href: '/siswa/profil',
    description: 'Pengaturan akun',
    color: 'gray'
  },
];

function SiswaSidebar({ userName = 'Siswa' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getColorClasses = (color, isActive) => {
    const colors = {
      emerald: {
        active: 'bg-emerald-50 text-emerald-700',
        icon: 'text-emerald-600',
        hover: 'hover:bg-emerald-50/50'
      },
      amber: {
        active: 'bg-amber-50 text-amber-700',
        icon: 'text-amber-600',
        hover: 'hover:bg-amber-50/50'
      },
      sky: {
        active: 'bg-sky-50 text-sky-700',
        icon: 'text-sky-600',
        hover: 'hover:bg-sky-50/50'
      },
      purple: {
        active: 'bg-purple-50 text-purple-700',
        icon: 'text-purple-600',
        hover: 'hover:bg-purple-50/50'
      },
      gray: {
        active: 'bg-gray-50 text-gray-700',
        icon: 'text-gray-600',
        hover: 'hover:bg-gray-50/50'
      }
    };

    return colors[color] || colors.gray;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-white via-emerald-50/30 to-amber-50/30 shadow-xl z-40 transition-all duration-300 border-r border-emerald-100/50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-40 animate-pulse"></div>
                    <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles size={24} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">SIMTAQ</h2>
                    <p className="text-xs text-emerald-600 font-medium">{userName}</p>
                  </div>
                </div>
              )}
              <button
                onClick={toggleCollapse}
                className="hidden lg:block p-1.5 hover:bg-emerald-50 rounded-lg transition"
              >
                <ChevronLeft
                  size={20}
                  className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const colorClasses = getColorClasses(item.color, isActive);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                        ${isActive
                          ? `${colorClasses.active} font-semibold shadow-sm`
                          : `text-gray-700 ${colorClasses.hover}`
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.title : ''}
                    >
                      <Icon
                        size={20}
                        className={isActive ? colorClasses.icon : 'text-gray-500'}
                      />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Tips */}
          {!isCollapsed && (
            <div className="p-4 border-t border-emerald-100/50 bg-gradient-to-br from-emerald-50 to-amber-50">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-emerald-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <p className="text-xs font-bold text-emerald-900">Tips Hari Ini</p>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Setor hafalan secara rutin setiap hari untuk hasil maksimal!
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SiswaLayout({ children }) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cream-50 to-amber-50/30">
      <SiswaSidebar userName={session?.user?.name || "Siswa"} />

      {/* Top Bar with Logout */}
      <div className="lg:ml-72 transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-emerald-100/50">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default memo(SiswaLayout);
