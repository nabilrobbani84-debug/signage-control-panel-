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

  const [isPairing, setIsPairing] = useState(false);
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedPairId, setSelectedPairId] = useState('');
  const [manualIdInput, setManualIdInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchDevicesForPairing = async () => {
    setLoadingDevices(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/devices/public/list`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDevicesList(json.data);
        if (json.data.length > 0) {
          setSelectedPairId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load devices list', err);
      setShowManualInput(true);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleConfirmPairing = () => {
    const finalId = showManualInput ? manualIdInput.trim() : selectedPairId;
    if (!finalId) {
      alert('Please enter or select a valid Device ID.');
      return;
    }
    useDeviceStore.getState().setDeviceId(finalId);
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '12px 16px',
        minWidth: 260,
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.8,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 4 }}>
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
            marginLeft: 'auto',
          }}
          title="Hide (F1)"
        >
          ×
        </button>
      </div>

      {isPairing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: 10, color: '#60a5fa' }}>PAIR WITH DEVICE:</div>
          
          {loadingDevices ? (
            <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading devices...</div>
          ) : showManualInput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                type="text"
                placeholder="Enter Device UUID"
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: 4,
                  padding: '4px 6px',
                  fontSize: 10,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setShowManualInput(false)}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 9, cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                ← Back to dropdown
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {devicesList.length === 0 ? (
                <div style={{ color: '#ef4444', fontSize: 10 }}>No devices registered.</div>
              ) : (
                <select
                  value={selectedPairId}
                  onChange={(e) => setSelectedPairId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 4,
                    padding: '4px 6px',
                    fontSize: 10,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {devicesList.map((d) => (
                    <option key={d.id} value={d.id} style={{ background: '#111', color: 'white' }}>
                      {d.nama} ({d.status === 'ONLINE' ? '🟢' : '🔴'})
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowManualInput(true)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 9, cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Or enter manual ID...
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button
              onClick={handleConfirmPairing}
              style={{
                flex: 1,
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 10,
              }}
            >
              Connect
            </button>
            <button
              onClick={() => {
                setIsPairing(false);
                setShowManualInput(false);
              }}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 10,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Device ID */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>ID: </span>
                <span style={{ color: '#60a5fa' }} title={deviceId}>{deviceId.slice(0, 12)}...</span>
              </div>
              <button
                onClick={() => {
                  setIsPairing(true);
                  fetchDevicesForPairing();
                }}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 9,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 'bold',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                Pair Device
              </button>
            </div>
          </div>
        </>
      )}

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
