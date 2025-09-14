import './logs'
import './auto-updater'
import { app, dialog, globalShortcut, ipcMain } from 'electron'
import { createWindow } from './window'
import { createTray } from './tray'
import { processes, scaleByPid, startLosslessScaling } from './lossless-scaling'
import { addProcess, getProcess } from './store'
import { notify } from './notifications'
import { Key } from '@nut-tree-fork/nut-js'
import { emitter } from './events'
import * as fs from 'node:fs'
import * as path from 'node:path'
import extractFileIcon from "extract-file-icon"
import { startRivaTuner } from './riva-tuner'
import { optOutProcess } from './auto-lossless-scaling'
import { getActiveWindowPid, waitForExplorer } from './utils/native'

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
        globalShortcut.register('Alt+CommandOrControl+D', async () => {
            const foregroundProcessPid = await getActiveWindowPid()
            const processInfo = processes[foregroundProcessPid]
            console.log({
                foregroundProcessPid,
                processInfo,
            })
        })
    }
    globalShortcut.register('Alt+CommandOrControl+I', async () => {
        const foregroundProcessPid = await getActiveWindowPid()
        const processInfo = processes[foregroundProcessPid]

        console.log('Opt in', foregroundProcessPid)
        console.log('Current process list', processes)
        console.log('Process info', processInfo)
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
        const foregroundProcessPid = await getActiveWindowPid()
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
