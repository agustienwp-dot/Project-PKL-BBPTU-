import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@farm.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Email atau password tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-slate-800 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1E3F20] text-white shadow-lg mb-2">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20]">FarmStock Pro</h1>
          <p className="text-sm text-slate-500">Masuk untuk mengelola data ternak & penjualan</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@farm.com"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-1 focus:ring-[#1E3F20] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] focus:ring-1 focus:ring-[#1E3F20] transition-colors"
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
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Seed Hint */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">Akun pengujian bawaan:</p>
          <div className="flex justify-center gap-2 text-xs font-mono">
            <button
              onClick={() => { setEmail('admin@farm.com'); setPassword('admin123'); }}
              className="px-3 py-1 bg-[#F5F5F0] hover:bg-slate-200 text-[#1E3F20] font-bold rounded-lg transition-colors border border-slate-300"
            >
              Admin
            </button>
            <button
              onClick={() => { setEmail('staff@farm.com'); setPassword('staff123'); }}
              className="px-3 py-1 bg-[#F5F5F0] hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors border border-slate-300"
            >
              Staff
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
