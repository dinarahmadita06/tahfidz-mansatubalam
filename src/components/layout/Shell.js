"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { LayoutDashboard, BookOpen, BarChart2, User, Users, Settings, Heart, LogOut, ChevronRight, Leaf, Calendar, MessageSquare } from "lucide-react";

function getNavigationItems(userRole) {
  const baseItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }
  ];

  switch (userRole) {
    case "siswa":
      return [
        ...baseItems,
        { href: "/hafalan", icon: BookOpen, label: "Hafalan" },
        { href: "/laporan", icon: BarChart2, label: "Laporan" },
        { href: "/profil", icon: User, label: "Profil" }
      ];
    
    case "guru":
      return [
        { href: "/guru/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { 
          href: "/guru/kelola-siswa", 
          icon: Users, 
          label: "Kelola Siswa",
          submenu: [
            { href: "/guru/kelola-siswa/kelas-10", label: "Kelas 10" },
            { href: "/guru/kelola-siswa/kelas-11", label: "Kelas 11" },
            { href: "/guru/kelola-siswa/kelas-12", label: "Kelas 12" }
          ]
        },
        { 
          href: "/guru/verifikasi-hafalan", 
          icon: BookOpen, 
          label: "Verifikasi Hafalan"
        },
        { 
          href: "/guru/mode-latihan", 
          icon: Settings, 
          label: "Mode Latihan"
        },
        { 
          href: "/guru/laporan-guru", 
          icon: BarChart2, 
          label: "Laporan"
        },
        { href: "/guru/pengumuman", icon: MessageSquare, label: "Pengumuman" },
        { href: "/profil", icon: User, label: "Profil" }
      ];
    
    case "orangtua":
      return [
        { href: "/orangtua/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/orangtua/anak", icon: Heart, label: "Progress Anak" },
        { href: "/orangtua/komunikasi", icon: Users, label: "Komunikasi" },
        { href: "/profil", icon: User, label: "Profil" }
      ];
    
    case "admin":
      return [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/users", icon: Users, label: "Kelola Pengguna" },
        { href: "/admin/system", icon: Settings, label: "Pengaturan" },
        { href: "/admin/reports", icon: BarChart2, label: "Laporan Sistem" },
        { href: "/profil", icon: User, label: "Profil" }
      ];
    
    default:
      return baseItems.concat([
        { href: "/hafalan", icon: BookOpen, label: "Hafalan" },
        { href: "/laporan", icon: BarChart2, label: "Laporan" },
        { href: "/profil", icon: User, label: "Profil" }
      ]);
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
    }
  }, []);

  const navigationItems = getNavigationItems(user?.role);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const linkClass = (href) => {
    const active = pathname === href;
    return `flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 ${active ? 'bg-gray-100 dark:bg-neutral-800 font-semibold text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`;
  };

  const submenuLinkClass = (href) => {
    const active = pathname === href;
    return `flex items-center rounded-lg px-3 py-2 ml-6 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 ${active ? 'bg-gray-100 dark:bg-neutral-800 font-semibold text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`;
  };
  
  const itemClass = "flex items-center gap-3";

  const toggleSubmenu = (label) => {
    setExpandedSubmenu(expandedSubmenu === label ? null : label);
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-gray-200 md:dark:border-neutral-800 bg-white/60 dark:bg-black/40 backdrop-blur">
      <div className="h-16 flex items-center px-4 text-lg font-semibold gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white"><Leaf size={18} /></span>
        Tahfidz
      </div>
      
      <nav className="flex-1 px-2 py-2 space-y-1">
        {navigationItems.map((item) => (
          <div key={item.href}>
            {item.submenu ? (
              <>
                <button 
                  onClick={() => toggleSubmenu(item.label)}
                  className={linkClass(item.href)}
                >
                  <span className={itemClass}>
                    <item.icon size={18} /> 
                    {item.label}
                  </span>
                  <ChevronRight size={16} className={`opacity-50 transition-transform ${expandedSubmenu === item.label ? 'rotate-90' : ''}`} />
                </button>
                {expandedSubmenu === item.label && (
                  <div className="mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href} className={submenuLinkClass(subItem.href)}>
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={item.href} className={linkClass(item.href)}>
                <span className={itemClass}>
                  <item.icon size={18} /> 
                  {item.label}
                </span>
                <ChevronRight size={16} className="opacity-50" />
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User info and logout */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.split(' ').map(n => n[0]).join('') || user.role?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      )}
    </aside>
  );
}

export function Topbar({ title = "Tahfidz" }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
    }
  }, []);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "siswa": return "Siswa";
      case "guru": return "Guru";
      case "orangtua": return "Orang Tua";
      case "admin": return "Administrator";
      default: return "";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-black/30 backdrop-blur">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white"><Leaf size={18} /></span>
          <div>
            <h1 className="text-base md:text-lg font-semibold">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name?.split(' ').map(n => n[0]).join('') || user.role?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || 'User'}
              </span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
    }
  }, []);

  const navigationItems = getNavigationItems(user?.role);

  const linkClass = (href) => {
    const active = pathname === href;
    return `px-2 py-3 text-center text-xs ${active ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground'} hover:bg-gray-50 dark:hover:bg-neutral-900`;
  };

  // Show only first 4 items in bottom nav for space
  const bottomNavItems = navigationItems.slice(0, 4);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur">
      <div className={`grid grid-cols-${bottomNavItems.length}`}>
        {bottomNavItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <div className="flex flex-col items-center gap-1">
              <item.icon size={18} />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}


