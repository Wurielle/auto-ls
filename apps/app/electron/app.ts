import './logs'
import './auto-updater'
import { app, dialog, globalShortcut, ipcMain } from 'electron'
import { createWindow } from './window'
import { createTray } from './tray'
import { getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
import { Key } from '@nut-tree-fork/nut-js'
import { emitter } from './events'
import { optInProcess, optOutProcess, scaleByPid } from './auto-lossless-scaling'
import { getActiveWindowPid, waitForExplorer } from './utils/native'
import { iconsDir } from './utils/filesystem'
import { processWatcher } from './process-watcher-instance'
import automations from './automations'
import { nutKeyToElectronAccelerator } from './utils/shortcuts'
import micromatch = require('micromatch')

async function initElectronApp() {
    await waitForExplorer()
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.nhs.auto-lossless-scaling')
    }
    await Promise.all(automations.map((automation) => automation.init()))
    const { window } = createWindow()
    createTray({ window })

    emitter.on('store-update', () => {
        if (window && !window.isDestroyed()) {
            window.webContents.send('store-update')
        }
    })
}

function registerShortcuts() {
    globalShortcut.unregisterAll()

    if (process.env.NODE_ENV === 'development') {
        globalShortcut.register('Alt+CommandOrControl+D', async () => {
            const foregroundProcessPid = await getActiveWindowPid()
            const processInfo = processWatcher.getByPid(foregroundProcessPid)
            console.log({
                foregroundProcessPid,
                processInfo,
            })
        })
    }

    const optInKeys = getStoreValue<number[]>('optInShortcut')
    if (optInKeys) {
        const accelerator = nutKeyToElectronAccelerator(optInKeys)
        if (accelerator) {
            globalShortcut.register(accelerator, async () => {
                const foregroundProcessPid = await getActiveWindowPid()
                await optInProcess(foregroundProcessPid)
            })
        }
    }

    const optOutKeys = getStoreValue<number[]>('optOutShortcut')
    if (optOutKeys) {
        const accelerator = nutKeyToElectronAccelerator(optOutKeys)
        if (accelerator) {
            globalShortcut.register(accelerator, async () => {
                const foregroundProcessPid = await getActiveWindowPid()
                const processPath = processWatcher.getByPid(foregroundProcessPid)?.filepath
                await optOutProcess(processPath)
            })
        }
    }
}

function initElectronShortcuts() {
    registerShortcuts()
    emitter.on('store-update', ({ type }) => {
        if (['optInShortcut', 'optOutShortcut'].includes(type)) {
            registerShortcuts()
        }
    })
}

function initEventListeners() {
    ipcMain.handle('electron-dialog-get-ls-executable-path', async () => {
        const res = await dialog.showOpenDialog({
            filters: [
                { name: 'Executable', extensions: ['exe'] },
            ],
        })
        return res.filePaths[0]
    })

    ipcMain.handle('electron-dialog-get-riva-tuner-executable-path', async () => {
        const res = await dialog.showOpenDialog({
            filters: [
                { name: 'Executable', extensions: ['exe'] },
            ],
        })
        return res.filePaths[0]
    })

    ipcMain.handle('electron-utils-get-shortcut-keys', async () => {
        return Key
    })

    ipcMain.handle('electron-api-get-icons-path', async () => {
        return iconsDir
    })

    processWatcher.on('process-creation', async (processInfo) => {
        const storeProcesses: StoreProcess[] = getStoreValue('processes') || []
        if (micromatch.isMatch(processInfo.filepath, storeProcesses.map((p) => p.path), {})) {
            // require('windows-tlist').getProcessInfo(pid).then(console.log) // Gets more info about loaded DLLs, etc
            const storeProcess = storeProcesses.find(p => p.path === processInfo.filepath)
            notify({
                title: 'Process detected',
                body: `${ processInfo.process } will be scaled soon`,
            })
            const detectedProcess = getProcess(processInfo.filepath)
            const updatedStoreProcesses: StoreProcess[] = [{
                ...detectedProcess,
                lastScaledAt: (new Date()).toISOString(),
            }, ...storeProcesses.filter((p) => p.path !== detectedProcess.path)]
            setStoreValue('processes', updatedStoreProcesses)
            await scaleByPid(processInfo.pid, storeProcess.options?.lsScaleDelay || storeProcess?.scaleTimeout)
        }
    })
}

app.whenReady()
    .then(initElectronApp)
    .then(initElectronShortcuts)
    .then(initEventListeners)
    .catch(console.error)
