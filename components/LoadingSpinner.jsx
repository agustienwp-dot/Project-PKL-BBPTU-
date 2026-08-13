'use client';

import React from 'react';

export default function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 border-4 border-[#1E3F20]/20 border-t-[#1E3F20] rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-600 animate-pulse">{text}</p>
    </div>
  );
}
