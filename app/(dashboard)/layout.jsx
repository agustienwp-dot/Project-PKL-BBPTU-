'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  LayoutDashboard, 
  Milk, 
  Coffee,
  ShoppingBag, 
  Users, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldCheck,
  FileText,
  PackageCheck,
  Package,
  History,
  ClipboardList,
  Boxes,
  TrendingDown,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  BarChart3,
  Bell
} from 'lucide-react';
import api from '@/services/api';
import NotificationBell from '@/components/NotificationBell';

function isRouteAllowed(role, pathname) {
  if (!role || !pathname) return true;

  // Root and dashboard are accessible to all authenticated users
  if (pathname === '/dashboard' || pathname === '/') return true;
  if (pathname.startsWith('/profil')) return true;
  if (pathname.startsWith('/reports')) return true;

  if (role === 'SUPERADMIN') {
    const allowed = [
      '/dashboard',
      '/superadmin',
      '/kategori',
      '/reports',
      '/profil',
      '/produksi',
      '/pengemasan',
      '/riwayat-produksi',
      '/riwayat-pengemasan',
      '/pemasaran',
      '/pemasaran/rekapan-farm',
      '/pemasaran/penerimaan',
      '/pemasaran/penjualan',
      '/pemasaran/laporan',
      '/pemasaran/bast',
      '/pemasaran/dashboard',
      '/pemasaran/terima-susu-segar',
      '/pemasaran/terima-data',
      '/pemasaran/jual-fresh',
      '/pemasaran/jual-olahan',
      '/pemasaran/piutang'
    ];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_FARM') {
    const allowed = [
      '/dashboard',
      '/produksi',
      '/pengemasan',
      '/riwayat-produksi',
      '/riwayat-pengemasan',
      '/reports',
      '/profil'
    ];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_PEMASARAN') {
    const allowed = [
      '/dashboard',
      '/pemasaran',
      '/pemasaran/dashboard',
      '/pemasaran/terima-susu-segar',
      '/pemasaran/bast',
      '/pemasaran/terima-data',
      '/pemasaran/rekapan-farm',
      '/pemasaran/jual-fresh',
      '/pemasaran/jual-olahan',
      '/pemasaran/piutang',
      '/pemasaran/laporan',
      '/profil'
    ];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  return false;
}

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Close sidebar on route change or Escape
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchStatus = async () => {
        try {
          if (user.role === 'ADMIN_PEMASARAN' || user.role === 'SUPERADMIN') {
            const pkgRes = await api.get('/farm/packaging?status=MENUNGGU_PENERIMAAN').catch(() => ({ data: { success: false } }));
            if (pkgRes.data?.success) {
              setPendingCount(pkgRes.data.data.length);
            }
          }

          const notifRes = await api.get('/notifications?limit=1').catch(() => ({ data: { success: false } }));
          if (notifRes.data?.success) {
            setUnreadNotifCount(notifRes.data.unreadCount || 0);
          }
        } catch (e) {}
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading || !user) {
    return <LoadingSpinner text="Memverifikasi hak akses Sistem Management Produksi Susu..." />;
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return { label: 'SUPERADMIN', bg: 'bg-purple-500/20 text-purple-200 border-purple-400/30' };
      case 'ADMIN_FARM':
        return { label: 'ADMIN FARM PRODUKSI', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' };
      case 'ADMIN_PEMASARAN':
        return { label: 'ADMIN PEMASARAN', bg: 'bg-blue-500/20 text-blue-200 border-blue-400/30' };
      default:
        return { label: role || 'USER', bg: 'bg-slate-500/20 text-slate-200 border-slate-400/30' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  // Define Role-based Navigation Items (Exact Original Names & Paths)
  const getNavItems = () => {
    const role = user?.role;
    const notifBadge = unreadNotifCount > 0 ? (unreadNotifCount > 9 ? '9+ Stok' : `${unreadNotifCount} Baru`) : null;

    if (role === 'SUPERADMIN') {
      return [
        { label: 'Dashboard Main', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Manajemen System', path: '/superadmin', icon: ShieldCheck },
        { label: 'Dashboard Pemasaran', path: '/pemasaran/dashboard', icon: Boxes },
        { label: 'Terima Susu Segar', path: '/pemasaran/terima-susu-segar', icon: Milk },
        { label: 'Distribusi Susu Segar', path: '/pemasaran/bast', icon: FileText },
        { label: 'UHT', path: '/pemasaran/terima-data', icon: PackageCheck, badge: notifBadge },
        { label: 'Laporan & Rekapitulasi', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_FARM') {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Produksi Susu', path: '/produksi', icon: Milk },
        { label: 'Pengemasan', path: '/pengemasan', icon: Package },
        { label: 'Riwayat Produksi', path: '/riwayat-produksi', icon: History },
        { label: 'Riwayat Pengemasan', path: '/riwayat-pengemasan', icon: ClipboardList },
        { label: 'Laporan Produksi', path: '/reports', icon: FileText },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_PEMASARAN') {
      return [
        { label: 'Dashboard Pemasaran', path: '/pemasaran/dashboard', icon: LayoutDashboard },
        { label: 'Terima Susu Segar', path: '/pemasaran/terima-susu-segar', icon: Milk },
        { label: 'Distribusi Susu Segar', path: '/pemasaran/bast', icon: FileText },
        { label: 'UHT', path: '/pemasaran/terima-data', icon: PackageCheck, badge: notifBadge },
        { label: 'Laporan & Rekapitulasi', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    // Default fallback navigation
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Laporan', path: '/reports', icon: FileText },
      { label: 'Profil', path: '/profil', icon: User }
    ];
  };

  const navItems = getNavItems();
  const isAllowed = isRouteAllowed(user?.role, pathname);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex flex-col font-sans relative selection:bg-emerald-900 selection:text-white">
      
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR DENGAN TOMBOL MENU UNTUK BUKA SIDEBAR       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#F5F5F0]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Left Side: Toggle Menu Button with Arrow & Label */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs text-xs font-bold transition-all transform active:scale-95 cursor-pointer"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-4 h-4 text-emerald-900 transition-transform group-hover:scale-110" />
            <span className="font-extrabold text-slate-800">Menu</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Right Side: Notification Bell + User Profile Badge */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* User Profile Bubble */}
          <Link
            href="/profil"
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all text-xs font-bold text-slate-800"
            title="Lihat Profil"
          >
            <div className="w-7 h-7 rounded-full bg-[#1E3F20] text-white flex items-center justify-center font-black text-xs shadow-inner">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="font-extrabold text-slate-900 truncate max-w-[120px]">
              {user?.name || 'Pengguna'}
            </span>
          </Link>
        </div>
      </header>

      {/* Floating Edge Arrow Trigger di tepi kiri layar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-5 h-14 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-r-xl shadow-md transition-all hover:w-6 opacity-75 hover:opacity-100 group cursor-pointer"
          title="Buka Sidebar Navigasi"
        >
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-emerald-200" />
        </button>
      )}

      {/* ========================================================= */}
      {/* 2. OVERLAY BACKDROP                                        */}
      {/* ========================================================= */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in cursor-pointer"
        />
      )}

      {/* ========================================================= */}
      {/* 3. SIDEBAR NAVIGATION DRAWER (Slide In from Left)         */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E3F20] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header Area with Close Button */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white text-[#1E3F20] flex items-center justify-center shadow font-black text-base">
                <Milk className="w-5 h-5 text-[#1E3F20]" />
              </div>
              <div className="leading-tight">
                <h2 className="font-extrabold text-xs text-white uppercase tracking-wider">BBPTUHPT BATURRADEN</h2>
                <span className="text-[10px] text-emerald-200 font-semibold tracking-wide block uppercase">
                  SISTEM MANAGEMENT STOK
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 active:scale-95 cursor-pointer"
              title="Tutup Menu Navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Header Title */}
          <div className="px-5 pt-4 pb-1">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">
              MENU NAVIGASI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const basePath = item.path.split('?')[0];
              const isActive = pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F5F5F0] text-[#1E3F20] shadow-md font-bold'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-black tracking-wider uppercase shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Box & Logout */}
          <div className="p-4 border-t border-white/10 bg-[#16331a]">
            <div className="p-3 bg-[#102613] rounded-2xl border border-white/10 mb-3 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white truncate">{user?.name || 'Pengguna'}</p>
                  <p className="text-[10px] text-emerald-300 truncate">{user?.email}</p>
                </div>
              </div>
              <div className={`inline-block text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider border ${roleInfo.bg}`}>
                {roleInfo.label}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-200 bg-[#2b1717] hover:bg-[#3d1e1e] border border-rose-800/40 transition-colors active:scale-95 shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 4. MAIN CONTENT AREA                                      */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
        {isAllowed ? (
          children
        ) : (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-2xl shadow-inner">
              403
            </div>
            <h2 className="text-2xl font-black text-slate-900">403 - Akses Ditolak</h2>
            <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow transition-all transform hover:-translate-y-0.5"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
