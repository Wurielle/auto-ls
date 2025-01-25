import path from 'path'

export const EXTERNALS_DIR = import.meta.env.DEV
    ? path.resolve('./resources')
    : process.resourcesPath