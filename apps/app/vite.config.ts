import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath, URL } from 'node:url'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
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

const formats: LibraryOptions['formats'] = ['cjs', 'es']

export const getFormats: () => LibraryOptions['formats'] = () => {
    return formats
}

export function getFileName(format: ModuleFormat, entryName: string) {
    return `${ entryName }.${
        {
            cjs: 'cjs',
            es: 'js',
            amd: '',
            commonjs: '',
            esm: '',
            iife: '',
            systemjs: '',
            system: '',
            umd: '',
            module: '',
        }[format]
    }`
}

export default defineConfig(({ mode }) => {
    const packagesToOmit = []
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
    const resolve = {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    }
    const rollupOptions = {
        external,
    }
    const plugins = () => [tsconfigPaths()]
    return {
        plugins: [
            ...plugins(),
            vue(),
            electron({
                main: {
                    // Shortcut of `build.lib.entry`
                    entry: 'electron/main.ts',
                    vite: {
                        resolve,
                        build: {
                            rollupOptions,
                        },
                        plugins: [...plugins()],
                    },
                },
                preload: {
                    // Shortcut of `build.rollupOptions.input`
                    // input: 'electron/preload.ts',
                },
                // Optional: Use Node.js API in the Renderer process
                renderer: {},
            }),
        ],
        resolve,
    }
})
