import * as path from 'node:path'
import { mkdir } from 'node:fs/promises'
import Seven from 'node-7z'
import { path7za } from '7zip-bin'
import { app, ipcMain, shell } from 'electron'
import * as fs from 'node:fs'

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
    const leaveZipped = false
    const disableLogging = false
    return mkdir(outputdir, { recursive: true })
        .then(() => downloadRelease(user, repo, outputdir, filterRelease, filterAsset, leaveZipped, disableLogging))
        .then(function (files) {
            return files[0]
        })
        .then((file) => {
            const target = file
            const dest = path.dirname(exePath)
            const myStream = Seven.extractFull(target, dest, {
                $progress: true,
                $bin: path7za,
            })

            myStream.on('data', function (data) {
                console.log(data) //? { status: 'extracted', file: 'extracted/file.txt" }
            })

            myStream.on('progress', function (progress) {
                console.log(progress) //? { percent: 67, fileCount: 5, file: undefinded }
            })

            myStream.on('end', function () {
                // end of the operation, get the number of folders involved in the operation
                console.log(myStream.info.get('Folders')) //? '4'
            })

            myStream.on('error', (err) => console.log(err))
            return new Promise((resolve) => {
                myStream.on('end', function () {
                    resolve(dest)
                    console.log('finished unzipping')
                })
            })
        })
        .then((dest: string) => {
            return shell.openPath(path.join(dest, 'setup_windows.bat'))
        })
        .catch(function (err) {
            console.error(err.message)
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