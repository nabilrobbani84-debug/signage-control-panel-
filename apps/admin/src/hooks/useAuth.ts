import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { LoginRequestDto, LoginResponseDto } from '@signage/types';

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
      const { data } = await apiClient.post<{ success: boolean; data: LoginResponseDto }>(
        '/auth/login',
        credentials
      );
      return data.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('signage_token', data.token);
        localStorage.setItem('signage_user', JSON.stringify(data.user));
      }
    },
  });
}

export function useLogout() {
  return () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('signage_token');
      localStorage.removeItem('signage_user');
      window.location.href = '/login';
    }
  };
}

export function useCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('signage_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}
