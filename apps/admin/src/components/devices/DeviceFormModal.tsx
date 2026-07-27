'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useCreateDevice, useUpdateDevice } from '@/hooks/useDevices';
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
  const [errors, setErrors] = useState<{ nama?: string; lokasi?: string }>({});
  const [serverError, setServerError] = useState('');

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

    const onError = (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'An error occurred. Please try again.';
      setServerError(msg);
    };

    if (isEdit && editDevice) {
      updateDevice.mutate({ id: editDevice.id, nama, lokasi }, { onSuccess, onError });
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
          ? 'Update the device name and location.'
          : 'Add a new display device to the network.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
