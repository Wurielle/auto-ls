import path from 'path'
import { PUBLIC_DIR } from './const'
import { app, BrowserWindow } from 'electron'

export function createWindow(): { window: BrowserWindow } {
    const window = new BrowserWindow({
        icon: path.join(PUBLIC_DIR, 'icons/256x256.png'),
        show: !!process.env.VITE_DEV_SERVER_URL,
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        window.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        window.loadFile('dist/index.html');
    }

    window.on('close', (e) => {
        e.preventDefault()
        window.hide()
    })

    app.on('before-quit', () => {
        window.removeAllListeners()
    })

    return  {
        window
    }
}