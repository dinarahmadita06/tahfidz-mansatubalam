'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  UserCircle,
  BookOpen,
  Star,
  CalendarCheck,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Heart,
  ChartBar,
  Megaphone,
  Target,
  LogOut,
  Award,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/orangtua',
    description: 'Monitoring hafalan anak',
    color: 'emerald'
  },
  {
    title: 'Hafalan Anak',
    icon: BookOpen,
    href: '/orangtua/hafalan-anak',
    description: 'Detail hafalan',
    color: 'emerald'
  },
  {
    title: 'Penilaian',
    icon: Star,
    href: '/orangtua/penilaian',
    description: 'Nilai dari guru',
    color: 'amber'
  },
  {
    title: 'Tasmi\'',
    icon: Award,
    href: '/orangtua/tasmi',
    description: 'Status ujian hafalan',
    color: 'purple'
  },
  {
    title: 'Presensi',
    icon: CalendarCheck,
    href: '/orangtua/presensi',
    description: 'Riwayat kehadiran',
    color: 'sky'
  },
  {
    title: 'Target Hafalan',
    icon: Target,
    href: '/orangtua/target-hafalan',
    description: 'Target & progress anak',
    color: 'amber'
  },
  {
    title: 'Laporan Hafalan',
    icon: ChartBar,
    href: '/orangtua/laporan-hafalan',
    description: 'Statistik & laporan',
    color: 'emerald'
  },
  {
    title: 'Pengumuman',
    icon: Megaphone,
    href: '/orangtua/pengumuman',
    description: 'Kabar terbaru',
    color: 'amber'
  },
  {
    title: 'Profil',
    icon: UserCircle,
    href: '/orangtua/profil',
    description: 'Data orang tua & anak',
    color: 'gray'
  },
];

function OrangtuaSidebar({ userName = 'Orang Tua' }) {
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
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
          fixed top-0 left-0 h-full bg-gradient-to-b from-white via-emerald-50/20 to-amber-50/20 shadow-xl z-40 transition-all duration-300 border-r border-emerald-100/30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-emerald-100/30 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
                    <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                      <Heart size={24} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Tahfidz App</h2>
                    <p className="text-xs text-emerald-600 font-medium">Portal Orang Tua</p>
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
            <div className="p-4 border-t border-emerald-100/30 bg-gradient-to-br from-emerald-50/50 to-amber-50/50">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-emerald-100/30">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className="text-amber-500" />
                  <p className="text-xs font-bold text-emerald-900">Tips Orang Tua</p>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Berikan dukungan dan doa untuk semangat hafalan anak Anda!
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function OrangtuaLayout({ children }) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-cream-50/30 to-amber-50/20">
      <OrangtuaSidebar userName={session?.user?.name || "Orang Tua"} />

      {/* Top Bar with Logout */}
      <div className="lg:ml-72 transition-all duration-300">
        <header className="bg-white/70 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-emerald-100/30">
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

export default memo(OrangtuaLayout);
