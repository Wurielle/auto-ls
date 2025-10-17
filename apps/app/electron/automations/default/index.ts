import { ProcessInfo } from '../../process-watcher'
import { StoreProcess } from '../../store'

export class DefaultAutomationHooks {
    public async init() {
    }

    public async applyProfile(context: { processInfo: ProcessInfo, processOptions: StoreProcess['options'] }) {
    }

    public async removeProfile(context: { name: string }) {
    }

    public async beforeScale(context: { processInfo: ProcessInfo, processOptions: StoreProcess['options'] }) {
    }

    public async onScale(context: { processInfo: ProcessInfo, processOptions: StoreProcess['options'] }) {

    }

    public async afterScale(context: { processInfo: ProcessInfo, processOptions: StoreProcess['options'] }) {
    }
}