import path from 'path'

export const EXTERNALS_DIR = process.env.NODE_ENV === 'development'
    ? path.resolve('./resources')
    : process.resourcesPath

export const PUBLIC_DIR = process.env.NODE_ENV === 'development'
    ? path.resolve('./public')
    : path.resolve(__dirname, '../dist')
