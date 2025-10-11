"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard,
  ClipboardCheck,
  UserCheck,
  FileText,
  Megaphone,
  BookOpen,
  User,
  LogOut,
  Menu,
  Bell
} from "lucide-react";

export default function LayoutGuruSimple({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Default user data
      setUser({
        name: "Ustadz Muhammad",
        role: "guru",
        avatar: null
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tahfidz App</h1>
                <p className="text-sm text-gray-500">Dashboard Guru</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/guru/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/guru/penilaian-kelas"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              >
                <ClipboardCheck className="w-4 h-4" />
                Penilaian
              </Link>
              <Link
                href="/guru/presensi"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              >
                <UserCheck className="w-4 h-4" />
                Presensi
              </Link>
              <Link
                href="/guru/laporan"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4" />
                Laporan
              </Link>
            </nav>

            {/* Right Side - Notifications & User */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Info & Dropdown */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {getInitials(user?.name || 'U')}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'guru'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}