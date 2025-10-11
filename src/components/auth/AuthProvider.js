"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    // Simulate API call
    const users = {
      'siswa@demo.com': { 
        id: 1, 
        name: 'Ahmad Zaki', 
        email: 'siswa@demo.com', 
        role: 'siswa',
        class: 'X-A',
        avatar: null
      },
      'guru@demo.com': { 
        id: 2, 
        name: 'Ustadz Muhammad', 
        email: 'guru@demo.com', 
        role: 'guru',
        subject: 'Tahfidz Al-Qur\'an',
        avatar: null
      },
      'orangtua@demo.com': { 
        id: 3, 
        name: 'Bapak Ahmad', 
        email: 'orangtua@demo.com', 
        role: 'orangtua',
        children: ['Ahmad Zaki'],
        avatar: null
      },
      'admin@demo.com': { 
        id: 4, 
        name: 'Administrator', 
        email: 'admin@demo.com', 
        role: 'admin',
        permissions: 'all',
        avatar: null
      }
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users[email];
        if (user && password === 'password123' && user.role === role) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Email, password, atau role tidak valid'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;