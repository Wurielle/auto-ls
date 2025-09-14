import log from "electron-log"
import { app } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'

const logFilePath = path.join(app.getPath("userData"), "logs.txt")

log.initialize()
log.transports.file.resolvePathFn = () => logFilePath

log.info('-----Present-Day-----Present-Time-----')

Object.assign(console, log.functions)

process.on("uncaughtException", (error) => {
    log.error("Uncaught Exception:", error)
})

process.on("unhandledRejection", (reason) => {
    log.error("Unhandled Rejection:", reason)
})

const MAX_LOG_SIZE = 5 * 1024 * 1024 // 5MB

function checkLogSize() {
    try {
        const stats = fs.statSync(logFilePath)
        if (stats.size > MAX_LOG_SIZE) {
            fs.writeFileSync(logFilePath, "")
            log.info("Log file cleared due to size limit")
        }
    } catch (error) {
        log.error("Failed to check log size:", error)
    }
}

checkLogSize()