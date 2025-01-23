const wqlImport = import('wql-process-monitor')
const { keyboard, Key } = require('@nut-tree-fork/nut-js')
const micromatch = require('micromatch')
const { Window } = require('win-control')

function send(processInfo) {
    if (processInfo.type === 'process-creation' && micromatch.isMatch(processInfo.payload.filepath, [
        '**/steamapps/**'
    ])) {
        // require('windows-tlist').getProcessInfo(pid).then(console.log) // Gets more info about loaded DLLs, etc
        console.log('Watching target process', processInfo)
        const { pid } = processInfo.payload
        let timeout
        let interval
        interval = setInterval(() => {
            const foregroundWindowPID = Window.getForeground().getPid();
            if (pid === foregroundWindowPID) {
                clearInterval(interval)
                clearTimeout(timeout)
                setTimeout(async () => {
                    console.log('Scaling', processInfo.payload.process)
                    const keys = [Key.LeftControl, Key.LeftAlt, Key.S]
                    await keyboard.pressKey(...keys)
                    await keyboard.releaseKey(...keys)
                }, 3000)
            }
        }, 1000)
        setTimeout(
            () => {
                clearInterval(interval)
            },
            5 * 60 * 1000,
        )
    }
}

wqlImport
    .then((wql) => {
        const { subscribe } = wql
        return subscribe({
            creation: true,
            deletion: true,
            bin: {
                filter: ['cmd.exe', 'tlist.exe', 'conhost.exe'],
            },
        })
    })
    .then((processMonitor) => {
        processMonitor.on('creation', ([process, pid, filepath, user]) => {
            send({
                type: 'process-creation',
                payload: {
                    process,
                    pid,
                    filepath,
                    user,
                },
            })
        })
        processMonitor.on('deletion', ([process, pid, filepath, user]) => {
            send({
                type: 'process-deletion',
                payload: {
                    process,
                    pid,
                    filepath,
                    user,
                },
            })
        })
    })

setInterval(() => {}, 1000 * 60 * 60)
