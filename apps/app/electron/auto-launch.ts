import { exec } from 'child_process';
import path from 'path'
import * as fs from 'node:fs'
import { EXTERNALS_DIR } from './const'
import { getStoreValue, setStoreValue } from './store'
import { app } from 'electron'
import { existsSync } from 'node:fs'

function  registerTask (options: {
    name: string
    batchPath: string
}) {
    const {name, batchPath} = options
    exec(`schtasks /Create /TN "${name}" /TR '"${batchPath}"' /SC ONLOGON /RL HIGHEST /F`, (err, stdout, stderr) => {
        if (err) {
            console.error('Failed to create scheduled task:', stderr);
        } else {
            console.log('Scheduled task created for startup:', stdout);
        }
    });
}

function  registerAppAutoLaunch (execPath: string) {
    const batchPath = path.join(EXTERNALS_DIR, 'run-as-admin.bat');
    const batchContent = `@echo off
powershell -Command "Start-Process '${execPath.split('\\').join('\\\\')}' -Verb RunAs"
exit
`
    fs.writeFileSync(batchPath, batchContent, 'utf8');

    registerTask({
        name: 'Auto Lossless Scaling - Run as Admin',
        batchPath: batchPath
    })
}

function  registerLosslessScalingAutoLaunch (execPath: string) {
    const batchPath = path.join(EXTERNALS_DIR, 'run-lossless-scaling-as-admin.bat');
    const batchContent = `@echo off
powershell -Command "Start-Process '${execPath.split('\\').join('\\\\')}' -Verb RunAs"
exit
`
    fs.writeFileSync(batchPath, batchContent, 'utf8');

    registerTask({
        name: 'Auto Lossless Scaling - Run Lossless Scaling as Admin',
        batchPath: batchPath
    })
}



app.on('ready', () => {
    const defaultLSExecutablePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Lossless Scaling\\LosslessScaling.exe'
    if (!getStoreValue('lsExecutablePath')) {
        if(existsSync(defaultLSExecutablePath)) {
            setStoreValue('lsExecutablePath', defaultLSExecutablePath)
        }
    }

    try  {
        registerAppAutoLaunch(process.execPath)
        if (getStoreValue('lsExecutablePath')) {
            if(existsSync(getStoreValue('lsExecutablePath'))) {
                registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
            } else {
                setStoreValue('lsExecutablePath', '')
            }
        }
    } catch (e) {
        console.log(`Couldn't register auto launch task`)
    }
})