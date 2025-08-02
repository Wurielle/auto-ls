import { autoUpdater } from "electron-updater"
import { ipcMain } from 'electron'
import { getStoreValue, setStoreValue } from './store'

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
})

const enableAutoUpdate = getStoreValue('autoUpdate')

if (enableAutoUpdate || typeof enableAutoUpdate === 'undefined') {
    setStoreValue('autoUpdate', true)
    autoUpdater.checkForUpdates()
}

ipcMain.handle('auto-updater.checkForUpdates', async () => {
    return autoUpdater.checkForUpdates()
})