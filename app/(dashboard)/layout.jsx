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

function isRouteAllowed(role, pathname) {
  if (!role || !pathname) return true;

  // Root and dashboard are accessible to all authenticated users
  if (pathname === '/dashboard' || pathname === '/') return true;
  if (pathname.startsWith('/profil')) return true;
  if (pathname.startsWith('/reports')) return true;

  if (role === 'SUPERADMIN') {
    const allowed = ['/dashboard', '/superadmin', '/kategori', '/reports', '/profil', '/produksi', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/pemasaran', '/pemasaran/penerimaan', '/pemasaran/penjualan', '/pemasaran/laporan'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_FARM') {
    const allowed = ['/dashboard', '/produksi', '/pengemasan', '/riwayat-produksi', '/riwayat-pengemasan', '/reports', '/profil'];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  }

  if (role === 'ADMIN_PEMASARAN') {
    const allowed = [
      '/dashboard',
      '/pemasaran',
      '/pemasaran/dashboard',
      '/pemasaran/terima-data',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        { label: 'Dashboard Pemasaran', path: '/pemasaran/dashboard', icon: Boxes },
        { label: 'Terima Data', path: '/pemasaran/terima-data', icon: PackageCheck },
        { label: 'Jual Fresh', path: '/pemasaran/jual-fresh', icon: Milk },
        { label: 'Jual Olahan', path: '/pemasaran/jual-olahan', icon: Package },
        { label: 'Kelola Piutang', path: '/pemasaran/piutang', icon: ShoppingCart },
        { label: 'Laporan Penjualan', path: '/pemasaran/laporan', icon: BarChart3 },
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
        { label: 'Terima Data (Farm & Packaging)', path: '/pemasaran/terima-data', icon: PackageCheck },
        { label: 'Kelola Piutang & Pelunasan', path: '/pemasaran/piutang', icon: ShoppingCart },
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
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1E3F20] text-white border-b border-[#2b592e] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white text-[#1E3F20] flex items-center justify-center font-black">
            <Milk className="w-5 h-5 text-[#1E3F20]" />
          </div>
          <span className="font-bold text-base text-white">STOK SUSU</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3F20] text-white border-r border-[#2b592e] flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-xl bg-white text-[#1E3F20] flex items-center justify-center shadow-lg font-black text-lg">
              <Milk className="w-6 h-6 text-[#1E3F20]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white leading-tight">STOK SUSU</h2>
              <span className="text-[10px] text-emerald-200 font-semibold tracking-wide block uppercase">Sistem Management Stok</span>
            </div>
          </div>

          {/* Navigation Links Directly */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const basePath = item.path.split('?')[0];
              const isActive = pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F5F5F0] text-[#1E3F20] shadow-md font-bold'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/20 text-white font-bold tracking-wider uppercase shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Box & Logout */}
          <div className="p-4 border-t border-white/10 bg-[#16331a]">
            <div className="p-3 bg-[#102613] rounded-xl border border-white/10 mb-3 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Pengguna'}</p>
              </div>
              <div className={`inline-block text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${roleInfo.bg}`}>
                {roleInfo.label}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F5F5F0]">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#1E3F20] animate-ping"></span>
            <h1 className="text-sm font-black text-[#1E3F20] tracking-wide">
              SISTEM MANAGEMENT STOK SUSU — Susu Segar & Susu Olahan
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F5F5F0] px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#1E3F20]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Content Viewport / Protected Access View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
