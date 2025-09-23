import { addProcess, getProcess, getStoreValue, setStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
import { applyLosslessScalingProfile, removeLosslessScalingProfile } from './lossless-scaling'
import * as path from 'node:path'
import { registerRivaTunerProfile, removeRivaTunerProfile, startRivaTuner } from './riva-tuner'
import { focusWindow, getActiveWindowPid, waitForProcessWindowCreation } from './utils/native'
import { clearTimeout } from 'node:timers'
import { autoClearInterval, autoClearTimeout } from './utils/timeouts'
import { processWatcher } from './process-watcher-instance'
import { extractProcessIcon } from './utils/filesystem'

// Ideally, we'd want to opt in and out using either pid or path
export async function optOutProcess(processPath: string) {
    if (processPath) {
        const { base } = path.parse(processPath)
        notify({
            title: 'Opting process out',
            body: `${ base } will no longer automatically scale`,
        })
        await removeRivaTunerProfile(base)
        await removeLosslessScalingProfile(base)
        setStoreValue('processes', ((getStoreValue('processes') || []) as StoreProcess[]).filter((storeProcess) => storeProcess.path !== processPath))
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
        if (processPath && !getProcess(processPath)) {
            extractProcessIcon(processPath)
            addProcess(processPath)
        }

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
    if (!processInfo) return
    try {
        await Promise.all([
            applyLosslessScalingProfile(processInfo),
            registerRivaTunerProfile(processInfo),
            waitForProcessWindowCreation(pid),
        ])

        interval = autoClearInterval(async () => {
            await focusWindow(pid)
            const initialFocusActiveWindowPid = await getActiveWindowPid()
            console.log('Checking for initial focus', {
                pid,
                foregroundWindowPID: initialFocusActiveWindowPid,
            }, pid === initialFocusActiveWindowPid)
            if (pid === initialFocusActiveWindowPid) {
                clearInterval(interval)
                clearTimeout(timeout)
                let triggerKeybindTimeout: NodeJS.Timeout | undefined

                const triggerKeybind = async () => {
                    await focusWindow(pid)
                    const delayedFocusActiveWindowPid = await getActiveWindowPid()
                    console.log('Checking for focus after provided delay', {
                        pid,
                        foregroundWindowPID: delayedFocusActiveWindowPid,
                        waited: wait,
                    }, pid === delayedFocusActiveWindowPid)
                    if (pid === delayedFocusActiveWindowPid) {
                        console.log('Scaling', {
                            pid,
                        })
                        clearTimeout(triggerKeybindTimeout)
                        const { keyboard } = await import('@nut-tree-fork/nut-js')
                        const keys = getStoreValue('lsScaleShortcut') as number[]
                        await keyboard.pressKey(...keys)
                        await keyboard.releaseKey(...keys)
                        // try again in case it didn't succeed initially (can happen for some reason)
                        await startRivaTuner()
                    } else {
                        console.log('Scaling not possible, the window may not be focused. Trying again in a second.')
                        triggerKeybindTimeout = setTimeout(triggerKeybind, 1000)
                    }
                }

                timeout = autoClearTimeout(triggerKeybind, typeof wait === 'number' ? wait : getStoreValue('defaultTimeout'))
            }
        }, 1000)
    } catch (e) {
        console.error(`An error occurred while scaling ${ pid }:`, e)
        clearInterval(interval)
        clearTimeout(timeout)
    }
}