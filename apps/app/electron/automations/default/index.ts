import { ProcessInfo } from '../../process-watcher'

export class DefaultAutomationHooks {
    public async init() {
    }

    public async applyProfile(context: { processInfo: ProcessInfo }) {
    }

    public async removeProfile(context: { name: string }) {
    }

    public async beforeScale(context: { processInfo: ProcessInfo }) {
    }

    public async afterScale(context: { processInfo: ProcessInfo }) {
    }
}