import { getStoreValue } from './store'
import { exec } from 'child_process'
import { rivaTunerVBSPath } from './auto-launch'
import { isProcessRunning, ProcessEvent } from './lossless-scaling'
import * as path from 'path'
import * as fsp from 'fs/promises'
import { existsSync } from 'fs'

export async function startRivaTuner() {
    const isEnabled = getStoreValue('enableRivaTuner')
    if (!isEnabled) return
    const executableName = (getStoreValue('rivaTunerExecutablePath') as string).split('\\').pop();
    const isRunning = await isProcessRunning(executableName)

    console.log('Starting RivaTuner', { executableName, isRunning: isRunning })
    if (!isRunning) {
        exec(`"wscript" "${ rivaTunerVBSPath }"`)
    }
    while (!(await isProcessRunning(executableName))) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

export async function stopRivaTuner() {
    const isEnabled = getStoreValue('enableRivaTuner')
    if (!isEnabled) return
    const executableName = (getStoreValue('rivaTunerExecutablePath') as string).split('\\').pop();
    const { default: psList } = await import('ps-list');
    const processes = await psList();
    const rivaTunerProcesses = processes.filter(p => [
        'RTSS',
        'RTSSHooksLoader',
        'EncoderServer',
    ].some((name) => p.name.includes(name)));
    const isRunning = !!rivaTunerProcesses.length

    console.log('Stopping RivaTuner', { executableName, isRunning: isRunning })
    if (isRunning) {
        await Promise.all(rivaTunerProcesses.map(async (p) => {
            if (p && p.pid) {
                console.log(`${p.name}: ${p.pid}`);
                try {
                    process.kill(p.pid);
                    while (await isProcessRunning(p.name)) {
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }
                } catch (error) {
                    console.error(`Failed to kill ${p.name} process: ${error}`);
                }
            }
        }));
    }

    return false; // Process wasn't running or couldn't be found
}

export async function registerRivaTunerProfile(processInfo: ProcessEvent['payload']) {
    const exePath = getStoreValue('rivaTunerExecutablePath') as string
    if (!exePath) return
    const rivaTunerConfigFilePath = path.resolve(path.dirname(exePath), 'Profiles', `${processInfo.process}.cfg`)
    if (!existsSync(rivaTunerConfigFilePath)) {
        await stopRivaTuner()
        const fileContent = await fsp.readFile(path.resolve(path.dirname(exePath), 'ProfileTemplates', `Global`), 'utf8')
        await fsp.writeFile(rivaTunerConfigFilePath, fileContent, 'utf8')
    }
    await startRivaTuner()
}