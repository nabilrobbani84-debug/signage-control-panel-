import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { DeviceDto, CreateDeviceDto, UpdateDeviceDto, AttachContentDto, PushContentDto } from '@signage/types';

const DEVICES_KEY = ['devices'];

async function fetchDevices(): Promise<DeviceDto[]> {
  const { data } = await apiClient.get<{ success: boolean; data: DeviceDto[] }>('/devices');
  return data.data;
}

async function fetchDevice(id: string): Promise<DeviceDto> {
  const { data } = await apiClient.get<{ success: boolean; data: DeviceDto }>(`/devices/${id}`);
  return data.data;
}

export function useDevices() {
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('signage_token') : false;
  return useQuery({
    queryKey: DEVICES_KEY,
    queryFn: fetchDevices,
    refetchInterval: hasToken ? 60_000 : false,
    enabled: hasToken,
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: [...DEVICES_KEY, id],
    queryFn: () => fetchDevice(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  return useMutation({
    mutationFn: async (input: CreateDeviceDto) => {
      const { data } = await apiClient.post('/devices', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
    },
  });
}

export function useUpdateDevice() {
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & UpdateDeviceDto) => {
      const { data } = await apiClient.put(`/devices/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
    },
  });
}

export function useDeleteDevice() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
    },
  });
}

export function useAttachContent(deviceId: string) {
  return useMutation({
    mutationFn: async (input: AttachContentDto) => {
      const { data } = await apiClient.post(`/devices/${deviceId}/attach-content`, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICES_KEY });
    },
  });
}

export function usePushContent(deviceId: string) {
  return useMutation({
    mutationFn: async (input: PushContentDto) => {
      const { data } = await apiClient.post(`/devices/${deviceId}/push`, input);
      return data.data;
    },
  });
}
