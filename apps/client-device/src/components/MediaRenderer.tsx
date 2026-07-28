import React, { useEffect, useRef, useState } from 'react';
import { ContentType } from '@signage/types';
import type { PlaylistItem } from '../store/deviceStore';

interface MediaRendererProps {
  item: PlaylistItem;
  onEnded: () => void;
}

/**
 * Renders the appropriate media type for a playlist item.
 * Handles IMAGE, VIDEO, TEXT (ticker), and WEB (webview/iframe).
 */
export function MediaRenderer({ item, onEnded }: MediaRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Helper to check if payload is a YouTube video URL
    const isYoutube = item.tipe === ContentType.VIDEO && 
      (item.payload.includes('youtube.com') || item.payload.includes('youtu.be'));

    // For non-video types OR YouTube iframes, auto-advance after durasi seconds
    if (item.tipe !== ContentType.VIDEO || isYoutube) {
      timerRef.current = setTimeout(onEnded, item.durasi * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item, onEnded]);

  // Helper to extract direct image URL from Google Images search page redirects
  const getCleanImageUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('google') && urlObj.pathname.includes('imgres')) {
        const imgUrl = urlObj.searchParams.get('imgurl');
        if (imgUrl) return decodeURIComponent(imgUrl);
      }
    } catch (e) {
      // Ignore
    }
    return url;
  };

  // Helper to get YouTube Embed URL from any watch or sharing link
  const getYoutubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1`;
    }
    return null;
  };

  switch (item.tipe) {
    case ContentType.IMAGE:
      return (
        <img
          src={getCleanImageUrl(item.payload)}
          alt={item.judul}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23111" width="100" height="100"/><text fill="%23444" x="50" y="54" text-anchor="middle" font-size="12">Image Error</text></svg>';
          }}
        />
      );

    case ContentType.VIDEO:
      const youtubeUrl = getYoutubeEmbedUrl(item.payload);
      if (youtubeUrl) {
        return (
          <iframe
            src={youtubeUrl}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={item.judul}
          />
        );
      }
      return (
        <video
          ref={videoRef}
          src={item.payload}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          onEnded={onEnded}
          onError={onEnded}
        />
      );

    case ContentType.TEXT:
      return <TickerDisplay text={item.payload} />;

    case ContentType.WEB:
      return (
        <iframe
          src={item.payload}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={item.judul}
        />
      );

    default:
      return (
        <div className="flex h-full w-full items-center justify-center text-white">
          <p className="text-2xl opacity-50">Unsupported content type</p>
        </div>
      );
  }
}

// ── Ticker (TEXT type) ─────────────────────────────────────

interface TickerDisplayProps {
  text: string;
}

function TickerDisplay({ text }: TickerDisplayProps) {
  const segments = text.split('|').map((s) => s.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [text]);

  useEffect(() => {
    const displayTimer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % segments.length);
        setVisible(true);
      }, 600);
    }, 5000);

    return () => clearInterval(displayTimer);
  }, [segments.length]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-16">
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <p
          className="text-center font-bold leading-tight tracking-tight text-white"
          style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}
        >
          {segments[index]}
        </p>
      </div>

      {segments.length > 1 && (
        <div className="mt-8 flex gap-2">
          {segments.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={{ background: i === index ? '#60a5fa' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
