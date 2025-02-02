import { spacing, Theme } from '@/tokens'

export const screens = {
    min: {
        value: 0,
        gutter: spacing['3'],
        margin: 0,
    },
    sm: {
        value: 640,
        gutter: spacing['5'],
        margin: spacing['5'],
    },
    md: {
        value: 768,
        gutter: spacing['6'],
        margin: spacing['6'],
    },
    lg: {
        value: 1024,
        gutter: spacing['6'],
        margin: spacing['6'],
    },
    xl: {
        value: 1440,
        gutter: spacing['6'],
        margin: spacing['6'],
    },
} as const

declare module '@/tokens' {
    export interface DefaultTheme {
        screens: typeof screens
    }
}

export type Screens = Theme['screens']
export type Screen = keyof Theme['screens']
