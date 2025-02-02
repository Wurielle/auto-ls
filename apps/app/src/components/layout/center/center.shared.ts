import { ElementType, HTMLAttributes } from 'react'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { boxPropsDefinition } from '@/components/layout/box'

export const centerPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    inline: optional<boolean>(),
}))

export type CenterPropsDefinition = typeof centerPropsDefinition

export interface CenterProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<CenterPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type CenterPropsWithDefaults = PropsDefinitionWithDefaults<CenterPropsDefinition>
