'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BBPTUHPTLogo } from '@/components/Logos';
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
import NotificationDropdown from '@/components/NotificationDropdown';

function isRouteAllowed(role, pathname) {
  if (!role || !pathname) return true;

  // Root and dashboard are accessible to all authenticated users
  if (pathname === '/dashboard' || pathname === '/') return true;
  if (pathname.startsWith('/profil')) return true;
  if (pathname.startsWith('/reports')) return true;
  if (pathname.startsWith('/berita-acara')) return true;

  if (role === 'SUPERADMIN') {
    const allowed = ['/dashboard', '/superadmin', '/kategori', '/reports', '/profil', '/produksi', '/berita-acara', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/pemasaran', '/pemasaran/penerimaan', '/pemasaran/penjualan', '/pemasaran/laporan'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_FARM') {
    const allowed = ['/dashboard', '/produksi', '/berita-acara', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/reports', '/profil'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_PEMASARAN') {
    const allowed = ['/dashboard', '/pemasaran', '/berita-acara', '/pemasaran/penerimaan', '/pemasaran/penjualan', '/pemasaran/laporan', '/produksi', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/reports', '/profil'];
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

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'ADMIN_PEMASARAN' || user.role === 'SUPERADMIN')) {
      const fetchPending = async () => {
        try {
          const res = await api.get('/farm/packaging?status=MENUNGGU_PENERIMAAN');
          if (res.data.success) {
            setPendingCount(res.data.data.length);
          }
        } catch (e) {}
      };
      fetchPending();
      const interval = setInterval(fetchPending, 15000);
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

  // Define Role-based Navigation Items
  const getNavItems = () => {
    const role = user?.role;

    if (role === 'SUPERADMIN') {
      return [
        { label: 'Dashboard Main', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Manajemen System', path: '/superadmin', icon: ShieldCheck },
        { label: 'Berita Acara', path: '/berita-acara', icon: ClipboardList },
        { label: 'Dashboard Pemasaran', path: '/pemasaran', icon: Boxes },
        { label: 'Notifikasi Stok', path: '/pemasaran/penerimaan', icon: Bell, badge: pendingCount > 0 ? `${pendingCount}` : null },
        { label: 'Penjualan Produk', path: '/pemasaran/penjualan', icon: ShoppingCart },
        { label: 'Laporan Penjualan', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_FARM') {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Produksi Susu', path: '/produksi', icon: Milk },
        { label: 'Berita Acara', path: '/berita-acara', icon: ClipboardList },
        { label: 'Laporan', path: '/reports', icon: FileText },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    if (role === 'ADMIN_PEMASARAN') {
      return [
        { label: 'Dashboard Pemasaran', path: '/pemasaran', icon: LayoutDashboard },
        { label: 'Berita Acara Masuk', path: '/berita-acara', icon: ClipboardList },
        { label: 'Notifikasi Stok', path: '/pemasaran/penerimaan', icon: Bell, badge: pendingCount > 0 ? `${pendingCount}` : null },
        { label: 'Penjualan', path: '/pemasaran/penjualan', icon: ShoppingCart },
        { label: 'Laporan Penjualan', path: '/pemasaran/laporan', icon: BarChart3 },
        { label: 'Stok & Produk Keluar', path: '/pemasaran?view=stok', icon: Boxes },
        { label: 'Profil', path: '/profil', icon: User }
      ];
    }

    // Default fallback navigation
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Berita Acara', path: '/berita-acara', icon: ClipboardList },
      { label: 'Laporan', path: '/reports', icon: FileText },
      { label: 'Profil', path: '/profil', icon: User }
    ];
  };

  const navItems = getNavItems();
  const isAllowed = isRouteAllowed(user?.role, pathname);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F5F0] text-slate-800 flex flex-col font-sans relative">
      
      {/* TOP HEADER BAR - CLEAN FULL WIDTH HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-3 md:px-6 md:py-3.5 flex items-center justify-between shadow-xs shrink-0 z-30 print:hidden">
        {/* Left: Hamburger Menu Button ☰ Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 text-slate-800 font-black text-sm flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-slate-800 shrink-0" />
            <span className="text-sm font-black text-slate-800 tracking-wide">Menu</span>
          </button>
        </div>

        {/* Right: Notification Dropdown & User Name Badge with Person Icon */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />

          <div className="px-4 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-slate-800 text-sm font-extrabold flex items-center gap-2 shadow-xs">
            <User className="w-4.5 h-4.5 text-slate-700 shrink-0" />
            <span className="text-sm font-black text-slate-800">{user?.name || 'Admin Farm'}</span>
          </div>
        </div>
      </header>

      {/* BODY AREA - FULL WIDTH DASHBOARD CONTENT */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#F4F7FB] w-full">
        
        {/* BACKDROP OVERLAY (Dark 30% overlay with subtle blur) */}
        <div 
          className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity duration-250 ease-in-out ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* OVERLAY NAVIGATION DRAWER */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[82vw] sm:w-72 md:w-80 bg-[#1E3F20] text-white border-r border-emerald-900/40 rounded-r-3xl shadow-2xl flex flex-col justify-between transition-transform duration-250 ease-in-out print:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full justify-between">
            {/* Top section: Header & Navigation Links */}
            <div className="flex flex-col min-h-0 flex-1">
              {/* Drawer Header: Logo, Title & Close Button "×" */}
              <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <BBPTUHPTLogo className="w-9 h-9 shrink-0" />
                  <div>
                    <h2 className="font-extrabold text-xs sm:text-sm text-white leading-tight tracking-wide">
                      BBPTUHPT BATURRADEN
                    </h2>
                    <span className="text-[10px] text-emerald-200 font-semibold tracking-wide block uppercase mt-0.5">
                      Sistem Management Stok
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu Title & Links */}
              <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
                <div className="px-3 mb-3 text-[11px] font-black uppercase tracking-widest text-emerald-200/70">
                  MENU NAVIGASI
                </div>
                
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const basePath = item.path.split('?')[0];
                    const isActive = pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath));
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all ${
                          isActive
                            ? 'bg-[#F5F5F0] text-[#1E3F20] shadow-md font-black'
                            : 'text-emerald-100 hover:text-white hover:bg-white/10 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className="w-5 h-5 shrink-0" />
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

            {/* Drawer Bottom Section: User Profile & Logout */}
            <div className="p-4 border-t border-white/10 space-y-2.5 shrink-0 bg-[#173219] rounded-br-3xl">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white/10 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-white truncate">{user?.name || 'Pengguna'}</span>
                  <span className="text-[10px] text-emerald-200 font-bold truncate opacity-90">{roleInfo.label}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-300 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA - FULL WIDTH & FIXED VIEWPORT */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden p-4 md:p-6 bg-[#F4F7FB] w-full">
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
                href="/dashboard"
                className="px-5 py-2.5 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow transition-all transform hover:-translate-y-0.5"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
