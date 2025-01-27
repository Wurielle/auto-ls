import Store from 'electron-store'

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