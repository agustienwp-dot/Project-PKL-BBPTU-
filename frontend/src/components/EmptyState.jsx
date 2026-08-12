import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Tidak Ada Data', message = 'Belum ada data yang tersedia saat ini.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
      <div className="p-4 bg-slate-800/60 rounded-full text-slate-500 mb-3">
        <Inbox className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1">{message}</p>
    </div>
  );
}
