import { Theme } from '@/tokens'

export const level = {
    none: 'none',
    background: -10,
    default: 0,
    foreground: 10,
    navigation: 100,
    overlay: 1_000,
    shell: 100_000,
    application: 100_000_000,
} as const

declare module '@/tokens' {
    export interface DefaultTheme {
        level: typeof level
    }
}

export type Level = keyof Theme['level']
