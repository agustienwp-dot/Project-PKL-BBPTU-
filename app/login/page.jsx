'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2, Milk, ShoppingBag, Package } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('superadmin@susu.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Email atau password tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3F20]/5 via-transparent to-emerald-500/10 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#1E3F20] text-white shadow-xl mb-1">
            <Milk className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] tracking-tight">STOK SUSU</h1>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest mt-0.5">Sistem Management Stok Susu</p>
          </div>
          <p className="text-xs text-slate-500">Masuk ke sistem sesuai dengan Role & Hak Akses akun Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email / Username Pengguna</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@susu.com atau username"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memverifikasi Hak Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard Stok Susu</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Role Selectors for 4 Roles */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Role Pengujian (4 Role):</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            
            {/* Superadmin */}
            <button
              type="button"
              onClick={() => { setEmail('superadmin@susu.com'); setPassword('admin123'); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span className="text-[10px] uppercase tracking-wide">1. Superadmin</span>
            </button>

            {/* Admin Farm */}
            <button
              type="button"
              onClick={() => { setEmail('farm@susu.com'); setPassword('farm123'); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors flex flex-col items-center gap-1"
            >
              <Milk className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] uppercase tracking-wide">2. Admin Farm</span>
            </button>

            {/* Admin Pengemasan */}
            <button
              type="button"
              onClick={() => { setEmail('pengemasan@susu.com'); setPassword('pengemasan123'); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors flex flex-col items-center gap-1"
            >
              <Package className="w-4 h-4 text-amber-700" />
              <span className="text-[10px] uppercase tracking-wide">3. Pengemasan</span>
            </button>

            {/* Admin Pemasaran */}
            <button
              type="button"
              onClick={() => { setEmail('pemasaran@susu.com'); setPassword('pemasaran123'); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors flex flex-col items-center gap-1"
            >
              <ShoppingBag className="w-4 h-4 text-blue-700" />
              <span className="text-[10px] uppercase tracking-wide">4. Pemasaran</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
