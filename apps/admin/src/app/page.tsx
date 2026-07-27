'use client';

import { Monitor, Wifi, Library, Activity } from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useContents } from '@/hooks/useContents';
import { DeviceStatus } from '@signage/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardPage() {
  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: contents = [], isLoading: contentsLoading } = useContents();

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === DeviceStatus.ONLINE).length;
  const offlineDevices = totalDevices - onlineDevices;
  const totalContents = contents.length;

  return (
    <div className="flex h-screen bg-[hsl(222,47%,6%)]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Overview"
          subtitle="Real-time signage network status"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Ambient gradient background */}
          <div
            className="pointer-events-none fixed inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at 20% 20%, hsl(217,91%,20%) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, hsl(189,100%,15%) 0%, transparent 60%)',
            }}
          />

          {/* Stats Grid */}
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Devices"
              value={totalDevices}
              icon={Monitor}
              subtitle="Registered displays"
              loading={devicesLoading}
              accentColor="text-slate-300"
            />
            <StatsCard
              title="Online Now"
              value={onlineDevices}
              icon={Wifi}
              subtitle="Active connections"
              loading={devicesLoading}
              accentColor="text-success"
              trend={{ value: 0, label: 'vs last hour' }}
            />
            <StatsCard
              title="Offline"
              value={offlineDevices}
              icon={Activity}
              subtitle="Not responding"
              loading={devicesLoading}
              accentColor={offlineDevices > 0 ? 'text-danger' : 'text-slate-400'}
            />
            <StatsCard
              title="Content Library"
              value={totalContents}
              icon={Library}
              subtitle="Media items available"
              loading={contentsLoading}
              accentColor="text-accent"
            />
          </div>

          {/* Device Status Table */}
          <div className="relative mt-8">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Device Status Feed</h2>
                  <p className="text-xs text-slate-500">Updates automatically via WebSocket</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {devicesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.06]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />
                        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
                      </div>
                    </div>
                  ))
                ) : devices.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-500">
                    No devices registered yet. Add your first device in the Devices tab.
                  </div>
                ) : (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                        <Monitor className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{device.nama}</p>
                        <p className="truncate text-xs text-slate-500">{device.lokasi}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <StatusBadge status={device.status} />
                        <span className="hidden text-xs text-slate-600 sm:block">
                          {device.last_seen
                            ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })
                            : 'Never seen'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
