import { ElementType, HTMLAttributes } from 'react'
import { Spacing } from '@/tokens'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { Properties } from 'csstype'
import { boxPropsDefinition } from '@/components/layout/box'

export const groupJustifyValues = ['left', 'center', 'right', 'stretch', 'between', 'around'] as const
export type GroupJustify = (typeof groupJustifyValues)[number]
export const groupAlignValues = ['stretch', 'center', 'top', 'bottom'] as const
export type GroupAlign = (typeof groupAlignValues)[number]
export const groupDirectionValues = ['row', 'column'] as const
export type GroupDirection = (typeof groupDirectionValues)[number]

export const groupPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    direction: optional<GroupDirection | Properties['flexDirection']>('row'),
    justify: optional<GroupJustify | Properties['justifyContent']>('left'),
    align: optional<GroupAlign | Properties['alignItems']>('center'),
    gap: optional<Spacing | Properties['gap'] | number>('3'),
    wrap: optional<boolean>(false),
}))

export type GroupPropsDefinition = typeof groupPropsDefinition

export interface GroupProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<GroupPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type GroupPropsWithDefaults = PropsDefinitionWithDefaults<GroupPropsDefinition>
