import { app } from 'electron'

app.whenReady().then(() => {
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe'),
    })
})