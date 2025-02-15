import { app, globalShortcut } from 'electron'
import { Window } from 'win-control'
import { createWindow } from './window'
import { createTray } from './tray'
import { processes, scaleByPid } from './lossless-scaling'
import { getProcess, addProcess, setStoreValue, getStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
app.whenReady().then(() => {
    if (process.platform === 'win32')
    {
        app.setAppUserModelId('com.nhs.auto-lossless-scaling');
    }
    const { window } = createWindow()
    createTray({window})
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        if (processPath && !getProcess(processPath)) addProcess(processPath);
        scaleByPid(foregroundProcessPid, 0)

        notify({
            title: 'Opting process in',
            body: `${processes[foregroundProcessPid]?.process} will now automatically scale`
        })
    })
    globalShortcut.register('Alt+CommandOrControl+O', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        if (processPath) {
            setStoreValue('processes', ((getStoreValue('processes') || []) as StoreProcess[]).filter((processPath) => processPath !== processPath));

            notify({
                title: 'Opting process out',
                body: `${ processes[foregroundProcessPid]?.process } will no longer automatically scale`
            })
        }
    })
})