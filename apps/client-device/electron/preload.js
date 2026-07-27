const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a safe, narrow API from the main process to the renderer.
 * All exposed functions are explicitly named — no catch-all channel access.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  toggleKiosk: () => ipcRenderer.invoke('toggle-kiosk'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  isElectron: true,
});
