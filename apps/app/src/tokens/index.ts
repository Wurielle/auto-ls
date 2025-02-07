export * from './border.ts'
export * from './colors.ts'
export * from './elevation.ts'
export * from './level.ts'
export * from './ratio.ts'
export * from './spacing.ts'
export * from './screens.ts'

export interface DefaultTheme {}

export interface ThemeOverride {}

export type Theme = {
    [Key in keyof DefaultTheme]-?: Key extends keyof ThemeOverride ? ThemeOverride[Key] : DefaultTheme[Key]
}

type EmotionTheme = Theme

declare module '@emotion/react' {
    export interface Theme extends EmotionTheme {}
}

/* Override default theme like this: */
// declare module '@/tokens' {
//     export interface ThemeOverride {
//         screens: {
//             min: {
//                 value: number
//                 gutter: number
//                 margin: number
//             }
//             mobile: {
//                 value: number
//                 gutter: number
//                 margin: number
//             }
//             tablet: {
//                 value: number
//                 gutter: number
//                 margin: number
//             }
//             desktop: {
//                 value: number
//                 gutter: number
//                 margin: number
//             }
//         }
//     }
// }
