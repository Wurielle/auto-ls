import { app, BrowserWindow, globalShortcut } from 'electron'
import { fork } from 'child_process'
import micromatch from 'micromatch'
import { Window } from 'win-control'
import Store from 'electron-store';
import { Tray, Menu } from 'electron'
import path from 'path'
import { PUBLIC_DIR } from './const'
import AutoLaunch from 'auto-launch'

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

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

let window: BrowserWindow

const appAutoLauncher = new AutoLaunch({
    name: 'Auto Lossless Scaling',
    path: process.execPath,
    isHidden: true,
})

appAutoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
        appAutoLauncher.enable().catch((err) => {
            console.error('Failed to enable auto-launch:', err)
        })
    }
}).catch((err) => {
    console.error('Failed to check auto-launch status:', err)
})


let tray: Tray | null = null

function createTray() {
    tray = new Tray(path.join(PUBLIC_DIR, 'icons/64x64.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Restart',
            click: () => {
                app.relaunch()
                app.quit()
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit()
            },
        }
    ])
    tray.on('click', () => window?.show())
    tray.setToolTip('Auto Lossless Scaling')
    tray.setContextMenu(contextMenu)
    app.on('before-quit', () => {
        tray.removeAllListeners()
    })
}

app.whenReady().then(() => {
    createTray()
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

    window = new BrowserWindow({
        icon: path.join(PUBLIC_DIR, 'icons/256x256.png'),
        show: import.meta.env.DEV,
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        window.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        window.loadFile('dist/index.html');
    }
    
    window.on('close', (e) => {
        e.preventDefault() // Prevent the default behavior of quitting the application
        window.hide() // Hide the window instead of closing it
    })
    app.on('before-quit', () => {
        window.removeAllListeners()
    })
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
app.on('before-quit', () => {
    child.kill()
})