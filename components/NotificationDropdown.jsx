'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import api from '@/services/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const cleanTitle = (str) => {
    if (!str) return '';
    return str.replace(/[\u{1F300}-\u{1F9FF}]|✨|📦|🛍️|🤝|🥛|📄|📝/gu, '').trim();
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
        if (!hasOpened) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setNotifications([]);
      if (!hasOpened) {
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setHasOpened(true);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
    handleMarkAllRead();
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      handleMarkAllRead();
    }
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
        onClick={toggleDropdown}
        className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 transition-colors relative flex items-center justify-center"
        title="Pemberitahuan & Konfirmasi"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        
        {/* RED NUMBER BADGE (Angka Notifikasi - Hilang ketika sudah dibuka) */}
        {unreadCount > 0 && !hasOpened && (
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
              <h4 className="font-black text-slate-900 text-sm">
                Notifikasi Diterima
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Konfirmasi dari Admin Pemasaran & Pengemasan
              </p>
            </div>
          </div>

          {/* Notification List Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-extrabold text-slate-900 text-xs truncate">
                      {cleanTitle(item.title)}
                    </h5>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-snug">
                    {item.desc}
                  </p>
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
              <span>Tutup Notifikasi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
