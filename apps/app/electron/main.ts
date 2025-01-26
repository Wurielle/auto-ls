import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'node:path'
import { fork } from 'child_process'
import {EXTERNALS_DIR} from './const'
import micromatch from 'micromatch'
import { Window } from 'win-control'
const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'Update.exe')
const exeName = path.basename(process.execPath)
import Store from 'electron-store';

type ProcessEvent = {
    type: 'process-creation' | 'process-deletion'
    payload: {
        pid: number
        filepath: string
        process: string
        user: string
    }
}
/* Unfortunately some games (e.g: Marvel Rivals) prevent you to get infos on the process such as the path
 * but this info is available on process creation so we keep a list of processes created in order to find the path when we need it
 */
const processes: Record<string, ProcessEvent['payload']> = {}
const store = new Store();
if (!store.get('processes')) {
    store.set('processes', []);
}
app.setLoginItemSettings({
    openAtLogin: true,
    path: updateExe,
    args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', '"--hidden"'
    ]
})

function getProcessPaths() {
    return store.get('processes') as string[]
}

app.whenReady().then(() => {
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        console.log('Opt in', foregroundProcessPid)
        const processPath = processes[foregroundProcessPid]?.filepath
        const processesPaths = getProcessPaths()
        if (processPath && processesPaths.indexOf(processPath) === -1) store.set('processes', [...getProcessPaths(), processPath]);
        scaleByPid(foregroundProcessPid, 0)
    })
    globalShortcut.register('Alt+CommandOrControl+O', () => {
        const foregroundProcessPid = Window.getForeground().getPid()
        console.log('Opt out', foregroundProcessPid)
        const processPath = processes[foregroundProcessPid]?.filepath
        if (processPath) store.set('processes', [...getProcessPaths()].filter((processPath) => processPath !== processPath));
    })
    const win = new BrowserWindow({
        title: 'Main window',
    })

    // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        // Load your file
        win.loadFile('dist/index.html');
    }
})

function scaleByPid(pid: number, wait = 10000) {
    console.log('scale', pid)
    let timeout
    let interval
    interval = setInterval(() => {
        const foregroundWindowPID = Window.getForeground().getPid();
        if (pid === foregroundWindowPID) {
            clearInterval(interval)
            clearTimeout(timeout)
            let triggerKeybindTimeout;
            async function triggerKeybind() {
                console.log('trigger keybind')
                if (pid === foregroundWindowPID) {
                    clearTimeout(triggerKeybindTimeout)
                    const { Key, keyboard } = await import('@nut-tree-fork/nut-js')
                    const keys = [Key.LeftControl, Key.LeftAlt, Key.S]
                    await keyboard.pressKey(...keys)
                    await keyboard.releaseKey(...keys)
                } else {
                    triggerKeybindTimeout = setTimeout(triggerKeybind, 1000)
                }
            }
            triggerKeybindTimeout = setTimeout(triggerKeybind, wait)
            setTimeout(
                () => {
                    clearTimeout(triggerKeybindTimeout)
                },
                5 * 60 * 1000,
            )
        }
    }, 1000)
    setTimeout(
        () => {
            clearInterval(interval)
        },
        5 * 60 * 1000,
    )
}

const child = fork(require.resolve('process-watcher'))
child.on('message', (processInfo: ProcessEvent) => {
    if (processInfo.type === 'process-creation') {
        processes[processInfo.payload.pid] = processInfo.payload
    } else if (processInfo.type === 'process-deletion') {
        delete processes[processInfo.payload.pid]
    }
    const processesPaths = getProcessPaths()
    if (processInfo.type === 'process-creation' && micromatch.isMatch(processInfo.payload.filepath, processesPaths, {})) {
        // require('windows-tlist').getProcessInfo(pid).then(console.log) // Gets more info about loaded DLLs, etc
        console.log('Scaling', processInfo.payload.process)
        scaleByPid(processInfo.payload.pid)
    }
})