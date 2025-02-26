import { exec } from 'child_process'
import path from 'path'
import * as fs from 'node:fs'
import { existsSync } from 'node:fs'
import { EXTERNALS_DIR } from './const'
import { getStoreValue, setStoreValue } from './store'
import { app } from 'electron'
import { emitter } from './events'

/* if I put the files inside a folder that isn't directly from getPath the vbs files stop working? */
const fileTargetDir = path.join(app.getPath('documents'))
export const appBatFileName = 'run-auto-lossless-scaling-as-admin.bat'
export const appVBSFileName = 'run-auto-lossless-scaling-as-admin.vbs'
export const appBatPath = path.join(fileTargetDir, appBatFileName)
export const appVBSPath = path.join(fileTargetDir, appVBSFileName)
export const lsBatFileName = 'run-lossless-scaling-as-admin.bat'
export const lsVBSFileName = 'run-lossless-scaling-as-admin.vbs'
export const lsBatPath = path.join(fileTargetDir, lsBatFileName)
export const lsVBSPath = path.join(fileTargetDir, lsVBSFileName)

function createBatContent(filename: string, minimized = false) {
    return `@echo off
powershell -Command "Start-Process '${ filename }' -Verb RunAs${ minimized ? ' -WindowStyle Minimized' : '' }"
exit
`
}

function createVBSContent(filename: string) {
    return `Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
currentDir = FSO.GetParentFolderName(WScript.ScriptFullName)
batchFile = currentDir & "\\${ filename }"

WshShell.Run batchFile, 0, False`
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
    const batContent = createBatContent(execPath.split('\\').join('\\\\'))
    const vbsContent = createVBSContent(appBatFileName)

    createFile(appBatPath, batContent)
    createFile(appVBSPath, vbsContent)

    registerTask({
        name: 'Auto Lossless Scaling - Run as Admin',
        vbsPath: appVBSPath,
    })
}

function registerLosslessScalingAutoLaunch(execPath: string) {
    const batContent = createBatContent(execPath.split('\\').join('\\\\'), true)
    const vbsContent = createVBSContent(lsBatFileName)

    createFile(lsBatPath, batContent)
    createFile(lsVBSPath, vbsContent)

    registerTask({
        name: 'Auto Lossless Scaling - Run Lossless Scaling as Admin',
        vbsPath: lsVBSPath,
    })
}


app.on('ready', () => {
    const defaultLSExecutablePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Lossless Scaling\\LosslessScaling.exe'
    if (!getStoreValue('lsExecutablePath')) {
        if (existsSync(defaultLSExecutablePath)) {
            setStoreValue('lsExecutablePath', defaultLSExecutablePath)
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
    } catch (e) {
        console.log(`Couldn't register auto launch task`)
    }
    emitter.on('store-update', ({ type }) => {
        if (type === 'lsExecutablePath') {
            registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
        }
    })
})
