import { ElementType, HTMLAttributes } from 'react'
import { defineProps, PropsDefinition, PropsDefinitionWithDefaults } from '@/utils/component'
import { boxPropsDefinition } from '@/components/layout/box'
import { Screen, Screens } from '@/tokens'

export const containerPropsDefinition = defineProps(({ optional }) => ({
    ...boxPropsDefinition,
    fluid: optional<boolean>(),
    size: optional<Screen>(),
    breakpoints: optional<Screens[]>(),
}))

export type ContainerPropsDefinition = typeof containerPropsDefinition

export interface ContainerProps extends HTMLAttributes<HTMLDivElement>, PropsDefinition<ContainerPropsDefinition> {
    asChild?: boolean
    as?: ElementType
}

export type ContainerPropsWithDefaults = PropsDefinitionWithDefaults<ContainerPropsDefinition>
