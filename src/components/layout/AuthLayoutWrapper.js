"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, Topbar, BottomNav } from "@/components/layout/Shell";

export default function AuthLayoutWrapper({ children }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  // Pages that should be full screen without sidebar
  const fullScreenPages = ['/', '/login', '/register', '/dashboard'];
  
  // If user is siswa or guru, all pages should be full screen
  const shouldShowSidebar = !fullScreenPages.includes(pathname) && user?.role !== 'siswa' && user?.role !== 'guru';

  if (!shouldShowSidebar) {
    return children;
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}