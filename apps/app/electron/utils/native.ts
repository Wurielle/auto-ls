import { Window } from 'win-control'
import { getProcesses, getProcessById } from 'node-processlist'

export async function getActiveWindowPid(): Promise<number> {
    const pidFromWindow = Window.getForeground().getPid()
    if (pidFromWindow) return pidFromWindow
    const name = Window.getForeground().getTitle()
    const processes = await getProcesses({
        filters: [`WINDOWTITLE eq ${ name }*`],
    })
    if (processes.length) return processes[0].pid
    return 0
}

export async function isProcessRunning(processName: string) {
    const psList = (await import('ps-list')).default
    const processes = await psList()
    return processes.some(p => p.name.includes(processName))
}

export async function getProcessWindow(pid: number) {
    const windowProcessInfo = Window.getByPid(pid)?.getProcessInfo()
    // Window.getByPid might fail due to kernel level anti cheat applications preventing access to pid
    if (windowProcessInfo) {
        return Window.getByPid(pid)
    }
    // in that case use Window.getByTitle
    const tasklistProcessInfo = await getProcessById(pid, { verbose: true })
    if (tasklistProcessInfo) {
        return Window.getByTitle(tasklistProcessInfo.windowTitle)
    }
}

export async function isProcessWindowOpen(pid: number) {
    return !!(await getProcessWindow(pid))?.getDimensions()
}

export async function waitForProcessWindow(pid: number) {
    while (!(await isProcessWindowOpen(pid))) {
        console.log(`[Process Window] ⌛ Waiting for process window creation: ${ pid }`)
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    console.log(`[Process Window] ✅ Process window created: ${ pid }`)
}

export async function focusWindow(pid: number) {
    const window = (await getProcessWindow(pid))
    if (!window?.getProcessInfo()) return console.log(`Window for process ${pid} cannot be focused programmatically.`)
    window?.setForeground()
}