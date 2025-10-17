import { Window } from 'win-control'
import { getProcessById, getProcesses } from 'node-processlist'
import { app } from 'electron'
import * as path from 'node:path'

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

export async function waitForProcessWindowCreation(pid: number) {
    let loopCount = 0
    while ((!(await isProcessWindowOpen(pid)))) {
        loopCount += 1
        if (loopCount >= 5 * 60) {
            throw new Error(`[Process Window] ❌ Wait for process window creation ${ pid } failed. It exceeded the maximum loop count.`)
        }
        console.log(`[Process Window] ⌛ Waiting for process window creation: ${ pid }`)
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    console.log(`[Process Window] ✅ Process window created: ${ pid }`)
}

export async function isExplorerRunning() {
    const psList = (await import('ps-list')).default
    const processes = await psList()
    const explorerProcess = processes.find(p => p.name === 'explorer.exe')
    return !!explorerProcess
}

export async function waitForExplorer() {
    while (!(await isExplorerRunning())) {
        console.log(`[Explorer] ⌛ Waiting for process creation`)
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    console.log(`[Explorer] ✅ Process created`)
    // safely wait for explorer to start properly
    await new Promise(resolve => setTimeout(resolve, process.env.NODE_ENV === 'development' ? 0 : 10000))
}

export async function focusWindow(pid: number) {
    const window = (await getProcessWindow(pid))
    if (!window?.getProcessInfo()) return console.log(`[Process Window] Window for process ${ pid } cannot be focused programmatically.`)
    window?.setForeground()
}

export function requireNativeModule(moduleName) {
    if (!app.isPackaged) {
        return require(moduleName)
    }

    const basePath = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", moduleName)
    return require(basePath)
}