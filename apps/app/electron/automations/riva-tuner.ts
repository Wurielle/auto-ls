import { DefaultAutomationHooks } from './default'
import { isProcessRunning } from '../utils/native'
import * as path from 'path'
import { existsSync } from 'fs'
import * as fsp from 'fs/promises'

export type RivaTunerAutomationHooksOptions = {
    isEnabled(): boolean
    getExecutablePath(): string
    run(): void
}

export class RivaTunerAutomationHooks extends DefaultAutomationHooks implements DefaultAutomationHooks {
    private options: RivaTunerAutomationHooksOptions

    constructor(options: RivaTunerAutomationHooksOptions) {
        super()
        this.options = options
    }

    public init() {
        return this.start()
    }

    public beforeScale(context) {
        return this.applyProfile(context)
    }

    public afterScale() {
        return this.start()
    }

    public async applyProfile({ processInfo }) {
        const exePath = this.options.getExecutablePath()
        if (!exePath) return
        const rivaTunerConfigFilePath = path.resolve(path.dirname(exePath), 'Profiles', `${ processInfo.process }.cfg`)
        if (!existsSync(rivaTunerConfigFilePath)) {
            await this.stop()
            const fileContent = await fsp.readFile(path.resolve(path.dirname(exePath), 'ProfileTemplates', `Global`), 'utf8')
            await fsp.writeFile(rivaTunerConfigFilePath, fileContent, 'utf8')
        }
        return this.start()
    }

    public async removeProfile({ name }) {
        const exePath = this.options.getExecutablePath()
        if (!exePath) return
        const rivaTunerConfigFilePath = path.resolve(path.dirname(exePath), 'Profiles', `${ name }.cfg`)
        if (existsSync(rivaTunerConfigFilePath)) {
            await this.stop()
            await fsp.rm(rivaTunerConfigFilePath)
        }
        await this.start()
    }

    public async start() {
        const isEnabled = this.options.isEnabled()
        if (!isEnabled) return
        const executableName = this.options.getExecutablePath().split('\\').pop()
        const isRunning = await isProcessRunning(executableName)

        console.log('Starting RivaTuner', { executableName, isRunning: isRunning })
        if (!isRunning) {
            this.options.run()
        }
        while (!(await isProcessRunning(executableName))) {
            console.log(`[RivaTuner] ⌛ Waiting for process creation`)
            await new Promise(resolve => setTimeout(resolve, 100))
            console.log(`[RivaTuner] ✅ Process created`)
        }
    }

    public async stop() {
        const isEnabled = this.options.isEnabled()
        if (!isEnabled) return
        const executableName = this.options.getExecutablePath().split('\\').pop()
        const { default: psList } = await import('ps-list')
        const processes = await psList()
        const rivaTunerProcesses = processes.filter(p => [
            'RTSS',
            'RTSSHooksLoader',
            'EncoderServer',
        ].some((name) => p.name.includes(name)))
        const isRunning = !!rivaTunerProcesses.length

        console.log('Stopping RivaTuner', { executableName, isRunning: isRunning })
        if (isRunning) {
            await Promise.all(rivaTunerProcesses.map(async (p) => {
                if (p && p.pid) {
                    console.log(`${ p.name }: ${ p.pid }`)
                    try {
                        process.kill(p.pid)
                        while (await isProcessRunning(p.name)) {
                            await new Promise(resolve => setTimeout(resolve, 100))
                        }
                    } catch (error) {
                        console.error(`Failed to kill ${ p.name } process: ${ error }`)
                    }
                }
            }))
        }

        return false // Process wasn't running or couldn't be found
    }
}