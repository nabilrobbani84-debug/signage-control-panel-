'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, Copy, Check } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useCreateDevice, useUpdateDevice } from '@/hooks/useDevices';
import { DeviceStatus } from '@signage/types';
import type { DeviceDto } from '@signage/types';

interface DeviceFormModalProps {
  open: boolean;
  onClose: () => void;
  editDevice?: DeviceDto | null;
}

export function DeviceFormModal({ open, onClose, editDevice }: DeviceFormModalProps) {
  const isEdit = !!editDevice;
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();

  const [nama, setNama] = useState(editDevice?.nama ?? '');
  const [lokasi, setLokasi] = useState(editDevice?.lokasi ?? '');
  const [status, setStatus] = useState<DeviceStatus>(editDevice?.status ?? DeviceStatus.OFFLINE);
  const [errors, setErrors] = useState<{ nama?: string; lokasi?: string }>({});
  const [serverError, setServerError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (editDevice) {
      setNama(editDevice.nama);
      setLokasi(editDevice.lokasi);
      setStatus(editDevice.status ?? DeviceStatus.OFFLINE);
    } else {
      setNama('');
      setLokasi('');
      setStatus(DeviceStatus.OFFLINE);
    }
  }, [editDevice]);

  const isPending = createDevice.isPending || updateDevice.isPending;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nama.trim()) newErrors.nama = 'Device name is required';
    if (!lokasi.trim()) newErrors.lokasi = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');

    const onSuccess = () => {
      onClose();
      setNama('');
      setLokasi('');
      setErrors({});
    };

    const onError = (err: any) => {
      if (err?.response?.status === 401) {
        setServerError('Sesi Anda telah berakhir atau belum login. Silakan login ulang.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message ??
        'An error occurred. Please try again.';
      setServerError(msg);
    };

    if (isEdit && editDevice) {
      updateDevice.mutate({ id: editDevice.id, nama, lokasi, status }, { onSuccess, onError });
    } else {
      createDevice.mutate({ nama, lokasi }, { onSuccess, onError });
    }
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
    setErrors({});
    setServerError('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Device' : 'Register New Device'}
      description={
        isEdit
          ? 'Update the device name, location, or status.'
          : 'Add a new display device to the network.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEdit && editDevice && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Device ID (UUID)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={editDevice.id}
                className="form-input flex-1 font-mono text-xs text-slate-300 bg-white/[0.03] border-white/10 select-all cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(editDevice.id);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-ghost shrink-0 px-3 py-2 text-xs flex items-center gap-1.5 border border-white/10"
                title="Copy Device ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span className={copied ? 'text-emerald-400' : 'text-slate-300'}>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Use this ID in your Signage Client Player to pair and bring it Online.
            </p>
          </div>
        )}

        <Input
          id="device-nama"
          label="Device Name"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="e.g. Display Lobby Utama"
          error={errors.nama}
        />
        <Input
          id="device-lokasi"
          label="Location"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
          placeholder="e.g. Lantai 1 - Lobby"
          error={errors.lokasi}
        />

        {isEdit && (
          <div className="space-y-1.5">
            <label htmlFor="device-status" className="block text-xs font-semibold text-slate-300">
              Device Status
            </label>
            <select
              id="device-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as DeviceStatus)}
              className="form-input w-full bg-[hsl(222,47%,9%)] text-slate-200 border-white/10"
            >
              <option value={DeviceStatus.OFFLINE}>🔴 Offline</option>
              <option value={DeviceStatus.ONLINE}>🟢 Online</option>
            </select>
          </div>
        )}

        {serverError && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger ring-1 ring-danger/20">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-ghost" disabled={isPending}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Register Device'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
