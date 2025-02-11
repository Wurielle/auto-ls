import Store from 'electron-store'
import { ipcMain } from 'electron';

export const store = new Store();
if (!store.get('processes')) {
    store.set('processes', []);
}

export function getProcessesPaths() {
    return store.get('processes') as string[]
}

export function setProcessesPaths(paths: string[]) {
    return store.set('processes', paths);
}

ipcMain.handle('electron-store-get', (event, key) => {
    return store.get(key);
});

ipcMain.handle('electron-store-set', (event, key, value) => {
    store.set(key, value);
    return true;
});