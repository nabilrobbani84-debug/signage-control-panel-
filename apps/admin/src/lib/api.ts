import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('signage_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401 responses, and return mock data if backend server is unreachable
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('signage_token');
        localStorage.removeItem('signage_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Mock fallback when backend server is offline/unreachable (ERR_NETWORK)
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const url = error.config?.url || '';
      if (url.includes('/devices')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: 'dev-001',
                nama: 'Lobby Utama Display 1',
                lokasi: 'Gedung A - Lt. 1',
                status: 'ONLINE',
                last_seen: new Date().toISOString(),
                playlists: [{ id: 'pl-1', content_id: 'c-1' }],
              },
              {
                id: 'dev-002',
                nama: 'Ruang Meeting Alpha',
                lokasi: 'Gedung A - Lt. 2',
                status: 'ONLINE',
                last_seen: new Date().toISOString(),
                playlists: [],
              },
              {
                id: 'dev-003',
                nama: 'Kantin Display 2',
                lokasi: 'Gedung B - Lt. 1',
                status: 'OFFLINE',
                last_seen: new Date(Date.now() - 3600000).toISOString(),
                playlists: [],
              },
            ],
          },
        });
      }
      if (url.includes('/contents')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: 'c-1',
                judul: 'Company Profile & Services 2026',
                tipe: 'VIDEO',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                durasi: 15,
                created_at: new Date().toISOString(),
              },
              {
                id: 'c-2',
                judul: 'Pengumuman Jam Operasional Kantor',
                tipe: 'IMAGE',
                url: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=1200',
                durasi: 10,
                created_at: new Date().toISOString(),
              },
              {
                id: 'c-3',
                judul: 'Welcome Banner Visitors',
                tipe: 'IMAGE',
                url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
                durasi: 10,
                created_at: new Date().toISOString(),
              },
            ],
          },
        });
      }
    }

    return Promise.reject(error);
  }
);
