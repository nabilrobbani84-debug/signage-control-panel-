'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { useCreateContent, useUpdateContent } from '@/hooks/useContents';
import { ContentType } from '@signage/types';
import type { ContentDto } from '@signage/types';

interface ContentFormModalProps {
  open: boolean;
  onClose: () => void;
  editContent?: ContentDto | null;
}

const contentTypePlaceholders: Record<ContentType, string> = {
  [ContentType.IMAGE]: 'https://example.com/banner.jpg',
  [ContentType.VIDEO]: 'https://example.com/promo.mp4',
  [ContentType.TEXT]: 'Selamat datang di kantor kami! | Info penting: ...',
  [ContentType.WEB]: 'https://dashboard.example.com',
};

export function ContentFormModal({ open, onClose, editContent }: ContentFormModalProps) {
  const isEdit = !!editContent;
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();

  const [judul, setJudul] = useState(editContent?.judul ?? '');
  const [tipe, setTipe] = useState<ContentType>(editContent?.tipe ?? ContentType.IMAGE);
  const [payload, setPayload] = useState(editContent?.payload ?? '');
  const [errors, setErrors] = useState<{ judul?: string; payload?: string }>({});
  const [serverError, setServerError] = useState('');

  const isPending = createContent.isPending || updateContent.isPending;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!judul.trim()) newErrors.judul = 'Title is required';
    if (!payload.trim()) newErrors.payload = 'Payload is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');

    const onSuccess = () => {
      onClose();
      setJudul('');
      setTipe(ContentType.IMAGE);
      setPayload('');
      setErrors({});
    };

    const onError = (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'An error occurred.';
      setServerError(msg);
    };

    if (isEdit && editContent) {
      updateContent.mutate({ id: editContent.id, judul, tipe, payload }, { onSuccess, onError });
    } else {
      createContent.mutate({ judul, tipe, payload }, { onSuccess, onError });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? () => {} : onClose}
      title={isEdit ? 'Edit Content' : 'Add Content'}
      description="Define the content type and provide a URL or text payload."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="content-judul"
          label="Content Title"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          placeholder="e.g. Promo Kemerdekaan 2025"
          error={errors.judul}
        />

        <Select
          id="content-tipe"
          label="Content Type"
          value={tipe}
          onChange={(e) => {
            setTipe(e.target.value as ContentType);
            setPayload('');
          }}
        >
          <option value={ContentType.IMAGE}>🖼️ Image</option>
          <option value={ContentType.VIDEO}>🎬 Video</option>
          <option value={ContentType.TEXT}>📝 Text / Ticker</option>
          <option value={ContentType.WEB}>🌐 Web / URL</option>
        </Select>

        <Input
          id="content-payload"
          label={tipe === ContentType.TEXT ? 'Text Content' : 'URL / Payload'}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder={contentTypePlaceholders[tipe]}
          error={errors.payload}
          hint={
            tipe === ContentType.TEXT
              ? 'Use | to separate ticker items'
              : 'Enter a publicly accessible URL'
          }
        />

        {serverError && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger ring-1 ring-danger/20">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isPending}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Content'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
