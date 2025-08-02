import './logs'
import './auto-updater'
import { app, dialog, globalShortcut, ipcMain } from 'electron'
import { Window } from 'win-control'
import { createWindow } from './window'
import { createTray } from './tray'
import { processes, scaleByPid, startLosslessScaling } from './lossless-scaling'
import { addProcess, getProcess } from './store'
import { notify } from './notifications'
import { Key } from '@nut-tree-fork/nut-js'
import { emitter } from './events'
import * as fs from 'node:fs'
import path from 'path'
import extractFileIcon from "extract-file-icon"
import { registerRivaTunerProfile, startRivaTuner } from './riva-tuner'
import { optOutProcess } from './auto-lossless-scaling'

const iconsDir = path.join(app.getPath("userData"), "icons")

function extractProcessIcon(exePath: string) {
    const iconPath = `${ iconsDir }/${ exePath.split('\\').pop().replace('.exe', '') }.png`

    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true })
    }
    if (!fs.existsSync(iconPath)) {
        try {
            const iconBuffer = extractFileIcon(exePath, 64)
            fs.writeFileSync(iconPath, iconBuffer)
        } catch (error) {
            console.error("Failed to extract icon:", error)
            return null
        }
    }
}

async function isExplorerRunning() {
    const psList = (await import('ps-list')).default
    const processes = await psList()
    const explorerProcess = processes.find(p => p.name === 'explorer.exe')
    return !!explorerProcess
}

async function waitForExplorer() {
    while (!(await isExplorerRunning())) {
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // safely wait for explorer to start properly
    await new Promise(resolve => setTimeout(resolve, 10000))
}

app.whenReady().then(async () => {
    await waitForExplorer()
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.nhs.auto-lossless-scaling')
    }
    await startLosslessScaling()
    await startRivaTuner()
    const { window } = createWindow()
    createTray({ window })
    if (process.env.NODE_ENV === 'development') {
        globalShortcut.register('Alt+CommandOrControl+D', () => {
            const foregroundProcessPid = Window.getForeground().getPid()
            const processInfo = processes[foregroundProcessPid]
            // applyLosslessScalingProfile(processInfo)
            registerRivaTunerProfile(processInfo)
        })
    }
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processInfo = processes[foregroundProcessPid]
        if (processInfo) {
            const processPath = processInfo.filepath
            if (processPath && !getProcess(processPath)) {
                extractProcessIcon(processPath)
                addProcess(processPath)
            }
            scaleByPid(foregroundProcessPid, 0)

            notify({
                title: 'Opting process in',
                body: `${ processInfo.process } will now automatically scale`,
            })
        } else {
            notify({
                title: 'Process not detected',
                body: `The requested process needs to be restarted`,
            })
        }
    })
    globalShortcut.register('Alt+CommandOrControl+O', async () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        await optOutProcess(processPath)
    })

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

    ipcMain.handle('als-opt-out-process', async (_, path: string) => {
        return await optOutProcess(path)
    })

    emitter.on('store-update', () => {
        if (window && !window.isDestroyed()) {
            window.webContents.send('store-update')
        }
    })
}).catch(console.error)
