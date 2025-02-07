import { app } from 'electron'

if (!app.requestSingleInstanceLock()) {
    app.quit();
}