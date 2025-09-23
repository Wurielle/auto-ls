import { RivaTunerAutomationHooks } from './riva-tuner'
import { getStoreValue } from '../store'
import { exec } from 'child_process'
import { lsVBSPath, rivaTunerVBSPath } from '../auto-launch'
import { LosslessScalingAutomationHooks } from './lossless-scaling'

export default [
    new LosslessScalingAutomationHooks({
        getExecutablePath() {
            return getStoreValue('lsExecutablePath')
        },
        run() {
            return exec(`"wscript" "${ lsVBSPath }"`)
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
    }),
]