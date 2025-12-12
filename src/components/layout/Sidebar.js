'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  UserCircle,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  Star,
  CalendarCheck2,
  Book,
  Target,
  Volume2,
  Award
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/guru',
    description: 'Ringkasan & statistik'
  },
  {
    title: 'Kelola Siswa',
    icon: Users,
    href: '/guru/siswa',
    description: 'Daftar & data siswa'
  },
  {
    title: 'Penilaian Hafalan',
    icon: Star,
    href: '/guru/penilaian-hafalan',
    description: 'Nilai hafalan siswa'
  },
  {
    title: 'Tahsin',
    icon: Volume2,
    href: '/guru/tahsin',
    description: 'Penilaian bacaan & tajwid'
  },
  {
    title: 'Tasmi\'',
    icon: Award,
    href: '/guru/tasmi',
    description: 'Ujian hafalan siswa'
  },
  {
    title: 'Presensi',
    icon: CalendarCheck2,
    href: '/guru/presensi',
    description: 'Catat kehadiran siswa'
  },
  {
    title: 'Target Hafalan',
    icon: Target,
    href: '/guru/target-hafalan',
    description: 'Target & progres siswa'
  },
  {
    title: 'Referensi Al-Qur\'an',
    icon: BookOpen,
    href: '/referensi',
    description: 'Teks & audio Qur\'an'
  },
  {
    title: 'Buku Digital',
    icon: Book,
    href: '/guru/buku-digital',
    description: 'Materi pembelajaran & panduan Tahfidz'
  },
  {
    title: 'Laporan',
    icon: FileText,
    href: '/guru/laporan',
    description: 'Laporan & statistik'
  },
  {
    title: 'Pengumuman',
    icon: Bell,
    href: '/guru/pengumuman',
    description: 'Buat pengumuman'
  },
  {
    title: 'Profil',
    icon: UserCircle,
    href: '/guru/profil',
    description: 'Pengaturan profil'
  },
];

function Sidebar({ userName = 'Guru' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg"
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
          fixed top-0 left-0 h-full bg-white text-gray-900 shadow-lg z-40 transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900" style={{ color: '#111827' }}>Tahfidz App</h2>
                    <p className="text-xs text-gray-600" style={{ color: '#4B5563' }}>{userName}</p>
                  </div>
                </div>
              )}
              <button
                onClick={toggleCollapse}
                className="hidden lg:block p-1.5 hover:bg-gray-100 rounded-lg transition"
                style={{ backgroundColor: 'transparent' }}
              >
                <ChevronLeft
                  size={20}
                  className={`transform transition-transform`}
                  style={{ color: '#374151', transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#FFFFFF' }}>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                        ${isActive
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      style={{
                        backgroundColor: isActive ? '#F0FDF4' : 'transparent',
                        color: isActive ? '#15803D' : '#374151',
                      }}
                      title={isCollapsed ? item.title : ''}
                    >
                      <Icon size={20} style={{ color: isActive ? '#16A34A' : '#4B5563' }} />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: isActive ? '#15803D' : '#1F2937' }}>{item.title}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{item.description}</p>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="bg-green-50 rounded-lg p-3" style={{ backgroundColor: '#F0FDF4' }}>
                <p className="text-xs font-medium text-green-900 mb-1" style={{ color: '#15803D' }}>💡 Tips</p>
                <p className="text-xs" style={{ color: '#16A34A' }}>
                  Gunakan Penilaian Hafalan untuk mencatat progress siswa
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
