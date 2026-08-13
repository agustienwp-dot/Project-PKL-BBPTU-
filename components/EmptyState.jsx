'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Tidak Ada Data', message = 'Belum ada data yang tersedia saat ini.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-[#F5F5F0] border border-dashed border-slate-300 rounded-2xl my-4">
      <div className="p-4 bg-white rounded-2xl text-[#1E3F20] shadow-sm">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}
