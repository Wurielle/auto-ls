const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronStore', {
    async get(key) {
        return await ipcRenderer.invoke('electron-store-get', key)
    },
    async set(key, value) {
        return await ipcRenderer.invoke('electron-store-set', key, value)
    },
})

contextBridge.exposeInMainWorld('electronDialog', {
    async getLSExecutablePath() {
        return await ipcRenderer.invoke('electron-dialog-get-ls-executable-path')
    },
    async getRivaTunerExecutablePath() {
        return await ipcRenderer.invoke('electron-dialog-get-riva-tuner-executable-path')
    },
})

contextBridge.exposeInMainWorld('electronUtils', {
    async getShortcutKeys() {
        return await ipcRenderer.invoke('electron-utils-get-shortcut-keys')
    },
})

contextBridge.exposeInMainWorld('electronApi', {
    onEvent(channel, callback) {
        ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    },
    async getIconsPath() {
        return await ipcRenderer.invoke('electron-api-get-icons-path')
    },
})
