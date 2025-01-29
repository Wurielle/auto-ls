import { exec } from 'child_process';

const taskName = 'Launch Auto Lossless Scaling on Startup';
const execPath = process.execPath;

const command = `schtasks /Create /TN "${taskName}" /TR "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -Command Start-Process '${execPath}' -Verb RunAs" /SC ONLOGON /RL HIGHEST /F`;

exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error('Failed to create scheduled task:', stderr);
    } else {
        console.log('Scheduled task created for startup (hidden console):', stdout);
    }
});