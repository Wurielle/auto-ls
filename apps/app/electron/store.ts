import Store = require('electron-store')
import { ipcMain } from 'electron'
import get from 'lodash.get'
import set from 'lodash.set'
import { emitter } from './events'
import { Key } from '@nut-tree-fork/nut-js'
import defaultsDeep from 'lodash/defaultsDeep'

const defaultSettings = {
    store: {
        enableLosslessScaling: true,
        enableRivaTuner: false,
        lsExecutablePath: '',
        lsDefaultFramegenMultiplier: 2,
        rivaTunerExecutablePath: '',
        rivaTunerDefaultFPSLimit: 0,
        autoUpdate: true,
        processes: [],
        defaultTimeout: 10000,
        lsScaleShortcut: [Key.LeftControl, Key.LeftAlt, Key.S],
        optInShortcut: [Key.LeftControl, Key.LeftAlt, Key.I],
        optOutShortcut: [Key.LeftControl, Key.LeftAlt, Key.O],
    },
}

export const store = new Store({
    defaults: defaultSettings,
})

store.set('store', defaultsDeep(store.get('store'), defaultSettings.store))

export function setStoreValue(path: string, value: any) {
    const storeValue = store.get('store') || {}
    const newStoreValue = set(storeValue, path, value)
    store.set('store', newStoreValue)
    emitter.emit('store-update', { type: path, value, storeValue: newStoreValue })
}

export function getStoreValue<V>(path?: string): V | null {
    const storeValue = store.get('store') || {}
    if (!path) return storeValue as V
    return get(storeValue, path)
}

export type StoreProcess = {
    path: string;
    lastScaledAt: string;
    scaleTimeout: number;
    options: {
        enableLosslessScaling: boolean;
        lsScaleDelay: number;
        lsFramegenMultiplier: number;
        enableRivaTuner: boolean;
        rivaTunerFPSLimit: number;
    }
}

export function getProcess(path: string): StoreProcess {
    return (getStoreValue<StoreProcess[]>('processes') || []).find((p) => p.path === path)
}

export function addProcess(path: StoreProcess['path'], options?: StoreProcess['options']) {
    const paths: StoreProcess[] = getStoreValue('processes') || []
    const processIndex = paths.findIndex((p) => p.path === path)
    const defaultOptions: StoreProcess['options'] = {
        enableLosslessScaling: getStoreValue('enableLosslessScaling'),
        lsScaleDelay: getStoreValue('defaultTimeout'),
        lsFramegenMultiplier: getStoreValue('lsDefaultFramegenMultiplier'),
        enableRivaTuner: getStoreValue('enableRivaTuner'),
        rivaTunerFPSLimit: getStoreValue('rivaTunerDefaultFPSLimit'),
    }
    if (processIndex === -1) {
        const newPaths: StoreProcess[] = [{
            path,
            lastScaledAt: new Date().toISOString(),
            scaleTimeout: getStoreValue('defaultTimeout'),
            options: {
                ...defaultOptions,
                ...options,
            },
        }, ...paths]
        setStoreValue('processes', newPaths)
    }
}

ipcMain.handle('electron-store-get', (event, key) => {
    return getStoreValue(key)
})

ipcMain.handle('electron-store-set', (event, key, value) => {
    setStoreValue(key, value)
    return true
})