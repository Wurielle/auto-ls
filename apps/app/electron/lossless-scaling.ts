import { exec, fork } from 'child_process'
import { Window } from 'win-control'
import { getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { app } from 'electron'
import micromatch from 'micromatch'
import { notify } from './notifications'
import { lsVBSPath } from './auto-launch'
import * as path from 'path'
import * as fsp from 'fs/promises'
import * as convert from 'xml-js';
import cloneDeep from 'lodash/cloneDeep'
import { registerRivaTunerProfile } from './riva-tuner'

export async function isProcessRunning(processName: string) {
    const psList = (await import('ps-list')).default
    const processes = await psList()
    return processes.some(p => p.name.includes(processName))
}

export async function applyLosslessScalingProfile(processInfo: ProcessEvent['payload']) {
    await stopLosslessScaling()
    const lsConfigFilePath = path.resolve(app.getPath('appData'), '../Local', 'Lossless Scaling', 'Settings.xml')
    const fileContent = await fsp.readFile(lsConfigFilePath, 'utf8')
    const json = convert.xml2json(fileContent, {compact: true, spaces: 4})
    const jsonObj = JSON.parse(json)
    if (!Array.isArray(jsonObj.Settings.GameProfiles.Profile)) {
        jsonObj.Settings.GameProfiles.Profile = [
            jsonObj.Settings.GameProfiles.Profile,
        ]
    }

    const profiles = jsonObj.Settings.GameProfiles.Profile

    const autoLSProfileName = 'Auto Lossless Scaling'
    let autoLSProfile = profiles.find(p => p.Title._text === autoLSProfileName)
    if (!autoLSProfile) {
        const defaultProfile = profiles[0]
        autoLSProfile = { ...cloneDeep(defaultProfile), Title: { _text: autoLSProfileName }}
        profiles.push(autoLSProfile)
    }

    let processProfile = profiles.find(p => p.Title._text === processInfo.process)
    if (!processProfile) {
        processProfile = { ...cloneDeep(autoLSProfile), Title: { _text: processInfo.process }}
        profiles.push(processProfile)
    }

    profiles[0] = processProfile

    const xml = convert.json2xml(JSON.stringify(jsonObj), {compact: true, ignoreComment: true, spaces: 4})
    await fsp.writeFile(lsConfigFilePath, xml, 'utf8')
    await startLosslessScaling()
}

export async function stopLosslessScaling() {
    const executableName = (getStoreValue('lsExecutablePath') as string).split('\\').pop();
    const isLSRunning = await isProcessRunning(executableName);

    if (isLSRunning) {
        const { default: psList } = await import('ps-list');
        const processes = await psList();
        const lsProcess = processes.find(p => p.name.includes(executableName));

        if (lsProcess && lsProcess.pid) {
            try {
                process.kill(lsProcess.pid);
                return true;
            } catch (error) {
                console.error(`Failed to kill Lossless Scaling process: ${error}`);
                return false;
            }
        }
    }

    return false; // Process wasn't running or couldn't be found
}


export async function startLosslessScaling() {
    const executableName = (getStoreValue('lsExecutablePath') as string).split('\\').pop();
    const isLSRunning = await isProcessRunning(executableName)
    if (!isLSRunning) {
        exec(`"wscript" "${ lsVBSPath }"`)
    }
}

export type ProcessEvent = {
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

export async function scaleByPid(pid: number, wait?: number) {
    const processInfo = processes[pid]
    if (!processInfo) return
    await applyLosslessScalingProfile(processInfo)
    await registerRivaTunerProfile(processInfo)
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
                    const { keyboard } = await import('@nut-tree-fork/nut-js')
                    const keys = getStoreValue('lsScaleShortcut')
                    await keyboard.pressKey(...keys)
                    await keyboard.releaseKey(...keys)
                } else {
                    triggerKeybindTimeout = setTimeout(triggerKeybind, 1000)
                }
            }

            triggerKeybindTimeout = setTimeout(triggerKeybind, wait || getStoreValue('defaultTimeout'))
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
        const storeProcess = storeProcesses.find(p => p.path === processInfo.payload.filepath)
        scaleByPid(processInfo.payload.pid, storeProcess?.scaleTimeout)
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