import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import type { ConnectionStatus } from '../store/deviceStore';
import { format } from './dateUtils';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

const statusConfig: Record<ConnectionStatus, { label: string; color: string; dot: string }> = {
  connected: {
    label: 'Connected',
    color: '#22c55e',
    dot: '#22c55e',
  },
  connecting: {
    label: 'Connecting...',
    color: '#f59e0b',
    dot: '#f59e0b',
  },
  reconnecting: {
    label: 'Reconnecting...',
    color: '#f59e0b',
    dot: '#f59e0b',
  },
  disconnected: {
    label: 'Disconnected',
    color: '#ef4444',
    dot: '#ef4444',
  },
};

/**
 * Discrete status overlay in the corner of the display.
 * Can be toggled with the F1 key or the toggle button.
 * Shows: Device ID, WS status, last sync time.
 */
export function ConnectionOverlay() {
  const [visible, setVisible] = useState(true);
  const { deviceId, connectionStatus, lastSyncAt, playlist } = useDeviceStore();

  const config = statusConfig[connectionStatus];

  // Listen for F1 keypress to toggle overlay
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 100,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: config.dot,
          border: 'none',
          cursor: 'pointer',
          opacity: 0.6,
        }}
        title="Show device info (F1)"
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 14px',
        minWidth: 220,
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.8,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          Signage Client
        </span>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
          title="Hide (F1)"
        >
          ×
        </button>
      </div>

      {/* Device ID */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>ID: </span>
            <span style={{ color: '#60a5fa' }} title={deviceId}>{deviceId.slice(0, 12)}...</span>
          </div>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${SERVER_URL}/api/devices/public/list`);
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                  // Filter out already online devices to avoid pairing conflicts
                  const available = json.data;
                  if (available.length === 0) {
                    alert('No devices registered. Please add a device in Admin Dashboard first.');
                    return;
                  }
                  
                  const options = available.map(d => `${d.nama} (${d.status}) [ID: ${d.id}]`).join('\n');
                  const promptMsg = `Choose a Device to pair with this screen:\n\n` + 
                    available.map((d, i) => `${i + 1}. ${d.nama} (${d.status})`).join('\n') + 
                    `\n\nEnter the number of the device you want to pair (or cancel):`;
                  
                  const choice = window.prompt(promptMsg);
                  if (choice !== null) {
                    const idx = parseInt(choice.trim(), 10) - 1;
                    if (idx >= 0 && idx < available.length) {
                      const targetDevice = available[idx];
                      useDeviceStore.getState().setDeviceId(targetDevice.id);
                      window.location.reload();
                    } else {
                      alert('Invalid selection.');
                    }
                  }
                } else {
                  throw new Error('Failed to retrieve list');
                }
              } catch (err) {
                console.error(err);
                const manualId = window.prompt('Server list unavailable. Enter Device ID manually:', deviceId);
                if (manualId && manualId.trim() !== '') {
                  useDeviceStore.getState().setDeviceId(manualId.trim());
                  window.location.reload();
                }
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            Pair Device
          </button>
        </div>
      </div>

      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Status: </span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: config.dot,
            display: 'inline-block',
            ...(connectionStatus === 'connected' && {
              boxShadow: `0 0 6px ${config.dot}`,
              animation: 'pulse 2s infinite',
            }),
          }}
        />
        <span style={{ color: config.color }}>{config.label}</span>
      </div>

      {/* Last sync */}
      <div>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Sync: </span>
        <span>{lastSyncAt ? format(lastSyncAt) : 'Never'}</span>
      </div>

      {/* Playlist count */}
      <div>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Playlist: </span>
        <span>{playlist.length} item{playlist.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>
        Press F1 to hide
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
