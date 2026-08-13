'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  LayoutDashboard, 
  Boxes, 
  Building2, 
  CheckCircle2, 
  ShoppingCart, 
  BadgeCheck, 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingSpinner text="Memverifikasi sesi pengguna..." />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Data Hewan', path: '/animals', icon: Boxes },
    { label: 'Kandang', path: '/cages', icon: Building2 },
    { label: 'Stok Tersedia', path: '/available', icon: CheckCircle2 },
    { label: 'Penjualan', path: '/sales', icon: ShoppingCart },
    { label: 'Hewan Terjual', path: '/sold', icon: BadgeCheck },
    { label: 'Pembeli', path: '/buyers', icon: Users },
    { label: 'Laporan', path: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1E3F20] text-white border-b border-[#2b592e] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white">
            <Boxes className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-white">FarmStock Pro</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3F20] text-white border-r border-[#2b592e] flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-xl bg-white text-[#1E3F20] flex items-center justify-center shadow-lg font-black">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white leading-tight">FarmStock Pro</h2>
              <span className="text-[11px] text-emerald-100 font-semibold tracking-wide">Next.js Fullstack</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F5F5F0] text-[#1E3F20] shadow-md font-bold'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout Box */}
          <div className="p-4 border-t border-white/10 bg-[#16331a]">
            <div className="flex items-center gap-3 p-2 bg-[#102613] rounded-xl border border-white/10 mb-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Pengguna'}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span className="uppercase font-semibold tracking-wider">{user?.role || 'STAFF'}</span>
                </div>
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
        {/* Desktop Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#1E3F20]">Sistem Manajemen Ternak & Penjualan (Next.js Fullstack)</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#F5F5F0] px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#1E3F20]">
              <span className="w-2 h-2 rounded-full bg-[#1E3F20] animate-pulse"></span>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
