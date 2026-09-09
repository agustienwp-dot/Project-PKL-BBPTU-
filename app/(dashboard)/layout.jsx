'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BBPTUHPTLogo } from '@/components/Logos';
import NotificationBell from '@/components/NotificationBell';
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
  FileCheck,
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
  Bell,
  MoreVertical,
  Truck
} from 'lucide-react';
import api from '@/services/api';
import NotificationDropdown from '@/components/NotificationDropdown';

function isRouteAllowed(role, pathname) {
  if (!role || !pathname) return true;

  // Root and dashboard are accessible to all authenticated users
  if (pathname.startsWith('/profil')) return true;

  if (role === 'SUPERADMIN') {

    const allowed = ['/dashboard',
      '/superadmin',
      '/reports',
      '/profil',
      '/produksi',
      '/pengemasan',
      '/riwayat-produksi',
      '/riwayat-pengemasan',
      '/pemasaran',
      '/pemasaran/dashboard',
      '/pemasaran/terima-susu-segar',
      '/pemasaran/bast',
      '/pemasaran/berita-acara',
      '/pemasaran/terima-data',
      '/pemasaran/laporan', '/uht/berita-acara', '/uht/pengemasan', '/uht/dashboard', '/susu-farm/dashboard', '/superadmin', '/kategori', '/susu-farm/reports', '/profil', '/susu-farm/produksi', '/susu-farm/berita-acara', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/pemasaran', '/pemasaran/penerimaan', '/pemasaran/penjualan', '/pemasaran/laporan'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_FARM') {
    const allowed = ['/susu-farm/dashboard', '/susu-farm/produksi', '/susu-farm/berita-acara', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/susu-farm/reports', '/profil'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_PEMASARAN') {
    const allowed = [
      '/dashboard',
      '/pemasaran',
      '/pemasaran/dashboard',
      '/pemasaran/terima-susu-segar',
      '/pemasaran/bast',
      '/pemasaran/berita-acara',
      '/pemasaran/terima-data',
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
  const [menuDotsOpen, setMenuDotsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  ;
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Close sidebar and menu dots on route change or Escape
  useEffect(() => {
    setSidebarOpen(false);
    setMenuDotsOpen(false);
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
          if (user.role === 'ADMIN_PEMASARAN' || user.role === 'SUPERADMIN' || user.role === 'ADMIN_PENGEMASAN') {
            const pkgRes = await api.get('/farm/packaging?status=MENUNGGU_PENERIMAAN').catch(() => ({ data: { success: false } }));
            if (pkgRes.data?.success) {
              setPendingCount(pkgRes.data.data.length);
            }
          }

          const notifRes = await api.get('/notifications?limit=1').catch(() => ({ data: { success: false } }));
          if (notifRes.data?.success) {
            setUnreadNotifCount(notifRes.data.unreadCount || 0);
          }
          const reqRes = await api.get('/susu/request?status=MENUNGGU_PERSETUJUAN');
          if (reqRes.data.success) {
            setPendingRequestCount(reqRes.data.data.length);
          }
        } catch (e) { }
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
      case 'ADMIN_PENGEMASAN':
        return { label: 'DIVISI UHT / PENGOLAHAN', bg: 'bg-amber-500/20 text-amber-200 border-amber-400/30' };
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
        { label: 'Dashboard Main', path: '/uht/dashboard', icon: LayoutDashboard },
        { label: 'Manajemen System', path: '/superadmin', icon: ShieldCheck },
        { label: 'Dashboard Pemasaran', path: '/pemasaran/dashboard', icon: Boxes },
        { label: 'Terima Susu Segar', path: '/pemasaran/terima-susu-segar', icon: Milk },
        { label: 'Distribusi Susu Segar', path: '/pemasaran/bast', icon: FileText },
        { label: 'Berita Acara', path: '/pemasaran/berita-acara', icon: FileCheck },
        { label: 'UHT', path: '/pemasaran/terima-data', icon: PackageCheck, badge: notifBadge },
        { label: 'Laporan & Rekapitulasi', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_FARM') {
      return [
        { label: 'Dashboard', path: '/susu-farm/dashboard', icon: LayoutDashboard },
        { label: 'Produksi Susu', path: '/susu-farm/produksi', icon: Milk },
        { label: 'Berita Acara', path: '/susu-farm/berita-acara', icon: ClipboardList },
        { label: 'Laporan', path: '/susu-farm/reports', icon: FileText },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_PEMASARAN') {
      return [
        { label: 'Dashboard Pemasaran', path: '/pemasaran/dashboard', icon: LayoutDashboard },
        { label: 'Terima Susu Segar', path: '/pemasaran/terima-susu-segar', icon: Milk },
        { label: 'Distribusi Susu Segar', path: '/pemasaran/bast', icon: FileText },
        { label: 'Berita Acara', path: '/pemasaran/berita-acara', icon: FileCheck },
        { label: 'UHT', path: '/pemasaran/terima-data', icon: PackageCheck, badge: notifBadge },
        { label: 'Laporan & Rekapitulasi', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_PENGEMASAN') {
      return [
        { label: 'Dashboard', path: '/uht/dashboard', icon: LayoutDashboard, section: 'DASHBOARD' },
        { label: 'Request Susu', path: '/uht/request-susu', icon: Milk, section: 'PENGOLAHAN' },
        { label: 'Input Hasil Pengolahan', path: '/uht/pengemasan', icon: Package, section: 'PENGOLAHAN' },
        { label: 'Sisa Stok Bahan', path: '/uht/stok-bahan', icon: Boxes, section: 'PENGOLAHAN' },
        { label: 'Berita Acara Olahan', path: '/uht/berita-acara', icon: FileCheck, section: 'PENGOLAHAN' },
        { label: 'Laporan Pengolahan', path: '/uht/reports', icon: FileText, section: 'PENGOLAHAN' },
        { label: 'Profil', path: '/profil', icon: User, section: 'LAINNYA' }
      ];
    }

    // Default fallback navigation
    return [
      { label: 'Dashboard', path: '/uht/dashboard', icon: LayoutDashboard },
      { label: 'Berita Acara', path: '/uht/berita-acara', icon: ClipboardList },
      { label: 'Laporan', path: '/reports', icon: FileText },
      { label: 'Profil', path: '/profil', icon: User }
    ];
  };

  const navItems = getNavItems();
  const isAllowed = isRouteAllowed(user?.role, pathname);

  return (
    <div className="h-screen bg-[#F5F5F0] text-slate-800 flex flex-col font-sans relative overflow-hidden">

      {/* TOP NAVBAR HEADER MATCHING DESIGN */}
      <header className="shrink-0 sticky top-0 z-30 bg-white border-b border-slate-200/70 shadow-2xs px-4 md:px-8 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center">
          {/* Menu Button Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 text-slate-800" />
            <span>Menu</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Icon */}
          <NotificationBell user={user} />

          {/* User Profile Pill */}
          <Link
            href="/profil"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-700" />
            <span className="truncate max-w-[140px] sm:max-w-none">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </Link>
        </div>
      </header>

      {/* OVERLAY BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200 print:hidden"
        />
      )}

      {/* SLIDE-OVER SIDEBAR DRAWER WITH ROUNDED CORNERS */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E3F20] text-white border-r border-[#2b592e] rounded-r-[32px] sm:rounded-r-[36px] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl print:hidden overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Top part: Header and Nav */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <BBPTUHPTLogo className="w-10 h-10 shrink-0" />
                <div>
                  <h2 className="font-extrabold text-xs text-white leading-tight tracking-wide">BBPTUHPT BATURRADEN</h2>
                  <span className="text-[9px] text-emerald-200 font-semibold tracking-wide block uppercase mt-0.5">Sistem Management Stok</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const basePath = item.path.split('?')[0];
                  const isExactMatch = pathname === basePath;
                  const hasMoreSpecificMatch = navItems.some(
                    (other) =>
                      other.path !== item.path &&
                      pathname.startsWith(other.path.split('?')[0]) &&
                      other.path.split('?')[0].length > basePath.length
                  );
                  const isActive = isExactMatch || (basePath !== '/uht/dashboard' && pathname.startsWith(basePath + '/') && !hasMoreSpecificMatch);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${isActive
                        ? 'bg-[#F5F5F0] text-[#1E3F20] shadow-md font-bold'
                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 font-extrabold tracking-wider uppercase shrink-0 border border-emerald-400/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-extrabold text-rose-200 hover:text-rose-100 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-300 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA - FULL WIDTH & SCROLLABLE VIEWPORT */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto p-4 md:p-6 bg-[#F4F7FB] w-full">
        {isAllowed ? (
          children
        ) : (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-2xl shadow-inner">
              403
            </div>
            <h2 className="text-2xl font-black text-slate-900">403 - Akses Ditolak</h2>
            <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <Link
              href={user?.role === 'ADMIN_FARM' ? '/susu-farm/dashboard' : '/uht/dashboard'}
              className="px-5 py-2.5 bg-[#1E3F20] text-white font-bold text-xs rounded-xl shadow hover:bg-[#16331a] transition-all"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
