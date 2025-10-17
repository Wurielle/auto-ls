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

contextBridge.exposeInMainWorld('AutoUpdater', {
    async checkForUpdates() {
        return await ipcRenderer.invoke('auto-updater.checkForUpdates')
    },
})

contextBridge.exposeInMainWorld('ALS', {
    async optOutProcess(path: string) {
        return await ipcRenderer.invoke('als-opt-out-process', path)
    },
    async scaleByPid(pid: number, wait?: number) {
        return await ipcRenderer.invoke('als-scale-by-pid', pid, wait)
    },
})

contextBridge.exposeInMainWorld('gameLibrary', {
    async getGames() {
        return await ipcRenderer.invoke('game-library-get-games')
    },
    async getProcesses() {
        return await ipcRenderer.invoke('game-library-get-processes')
    },
    async getExes(path: string) {
        return await ipcRenderer.invoke('game-library-get-exes', path)
    },
    async getProcessPath(pid: number) {
        return await ipcRenderer.invoke('game-library-get-process-path', pid)
    },
    async addProcess(path: string) {
        return await ipcRenderer.invoke('game-library-add-process', path)
    },
    async openFileLocation(path: string) {
        return await ipcRenderer.invoke('game-library-open-file-location', path)
    },
})

contextBridge.exposeInMainWorld('optiScaler', {
    async install(exePath: string) {
        return await ipcRenderer.invoke('opti-scaler-install', exePath)
    },
    async uninstall(exePath: string) {
        return await ipcRenderer.invoke('opti-scaler-uninstall', exePath)
    },
    async checkInstall(exePath: string) {
        return await ipcRenderer.invoke('opti-scaler-check-install', exePath)
    },
})