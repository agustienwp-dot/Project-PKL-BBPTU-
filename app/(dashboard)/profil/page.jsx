'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Mail, Calendar, CheckCircle2, Milk, Building2 } from 'lucide-react';

export default function ProfilPage() {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return { label: 'SUPERADMIN PENGELOLA', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'ADMIN_FARM':
        return { label: 'ADMIN FARM PRODUKSI', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'ADMIN_PENGEMASAN':
        return { label: 'ADMIN PENGEMASAN', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'ADMIN_PEMASARAN':
        return { label: 'ADMIN PEMASARAN & STOK', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: role || 'USER', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
          <User className="w-4 h-4" />
          <span>Pengaturan Akun</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Profil Saya</h1>
        <p className="text-xs text-slate-500 font-medium">Informasi data diri dan wewenang akun Admin Farm Produksi.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
          <div className="w-20 h-20 rounded-3xl bg-[#1E3F20] text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            <Milk className="w-10 h-10 text-emerald-300" />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{user?.name || 'Admin Farm Produksi'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <div className={`inline-block text-[10px] px-3 py-1 rounded-full font-black border ${roleInfo.bg}`}>
              {roleInfo.label}
            </div>
          </div>
        </div>

        {/* Account Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Tipe Pengguna</span>
            <p className="font-black text-slate-800 text-sm">Admin Farm Produksi</p>
            <p className="text-[11px] text-slate-500">Mencatat produksi perah susu & pengemasan</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Sistem Hak Akses</span>
            <p className="font-black text-slate-800 text-sm">POV Farm Produksi (Sapi & Kambing)</p>
            <p className="text-[11px] text-slate-500">Akses penuh ke modul perah & kemasan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
