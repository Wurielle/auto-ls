import { getStoreValue } from './store'
import { exec } from 'child_process'
import { rivaTunerVBSPath } from './auto-launch'
import { isProcessRunning, ProcessEvent } from './lossless-scaling'
import * as path from 'path'
import * as fsp from 'fs/promises'
import { existsSync } from 'fs'

export async function startRivaTuner() {
    const executableName = (getStoreValue('rivaTunerExecutablePath') as string).split('\\').pop();
    const isRunning = await isProcessRunning(executableName)
    if (!isRunning) {
        exec(`"wscript" "${ rivaTunerVBSPath }"`)
    }
}

export async function stopRivaTuner() {
    const executableName = (getStoreValue('rivaTunerExecutablePath') as string).split('\\').pop();
    const isRunning = await isProcessRunning(executableName);

    if (isRunning) {
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

export async function registerRivaTunerProfile(processInfo: ProcessEvent['payload']) {
    const exePath = getStoreValue('rivaTunerExecutablePath') as string
    if (!exePath) return
    await stopRivaTuner()
    const rivaTunerConfigFilePath = path.resolve(path.dirname(exePath), 'Profiles', `${processInfo.process}.cfg`)
    if (!existsSync(rivaTunerConfigFilePath)) {
        const fileContent = await fsp.readFile(path.resolve(path.dirname(exePath), 'ProfileTemplates', `Global`), 'utf8')
        await fsp.writeFile(rivaTunerConfigFilePath, fileContent, 'utf8')
    }
    await startRivaTuner()
}