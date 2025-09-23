import * as fs from 'node:fs'
import * as path from 'node:path'
import { app } from 'electron'
import extractFileIcon = require("extract-file-icon")

export const iconsDir = path.join(app.getPath("userData"), "icons")

export function extractProcessIcon(exePath: string) {
    const iconPath = `${ iconsDir }/${ exePath.split('\\').pop().replace('.exe', '') }.png`

    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true })
    }
    if (!fs.existsSync(iconPath)) {
        try {
            const iconBuffer = extractFileIcon(exePath, 64)
            fs.writeFileSync(iconPath, iconBuffer)
        } catch (error) {
            console.error("Failed to extract icon:", error)
            return null
        }
    }
}