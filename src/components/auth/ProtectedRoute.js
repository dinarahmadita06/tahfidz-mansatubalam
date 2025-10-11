"use client";
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'siswa':
            router.push('/dashboard');
            break;
          case 'guru':
            router.push('/guru/dashboard');
            break;
          case 'orangtua':
            router.push('/orangtua/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/login');
        }
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null; // Will redirect to appropriate dashboard
  }

  return children;
};

export default ProtectedRoute;