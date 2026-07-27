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
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Overview"
          subtitle="Real-time signage network status"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                title="Total Devices"
                value={totalDevices}
                icon={Monitor}
                subtitle="Registered displays"
                loading={devicesLoading}
                accentColor="text-foreground"
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
                accentColor={offlineDevices > 0 ? 'text-danger' : 'text-neutral-500'}
              />
              <StatsCard
                title="Content Library"
                value={totalContents}
                icon={Library}
                subtitle="Media items available"
                loading={contentsLoading}
                accentColor="text-foreground"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-surface-border bg-surface">
              <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Device Status Feed</h2>
                  <p className="text-xs text-neutral-500">Updates automatically via WebSocket</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              </div>

              <div className="divide-y divide-surface-border">
                {devicesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-9 w-9 animate-pulse rounded-md bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 animate-pulse rounded bg-neutral-800" />
                        <div className="h-3 w-24 animate-pulse rounded bg-neutral-900" />
                      </div>
                    </div>
                  ))
                ) : devices.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-neutral-500">
                    No devices registered yet. Add your first device in the Devices tab.
                  </div>
                ) : (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-surface-border bg-background">
                        <Monitor className="h-4 w-4 text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{device.nama}</p>
                        <p className="truncate text-xs text-neutral-500">{device.lokasi}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <StatusBadge status={device.status} />
                        <span className="hidden text-xs text-neutral-500 sm:block">
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
