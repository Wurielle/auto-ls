import { exec } from 'child_process'
import { getStoreValue } from './store'
import { app } from 'electron'
import { lsVBSPath } from './auto-launch'
import * as path from 'node:path'
import * as fsp from 'fs/promises'
import * as convert from 'xml-js'
import cloneDeep from 'lodash/cloneDeep'
import { isProcessRunning } from './utils/native'
import { ProcessWatcherForkEvent } from './process-watcher'

export async function applyLosslessScalingProfile(processInfo: ProcessWatcherForkEvent['payload']) {
    await stopLosslessScaling()
    const lsConfigFilePath = path.resolve(app.getPath('appData'), '../Local', 'Lossless Scaling', 'Settings.xml')
    const fileContent = await fsp.readFile(lsConfigFilePath, 'utf8')
    const json = convert.xml2json(fileContent, { compact: true, spaces: 4 })
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
        autoLSProfile = { ...cloneDeep(defaultProfile), Title: { _text: autoLSProfileName } }
        profiles.push(autoLSProfile)
    }

    let processProfile = profiles.find(p => p.Title._text === processInfo.process)
    if (!processProfile) {
        processProfile = { ...cloneDeep(autoLSProfile), Title: { _text: processInfo.process } }
        profiles.push(processProfile)
    }

    profiles[0] = processProfile

    const xml = convert.json2xml(JSON.stringify(jsonObj), { compact: true, ignoreComment: true, spaces: 4 })
    await fsp.writeFile(lsConfigFilePath, xml, 'utf8')
    await startLosslessScaling()
}

export async function removeLosslessScalingProfile(name: string) {
    await stopLosslessScaling()
    const lsConfigFilePath = path.resolve(app.getPath('appData'), '../Local', 'Lossless Scaling', 'Settings.xml')
    const fileContent = await fsp.readFile(lsConfigFilePath, 'utf8')
    const json = convert.xml2json(fileContent, { compact: true, spaces: 4 })
    const jsonObj = JSON.parse(json)
    if (!Array.isArray(jsonObj.Settings.GameProfiles.Profile)) {
        return
    }

    const profiles = jsonObj.Settings.GameProfiles.Profile
    const profileIndex = profiles.findIndex(p => p.Title._text === name)

    if (profileIndex > -1) {
        jsonObj.Settings.GameProfiles.Profile.splice(profileIndex, 1)
    }

    const xml = convert.json2xml(JSON.stringify(jsonObj), { compact: true, ignoreComment: true, spaces: 4 })
    await fsp.writeFile(lsConfigFilePath, xml, 'utf8')
    await startLosslessScaling()
}

export async function stopLosslessScaling() {
    const executableName = (getStoreValue('lsExecutablePath') as string).split('\\').pop()
    const isRunning = await isProcessRunning(executableName)

    console.log('Stopping Lossless Scaling', { executableName, isRunning: isRunning })
    if (isRunning) {
        const { default: psList } = await import('ps-list')
        const processes = await psList()
        const lsProcess = processes.find(p => p.name.includes(executableName))

        if (lsProcess && lsProcess.pid) {
            try {
                process.kill(lsProcess.pid)
                while (await isProcessRunning(executableName)) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            } catch (error) {
                console.error(`Failed to kill Lossless Scaling process: ${ error }`)
            }
        }
    }

    return false // Process wasn't running or couldn't be found
}


export async function startLosslessScaling() {
    const executableName = (getStoreValue('lsExecutablePath') as string).split('\\').pop()
    const isRunning = await isProcessRunning(executableName)
    console.log('Starting Lossless Scaling', { executableName, isRunning: isRunning })
    if (!isRunning) {
        exec(`"wscript" "${ lsVBSPath }"`)
    }
    while (!(await isProcessRunning(executableName))) {
        console.log(`[Lossless Scaling] ⌛ Waiting for process creation`)
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(`[Lossless Scaling] ✅ Process created`)
}