'use client';

import { useState } from 'react';
import { Loader2, Send, ListOrdered } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { usePushContent, useAttachContent } from '@/hooks/useDevices';
import { useContents } from '@/hooks/useContents';
import type { DeviceDto, ContentDto } from '@signage/types';

interface PushContentModalProps {
  open: boolean;
  onClose: () => void;
  device: DeviceDto;
}

type Tab = 'push' | 'attach';

export function PushContentModal({ open, onClose, device }: PushContentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('push');
  const [selectedContentId, setSelectedContentId] = useState('');
  const [durasi, setDurasi] = useState(30);
  const [urutan, setUrutan] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: allContents = [], isLoading: contentsLoading } = useContents();
  const pushContent = usePushContent(device.id);
  const attachContent = useAttachContent(device.id);

  const isPending = pushContent.isPending || attachContent.isPending;
  const isOnline = device.status === 'ONLINE';

  const reset = () => {
    setSelectedContentId('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handlePush = () => {
    if (!selectedContentId) {
      setErrorMsg('Please select a content item');
      return;
    }
    setErrorMsg('');

    pushContent.mutate(
      { content_id: selectedContentId },
      {
        onSuccess: () => setSuccessMsg('Content pushed to device successfully!'),
        onError: (err) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Failed to push content.';
          setErrorMsg(msg);
        },
      }
    );
  };

  const handleAttach = () => {
    if (!selectedContentId) {
      setErrorMsg('Please select a content item');
      return;
    }
    setErrorMsg('');

    attachContent.mutate(
      { content_id: selectedContentId, urutan, durasi },
      {
        onSuccess: () => setSuccessMsg('Content added to playlist!'),
        onError: (err) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Failed to attach content.';
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); }}
      title={`Manage Content — ${device.nama}`}
      description={device.lokasi}
      className="max-w-xl"
    >
      {/* Tabs */}
      <div className="mb-5 flex rounded-lg bg-white/[0.04] p-1">
        {[
          { key: 'push' as Tab, label: 'Push Now', icon: Send },
          { key: 'attach' as Tab, label: 'Add to Playlist', icon: ListOrdered },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); reset(); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'bg-accent/15 text-accent shadow-sm ring-1 ring-accent/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Device Status Warning */}
      {activeTab === 'push' && !isOnline && (
        <div className="mb-4 rounded-lg bg-warning/10 px-3 py-2.5 text-sm text-warning ring-1 ring-warning/20">
          ⚠️ This device is currently offline. The push command will fail if the device is not connected.
        </div>
      )}

      {/* Content Selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-300">Select Content</label>
        {contentsLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-white/[0.06]" />
        ) : (
          <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-2">
            {allContents.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No content in library. Add content first.
              </p>
            ) : (
              allContents.map((content: ContentDto) => (
                <button
                  key={content.id}
                  onClick={() => setSelectedContentId(content.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                    selectedContentId === content.id
                      ? 'bg-accent/15 ring-1 ring-accent/30'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <ContentTypeBadge type={content.tipe} />
                  <span className="flex-1 truncate text-sm text-slate-200">{content.judul}</span>
                  {selectedContentId === content.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Attach-specific settings */}
      {activeTab === 'attach' && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Order (urutan)
            </label>
            <input
              type="number"
              min={1}
              value={urutan}
              onChange={(e) => setUrutan(Math.max(1, Number(e.target.value) || 1))}
              className="form-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={1}
              max={86400}
              value={durasi}
              onChange={(e) => setDurasi(Math.max(1, Number(e.target.value) || 1))}
              className="form-input"
            />
          </div>
        </div>
      )}

      {/* Feedback */}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success ring-1 ring-success/20">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger ring-1 ring-danger/20">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button onClick={() => { onClose(); reset(); }} className="btn-ghost">
          Close
        </button>
        <button
          onClick={activeTab === 'push' ? handlePush : handleAttach}
          className="btn-primary"
          disabled={isPending || !selectedContentId}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {activeTab === 'push' ? (
            <>
              <Send className="h-4 w-4" />
              Push to Device
            </>
          ) : (
            <>
              <ListOrdered className="h-4 w-4" />
              Add to Playlist
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}
