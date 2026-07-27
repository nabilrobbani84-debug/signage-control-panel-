'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Grid3X3, List } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { ContentFormModal } from '@/components/contents/ContentFormModal';
import { useContents, useDeleteContent } from '@/hooks/useContents';
import { ContentType } from '@signage/types';
import type { ContentDto } from '@signage/types';
import { formatDistanceToNow } from 'date-fns';

export default function ContentsPage() {
  const { data: contents = [], isLoading } = useContents();
  const deleteContent = useDeleteContent();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ContentDto | null>(null);

  const filtered = contents.filter((c) => {
    const matchesSearch = c.judul.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || c.tipe === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (content: ContentDto) => {
    if (!confirm(`Delete "${content.judul}"?`)) return;
    deleteContent.mutate(content.id);
  };

  return (
    <div className="flex h-screen bg-[hsl(222,47%,6%)]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Content Library"
          subtitle={`${contents.length} items · ${Object.values(ContentType).map((t) => `${contents.filter((c) => c.tipe === t).length} ${t}`).join(' · ')}`}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search content..."
                  className="form-input w-56 pl-9"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
                className="rounded-lg border border-white/10 bg-[hsl(222,47%,9%)] px-3 py-2 text-sm text-slate-300 outline-none focus:border-accent/50"
              >
                <option value="all">All Types</option>
                {Object.values(ContentType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {/* View toggle */}
              <div className="flex rounded-lg bg-white/[0.04] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white/10 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white/10 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => { setEditTarget(null); setShowFormModal(true); }}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="glass-card h-40 animate-pulse" />
                  ))
                : filtered.map((content) => (
                    <div key={content.id} className="glass-card group p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <ContentTypeBadge type={content.tipe} />
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => { setEditTarget(content); setShowFormModal(true); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(content)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-danger/15 hover:text-danger"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <p className="mb-1 text-sm font-semibold text-slate-200 line-clamp-2">
                        {content.judul}
                      </p>
                      <p className="mb-3 truncate text-xs text-slate-500" title={content.payload}>
                        {content.payload}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Payload</th>
                    <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">Created</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((content) => (
                    <tr key={content.id} className="table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium text-slate-200">{content.judul}</td>
                      <td className="px-6 py-4"><ContentTypeBadge type={content.tipe} /></td>
                      <td className="hidden max-w-xs px-6 py-4 md:table-cell">
                        <p className="truncate text-xs text-slate-500">{content.payload}</p>
                      </td>
                      <td className="hidden px-6 py-4 text-xs text-slate-500 lg:table-cell">
                        {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditTarget(content); setShowFormModal(true); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(content)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-danger/10 hover:text-danger"
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
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="mt-12 text-center text-sm text-slate-500">
              {search ? `No content matches "${search}"` : 'No content yet. Click "Add Content" to get started.'}
            </div>
          )}
        </main>
      </div>

      <ContentFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditTarget(null); }}
        editContent={editTarget}
      />
    </div>
  );
}
