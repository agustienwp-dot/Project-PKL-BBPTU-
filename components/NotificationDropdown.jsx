'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ChevronRight, X, Sparkles } from 'lucide-react';
import api from '@/services/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(2);
  const hoverTimeoutRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
      // Default fallback state
      setNotifications([
        {
          id: 'n1',
          title: '✨ Konfirmasi Admin Pemasaran',
          desc: 'Berita Acara BA-20260819-003 disetujui & diterima oleh Seksi Pemasaran (10 Liter).',
          time: '11:16 WIB',
          icon: '🤝',
          isUnread: true,
        },
        {
          id: 'n2',
          title: '📦 Konfirmasi Admin Pengemasan',
          desc: 'Hasil Produksi Susu Sapi (7,770 Liter Siap Olah) diserahkan ke Seksi Pengemasan.',
          time: '11:15 WIB',
          icon: '🥛',
          isUnread: true,
        },
        {
          id: 'n3',
          title: '🛍️ Distribusi Susu Segar',
          desc: 'Penjualan langsung susu segar sebanyak 20 Liter telah dicatat oleh Seksi Pemasaran.',
          time: '10:45 WIB',
          icon: '🛍️',
          isUnread: false,
        }
      ]);
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bell Button Icon With Red Number Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 transition-colors relative flex items-center justify-center"
        title="Pemberitahuan & Konfirmasi"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        
        {/* RED NUMBER BADGE (Angka Notifikasi) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md animate-pulse border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP CARD */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow Pointer Top right */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-200"></div>

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <span>Notifikasi Baru Diterima</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                    {unreadCount} Baru
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Konfirmasi dari Admin Pemasaran & Pengemasan
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-800 font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Dibaca</span>
              </button>
            )}
          </div>

          {/* Notification List Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    item.isUnread ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-sm mt-0.5">
                    {item.icon || '📩'}
                  </div>

                  {/* Notification Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-extrabold text-slate-900 text-xs truncate">
                        {item.title}
                      </h5>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-snug line-clamp-2">
                      {item.desc}
                    </p>

                    {item.isUnread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                Tidak ada notifikasi baru.
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 transition-colors inline-flex items-center gap-1"
            >
              <span>Tampilkan Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
