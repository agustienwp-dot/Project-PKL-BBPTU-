'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  Milk,
  Boxes,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  ChevronRight,
  Send
} from 'lucide-react';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Baru saja';
  if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [newToastNotif, setNewToastNotif] = useState(null);

  const prevIdsRef = useRef(new Set());
  const dropdownRef = useRef(null);

  const fetchNotifications = async (isBackground = false) => {
    if (!user) return;
    if (!isBackground) setLoading(true);

    try {
      const res = await api.get('/notifications?limit=25');
      if (res.data?.success) {
        const list = res.data.data || [];
        const unread = res.data.unreadCount || 0;

        // Check if there are brand new notifications that arrived while active
        if (isBackground && prevIdsRef.current.size > 0) {
          const freshItems = list.filter(
            (n) => !prevIdsRef.current.has(n.id) && !n.isRead
          );
          if (freshItems.length > 0) {
            const latest = freshItems[0];
            setNewToastNotif(latest);
            setTimeout(() => {
              setNewToastNotif(null);
            }, 6000);
          }
        }

        const newIdSet = new Set(list.map((n) => n.id));
        prevIdsRef.current = newIdSet;

        setNotifications(list);
        setUnreadCount(unread);
      }
    } catch (err) {
      // Silently fail on background poll to avoid intrusive error messages
      if (!isBackground) {
        console.error('Error fetching notifications:', err);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling every 10 seconds for realtime sync
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id, link, e) => {
    if (e) e.stopPropagation();

    try {
      await api.patch(`/notifications/${id}`, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const res = await api.post('/notifications/read-all');
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();

    try {
      const target = notifications.find((n) => n.id === id);
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredList = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type = '', title = '') => {
    const t = (type + ' ' + title).toLowerCase();
    if (t.includes('keju')) {
      return <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">🧀</div>;
    }
    if (t.includes('yogurt')) {
      return <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">🍦</div>;
    }
    if (t.includes('susu') || t.includes('milk')) {
      return (
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
          <Milk className="w-4 h-4" />
        </div>
      );
    }
    if (t.includes('send') || t.includes('kirim')) {
      return (
        <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
          <Send className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="p-2 rounded-xl bg-slate-100 text-slate-800 shrink-0">
        <Package className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Floating Realtime Pop Toast when new notif arrives */}
      {newToastNotif && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white rounded-3xl p-4 shadow-2xl border-2 border-emerald-500 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Stok Baru Masuk!
                </span>
                <button
                  onClick={() => setNewToastNotif(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-black text-slate-900 mt-1 truncate">
                {newToastNotif.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-snug">
                {newToastNotif.message}
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleMarkAsRead(newToastNotif.id, newToastNotif.link);
                    setNewToastNotif(null);
                  }}
                  className="px-3 py-1 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-xl text-[10px] font-black flex items-center gap-1 shadow"
                >
                  <span>Buka Stok Pemasaran</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2.5 rounded-2xl transition-all border ${
          isOpen
            ? 'bg-emerald-50 text-[#1E3F20] border-emerald-300 shadow-inner'
            : 'bg-white text-slate-700 hover:text-[#1E3F20] hover:bg-slate-50 border-slate-200 shadow-sm'
        }`}
        title="Notifikasi Stok & Aktivitas"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full ring-2 ring-white shadow-md animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-50 pointer-events-none" />
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#1E3F20] to-[#2d5c30] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-xl">
                <Bell className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">Notifikasi Masuk</h3>
                <span className="text-[10px] text-emerald-200 font-semibold">
                  {unreadCount > 0
                    ? `${unreadCount} notifikasi belum dibaca`
                    : 'Semua notifikasi telah dibaca'}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-xl transition-all border border-white/20 active:scale-95 disabled:opacity-50"
                title="Tandai semua sudah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{markingAll ? 'Memproses...' : 'Tandai Dibaca'}</span>
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded-xl text-xs transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('UNREAD')}
                className={`px-3 py-1 rounded-xl text-xs transition-all ${
                  activeTab === 'UNREAD'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>

            <button
              onClick={() => fetchNotifications()}
              className="text-[10px] text-slate-400 hover:text-slate-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Memuat notifikasi...</span>
              </div>
            ) : filteredList.length > 0 ? (
              filteredList.map((notif) => {
                const isUnread = !notif.isRead;
                let meta = null;
                if (notif.metadata) {
                  try {
                    meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;
                  } catch (e) {}
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                    className={`p-3.5 transition-all cursor-pointer group flex items-start gap-3 hover:bg-slate-50 relative ${
                      isUnread ? 'bg-emerald-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Visual Icon */}
                    {getNotifIcon(notif.type, notif.title)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          className={`text-xs leading-tight line-clamp-1 ${
                            isUnread
                              ? 'font-black text-slate-900'
                              : 'font-semibold text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-medium">
                        {notif.message}
                      </p>

                      {/* Details Badge if available */}
                      {meta && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {meta.quantity && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono">
                              {meta.quantity} {meta.unit || 'pcs'}
                            </span>
                          )}
                          {meta.variant && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {meta.variant}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Sender & Timestamp */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                        <span className="truncate max-w-[160px]">
                          Dari: {notif.senderName || 'Admin Pengolahan'}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{formatRelativeTime(notif.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick Delete Action */}
                    <button
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0 self-start"
                      title="Hapus notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Tidak ada notifikasi</h4>
                <p className="text-[11px] text-slate-400">
                  {activeTab === 'UNREAD'
                    ? 'Semua notifikasi telah Anda baca.'
                    : 'Belum ada notifikasi stok atau aktivitas baru.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/pemasaran/terima-data');
              }}
              className="w-full text-center text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-emerald-100/50 transition-all"
            >
              <span>Buka Menu Stok & Olahan UHT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
