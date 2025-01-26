import path from 'path'

export const EXTERNALS_DIR = import.meta.env.DEV
    ? path.resolve('./resources')
    : process.resourcesPath

export const PUBLIC_DIR = import.meta.env.DEV
    ? path.resolve('./public')
    : path.resolve(__dirname, '../dist')