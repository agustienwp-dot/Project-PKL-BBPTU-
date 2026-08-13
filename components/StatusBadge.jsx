'use client';

import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  const badgeStyles = {
    AVAILABLE: 'bg-[#1E3F20]/10 text-[#1E3F20] border-[#1E3F20]/30 font-bold',
    SOLD: 'bg-blue-500/10 text-blue-700 border-blue-500/30 font-bold',
    DECEASED: 'bg-rose-500/10 text-rose-700 border-rose-500/30 font-bold',
    TRANSFERRED: 'bg-amber-500/10 text-amber-800 border-amber-500/30 font-bold',
  };

  const badgeLabels = {
    AVAILABLE: 'Tersedia',
    SOLD: 'Terjual',
    DECEASED: 'Mati',
    TRANSFERRED: 'Dipindahkan',
  };

  const style = badgeStyles[normalized] || 'bg-slate-200 text-slate-700 border-slate-300';
  const label = badgeLabels[normalized] || normalized;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
}
