import { DefaultAutomationHooks } from './default'
import { isProcessRunning } from '../utils/native'
import * as path from 'path'
import { existsSync } from 'fs'
import * as fsp from 'fs/promises'
import * as ini from 'ini'

export type RivaTunerAutomationHooksOptions = {
    isEnabled(): boolean
    getExecutablePath(): string
    run(): void
    init(): void
}

export class RivaTunerAutomationHooks extends DefaultAutomationHooks implements DefaultAutomationHooks {
    private options: RivaTunerAutomationHooksOptions

    constructor(options: RivaTunerAutomationHooksOptions) {
        super()
        this.options = options
        this.options.init()
    }

    public init() {
        return this.start()
    }

    public beforeScale(context) {
        if (!context.processOptions.enableRivaTuner) return this.removeProfile({ name: context.processInfo.process })
        return this.applyProfile(context)
    }

    public async afterScale(context) {
        if (!context.processOptions.enableRivaTuner) return
        await this.stop()
        return this.start()
    }

    public async applyProfile(context) {
        const { processInfo, processOptions } = context
        const exePath = this.options.getExecutablePath()
        if (!exePath) return
        const rivaTunerConfigFilePath = path.resolve(path.dirname(exePath), 'Profiles', `${ processInfo.process }.cfg`)
        const targetLimit = processOptions.rivaTunerFPSLimit
        if (existsSync(rivaTunerConfigFilePath)) {
            const fileContent = await fsp.readFile(rivaTunerConfigFilePath, 'utf-8')
            const config = ini.parse(fileContent)
            if (Number(config.Framerate.Limit) !== targetLimit) {
                await this.stop()
                config.Framerate.Limit = targetLimit
                await fsp.writeFile(rivaTunerConfigFilePath, ini.stringify(config), 'utf8')
            }
        } else {
            await this.stop()
            const fileContent = await fsp.readFile(path.resolve(path.dirname(exePath), 'ProfileTemplates', `Global`), 'utf8')
            const config = ini.parse(fileContent)
            config.Framerate.Limit = targetLimit
            await fsp.writeFile(rivaTunerConfigFilePath, ini.stringify(config), 'utf8')
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
        const executablePath = this.options.getExecutablePath()
        if (!executablePath) return
        const executableName = executablePath.split('\\').pop()
        const isRunning = await isProcessRunning(executableName)

        console.log('Starting RivaTuner', { executableName, isRunning: isRunning })
        if (!isRunning) {
            this.options.run()
        }
        while (!(await isProcessRunning(executableName))) {
            console.log(`[RivaTuner] ⌛ Waiting for process creation`)
            await new Promise(resolve => setTimeout(resolve, 200))
        }
        console.log(`[RivaTuner] ✅ Process created`)
    }

    public async stop() {
        const isEnabled = this.options.isEnabled()
        if (!isEnabled) return
        const executablePath = this.options.getExecutablePath()
        if (!executablePath) return
        const executableName = executablePath.split('\\').pop()

        const { default: psList } = await import('ps-list')

        const getRivaProcesses = async () => {
            const processes = await psList()
            return processes.filter(p => [
                'RTSS',
                'RTSSHooksLoader',
                'EncoderServer',
            ].some((name) => p.name.includes(name)))
        }

        let rivaTunerProcesses = await getRivaProcesses()
        const isRunning = !!rivaTunerProcesses.length

        console.log('Stopping RivaTuner', { executableName, isRunning: isRunning })
        if (isRunning) {
            for (const p of rivaTunerProcesses) {
                if (p && p.pid) {
                    console.log(`Killing ${ p.name }: ${ p.pid }`)
                    try {
                        process.kill(p.pid)
                    } catch (error) {
                        console.error(`Failed to kill ${ p.name } process: ${ error }`)
                    }
                }
            }

            // Wait for processes to disappear
            let retries = 30
            while (retries > 0 && (await getRivaProcesses()).length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100))
                retries--
            }

            if (retries === 0) {
                console.warn('[RivaTuner] Some processes did not exit, attempting taskkill')
                const { exec } = await import('child_process')
                try {
                    exec('taskkill /F /IM RTSS.exe /T')
                    exec('taskkill /F /IM RTSSHooksLoader.exe /T')
                    exec('taskkill /F /IM RTSSHooksLoader64.exe /T')
                    exec('taskkill /F /IM EncoderServer.exe /T')
                    exec('taskkill /F /IM EncoderServer64.exe /T')
                } catch (e) {}
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }

        // Give it a bit more time to release file locks
        await new Promise(resolve => setTimeout(resolve, 500))
        return true
    }
}
