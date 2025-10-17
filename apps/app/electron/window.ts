import * as path from 'node:path'
import { PUBLIC_DIR } from './const'
import { app, BrowserWindow } from 'electron'

export function createWindow(): { window: BrowserWindow } {
    const window = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path.join(PUBLIC_DIR, 'icons/256x256.png'),
        show: !!process.env.VITE_DEV_SERVER_URL,
    })

    window.maximize()

    if (process.env.VITE_DEV_SERVER_URL) {
        window.loadURL(process.env.VITE_DEV_SERVER_URL)
        window.webContents.openDevTools()
    } else {
        window.hide()
        window.setMenu(null)
        window.loadFile('dist/index.html')
    }

    window.on('close', (e) => {
        e.preventDefault()
        window.hide()
    })

    app.on('before-quit', () => {
        window.removeAllListeners()
    })

    return {
        window,
    }
}