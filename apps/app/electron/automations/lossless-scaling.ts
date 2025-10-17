import { DefaultAutomationHooks } from './default'
import { isProcessRunning } from '../utils/native'
import * as path from 'node:path'
import * as fsp from 'fs/promises'
import { app } from 'electron'
import * as convert from 'xml-js'
import cloneDeep from 'lodash/cloneDeep'

export type LosslessScalingAutomationHooksOptions = {
    getExecutablePath(): string
    getScaleShortcut(): number[]
    run(): void
    init(): void
}

export class LosslessScalingAutomationHooks extends DefaultAutomationHooks implements DefaultAutomationHooks {
    private options: LosslessScalingAutomationHooksOptions

    constructor(options: LosslessScalingAutomationHooksOptions) {
        super()
        this.options = options
        this.options.init()
    }

    public init() {
        return this.start()
    }

    public beforeScale(context) {
        if (!context.processOptions.enableLosslessScaling) return this.removeProfile({ name: context.processInfo.process })
        return this.applyProfile(context)
    }

    public async onScale(context) {
        if (!context.processOptions.enableLosslessScaling) return
        const { keyboard } = await import('@nut-tree-fork/nut-js')
        const keys = this.options.getScaleShortcut()
        if (typeof keys[0] === 'number') await keyboard.pressKey(keys[0])
        if (typeof keys[1] === 'number') await keyboard.pressKey(keys[1])
        if (typeof keys[2] === 'number') await keyboard.pressKey(keys[2])
        if (typeof keys[2] === 'number') await keyboard.releaseKey(keys[2])
        if (typeof keys[1] === 'number') await keyboard.releaseKey(keys[1])
        if (typeof keys[0] === 'number') await keyboard.releaseKey(keys[0])
    }

    public async applyProfile(context) {
        if (!context.processOptions.enableLosslessScaling) return
        const { processInfo } = context
        await this.stop()
        const lsConfigFilePath = path.resolve(app.getPath('appData'), '../Local', 'Lossless Scaling', 'Settings.xml')
        const fileContent = await fsp.readFile(lsConfigFilePath, 'utf8')
        const json = convert.xml2json(fileContent, { compact: true, spaces: 4 })
        const jsonObj = JSON.parse(json)
        if (!Array.isArray(jsonObj.Settings.GameProfiles.Profile)) {
            jsonObj.Settings.GameProfiles.Profile = [
                jsonObj.Settings.GameProfiles.Profile,
            ]
        }

        const profiles: any[] = jsonObj.Settings.GameProfiles.Profile

        const autoLSProfileName = 'Auto Lossless Scaling'
        let autoLSProfile = profiles.find(p => p.Title._text === autoLSProfileName)
        if (!autoLSProfile) {
            const defaultProfile = profiles[0]
            autoLSProfile = { ...cloneDeep(defaultProfile), Title: { _text: autoLSProfileName } }
            profiles.push(autoLSProfile)
        }

        let processProfile = profiles.find(p => p.Title._text === processInfo.process)
        if (processProfile) {
            const newProcessProfile = {
                ...processProfile,
                LSFG3Multiplier: { _text: String(context.processOptions.lsFramegenMultiplier) },
            }
            profiles.splice(profiles.indexOf(processProfile), 1, newProcessProfile)
            processProfile = newProcessProfile
        } else {
            const newProcessProfile = {
                ...cloneDeep(autoLSProfile),
                Title: { _text: processInfo.process },
                LSFG3Multiplier: { _text: String(context.processOptions.lsFramegenMultiplier) },
            }
            profiles.push(newProcessProfile)
            processProfile = newProcessProfile
        }

        profiles[0] = { ...processProfile }

        const xml = convert.json2xml(JSON.stringify(jsonObj), { compact: true, ignoreComment: true, spaces: 4 })
        await fsp.writeFile(lsConfigFilePath, xml, 'utf8')
        await this.start()
    }

    public async removeProfile({ name }) {
        await this.stop()
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
        await this.start()
    }

    public async start() {
        const executableName = this.options.getExecutablePath().split('\\').pop()
        const isRunning = await isProcessRunning(executableName)
        console.log('Starting Lossless Scaling', { executableName, isRunning: isRunning })
        if (!isRunning) {
            this.options.run()
        }
        while (!(await isProcessRunning(executableName))) {
            console.log(`[Lossless Scaling] ⌛ Waiting for process creation`)
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log(`[Lossless Scaling] ✅ Process created`)
    }

    public async stop() {
        const executableName = this.options.getExecutablePath().split('\\').pop()
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
}