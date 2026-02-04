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
  Key,
  Award
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
    title: 'Laporan Hafalan & Kehadiran',
    icon: BarChart3,
    href: '/admin/laporan/kehadiran',
  },
  {
    title: 'Sertifikat Tasmi',
    icon: Award,
    href: '/admin/sertifikat',
  },
  {
    title: 'Pengumuman',
    icon: Megaphone,
    href: '/admin/pengumuman',
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
  const [isMounted, setIsMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  // Mark component as mounted - runs only once on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile screen - runs only on client
  useEffect(() => {
    if (!isMounted) return;
    
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

  // Cleanup: Close sidebar on route change (mobile only) and reset body overflow
  useEffect(() => {
    // Only auto-close on mobile when route actually changes
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]); // Remove sidebarOpen from deps to prevent loop

  // Separate effect for body overflow management
  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? 'hidden' : 'unset';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  // Fetch pending siswa count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/admin/siswa?status=pending&limit=1');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pagination?.totalCount || 0);
        }
      } catch (error) {
        // Silently fail
      }
    };

    if (isMounted) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
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
      }
    };

    if (typeof window !== 'undefined') {
      checkNotifications();
      const interval = setInterval(checkNotifications, 60000);
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

  // Multi-expand: toggle submenu independently
  const toggleSubmenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = async () => {
    try {
      // Log logout activity
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
      
      // Proceed with signOut - redirect to landing page
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

  // Auto-expand menu yang aktif, tapi jangan close yang lain
  useEffect(() => {
    const activeMenu = menuItems.find((item) =>
      item.submenu && isSubmenuActive(item.submenu)
    );

    if (activeMenu) {
      setExpandedMenus(prev => ({ ...prev, [activeMenu.title]: true }));
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
          opacity: 0.6;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAFFF8 0%, #FFFBE9 100%)' }} suppressHydrationWarning>
        {/* Mobile Overlay - with pointer-events protection */}
        {isMounted && isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 md:bg-black/50 z-40 lg:hidden transition-opacity duration-200"
            onClick={(e) => {
              // Only close if clicking backdrop, not if event came from toggle button
              e.stopPropagation();
              setSidebarOpen(false);
            }}
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
                ? 'w-[240px] xl:w-[260px]'
                : 'w-20'
          } ${
            isMobile ? 'fixed left-0 top-0 bottom-0 w-[240px] z-50' : 'relative'
          } transition-all duration-300 flex flex-col islamic-pattern`}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(180deg, #E8FFF3 0%, #FFF9E7 100%)',
            boxShadow: '4px 0px 12px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Islamic Star Ornament */}
          <div className="islamic-star-ornament"></div>
          
          {/* Logo Section */}
          <div className="h-16 lg:h-20 flex items-center justify-between px-5 border-b border-emerald-100/60">
            {sidebarOpen ? (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 lg:gap-3 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className="p-2 lg:p-2.5 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <BookOpen className="text-white w-5 h-5 lg:w-6 h-6" strokeWidth={2} />
                </div>
                <span className="font-bold text-base lg:text-lg" style={{ color: '#064E3B', letterSpacing: '0.02em' }}>
                  SIMTAQ
                </span>
              </Link>
            ) : (
              <Link
                href="/admin/dashboard"
                className="p-2 lg:p-2.5 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 block"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <BookOpen className="text-white w-5 h-5 lg:w-6 h-6" strokeWidth={2} />
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
          <nav className="flex-1 overflow-y-auto py-3 lg:py-5 px-3 lg:px-4">
            <div className="space-y-1.5 lg:space-y-2">
              {menuItems.map((item, index) => {
                const isMenuActive = item.submenu ? isSubmenuActive(item.submenu) : isActive(item.href);
                const showDivider = index === 3 || index === 5 || index === 6;

                return (
                  <div key={item.title}>
                    {showDivider && (
                      <div className="my-2.5 lg:my-3 border-t border-emerald-100/60"></div>
                    )}

                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => sidebarOpen ? toggleSubmenu(item.title) : setSidebarOpen(true)}
                          className={`w-full flex items-center justify-between gap-2 ${sidebarOpen ? 'px-3' : 'px-0'} py-1.5 lg:py-2 rounded-xl min-h-[40px] lg:min-h-[44px] transition-colors duration-200 group ${
                            isMenuActive
                              ? 'bg-emerald-50/70 ring-1 ring-emerald-200/40 text-emerald-700 font-semibold'
                              : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700'
                          }`}
                          title={!sidebarOpen ? item.title : ''}
                        >
                          <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
                            <item.icon
                              className={`w-[18px] h-[18px] lg:w-5 lg:h-5 shrink-0 ${isMenuActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}
                              strokeWidth={1.5}
                            />
                            {sidebarOpen && (
                              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis truncate text-[13px] lg:text-sm font-medium">{item.title}</span>
                            )}
                          </div>
                          {sidebarOpen && (
                            <ChevronDown
                              className={`text-slate-400 transition-transform duration-200 w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${
                                expandedMenus[item.title] ? 'rotate-180' : ''
                              }`}
                              strokeWidth={2}
                            />
                          )}
                        </button>

                        {sidebarOpen && expandedMenus[item.title] && (
                          <div className="mt-1.5 space-y-1 pl-6 border-l border-emerald-100/50 transition-all duration-200">
                            {item.submenu.map((subitem) => (
                              <Link
                                key={subitem.href}
                                href={subitem.href}
                                onClick={handleLinkClick}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg text-xs lg:text-sm transition-colors duration-200 border-l-2 ml-2 ${
                                  isActive(subitem.href)
                                    ? 'bg-emerald-50/60 text-emerald-700 font-medium border-l-emerald-400/70'
                                    : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700 border-l-transparent hover:border-l-emerald-300/40'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 lg:gap-3">
                                  <subitem.icon
                                    className={`w-4 h-4 lg:w-[18px] lg:h-[18px] ${isActive(subitem.href) ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}
                                    strokeWidth={1.5}
                                  />
                                  <span className="font-medium">{subitem.title}</span>
                                </div>
                                {subitem.href === '/admin/validasi-siswa' && pendingCount > 0 && (
                                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                    {pendingCount > 99 ? '99+' : pendingCount}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`w-full flex items-center gap-2.5 lg:gap-3 ${sidebarOpen ? 'px-3' : 'px-0 justify-center'} py-1.5 lg:py-2 rounded-xl min-h-[40px] lg:min-h-[44px] transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'bg-emerald-50/70 ring-1 ring-emerald-200/40 text-emerald-700 font-semibold'
                            : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700'
                        }`}
                        title={!sidebarOpen ? item.title : ''}
                      >
                        <item.icon
                          className={`w-[18px] h-[18px] lg:w-5 lg:h-5 ${isActive(item.href) ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}
                          strokeWidth={1.5}
                        />
                        {sidebarOpen && (
                          <span className="text-[13px] lg:text-sm font-medium">{item.title}</span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer Section - Logout */}
          <div className="p-3 lg:p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl min-h-[40px] lg:min-h-[44px] transition-colors duration-200 group hover:bg-red-50/60 text-red-600 hover:text-red-700"
            >
              <LogOut
                className="group-hover:scale-105 transition-transform duration-200 w-[18px] h-[18px] lg:w-5 lg:h-5"
                strokeWidth={1.5}
              />
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <span className="font-semibold text-xs lg:text-sm block">Logout</span>
                  <span className="text-[10px] text-red-500/70 block mt-0.5">
                    Keluar dari akun administrator
                  </span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Mobile Header with Hamburger */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSidebarOpen(!sidebarOpen);
              }}
              onPointerDown={(e) => {
                // Prevent double trigger on touch devices
                e.stopPropagation();
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-50"
              aria-label="Toggle menu"
              type="button"
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
            <div className="w-10" />
          </div>

          {/* Content */}
          <div className="w-full px-4 sm:px-6 lg:px-10 pt-5 pb-8">
            <div className="w-full">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
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

export default memo(AdminLayout);
