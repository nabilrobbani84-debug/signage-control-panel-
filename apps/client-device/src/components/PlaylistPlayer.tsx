import React, { useState, useCallback, useEffect } from 'react';
import { MediaRenderer } from './MediaRenderer';
import { useDeviceStore } from '../store/deviceStore';

/**
 * PlaylistPlayer manages the cycling through playlist items.
 * Uses a fade transition between items for a smooth kiosk experience.
 */
export function PlaylistPlayer() {
  const { playlist, currentIndex, nextItem } = useDeviceStore();
  const [visible, setVisible] = useState(true);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);

  // When the store index changes (via timer, end of video, or push), smoothly transition
  useEffect(() => {
    setVisible(false);
    const timeout = setTimeout(() => {
      setDisplayIndex(currentIndex);
      setVisible(true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  const handleEnded = useCallback(() => {
    nextItem();
  }, [nextItem]);

  if (playlist.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050a14]">
        <div className="mb-6 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white/20">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-lg font-medium text-white/20">No content assigned</p>
        <p className="mt-1 text-sm text-white/10">
          Use the admin dashboard to push content to this device
        </p>
      </div>
    );
  }

  const currentItem = playlist[displayIndex] ?? playlist[0];

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Fade container */}
      <div
        className="absolute inset-0"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
        }}
      >
        <MediaRenderer
          key={`${currentItem.id}-${displayIndex}`}
          item={currentItem}
          onEnded={handleEnded}
        />
      </div>

      {/* Playlist progress dots */}
      {playlist.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {playlist.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === displayIndex ? '24px' : '6px',
                background: i === displayIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
