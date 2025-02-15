import Store from 'electron-store'
import { ipcMain } from 'electron';
import get from 'lodash.get'
import set from 'lodash.set'
import { emitter } from './events'

export const store = new Store({
    defaults: {
        store: {
            processes: [],
            defaultTimeout: 5000,
            lsExecutablePath: '',
        }
    }
});

export function setStoreValue(path: string, value: any) {
    const storeValue = store.get('store') || {};
    const newStoreValue = set(storeValue, path, value);
    store.set('store', newStoreValue);
    emitter.emit('store-update', { type: path, value, storeValue: newStoreValue });
}

export function getStoreValue<V>(path: string): V | null {
    const storeValue = store.get('store') || {};
    return get(storeValue, path);
}

export type StoreProcess = {
    path: string;
    lastScaledAt: string;
    scaleTimeout: number;
}

export function getProcess(path: string): StoreProcess {
    return (getStoreValue<StoreProcess[]>('processes') || []).find((p) => p.path === path);
}

export function addProcess(path: StoreProcess['path']) {
    const paths: StoreProcess[] = getStoreValue('processes') || [];
    const processIndex = paths.findIndex((p) => p.path === path);
    if (processIndex === -1) {
        const newPaths: StoreProcess[] = [ {
            path,
            lastScaledAt: new Date().toISOString(),
            scaleTimeout: getStoreValue('defaultTimeout'),
        }, ...paths]
            setStoreValue('processes', newPaths);
    }
}

ipcMain.handle('electron-store-get', (event, key) => {
    return getStoreValue(key);
});

ipcMain.handle('electron-store-set', (event, key, value) => {
    setStoreValue(key, value);
    return true;
});