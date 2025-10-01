import { downloadRelease }  from '@terascope/fetch-github-release';
import * as path from 'node:path'
import { mkdir } from 'node:fs/promises'
import Seven from 'node-7z'
import { path7za } from '7zip-bin'
import { exec } from 'child_process'

function filterRelease(release) {
    return release.prerelease === false;
}

function filterAsset(asset) {
    return asset.name.includes('OptiScaler_');
}

const user = 'optiscaler';
const repo = 'OptiScaler';
const outputdir = path.resolve('./temp');
const leaveZipped = false;
const disableLogging = false;
mkdir(outputdir, { recursive: true })
    .then(() => downloadRelease(user, repo, outputdir, filterRelease, filterAsset, leaveZipped, disableLogging))
    .then(function(files) {
        console.log('All done!');
        console.log(files[0]);
        return files[0];
    })
    .then((file) => {
        const target = file
        const dest = path.join(path.dirname(file), '/optiscaler')
        console.log(target, dest)
        const myStream = Seven.extractFull(target, dest, {
            $progress: true,
            $bin: path7za
        })

        return new Promise((resolve) => {
            myStream.on('end', function () {
                resolve(dest)
            })
        })
    })
    .then((dest: string) => {
        exec(`start cmd /c ${path.join(dest, 'setup_windows.bat')}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(stdout);
            }
        );
    })
    .catch(function(err) {
        console.error(err.message);
    });