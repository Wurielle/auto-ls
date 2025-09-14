import { exec } from 'child_process'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { existsSync } from 'node:fs'
import { getStoreValue, setStoreValue } from './store'
import { app } from 'electron'
import { emitter } from './events'

/* if I put the files inside a folder that isn't directly from getPath the vbs files stop working? */
const fileTargetDir = path.join(app.getPath('documents'))
export const appVBSFileName = 'run-auto-lossless-scaling-as-admin.vbs'
export const appVBSPath = path.join(fileTargetDir, appVBSFileName)
export const lsVBSFileName = 'run-lossless-scaling-as-admin.vbs'
export const rivaTunerVBSFileName = 'run-riva-tuner-as-admin.vbs'
export const lsVBSPath = path.join(fileTargetDir, lsVBSFileName)
export const rivaTunerVBSPath = path.join(fileTargetDir, rivaTunerVBSFileName)

function createVBSContent(exePath: string, minimized = false) {
    return `Option Explicit
Dim shell, exePath
Set shell = CreateObject("Shell.Application")
exePath = "${ exePath }"
shell.ShellExecute exePath, "", "", "runas", ${ minimized ? 7 : 0 }`
}

function createFile(filePath: string, content: string) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content, 'utf8')
}

function registerTask(options: {
    name: string
    vbsPath: string
}) {
    const { name, vbsPath } = options
    exec(`schtasks /Create /TN "${ name }" /TR "wscript.exe \\"${ vbsPath }\\"" /SC ONLOGON /RL HIGHEST /F`, (err, stdout, stderr) => {
        if (err) {
            console.error('Failed to create scheduled task:', stderr)
        } else {
            console.log('Scheduled task created for startup:', stdout)
        }
    })
}

function registerAppAutoLaunch(execPath: string) {
    const escapedExePath = execPath.split('\\').join('\\\\')

    createFile(appVBSPath, createVBSContent(escapedExePath))

    registerTask({
        name: 'Auto Lossless Scaling - Run as Admin',
        vbsPath: appVBSPath,
    })
}

function registerRivaTunerAutoLaunch(execPath: string) {
    const escapedExePath = execPath.split('\\').join('\\\\')

    createFile(rivaTunerVBSPath, createVBSContent(escapedExePath, true))
}

function registerLosslessScalingAutoLaunch(execPath: string) {
    const escapedExePath = execPath.split('\\').join('\\\\')

    createFile(lsVBSPath, createVBSContent(escapedExePath, true))
}


app.on('ready', () => {
    const defaultLSExecutablePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Lossless Scaling\\LosslessScaling.exe'
    if (!getStoreValue('lsExecutablePath')) {
        if (existsSync(defaultLSExecutablePath)) {
            setStoreValue('lsExecutablePath', defaultLSExecutablePath)
        }
    }

    const defaultRivatunerExecutablePath = 'C:\\Program Files (x86)\\RivaTuner Statistics Server\\RTSS.exe'
    if (!getStoreValue('rivaTunerExecutablePath')) {
        if (existsSync(defaultRivatunerExecutablePath)) {
            setStoreValue('rivaTunerExecutablePath', defaultRivatunerExecutablePath)
        }
    }

    try {
        registerAppAutoLaunch(process.execPath)

        if (getStoreValue('lsExecutablePath')) {
            if (existsSync(getStoreValue('lsExecutablePath'))) {
                registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
            } else {
                setStoreValue('lsExecutablePath', '')
            }
        }

        if (getStoreValue('rivaTunerExecutablePath')) {
            if (existsSync(getStoreValue('rivaTunerExecutablePath'))) {
                registerRivaTunerAutoLaunch(getStoreValue('rivaTunerExecutablePath'))
            } else {
                setStoreValue('rivaTunerExecutablePath', '')
            }
        }
    } catch (e) {
        console.log(`Couldn't register auto launch task`)
    }
    emitter.on('store-update', ({ type }) => {
        if (type === 'lsExecutablePath') {
            registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
        }
    })
})
