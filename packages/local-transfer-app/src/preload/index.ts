import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, webContents } from 'electron';
import makeInstance from '../shared/make-instance';

// Custom APIs for renderer
const api = {
  service: makeInstance(webContents.getFocusedWebContents()!)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
