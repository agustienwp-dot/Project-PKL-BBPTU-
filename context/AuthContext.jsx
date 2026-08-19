'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login gagal');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdminFarm = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';
  const isAdminPemasaran = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isSuperAdmin,
        isAdminFarm,
        isAdminPemasaran,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
