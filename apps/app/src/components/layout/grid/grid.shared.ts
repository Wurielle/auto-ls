import { ElementType, HTMLAttributes } from 'react'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { boxPropsDefinition } from '@/components/layout/box'
import { Spacing } from '@/tokens'
import { Properties } from 'csstype'

export const gridPropsDefinition = defineProps(({ optional, responsive }) => ({
    ...boxPropsDefinition,
    ...responsive({
        gap: optional<Spacing | Properties['gap'] | number>('3'),
        columns: optional<number>(12),
        rows: optional<number>(),
        align: optional<Properties['alignItems']>(),
    }),
}))

export const gridColPropsDefinition = defineProps(({ optional, responsive }) => ({
    ...boxPropsDefinition,
    ...responsive({
        span: optional<number>(),
        start: optional<Properties['gridColumnStart'] | number>(),
        end: optional<Properties['gridColumnEnd'] | number>(),
        rowSpan: optional<Properties['gridRow'] | number>(),
        rowStart: optional<Properties['gridRowStart'] | number>(),
        rowEnd: optional<Properties['gridRowEnd'] | number>(),
        order: optional<Properties['order'] | number>(),
    }),
}))

export type GridPropsDefinition = typeof gridPropsDefinition

export type GridColPropsDefinition = typeof gridColPropsDefinition

export interface GridProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<GridPropsDefinition> {
    as?: ElementType
}

export type GridPropsWithDefaults = PropsDefinitionWithDefaults<GridPropsDefinition>

export interface GridColProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<GridColPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type GridColPropsWithDefaults = PropsDefinitionWithDefaults<GridColPropsDefinition>
