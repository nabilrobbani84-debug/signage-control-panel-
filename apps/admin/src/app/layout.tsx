import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Signage Control Panel — PT MJ Solution Indonesia',
  description:
    'Centralized digital signage management platform. Manage devices, content library, and real-time playlists.',
  keywords: ['digital signage', 'control panel', 'display management', 'content management'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} min-h-screen bg-[hsl(222,47%,6%)] font-sans text-slate-100`}>
        <QueryProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
