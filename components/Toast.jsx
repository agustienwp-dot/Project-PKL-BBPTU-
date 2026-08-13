'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
      <div className={`p-1.5 rounded-xl ${isSuccess ? 'bg-[#1E3F20]/10 text-[#1E3F20]' : 'bg-rose-50 text-rose-700'}`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>
      <span className="text-xs font-bold text-slate-800">{message}</span>
      <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
