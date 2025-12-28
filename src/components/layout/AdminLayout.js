'use client';

import { useEffect, useState, memo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  UserCheck,
  UsersRound,
  Activity,
  User,
  Megaphone,
  Key
} from 'lucide-react';
import NotificationPopup from '@/components/NotificationPopup';
import PageTransition from '@/components/PageTransition';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    title: 'Manajemen Pengguna',
    icon: Users,
    submenu: [
      { title: 'Guru', href: '/admin/guru', icon: GraduationCap },
      { title: 'Siswa', href: '/admin/siswa', icon: UsersRound },
      { title: 'Orang Tua', href: '/admin/orangtua', icon: Users },
      { title: 'Validasi Siswa', href: '/admin/validasi-siswa', icon: UserCheck },
    ]
  },
  {
    title: 'Kelas & Tahun Ajaran',
    icon: School,
    submenu: [
      { title: 'Kelas', href: '/admin/kelas', icon: School },
      { title: 'Tahun Ajaran', href: '/admin/tahun-ajaran', icon: Calendar },
    ]
  },
  {
    title: 'Monitoring & Laporan',
    icon: BarChart3,
    submenu: [
      { title: 'Laporan Hafalan & Kehadiran', href: '/admin/laporan/kehadiran', icon: BarChart3 },
    ]
  },
  {
    title: 'Pengumuman',
    icon: Megaphone,
    href: '/admin/pengumuman',
  },
  {
    title: 'Reset Password User',
    icon: Key,
    href: '/admin/reset-password-user',
  },
  {
    title: 'Log Activity',
    icon: Activity,
    href: '/admin/activity-logs',
  },
  {
    title: 'Profil',
    icon: User,
    href: '/admin/profile',
  },
];

function AdminLayout({ children }) {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMounted, setIsMounted] = useState(false); // NEW: Track if component is mounted
  const pathname = usePathname();

  // Mark component as mounted - runs only once on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile screen - runs only on client
  useEffect(() => {
    if (!isMounted) return; // Wait until mounted
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMounted]);

  // Polling for new notifications every 10 seconds
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const notifications = await res.json();
          if (Array.isArray(notifications) && notifications.length > 0 && !currentNotification) {
            setCurrentNotification(notifications[0]);
            if (notifications.length > 1) {
              setNotificationQueue(notifications.slice(1));
            }
          }
        }
      } catch (error) {
        // Silently fail - notification polling is not critical
        // console.error('Error fetching notifications:', error);
      }
    };

    // Only start polling if we're on client side
    if (typeof window !== 'undefined') {
      checkNotifications();
      const interval = setInterval(checkNotifications, 60000); // interval 60 detik

      return () => clearInterval(interval);
    }
  }, [currentNotification]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleCloseNotification = () => {
    setCurrentNotification(null);

    if (notificationQueue.length > 0) {
      setTimeout(() => {
        setCurrentNotification(notificationQueue[0]);
        setNotificationQueue(notificationQueue.slice(1));
      }, 500);
    }
  };

  const toggleSubmenu = (title) => {
    setExpandedMenus(prev => {
      // If clicking the same menu that's open, close it
      if (prev[title]) {
        return { ...prev, [title]: false };
      }
      // Otherwise, close all others and open only this one
      return { [title]: true };
    });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const isActive = (href) => {
    return pathname === href;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => pathname === item.href);
  };

  // Close sidebar on mobile when link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Auto-expand menu yang aktif, close yang lain
  useEffect(() => {
    const activeMenu = menuItems.find((item) =>
      item.submenu && isSubmenuActive(item.submenu)
    );

    if (activeMenu) {
      setExpandedMenus({ [activeMenu.title]: true });
    } else {
      // Close all if no active submenu
      setExpandedMenus({});
    }
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        /* Islamic pattern background for sidebar */
        .islamic-pattern {
          background-image:
            repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(16, 185, 129, 0.06) 35px, rgba(16, 185, 129, 0.06) 70px),
            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(245, 158, 11, 0.04) 35px, rgba(245, 158, 11, 0.04) 70px);
        }

        /* Islamic star ornament at bottom of sidebar */
        .islamic-star-ornament {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 150px;
          background-image:
            radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
            conic-gradient(from 0deg, rgba(16, 185, 129, 0.05) 0deg, transparent 45deg, rgba(16, 185, 129, 0.05) 90deg, transparent 135deg, rgba(16, 185, 129, 0.05) 180deg, transparent 225deg, rgba(16, 185, 129, 0.05) 270deg, transparent 315deg);
          /* filter: blur(1px); removed for performance */
          opacity: 0.6;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAFFF8 0%, #FFFBE9 100%)' }} suppressHydrationWarning>
        {/* Mobile Overlay - Only show when sidebar is open on mobile AND component is mounted */}
        {isMounted && isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            isMobile
              ? sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
              : sidebarOpen
                ? 'w-72'
                : 'w-20'
          } ${
            isMobile ? 'fixed left-0 top-0 bottom-0 w-72 z-50' : 'relative'
          } transition-all duration-300 flex flex-col islamic-pattern`}
          style={{
            background: 'linear-gradient(180deg, #E8FFF3 0%, #FFF9E7 100%)',
            boxShadow: '4px 0px 12px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Islamic Star Ornament */}
          <div className="islamic-star-ornament"></div>
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-emerald-100/60">
            {sidebarOpen ? (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className="p-2.5 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <BookOpen className="text-white" size={24} strokeWidth={2} />
                </div>
                <span className="font-bold text-lg" style={{ color: '#064E3B', letterSpacing: '0.02em' }}>
                  SIMTAQ
                </span>
              </Link>
            ) : (
              <Link
                href="/admin/dashboard"
                className="p-2.5 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 block"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <BookOpen className="text-white" size={24} strokeWidth={2} />
              </Link>
            )}

            {/* Toggle Button - Hidden on Mobile */}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-emerald-50/60 text-gray-500 hover:text-emerald-700 transition-all duration-200"
                title={sidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
              >
                {sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          {/* Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-5 px-4">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                const isMenuActive = item.submenu ? isSubmenuActive(item.submenu) : isActive(item.href);
                const showDivider = index === 0 || index === 3 || index === 4; // Divider after Dashboard, Monitoring, Activity

                return (
                  <div key={item.title}>
                    {showDivider && index !== 0 && (
                      <div className="my-2 border-t border-gray-200/30"></div>
                    )}

                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => sidebarOpen ? toggleSubmenu(item.title) : setSidebarOpen(true)}
                          className={`w-full flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-0'} py-2 rounded-xl transition-all duration-200 group relative ${
                            isMenuActive
                              ? 'bg-emerald-50/80 text-emerald-800'
                              : 'text-gray-700 hover:bg-emerald-50/40 hover:text-emerald-700'
                          }`}
                          title={!sidebarOpen ? item.title : ''}
                        >
                          {isMenuActive && sidebarOpen && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full"></div>
                          )}
                          <div className="flex items-center gap-3">
                            <item.icon
                              size={20}
                              strokeWidth={1.5}
                              className={isMenuActive ? 'text-emerald-700' : 'text-gray-600 group-hover:text-emerald-700'}
                            />
                            {sidebarOpen && (
                              <span className="font-medium text-sm">{item.title}</span>
                            )}
                          </div>
                          {sidebarOpen && (
                            <ChevronDown
                              size={16}
                              strokeWidth={2}
                              className={`transition-transform duration-200 ${
                                expandedMenus[item.title] ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>

                        {sidebarOpen && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              expandedMenus[item.title]
                                ? 'mt-1 ml-6 pl-4 max-h-96 opacity-100 border-l-2 border-emerald-100'
                                : 'mt-0 ml-0 pl-0 max-h-0 opacity-0 border-l-0'
                            }`}
                          >
                            <div className="space-y-1">
                              {item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.href}
                                  href={subitem.href}
                                  prefetch={false}
                                  onClick={handleLinkClick}
                                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 group relative ${
                                    isActive(subitem.href)
                                      ? 'bg-amber-50 text-amber-900'
                                      : 'text-gray-600 hover:bg-emerald-50/40 hover:text-emerald-700'
                                  }`}
                                >
                                  {isActive(subitem.href) && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full"></div>
                                  )}
                                  <subitem.icon
                                    size={18}
                                    strokeWidth={1.5}
                                    className={isActive(subitem.href) ? 'text-amber-700' : 'text-gray-500 group-hover:text-emerald-600'}
                                  />
                                  <span className="font-medium">{subitem.title}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={false}
                        onClick={handleLinkClick}
                        className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-0 justify-center'} py-2 rounded-xl transition-all duration-200 group relative ${
                          isActive(item.href)
                            ? 'text-amber-900 shadow-inner'
                            : 'text-gray-700 hover:bg-emerald-50/40 hover:text-emerald-700'
                        }`}
                        style={isActive(item.href) ? {
                          background: 'linear-gradient(135deg, #FFF5DA 0%, #FFEAA7 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(245, 158, 11, 0.15)'
                        } : {}}
                        title={!sidebarOpen ? item.title : ''}
                      >
                        {isActive(item.href) && sidebarOpen && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full"></div>
                        )}
                        <item.icon
                          size={20}
                          strokeWidth={1.5}
                          className={isActive(item.href) ? 'text-amber-700' : 'text-gray-600 group-hover:text-emerald-700'}
                        />
                        {sidebarOpen && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer Section - Logout */}
          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-red-50/60 text-red-600 hover:text-red-700"
            >
              <LogOut
                size={20}
                strokeWidth={1.5}
                className="group-hover:scale-105 transition-transform duration-200"
              />
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <span className="font-semibold text-sm block">Logout</span>
                  <span className="text-xs text-red-500/70 block mt-0.5">
                    Keluar dari akun administrator
                  </span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Mobile Header with Hamburger */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-full shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-bold text-base text-emerald-900">
                Tahfidz Admin
              </span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>

        <NotificationPopup
          notification={currentNotification}
          onClose={handleCloseNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </>
  );
}

// Memoize untuk mencegah unnecessary re-render
export default memo(AdminLayout);
