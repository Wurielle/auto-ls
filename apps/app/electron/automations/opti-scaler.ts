import * as path from 'node:path'
import { mkdir } from 'node:fs/promises'
import Seven from 'node-7z'
import { app, ipcMain, shell } from 'electron'
import * as fs from 'node:fs'
import { requireNativeModule } from '../utils/native'
import { EXTERNALS_DIR } from '../const'
import { copyFilesRecursively } from '../utils/filesystem'
import { getStoreValue } from '../store'

function filterRelease(release) {
    return release.prerelease === false
}

function filterAsset(asset) {
    return asset.name.includes('OptiScaler_')
}

async function install(exePath: string) {
    const { downloadRelease } = await import('@terascope/fetch-github-release')

    const user = 'optiscaler'
    const repo = 'OptiScaler'
    const outputdir = path.join(app.getPath('userData'), 'downloads/optiscaler')
    const dest = path.dirname(exePath)
    const leaveZipped = true
    const disableLogging = true

    function cleanup() {
        if (fs.existsSync(outputdir)) {
            fs.rmSync(outputdir, { recursive: true })
        }
    }

    return mkdir(outputdir, { recursive: true })
        .then(() => downloadRelease(user, repo, outputdir, filterRelease, filterAsset, leaveZipped, disableLogging))
        .then(function (files) {
            return files[0]
        })
        .then((file) => {
            const myStream = Seven.extractFull(file, dest, {
                $progress: true,
                $bin: requireNativeModule('7zip-bin').path7za,
            })

            return new Promise((resolve, reject) => {
                myStream.on('end', function () {
                    resolve(dest)
                })
                myStream.on('error', (err) => {
                    reject(err)
                })
            })
        })
        .then(() => {
            return shell.openPath(path.join(dest, 'setup_windows.bat'))
        })
        .then(() => {
            const fsr4Dir = path.join(EXTERNALS_DIR, 'FSR4')
            const fsr4int8Dir = path.join(EXTERNALS_DIR, 'FSR4 INT8')

            copyFilesRecursively(fsr4Dir, dest)
            if (getStoreValue('osFSR4Mode') === 'int8') copyFilesRecursively(fsr4int8Dir, dest)
        })
        .catch(function (err) {
            cleanup()
        })
        .finally(function () {
            cleanup()
        })
}

async function uninstall(exePath: string) {
    return shell.openPath(path.join(path.dirname(exePath), './Remove OptiScaler.bat'))
}

app.whenReady().then(() => {
    ipcMain.handle('opti-scaler-install', (_, exePath: string) => {
        return install(exePath)
    })
    ipcMain.handle('opti-scaler-uninstall', (_, exePath: string) => {
        return uninstall(exePath)
    })
    ipcMain.handle('opti-scaler-check-install', (_, exePath: string) => {
        return fs.existsSync(path.join(path.dirname(exePath), './Remove OptiScaler.bat'))
    })
})