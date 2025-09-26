import * as fsp from "fs/promises"
import * as game_scanner from "@equal-games/game-scanner"

export interface GameExe {
    path: string;
    size: number;
}

const exes = new Map<string, GameExe[]>()

export async function findGameExes(rootDir: string): Promise<GameExe[]> {
    const patterns = ["**/*.exe"]

    const { globby } = await import('globby')
    const files = await globby(patterns, {
        cwd: rootDir,
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