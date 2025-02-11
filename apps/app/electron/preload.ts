const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronStore', {
    get: async (key) => {
        return await ipcRenderer.invoke('electron-store-get', key);
    },
    set: async (key, value) => {
        return await ipcRenderer.invoke('electron-store-set', key, value);
    },
});