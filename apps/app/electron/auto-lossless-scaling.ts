import { getDefaultedProcessOptions, getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
import * as path from 'node:path'
import { focusWindow, getActiveWindowPid, waitForProcessWindowCreation } from './utils/native'
import { clearTimeout } from 'node:timers'
import { autoClearInterval, autoClearTimeout } from './utils/timeouts'
import { processWatcher } from './process-watcher-instance'
import automations from './automations'
import { addProcess } from './game-library'
import { ipcMain } from 'electron'

// Ideally, we'd want to opt in and out using either pid or path
export async function optOutProcess(processPath: string) {
    if (processPath) {
        const { base } = path.parse(processPath)
        notify({
            title: 'Opting process out',
            body: `${ base } will no longer automatically scale`,
        })
        await Promise.all(automations.map((automation) => automation.removeProfile({ name: base })))
        const newStoreProcessesValue = ((getStoreValue('processes') || []) as StoreProcess[]).filter((storeProcess) => {
            return storeProcess.path !== processPath
        })
        setStoreValue('processes', newStoreProcessesValue)
    } else {
        notify({
            title: 'Process not detected',
            body: `The requested process needs to be restarted`,
        })
    }
}

export async function optInProcess(pid: number) {
    const processInfo = processWatcher.getByPid(pid)

    if (processInfo) {
        const processPath = processInfo.filepath

        addProcess(processPath)

        notify({
            title: 'Opting process in',
            body: `${ processInfo.process } will now automatically scale`,
        })

        await scaleByPid(pid, 0)
    } else {
        notify({
            title: 'Process not detected',
            body: `The requested process needs to be restarted`,
        })
    }
}

export async function scaleByPid(pid: number, wait?: number) {
    let timeout: NodeJS.Timeout | undefined
    let interval: NodeJS.Timeout | undefined
    const processInfo = processWatcher.getByPid(pid)
    if (!processInfo) return notify({
        title: 'Process not detected',
        body: `The requested process needs to be restarted`,
    })
    const processOptions = getDefaultedProcessOptions(getProcess(processInfo.filepath)?.options)
    const context = { processInfo, processOptions }
    try {
        await Promise.all([
            ...automations.map((automation) => automation.beforeScale(context)),
            waitForProcessWindowCreation(pid),
        ])

        console.log(`[Auto LS] Starting focus check loop for pid ${pid}`)

        interval = autoClearInterval(async () => {
            const currentPid = await getActiveWindowPid()
            if (pid === currentPid) {
                console.log(`[Auto LS] Found focus for pid ${pid}. Proceeding with scale delay.`)
                clearInterval(interval)
                clearTimeout(timeout)

                let triggerKeybindTimeout: NodeJS.Timeout | undefined
                const delay = typeof wait === 'number' ? wait : getStoreValue<number>('defaultTimeout')

                const triggerKeybind = async () => {
                    // Try to re-focus just before scaling in case user switched windows
                    await focusWindow(pid)
                    const finalPid = await getActiveWindowPid()

                    if (pid === finalPid) {
                        console.log(`[Auto LS] Scaling pid ${pid}`)
                        clearTimeout(triggerKeybindTimeout)
                        await Promise.all(automations.map((automation) => automation.onScale(context)))
                        // Wait a bit before afterScale to let LS finish its work
                        await new Promise(resolve => setTimeout(resolve, 500))
                        await Promise.all(automations.map((automation) => automation.afterScale(context)))
                        console.log(`[Auto LS] Scaling successful for pid ${pid}`)
                    } else {
                        console.log(`[Auto LS] Scaling not possible for pid ${pid}, window not focused (${finalPid} focused instead). Retrying focus in 1s.`)
                        triggerKeybindTimeout = setTimeout(triggerKeybind, 1000)
                    }
                }

                timeout = autoClearTimeout(triggerKeybind, delay)
            } else {
                // If not focused, try to focus it (but don't force it too aggressively if user is doing something else)
                // Actually, the previous implementation did focusWindow(pid) every second.
                await focusWindow(pid)
            }
        }, 1000)
    } catch (e) {
        console.error(`An error occurred while scaling ${ pid }:`, e)
        clearInterval(interval)
        clearTimeout(timeout)
    }
}

ipcMain.handle('als-opt-out-process', async (_, path: string) => {
    return await optOutProcess(path)
})

ipcMain.handle('als-scale-by-pid', async (_, pid: number, wait?: number) => {
    return await scaleByPid(pid, wait)
})
