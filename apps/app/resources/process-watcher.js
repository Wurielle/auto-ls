const wqlImport = import('wql-process-monitor')

function send(...args) {
  process.send(...args)
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
    // require('windows-tlist').getProcessInfo(pid).then(console.log)
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
