import * as fsp from "fs/promises"
import * as game_scanner from "@equal-games/game-scanner"
import { ipcMain } from 'electron'
import { getProcesses } from 'node-processlist'
import { addProcess, getProcess } from './store'
import { extractProcessIcon } from './utils/filesystem'
import * as path from 'path'
import find = require("find-process")

export interface GameExe {
    path: string;
    size: number;
}

const exes = new Map<string, GameExe[]>()

export async function findGameExes(rootDir: string): Promise<GameExe[]> {
    const patterns = ["**/*.exe"]
    const normalizedPath = rootDir.replace(/\\/g, '/')
    const { globby } = await import('globby')
    const files = await globby(patterns, {
        cwd: normalizedPath,
        absolute: true,
        caseSensitiveMatch: false,
        gitignore: true,
    })

    const uniqueFiles = Array.from(new Set(files))

    const results: GameExe[] = []
    for (const file of uniqueFiles) {
        try {
            const stats = await fsp.stat(file)
            results.push({ path: file, size: stats.size })
        } catch {
        }
    }

    return results
}

function getGames() {
    return [
        ...game_scanner.steam.games(),
        ...game_scanner.gog.games(),
        ...game_scanner.amazon.games(),
        ...game_scanner.blizzard.games(),
        ...game_scanner.origin.games(),
        ...game_scanner.epicgames.games(),
        ...game_scanner.riotgames.games(),
        ...game_scanner.ubisoft.games(),
    ]
}

async function scanExesByPath(path: string) {
    const foundExes = await findGameExes(path)
    foundExes.sort((a, b) => b.size-a.size)
    return foundExes
}

function scanAllExes() {
    return Promise.all([
        ...getGames().map(async (gameInfo) => {
            const foundExes = await scanExesByPath(gameInfo.path)
            exes.set(gameInfo.path, foundExes)
        }),
    ])
}

scanAllExes()
    .then(() => {
        console.log(Array.from(exes.values()))
    })

ipcMain.handle('game-library-get-games', async (_) => {
    return getGames()
})

ipcMain.handle('game-library-get-processes', async (_) => {
    return getProcesses({ verbose: true })
})

ipcMain.handle('game-library-get-process-path', async (_, pid) => {
    return find.default('pid', pid)
})

ipcMain.handle('game-library-get-exes', async (_, path) => {
    return scanExesByPath(path)
})

ipcMain.handle('game-library-add-process', async (_, processPath = "") => {
    const normalizedPath = path.normalize(processPath)
    if (normalizedPath && !getProcess(normalizedPath)) {
        extractProcessIcon(normalizedPath)
        addProcess(normalizedPath)
    }
})

