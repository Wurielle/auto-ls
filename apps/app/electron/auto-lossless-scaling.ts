import { getStoreValue, setStoreValue, StoreProcess } from './store'
import { notify } from './notifications'
import { removeLosslessScalingProfile } from './lossless-scaling'
import * as path from 'node:path'
import { removeRivaTunerProfile } from './riva-tuner'

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