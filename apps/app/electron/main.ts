import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fork } from 'child_process'
import {EXTERNALS_DIR} from './const'
import micromatch from 'micromatch'
import { Window } from 'win-control'
const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'Update.exe')
const exeName = path.basename(process.execPath)

app.setLoginItemSettings({
    openAtLogin: true,
    path: updateExe,
    args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', '"--hidden"'
    ]
})

app.whenReady().then(() => {
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

const child = fork(path.join(EXTERNALS_DIR, 'process-watcher.js'))
child.on('message', (processInfo: ProcessEvent) => {
    if (processInfo.type === 'process-creation' && micromatch.isMatch(processInfo.payload.filepath, [
        '**/steamapps/**'
    ])) {
        // require('windows-tlist').getProcessInfo(pid).then(console.log) // Gets more info about loaded DLLs, etc
        console.log('Watching target process', processInfo)
        const { pid } = processInfo.payload
        let timeout
        let interval
        interval = setInterval(() => {
            const foregroundWindowPID = Window.getForeground().getPid();
            if (pid === foregroundWindowPID) {
                clearInterval(interval)
                clearTimeout(timeout)
                setTimeout(async () => {
                    console.log('Scaling', processInfo.payload.process)
                    const { Key, keyboard } = await import('@nut-tree-fork/nut-js')
                    const keys = [Key.LeftControl, Key.LeftAlt, Key.S]
                    await keyboard.pressKey(...keys)
                    await keyboard.releaseKey(...keys)
                }, 3000)
            }
        }, 1000)
        setTimeout(
            () => {
                clearInterval(interval)
            },
            5 * 60 * 1000,
        )
    }
})