import {Notification, NotificationConstructorOptions} from 'electron'
import path from 'path'
import { PUBLIC_DIR } from './const'

export function notify(options: NotificationConstructorOptions) {
    return new Notification({
        icon: path.join(PUBLIC_DIR, 'icons/256x256.png'),
        silent: true,
        ...options,
    }).show()
}