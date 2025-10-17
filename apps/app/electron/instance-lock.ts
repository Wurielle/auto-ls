import { app, BrowserWindow } from 'electron'

if (!app.requestSingleInstanceLock()) {
    app.quit()
} else {
    // When a second instance is launched, focus or show the existing window
    app.on('second-instance', () => {
        const [win] = BrowserWindow.getAllWindows()
        if (win) {
            if (win.isMinimized()) {
                win.restore()
            }
            if (!win.isVisible()) {
                win.show()
            }
            win.focus()
        }
    })
}