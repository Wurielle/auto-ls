import { exec } from 'child_process';
import path from 'path'
import * as fs from 'node:fs'
import { EXTERNALS_DIR } from './const'

const taskName = 'Launch Auto Lossless Scaling on Startup';
const execPath = process.execPath;

const batPath = path.join(EXTERNALS_DIR, 'startup.bat');
const batContent = `
@echo off
powershell -Command "Start-Process '${execPath.replaceAll('\\', '\\\\')}' -Verb RunAs"
exit
`

fs.writeFileSync(batPath, batContent, 'utf8');

const command = `schtasks /Create /TN "${taskName}" /TR '"${batPath}"' /SC ONLOGON /RL HIGHEST /F`;

console.log(command)

exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error('Failed to create scheduled task:', stderr);
    } else {
        console.log('Scheduled task created for startup (hidden console):', stdout);
    }
});