import { Theme } from '@/tokens'

export const borderRadius = {
    none: 0,
    default: 4,
    full: 9999,
} as const

export const borderStyle = {
    none: 'none',
    solid: 'solid',
} as const

export const borderWidth = {
    none: 0,
    default: 1,
} as const

declare module '@/tokens' {
    export interface DefaultTheme {
        borderRadius: typeof borderRadius
        borderStyle: typeof borderStyle
        borderWidth: typeof borderWidth
    }
}

export type BorderRadius = keyof Theme['borderRadius']
export type BorderStyle = keyof Theme['borderStyle']
export type BorderWidth = keyof Theme['borderWidth']
