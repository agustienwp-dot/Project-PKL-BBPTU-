'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Milk,
  ShoppingBag,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  Package,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Login Form State (Email / Username & Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State (Nama, Email, Password & Role)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('ADMIN_FARM');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modal Konfirmasi Pendaftaran
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredData, setRegisteredData] = useState(null); // { token, user, name, email }

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Email/Username atau password tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });

      if (res.data.success) {
        setRegisteredData({
          token: res.data.token,
          user: res.data.user,
          name: regName,
          email: regEmail,
        });
        setShowConfirmModal(true);
      } else {
        setError(res.data.message || 'Gagal mendaftar akun baru.');
      }
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || 'Gagal mendaftar akun baru.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // User Memilih: "Ya, Langsung Masuk"
  const handleConfirmAutoLogin = async () => {
    setLoading(true);
    try {
      // Simpan token & user di localStorage
      if (registeredData?.token && registeredData?.user) {
        localStorage.setItem('token', registeredData.token);
        localStorage.setItem('user', JSON.stringify(registeredData.user));
      }

      // Melakukan login via context jika data email & password ada
      if (regEmail && regPassword) {
        try {
          await login(regEmail, regPassword);
        } catch (e) {
          console.warn('Context login fallback used:', e);
        }
      }

      setShowConfirmModal(false);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Auto-login redirect error:', err);
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  };

  // User Memilih: "Tidak, Nanti Saja"
  const handleDeclinedAutoLogin = () => {
    const createdEmail = registeredData?.email || '';
    setShowConfirmModal(false);
    setRegisteredData(null);
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    
    // Switch ke tab Login & isi email/username otomatis
    setMode('login');
    setEmail(createdEmail);
    setPassword('');
    setSuccess(`Akun "${createdEmail}" berhasil didaftarkan. Silakan login manual.`);
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(quickEmail, quickPassword);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Quick login error:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal login dengan akun quick login.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3F20]/5 via-transparent to-emerald-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1E3F20]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#1E3F20] text-white shadow-xl mb-1">
            <Milk className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] tracking-tight">STOK SUSU</h1>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest mt-0.5">Sistem Manajemen Stok Susu BBPTU</p>
          </div>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-[#1E3F20] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-[#1E3F20] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* FORM 1: LOGIN MANUAL */}
        {mode === 'login' && (
          <div className="space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 text-center font-medium">
                Masukkan email/username dan password akun Anda untuk masuk.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ketikkan email atau username Anda..."
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketikkan password Anda..."
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Shortcuts */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Shortcut Quick Login (Demo Role):
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('superadmin@susu.com', 'admin123')}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-all active:scale-95 group shadow-sm disabled:opacity-50"
                >
                  <span className="text-[10px] font-bold text-purple-600 block uppercase">SUPERADMIN</span>
                  <span className="text-xs font-black text-purple-950 block group-hover:underline">⚡ Superadmin</span>
                  <span className="text-[10px] text-purple-700/80 block mt-0.5">superadmin@susu.com</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('farm@susu.com', 'farm123')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all active:scale-95 group shadow-sm disabled:opacity-50"
                >
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">ADMIN FARM</span>
                  <span className="text-xs font-black text-emerald-950 block group-hover:underline">⚡ Farm Produksi</span>
                  <span className="text-[10px] text-emerald-700/80 block mt-0.5">farm@susu.com</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('pengemasan@susu.com', 'pengemasan123')}
                  className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition-all active:scale-95 group shadow-sm disabled:opacity-50"
                >
                  <span className="text-[10px] font-bold text-indigo-600 block uppercase">ADMIN PENGEMASAN</span>
                  <span className="text-xs font-black text-indigo-950 block group-hover:underline">⚡ Pengemasan</span>
                  <span className="text-[10px] text-indigo-700/80 block mt-0.5">pengemasan@susu.com</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('pemasaran@susu.com', 'pemasaran123')}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all active:scale-95 group shadow-sm disabled:opacity-50"
                >
                  <span className="text-[10px] font-bold text-blue-600 block uppercase">ADMIN PEMASARAN</span>
                  <span className="text-xs font-black text-blue-950 block group-hover:underline">⚡ Pemasaran & Stok</span>
                  <span className="text-[10px] text-blue-700/80 block mt-0.5">pemasaran@susu.com</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM 2: REGISTRASI AKUN BARU MANUAL (DENGAN EMAIL) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 text-center font-medium">
              Isi data di bawah ini untuk mendaftarkan akun baru.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Contoh: admin.farm@bbptu.go.id"
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-2 focus:ring-[#1E3F20]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  title={showRegPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Role Hak Akses
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('ADMIN_FARM')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    regRole === 'ADMIN_FARM'
                      ? 'border-[#1E3F20] bg-[#1E3F20]/10 text-[#1E3F20]'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Milk className="w-4 h-4 text-emerald-700" />
                  <span>Admin Farm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('ADMIN_PENGEMASAN')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    regRole === 'ADMIN_PENGEMASAN'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4 text-indigo-700" />
                  <span>Pengemasan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('ADMIN_PEMASARAN')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    regRole === 'ADMIN_PEMASARAN'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-blue-700" />
                  <span>Pemasaran</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('SUPERADMIN')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    regRole === 'SUPERADMIN'
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Superadmin</span>
                </button>
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
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun Baru</span>
                  <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* MODAL KONFIRMASI PEMILIHAN AUTO-LOGIN / TIDAK */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800">Akun Berhasil Didaftarkan!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Akun atas nama <span className="font-bold text-[#1E3F20]">"{registeredData?.name}"</span> (<span className="font-semibold">{registeredData?.email}</span>) dengan role <span className="font-bold">{registeredData?.user?.role}</span> telah sukses dibuat.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
              Apakah Anda ingin langsung masuk ke Dashboard sekarang?
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmAutoLogin}
                className="w-full py-3 px-4 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Masuk ke Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Ya, Langsung Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleDeclinedAutoLogin}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-xs disabled:opacity-50"
              >
                Tidak, Nanti Saja (Kembali ke Login)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
