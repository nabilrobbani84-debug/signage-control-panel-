'use client';

import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  Monitor,
  RefreshCw,
  Search,
  MapPin,
  Clock,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeviceFormModal } from '@/components/devices/DeviceFormModal';
import { PushContentModal } from '@/components/devices/PushContentModal';
import { useDevices, useDeleteDevice } from '@/hooks/useDevices';
import { DeviceStatus } from '@signage/types';
import type { DeviceDto } from '@signage/types';
import { formatDistanceToNow } from 'date-fns';

export default function DevicesPage() {
  const { data: devices = [], isLoading, refetch, isFetching } = useDevices();
  const deleteDevice = useDeleteDevice();

  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<DeviceDto | null>(null);
  const [pushTarget, setPushTarget] = useState<DeviceDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const filtered = devices.filter((d) => {
    const matchesSearch =
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'online' && d.status === DeviceStatus.ONLINE) ||
      (filterStatus === 'offline' && d.status === DeviceStatus.OFFLINE);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (device: DeviceDto) => {
    if (!confirm(`Delete "${device.nama}"? This action cannot be undone.`)) return;
    setDeletingId(device.id);
    deleteDevice.mutate(device.id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const onlineCount = devices.filter((d) => d.status === DeviceStatus.ONLINE).length;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Device Manager"
          subtitle={`${devices.length} registered · ${onlineCount} online`}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search devices..."
                  className="form-input w-full sm:w-64 pl-9"
                />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="rounded-lg border border-white/10 bg-[hsl(222,47%,9%)] px-3 py-2 text-sm text-slate-300 outline-none focus:border-accent/50"
              >
                <option value="all">All Statuses</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="btn-ghost flex-1 sm:flex-none justify-center"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => { setEditTarget(null); setShowFormModal(true); }}
                className="btn-primary flex-1 sm:flex-none justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Device
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05] text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Device
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">
                    Location
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">
                    Last Seen
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 xl:table-cell">
                    Playlist
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-5 w-full animate-pulse rounded bg-white/[0.06]" />
                        </td>
                      </tr>
                    ))
                  : filtered.length === 0
                  ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                          {search ? `No devices match "${search}"` : 'No devices found. Add your first device.'}
                        </td>
                      </tr>
                    )
                  : filtered.map((device) => (
                      <tr key={device.id} className="table-row-hover group animate-fade-in">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/[0.08]">
                              <Monitor className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{device.nama}</p>
                              <p className="font-mono text-[10px] text-slate-600">{device.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={device.status} />
                        </td>
                        <td className="hidden px-6 py-4 md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {device.lokasi}
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {device.last_seen
                              ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })
                              : 'Never'}
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 xl:table-cell">
                          <span className="text-sm text-slate-400">
                            {/* @ts-expect-error playlists included via API */}
                            {(device.playlists?.length ?? 0)} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPushTarget(device)}
                              title="Push Content"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-accent/10 hover:text-accent"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => { setEditTarget(device); setShowFormModal(true); }}
                              title="Edit Device"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/[0.07] hover:text-slate-200"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(device)}
                              disabled={deletingId === device.id}
                              title="Delete Device"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          <p className="mt-3 text-right text-xs text-slate-600">
            Showing {filtered.length} of {devices.length} devices
          </p>
        </main>
      </div>

      <DeviceFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditTarget(null); }}
        editDevice={editTarget}
      />

      {pushTarget && (
        <PushContentModal
          open={!!pushTarget}
          onClose={() => setPushTarget(null)}
          device={pushTarget}
        />
      )}
    </div>
  );
}
