import { RivaTunerAutomationHooks } from './riva-tuner'
import { getStoreValue, setStoreValue } from '../store'
import { exec } from 'child_process'
import { LosslessScalingAutomationHooks } from './lossless-scaling'
import { existsSync } from 'node:fs'
import { emitter } from '../events'
import { createFile, createVBSContent } from '../utils/filesystem'
import { lsVBSPath, rivaTunerVBSPath } from '../const'

export default [
    new LosslessScalingAutomationHooks({
        getExecutablePath() {
            return getStoreValue('lsExecutablePath')
        },
        getScaleShortcut() {
            return getStoreValue('lsScaleShortcut')
        },
        run() {
            return exec(`"wscript" "${ lsVBSPath }"`)
        },
        init() {
            function registerLosslessScalingAutoLaunch(execPath: string) {
                const escapedExePath = execPath.split('\\').join('\\\\')

                createFile(lsVBSPath, createVBSContent(escapedExePath, true))
            }

            const defaultLSExecutablePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Lossless Scaling\\LosslessScaling.exe'
            if (!getStoreValue('lsExecutablePath')) {
                if (existsSync(defaultLSExecutablePath)) {
                    setStoreValue('lsExecutablePath', defaultLSExecutablePath)
                }
            }

            if (getStoreValue('lsExecutablePath')) {
                if (existsSync(getStoreValue('lsExecutablePath'))) {
                    registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
                } else {
                    setStoreValue('lsExecutablePath', '')
                }
            }

            emitter.on('store-update', ({ type }) => {
                if (type === 'lsExecutablePath') {
                    registerLosslessScalingAutoLaunch(getStoreValue('lsExecutablePath'))
                }
            })
        },
    }),
    new RivaTunerAutomationHooks({
        isEnabled() {
            return getStoreValue('enableRivaTuner')
        },
        getExecutablePath() {
            return getStoreValue('rivaTunerExecutablePath')
        },
        run() {
            return exec(`"wscript" "${ rivaTunerVBSPath }"`)
        },
        init() {
            function registerRivaTunerAutoLaunch(execPath: string) {
                const escapedExePath = execPath.split('\\').join('\\\\')

                createFile(rivaTunerVBSPath, createVBSContent(escapedExePath, true))
            }
            
            const defaultRivatunerExecutablePath = 'C:\\Program Files (x86)\\RivaTuner Statistics Server\\RTSS.exe'
            if (!getStoreValue('rivaTunerExecutablePath')) {
                if (existsSync(defaultRivatunerExecutablePath)) {
                    setStoreValue('rivaTunerExecutablePath', defaultRivatunerExecutablePath)
                }
            }

            if (getStoreValue('rivaTunerExecutablePath')) {
                if (existsSync(getStoreValue('rivaTunerExecutablePath'))) {
                    registerRivaTunerAutoLaunch(getStoreValue('rivaTunerExecutablePath'))
                } else {
                    setStoreValue('rivaTunerExecutablePath', '')
                }
            }

            emitter.on('store-update', ({ type }) => {
                if (type === 'rivaTunerExecutablePath') {
                    registerRivaTunerAutoLaunch(getStoreValue('rivaTunerExecutablePath'))
                }
            })
        },
    }),
]