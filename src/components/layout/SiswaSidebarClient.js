'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import useSiswaActivityTracking from '@/hooks/useSiswaActivityTracking';
import {
  LayoutDashboard,
  Star,
  Book,
  BookOpen,
  TrendingUp,
  UserCircle,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  LogOut,
  Award,
  Megaphone,
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
    title: 'Al-Qur\'an Digital',
    icon: BookOpen,
    href: '/siswa/referensi',
    description: 'Baca & dengar Qur\'an',
    color: 'emerald'
  },
  {
    title: 'Laporan Hafalan',
    icon: TrendingUp,
    href: '/siswa/laporan',
    description: 'Progress & statistik',
    color: 'amber'
  },
  {
    title: 'Pengumuman',
    icon: Megaphone,
    href: '/siswa/pengumuman',
    description: 'Riwayat pengumuman',
    color: 'emerald'
  },
  {
    title: 'Profil',
    icon: UserCircle,
    href: '/siswa/profil',
    description: 'Pengaturan akun',
    color: 'gray'
  },
];

export default function SiswaSidebarClient({ userName = 'Siswa' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Track activity when menu is accessed
  useSiswaActivityTracking();

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    try {
      await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGOUT' })
      }).catch(err => console.error('Logout activity log failed:', err));
    } catch (error) {
      console.error('Logout pre-processing failed:', error);
    } finally {
      // Clear session storage on logout
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      try {
        await signOut({ callbackUrl: '/', redirect: false });
        // Force redirect to prevent old domain cache
        window.location.href = '/';
      } catch (error) {
        console.error('SignOut failed, forcing manual redirect:', error);
        // Emergency fallback: force to root
        window.location.replace('/');
      }
    }
  };

  const getColorClasses = (color) => {
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
          className="lg:hidden fixed inset-0 bg-black/20 md:bg-black/40 z-30 transition-opacity duration-200"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-white via-emerald-50/30 to-amber-50/30 shadow-xl z-40 transition-all duration-300 border-r border-emerald-100/50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-[200px] xl:w-[220px]'}
          w-[200px]
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-2.5 lg:p-3 border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2.5 lg:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-40 animate-pulse"></div>
                    <div className="relative w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="text-white w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base lg:text-lg">SIMTAQ</h2>
                    <p className="text-[10px] lg:text-xs text-emerald-600 font-medium">{userName}</p>
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
          <nav className="flex-1 overflow-y-auto p-2.5 lg:p-3">
            <ul className="space-y-1.5 lg:space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const colorClasses = getColorClasses(item.color);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-2.5 lg:gap-3 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all
                        ${isActive
                          ? `${colorClasses.active} font-semibold shadow-sm`
                          : `text-gray-700 ${colorClasses.hover}`
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.title : ''}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] lg:w-5 lg:h-5 ${isActive ? colorClasses.icon : 'text-gray-500'}`}
                      />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <p className="text-[13px] lg:text-sm font-medium leading-tight">{item.title}</p>
                          <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-2.5 lg:p-3 border-t border-emerald-100/50 mt-auto">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-2.5 lg:gap-3 px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-xl transition-all
                text-gray-700 hover:bg-rose-50 hover:text-rose-600 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`w-[18px] h-[18px] lg:w-5 lg:h-5 transition-colors text-gray-500 group-hover:text-rose-600`} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-[13px] lg:text-sm font-semibold">Logout</p>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 group-hover:text-rose-400">Keluar dari akun</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
