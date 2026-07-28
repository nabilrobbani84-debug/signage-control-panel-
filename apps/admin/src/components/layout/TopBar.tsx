'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Check, Trash2, Info, CheckCircle2, AlertTriangle, Monitor } from 'lucide-react';
import { useSocketContext } from '@/providers/SocketProvider';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { SOCKET_EVENTS } from '@signage/types';
import { formatDistanceToNow } from 'date-fns';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'System Online',
    description: 'Signage Control Panel server is active and connected to database.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Real-time Gateway',
    description: 'WebSocket listener initialized on /admin namespace.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    type: 'info',
  },
  {
    id: '3',
    title: 'Device Sync Ready',
    description: 'Use the Device Manager to monitor screen connections.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    type: 'info',
  },
];

export function TopBar({ title, subtitle }: TopBarProps) {
  const { socket, isConnected } = useSocketContext();
  const user = useCurrentUser();
  const logout = useLogout();

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for live socket events and push notifications
  useEffect(() => {
    if (!socket) return;

    const handleDeviceConnected = (payload: any) => {
      const newNotif: NotificationItem = {
        id: Date.now().toString(),
        title: 'Device Connected',
        description: `Device ${payload.deviceId?.slice(0, 8)}... has come ONLINE.`,
        timestamp: new Date(),
        read: false,
        type: 'success',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    const handleDeviceDisconnected = (payload: any) => {
      const newNotif: NotificationItem = {
        id: Date.now().toString(),
        title: 'Device Disconnected',
        description: `Device ${payload.deviceId?.slice(0, 8)}... went OFFLINE.`,
        timestamp: new Date(),
        read: false,
        type: 'warning',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on(SOCKET_EVENTS.DEVICE_CONNECTED, handleDeviceConnected);
    socket.on(SOCKET_EVENTS.DEVICE_DISCONNECTED, handleDeviceDisconnected);

    return () => {
      socket.off(SOCKET_EVENTS.DEVICE_CONNECTED, handleDeviceConnected);
      socket.off(SOCKET_EVENTS.DEVICE_DISCONNECTED, handleDeviceDisconnected);
    };
  }, [socket]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border px-6 bg-background relative z-40">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Socket Status Indicator */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
            isConnected
              ? 'border-success/20 bg-success/10 text-success'
              : 'border-neutral-800 bg-surface text-neutral-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? 'bg-success animate-pulse' : 'bg-neutral-600'
            }`}
          />
          {isConnected ? 'Live' : 'Offline'}
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-surface hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-white/10 bg-[hsl(222,47%,8%)] shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-300" />
                  <span className="text-sm font-semibold text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      title="Clear all"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-danger/20 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleRead(n.id)}
                      className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                        n.read ? 'bg-transparent opacity-75 hover:bg-white/[0.02]' : 'bg-white/[0.04] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                        {n.type === 'info' && <Info className="h-4 w-4 text-sky-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold ${n.read ? 'text-slate-300' : 'text-white'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400 leading-snug">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        {user && (
          <div className="hidden sm:flex items-center gap-3 border-l border-surface-border pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-surface-border">
              <User className="h-4 w-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">{user.name || user.email}</p>
              <p className="text-[10px] text-neutral-500">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-danger/10 hover:text-danger ml-2"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

