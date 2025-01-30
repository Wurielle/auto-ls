import { exec } from "child_process";

function appExistsWindows(appName) {
    return new Promise((resolve) => {
        exec(`powershell "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName"`,
            (error, stdout) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    resolve(false);
                    return;
                }
                const apps = stdout.split("\n").map(line => line.trim()).filter(line => line);
                const found = apps.find(app => app === appName);

                if (found) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
    });
}

function getAppPathWindows(appName) {
    return new Promise((resolve) => {
        const command = `powershell -Command "& {
  $apps = Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*;
  $match = $apps | Where-Object { $_.DisplayName -eq '${appName}' };
  if ($match) {
    if ($match.InstallLocation -and ($match.InstallLocation -ne '')) {
      $match.InstallLocation
    } elseif ($match.UninstallString -and ($match.UninstallString -ne '')) {
      Split-Path -Path $match.UninstallString -Parent
    } else {
      ''
    }
  } else {
    ''
  }
}"`;

        exec(command, (error, stdout) => {
            const path = stdout.trim();
            resolve(path || null);
        });
    });
}

// Example Usage
(async () => {
    const appName = "Lossless Scaling";

    const exists = await appExistsWindows(appName);
    console.log(`Exists: ${exists}`);

    if (exists) {
        const path = await getAppPathWindows(appName);
        console.log(`Path: ${path}`);
    } else {
        console.log("App not found.");
    }
})();
