import { fork } from 'child_process'
import { app } from 'electron'
import { ChildProcess } from 'node:child_process'
import mitt, { Emitter } from 'mitt'

export type ProcessInfo = {
    pid: number
    filepath: string
    process: string
    user: string
}

export type ProcessWatcherForkEvent = {
    type: 'process-creation' | 'process-deletion'
    payload: ProcessInfo
}

export type ProcessWatcherEmitterEvents = {
    'process-creation': ProcessInfo,
    'process-deletion': ProcessInfo,
}

export type ProcessWatcherEmitter = Emitter<ProcessWatcherEmitterEvents>

/* Unfortunately some games (e.g: Marvel Rivals, Helldivers 2) prevent you to get infos on the process such as the path
 * but this info is available on process creation so we keep a list of processes created in order to find the path when we need it
 */
export class ProcessWatcher implements ProcessWatcherEmitter {
    private fork: ChildProcess | null = null
    private processes = new Map<ProcessInfo['pid'], ProcessInfo>()
    private emitter: ProcessWatcherEmitter = mitt()
    public on = this.emitter.on
    public off = this.emitter.off
    public emit = this.emitter.emit
    public all = this.emitter.all

    constructor() {
        this.fork = fork(require.resolve('process-watcher'))

        this.fork?.on('message', (processEvent: ProcessWatcherForkEvent) => {
            if (processEvent.type === 'process-creation') {
                // Helldivers 2 manages to create the process twice with the same id...
                if (this.processes.get(processEvent.payload.pid)) return
                this.add(processEvent.payload)
                this.emitter.emit('process-creation', processEvent.payload)
            } else if (processEvent.type === 'process-deletion') {
                this.delete(processEvent.payload.pid)
                this.emitter.emit('process-deletion', processEvent.payload)
            }
        })


        app.on('before-quit', () => {
            this.destroy()
        })
    }

    public add(processInfo: ProcessInfo) {
        this.processes.set(processInfo.pid, processInfo)
    }

    public delete(pid: ProcessInfo['pid']) {
        this.processes.delete(pid)
    }

    public getByPid(pid: ProcessInfo['pid']) {
        return this.processes.get(pid)
    }

    public destroy() {
        this.fork?.kill()
        this.emitter.all.clear()
        this.processes.clear()
    }
}