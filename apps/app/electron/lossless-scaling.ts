import { fork } from 'child_process'
import { Window } from 'win-control'
import { getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { app } from 'electron'
import micromatch from 'micromatch'
import { notify } from './notifications'

type ProcessEvent = {
    type: 'process-creation' | 'process-deletion'
    payload: {
        pid: number
        filepath: string
        process: string
        user: string
    }
}
/* Unfortunately some games (e.g: Marvel Rivals) prevent you to get infos on the process such as the path
 * but this info is available on process creation so we keep a list of processes created in order to find the path when we need it
 */
export const processes: Record<string, ProcessEvent['payload']> = {}

export function scaleByPid(pid: number, wait = 3000) {
    let timeout
    let interval
    interval = setInterval(() => {
        const foregroundWindowPID = Window.getForeground().getPid()
        if (pid === foregroundWindowPID) {
            clearInterval(interval)
            clearTimeout(timeout)
            let triggerKeybindTimeout

            async function triggerKeybind() {
                if (pid === foregroundWindowPID) {
                    clearTimeout(triggerKeybindTimeout)
                    const { Key, keyboard } = await import('@nut-tree-fork/nut-js')
                    const keys = getStoreValue('lsScaleShortcut')
                    await keyboard.pressKey(...keys)
                    await keyboard.releaseKey(...keys)
                } else {
                    triggerKeybindTimeout = setTimeout(triggerKeybind, 1000)
                }
            }

            triggerKeybindTimeout = setTimeout(triggerKeybind, wait)
            setTimeout(
                () => {
                    clearTimeout(triggerKeybindTimeout)
                },
                5 * 60 * 1000,
            )
        }
    }, 1000)
    setTimeout(
        () => {
            clearInterval(interval)
        },
        5 * 60 * 1000,
    )
}

const child = fork(require.resolve('process-watcher'))
child.on('message', (processInfo: ProcessEvent) => {
    if (processInfo.type === 'process-creation') {
        processes[processInfo.payload.pid] = processInfo.payload
    } else if (processInfo.type === 'process-deletion') {
        delete processes[processInfo.payload.pid]
    }
    const storeProcesses: StoreProcess[] = getStoreValue('processes') || []
    if (processInfo.type === 'process-creation' && micromatch.isMatch(processInfo.payload.filepath, storeProcesses.map((p) => p.path), {})) {
        // require('windows-tlist').getProcessInfo(pid).then(console.log) // Gets more info about loaded DLLs, etc
        scaleByPid(processInfo.payload.pid)
        notify({
            title: 'Process detected',
            body: `${ processInfo.payload.process } will be scaled soon`,
        })
        const detectedProcess = getProcess(processInfo.payload.filepath)
        const updatedStoreProcesses: StoreProcess[] = [{
            ...detectedProcess,
            lastScaledAt: (new Date()).toISOString(),
        }, ...storeProcesses.filter((p) => p.path !== detectedProcess.path)]
        setStoreValue('processes', updatedStoreProcesses)
    }
})
app.on('before-quit', () => {
    child.kill()
})