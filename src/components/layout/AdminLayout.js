'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  UserCheck,
  UsersRound,
  Activity
} from 'lucide-react';
import NotificationPopup from '@/components/NotificationPopup';

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
      { title: 'Laporan Hafalan', href: '/admin/laporan/hafalan', icon: BookOpen },
      { title: 'Laporan Kehadiran', href: '/admin/laporan/kehadiran', icon: UserCheck },
      { title: 'Statistik Sekolah', href: '/admin/laporan/statistik', icon: BarChart3 },
    ]
  },
  {
    title: 'Log Activity',
    icon: Activity,
    href: '/admin/activity-logs',
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    href: '/admin/pengaturan',
  },
];

export default function AdminLayout({ children }) {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const pathname = usePathname();
  const router = useRouter();

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
      const interval = setInterval(checkNotifications, 30000); // Increased to 30 seconds

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
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-neutral-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <BookOpen className="text-orange-500" size={24} />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Tahfidz Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isSubmenuActive(item.submenu)
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        {sidebarOpen && <span className="font-medium">{item.title}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expandedMenus[item.title] ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {sidebarOpen && expandedMenus[item.title] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <button
                            key={subitem.href}
                            onClick={() => router.push(subitem.href)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subitem.href)
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <subitem.icon size={18} />
                            <span>{subitem.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="font-medium">{item.title}</span>}
                  </button>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>

      <NotificationPopup
        notification={currentNotification}
        onClose={handleCloseNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
