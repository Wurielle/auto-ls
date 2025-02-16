import { app, dialog, globalShortcut, ipcMain } from 'electron'
import { Window } from 'win-control'
import { createWindow } from './window'
import { createTray } from './tray'
import { processes, scaleByPid } from './lossless-scaling'
import { addProcess, getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
import { Key } from '@nut-tree-fork/nut-js'

app.whenReady().then(() => {
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.nhs.auto-lossless-scaling')
    }
    const { window } = createWindow()
    createTray({ window })
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        if (processPath && !getProcess(processPath)) addProcess(processPath)
        scaleByPid(foregroundProcessPid, 0)

        notify({
            title: 'Opting process in',
            body: `${ processes[foregroundProcessPid]?.process } will now automatically scale`,
        })
    })
    globalShortcut.register('Alt+CommandOrControl+O', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        if (processPath) {
            setStoreValue('processes', ((getStoreValue('processes') || []) as StoreProcess[]).filter((processPath) => processPath !== processPath))

            notify({
                title: 'Opting process out',
                body: `${ processes[foregroundProcessPid]?.process } will no longer automatically scale`,
            })
        }
    })

    ipcMain.handle('electron-dialog-get-ls-executable-path', async (event, key, value) => {
        const res = await dialog.showOpenDialog({
            filters: [
                { name: 'Executable', extensions: ['exe'] },
            ],
        })
        return res.filePaths[0]
    })

    ipcMain.handle('electron-utils-get-shortcut-keys', async (event, key, value) => {
        return Key
    })
})