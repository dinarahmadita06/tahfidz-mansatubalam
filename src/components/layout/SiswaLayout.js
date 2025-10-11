'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function SiswaLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      description: 'Ringkasan & statistik',
    },
    {
      title: 'Hafalan Saya',
      icon: BookOpen,
      href: '/hafalan',
      description: 'Riwayat hafalan',
    },
    {
      title: 'Referensi Al-Qur\'an',
      icon: BookOpen,
      href: '/referensi',
      description: 'Teks & audio Qur\'an',
    },
    {
      title: 'Jadwal & Agenda',
      icon: Calendar,
      href: '/jadwal',
      description: 'Jadwal setoran',
    },
    {
      title: 'Profil',
      icon: UserCircle,
      href: '/profil',
      description: 'Pengaturan profil',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Tahfidz App</h1>
                  <p className="text-xs text-gray-500">Siswa</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              {isCollapsed ? (
                <ChevronRight size={20} className="text-gray-600" />
              ) : (
                <ChevronLeft size={20} className="text-gray-600" />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? 'text-blue-600' : 'text-gray-500'}
                    />
                    {!isCollapsed && (
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition w-full"
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="text-sm font-medium">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 lg:hidden">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">Tahfidz App</h1>
                    <p className="text-xs text-gray-500">Siswa</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon
                          size={20}
                          className={isActive ? 'text-blue-600' : 'text-gray-500'}
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : ''}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition w-full"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
