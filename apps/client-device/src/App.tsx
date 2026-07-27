import React from 'react';
import { PlaylistPlayer } from './components/PlaylistPlayer';
import { ConnectionOverlay } from './components/ConnectionOverlay';
import { useDeviceSocket } from './hooks/useDeviceSocket';

export default function App() {
  // Initialize socket connection — runs once for the lifetime of the app
  useDeviceSocket();

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050a14' }}>
      {/* Full-bleed media display */}
      <PlaylistPlayer />

      {/* Discrete status overlay */}
      <ConnectionOverlay />
    </div>
  );
}
