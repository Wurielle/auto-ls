import { platform } from 'os'

(function() {
    switch (platform()) {
        // case 'win32':
        //     return import('./windows')
        case 'linux':
            return import('./linux')
        default:
            throw new Error(`Unsupported platform: ${ platform() }`)
    }
})()
