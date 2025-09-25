import * as path from 'node:path'
import { app } from 'electron'

export const EXTERNALS_DIR = process.env.NODE_ENV === 'development'
    ? path.resolve('./resources')
    : process.resourcesPath

export const PUBLIC_DIR = process.env.NODE_ENV === 'development'
    ? path.resolve('./public')
    : path.resolve(__dirname, '../dist')

/* if I put the files inside a folder that isn't directly from getPath the vbs files stop working? */
const fileTargetDir = path.join(app.getPath('documents'))
export const appVBSFileName = 'run-auto-lossless-scaling-as-admin.vbs'
export const appVBSPath = path.join(fileTargetDir, appVBSFileName)
export const lsVBSFileName = 'run-lossless-scaling-as-admin.vbs'
export const rivaTunerVBSFileName = 'run-riva-tuner-as-admin.vbs'
export const lsVBSPath = path.join(fileTargetDir, lsVBSFileName)
export const rivaTunerVBSPath = path.join(fileTargetDir, rivaTunerVBSFileName)