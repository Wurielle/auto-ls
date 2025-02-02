import { ElementType, HTMLAttributes } from 'react'
import { Spacing } from '@/tokens'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { Properties } from 'csstype'
import { boxPropsDefinition } from '@/components/layout/box'

export const stackJustifyValues = ['left', 'center', 'right', 'stretch', 'between', 'around'] as const
export type StackJustify = (typeof stackJustifyValues)[number]
export const stackAlignValues = ['stretch', 'center', 'top', 'bottom'] as const
export type StackAlign = (typeof stackAlignValues)[number]

export const stackPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    justify: optional<StackJustify | Properties['justifyContent']>('stretch'),
    align: optional<StackAlign | Properties['alignItems']>('top'),
    gap: optional<Spacing | Properties['gap'] | number>('3'),
}))

export type StackPropsDefinition = typeof stackPropsDefinition

export interface StackProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<StackPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type StackPropsWithDefaults = PropsDefinitionWithDefaults<StackPropsDefinition>
