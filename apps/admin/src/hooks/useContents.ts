import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { ContentDto, CreateContentDto, UpdateContentDto } from '@signage/types';

const CONTENTS_KEY = ['contents'];

async function fetchContents(): Promise<ContentDto[]> {
  const { data } = await apiClient.get<{ success: boolean; data: ContentDto[] }>('/contents');
  return data.data;
}

export function useContents() {
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('signage_token') : false;
  return useQuery({
    queryKey: CONTENTS_KEY,
    queryFn: fetchContents,
    enabled: hasToken,
  });
}

export function useCreateContent() {
  return useMutation({
    mutationFn: async (input: CreateContentDto) => {
      const { data } = await apiClient.post('/contents', input);
      return data.data as ContentDto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENTS_KEY });
    },
  });
}

export function useUpdateContent() {
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & UpdateContentDto) => {
      const { data } = await apiClient.put(`/contents/${id}`, input);
      return data.data as ContentDto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENTS_KEY });
    },
  });
}

export function useDeleteContent() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENTS_KEY });
    },
  });
}
