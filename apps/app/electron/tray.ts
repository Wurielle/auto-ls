import path from 'path'
import { PUBLIC_DIR } from './const'
import { app, BrowserWindow, Menu, Tray } from 'electron'

export function createTray({window}: { window: BrowserWindow }): {tray: Tray} {
    const tray = new Tray(path.join(PUBLIC_DIR, 'icons/64x64.png'))

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
    return {
        tray
    }
}