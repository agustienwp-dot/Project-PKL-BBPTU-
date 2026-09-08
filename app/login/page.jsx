'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { KementanLogo, BBPTUHPTLogo } from '@/components/Logos';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Milk,
  Package,
  ShoppingBag,
  UserPlus,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Tab Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('ADMIN_FARM');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modal Auto-Login
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  // Developer Quick Test Roles Collapsible State
  const [showQuickRoles, setShowQuickRoles] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = '/susu-farm/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Email / Username atau kata sandi tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      setError('Kata sandi pendaftaran wajib minimal 8 karakter.');
      return;
    }

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

  const handleConfirmAutoLogin = async () => {
    setLoading(true);
    try {
      if (registeredData?.token && registeredData?.user) {
        localStorage.setItem('token', registeredData.token);
        localStorage.setItem('user', JSON.stringify(registeredData.user));
      }
      if (regEmail && regPassword) {
        try {
          await login(regEmail, regPassword);
        } catch (e) {
          console.warn('Fallback login used:', e);
        }
      }
      setShowConfirmModal(false);
      window.location.href = '/susu-farm/dashboard';
    } catch (err) {
      window.location.href = '/susu-farm/dashboard';
    } finally {
      setLoading(false);
    }
  };

  const handleDeclinedAutoLogin = () => {
    const createdEmail = registeredData?.email || '';
    setShowConfirmModal(false);
    setRegisteredData(null);
    setRegName('');
    setRegEmail('');
    setRegPassword('');

    setMode('login');
    setEmail(createdEmail);
    setPassword('');
    setSuccess(`Akun "${createdEmail}" berhasil didaftarkan. Silakan login manual.`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex items-center justify-center p-4 selection:bg-emerald-200">
      {/* Main Login Card with Blue Bar Accent on Left Edge */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-9 shadow-xl relative border border-slate-200/80 overflow-hidden">
        {/* Left Edge Blue Bar Accent (Matching Screenshot 2) */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#0091FF]" />

        {/* Top Header Section with 2 Official Logos */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <KementanLogo className="w-12 h-12" />
            <BBPTUHPTLogo className="w-12 h-12" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang di BBPTUHPT!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Masuk kembali ke akun Anda.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. FORM LOGIN (Exact Visual Match to Screenshot 2) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            {/* Field 1: Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Email
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white border-2 border-transparent focus:border-[#5c7c3e]/40 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Field 2: Kata Sandi */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white border-2 border-transparent focus:border-[#5c7c3e]/40 rounded-xl py-3 pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row: Ingat Saya & Lupa Kata Sandi */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#5c7c3e] focus:ring-[#5c7c3e]/30"
                />
                <span>Ingat Saya</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert('Silakan hubungi Superadmin atau Tim IT BBPTUHPT Baturraden untuk reset kata sandi Anda.')
                }
                className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Green Olive Button (Masuk) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#5c7c3e] hover:bg-[#4c6932] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 text-base mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>

            {/* Register Account Link */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccess('');
                }}
                className="font-bold text-[#5c7c3e] hover:underline cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </p>
          </form>
        )}

        {/* 2. FORM REGISTER (Optional Mode) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white border-2 border-transparent focus:border-[#5c7c3e]/40 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Email
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="admin.farm@bbptu.go.id"
                className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white border-2 border-transparent focus:border-[#5c7c3e]/40 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white border-2 border-transparent focus:border-[#5c7c3e]/40 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirement Checklist Box */}
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] space-y-1">
                <p className="font-semibold text-slate-600">Syarat Kata Sandi:</p>
                <div className="space-y-0.5 font-medium">
                  <div className={`flex items-center gap-1.5 ${regPassword.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] ${regPassword.length >= 8 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {regPassword.length >= 8 ? '✓' : '•'}
                    </span>
                    <span>Minimal 8 karakter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-zA-Z]/.test(regPassword) && /[0-9]/.test(regPassword) ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] ${/[a-zA-Z]/.test(regPassword) && /[0-9]/.test(regPassword) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {/[a-zA-Z]/.test(regPassword) && /[0-9]/.test(regPassword) ? '✓' : '•'}
                    </span>
                    <span>Kombinasi huruf & angka</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Role Akses
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full bg-[#E5E7EB]/90 hover:bg-[#E5E7EB] focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="ADMIN_FARM">Admin Farm (Perah Sapi)</option>
                <option value="ADMIN_PENGEMASAN">Admin Pengemasan & Olahan</option>
                <option value="ADMIN_PEMASARAN">Admin Pemasaran (Penjualan)</option>
                <option value="SUPERADMIN">Superadmin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#5c7c3e] hover:bg-[#4c6932] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Daftar Akun Baru</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="font-bold text-[#5c7c3e] hover:underline cursor-pointer"
              >
                Kembali ke Login
              </button>
            </p>
          </form>
        )}
      </div>

      {/* MODAL AUTO-LOGIN AFTER REGISTER */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-slate-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">Akun Berhasil Didaftarkan!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Akun atas nama <span className="font-bold text-[#5c7c3e]">"{registeredData?.name}"</span> telah sukses dibuat.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmAutoLogin}
                className="w-full py-3 px-4 bg-[#5c7c3e] hover:bg-[#4c6932] text-white font-bold rounded-xl shadow-md text-xs"
              >
                {loading ? 'Memproses...' : 'Ya, Langsung Masuk Ke Dashboard'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleDeclinedAutoLogin}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
