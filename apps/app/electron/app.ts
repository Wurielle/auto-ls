import { app, globalShortcut } from 'electron'
import { Window } from 'win-control'
import { createWindow } from './window'
import { createTray } from './tray'
import { processes, scaleByPid } from './lossless-scaling'
import { getProcessesPaths, setProcessesPaths } from './store'
import { notify } from './notifications'

app.whenReady().then(() => {
    const { window } = createWindow()
    createTray({window})
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        const processPath = processes[foregroundProcessPid]?.filepath
        const processesPaths = getProcessesPaths()
        if (processPath && processesPaths.indexOf(processPath) === -1) setProcessesPaths([...getProcessesPaths(), processPath]);
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
            setProcessesPaths([...getProcessesPaths()].filter((processPath) => processPath !== processPath));

            notify({
                title: 'Opting process out',
                body: `${ processes[foregroundProcessPid]?.process } will no longer automatically scale`
            })
        }
    })
})