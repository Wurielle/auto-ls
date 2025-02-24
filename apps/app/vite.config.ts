import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import electron from 'vite-plugin-electron/simple'
import tsconfigPaths from 'vite-tsconfig-paths'
import { builtinModules } from 'node:module'

const pkg = require('./package.json')
const omitPackages = (keys: string[], ignore: string[] = []) =>
    keys.filter((key) => !ignore.includes(key))

export function getRootExternal(ignore: string[] = []) {
    const externalPackages = [
        ...builtinModules,
        ...builtinModules.map((name) => `node:${ name }`),
        ...omitPackages(Object.keys(pkg.dependencies || {}), ignore),
        ...omitPackages(Object.keys(pkg.peerDependencies || {}), ignore),
        ...omitPackages(Object.keys(pkg.devDependencies || {}), ignore),
    ]
    return [
        ...getNodeExternal(),
        ...externalPackages.map(
            (packageName) => new RegExp(`^${packageName}(\/.*)?`),
        ),
    ]
}

export function getNodeExternal() {
    return [...builtinModules, ...builtinModules.map((name) => `node:${ name }`)]
}



export default defineConfig(({ mode }) => {
    const packagesToOmit: string[] = []
    const omitPackages = (keys: string[]) =>
        keys.filter((key) => !packagesToOmit.includes(key))
    const externalPackages = [
        ...omitPackages(Object.keys(pkg.dependencies || {})),
        ...omitPackages(Object.keys(pkg.peerDependencies || {})),
        ...(mode === 'development'
            ? omitPackages(Object.keys(pkg.devDependencies || {}))
            : []),
    ]
    const external = [
        ...externalPackages.map(
            (packageName) => new RegExp(`^${ packageName }(/.*)?`),
        ),
        ...(mode === 'development' ? getRootExternal() : []),
    ]
    const rollupOptions = {
        external,
    }
    const plugins = () => [tsconfigPaths()]
    return {
        plugins: [
            ...plugins(),
            react(),
            electron({
                main: {
                    entry: 'electron/main.ts',
                    vite: {
                        build: {
                            rollupOptions,
                        },
                        plugins: [...plugins()],
                    },
                },
                preload: {
                    input: 'electron/preload.ts',
                },
                renderer: {},
            }),
        ],
    }
})
