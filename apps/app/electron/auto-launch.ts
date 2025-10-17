import { exec } from 'child_process'
import { app } from 'electron'
import { createFile, createVBSContent } from './utils/filesystem'
import { appVBSPath } from './const'

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

app.on('ready', () => {
    try {
        registerAppAutoLaunch(process.execPath)
    } catch (e) {
        console.log(`Couldn't register auto launch task`)
    }
})
